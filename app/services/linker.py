from app.core.db import db
from app.models.node import ItineraryNode
from app.models.edge import DependencyEdge, ConstraintType

def calculate_min_buffer(source: ItineraryNode, target: ItineraryNode) -> int:
    """Calculate the minimum buffer required between two consecutive nodes in minutes."""
    buffer = 60 # Base buffer
    
    # Simple logic based on types
    if source.node_type == "FLIGHT":
        buffer += 60 # Extra time for baggage claim, airport exit
    if target.node_type == "FLIGHT":
        buffer += 120 # Need to be at airport 2 hours early
        
    # Spatial logic (very basic check)
    if source.location and target.location and source.location.lower() != target.location.lower():
        buffer += 90 # Inter-city or significant location change

    return buffer

def run_auto_linker(trip_id: str):
    """
    Dynamically analyzes the chronological sequence of nodes for a trip and 
    creates edges between consecutive nodes.
    """
    # 1. Fetch all nodes for the trip, sorted chronologically
    nodes = ItineraryNode.query.filter_by(trip_id=trip_id).order_by(ItineraryNode.start_time).all()
    
    if len(nodes) < 2:
        return

    # 2. Clear existing edges for these nodes to avoid duplicates/stale edges on recalculation
    node_ids = [n.id for n in nodes]
    DependencyEdge.query.filter(
        (DependencyEdge.source_node_id.in_(node_ids)) | 
        (DependencyEdge.target_node_id.in_(node_ids))
    ).delete(synchronize_session='fetch')
    
    # 3. Create edges between consecutive nodes
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
