from app.core.db import db
from app.models.node import ItineraryNode
from app.models.edge import DependencyEdge, ConstraintType

def calculate_min_buffer(source: ItineraryNode, target: ItineraryNode) -> int:
    """Calculate minimum buffer based on actual scheduled buffer between nodes."""
    if source.end_time and target.start_time:
        actual_gap = int((target.start_time - source.end_time).total_seconds() / 60)
        if actual_gap >= 0:
            # Respect user's scheduled gap (capped at reasonable 30 mins)
            return min(actual_gap, 30)
            
    return 30

def run_auto_linker(trip_id: str):
    """
    Dynamically analyzes the chronological sequence of nodes for a trip and 
    creates edges between consecutive nodes.
    """
    nodes = ItineraryNode.query.filter_by(trip_id=trip_id).order_by(ItineraryNode.start_time).all()
    
    if len(nodes) < 2:
        return

    node_ids = [n.id for n in nodes]
    DependencyEdge.query.filter(
        (DependencyEdge.source_node_id.in_(node_ids)) | 
        (DependencyEdge.target_node_id.in_(node_ids))
    ).delete(synchronize_session='fetch')
    
    new_edges = []
    for i in range(len(nodes) - 1):
        source = nodes[i]
        target = nodes[i+1]
        
        min_buffer = calculate_min_buffer(source, target)
        
        edge = DependencyEdge(
            source_node_id=source.id,
            target_node_id=target.id,
            min_buffer_minutes=min_buffer,
            constraint_type=ConstraintType.TEMPORAL.value
        )
        new_edges.append(edge)
        
    db.session.add_all(new_edges)
    db.session.commit()
