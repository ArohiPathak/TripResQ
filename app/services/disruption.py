from collections import deque
from datetime import timedelta
from app.core.db import db
from app.models.node import ItineraryNode, NodeStatus, NodeType
from app.models.edge import DependencyEdge

def apply_disruption(trip_id: str, node_id: str, delay_minutes: int, reason: str):
    """
    Executes a BFS propagation engine to recalculate constraints and cascade delays.
    """
    target_node = db.session.get(ItineraryNode, node_id)
    if not target_node or target_node.trip_id != trip_id:
        raise ValueError("Invalid node or trip ID")

    # Shift the target node's time (both start and end to preserve duration)
    target_node.start_time += timedelta(minutes=delay_minutes)
    target_node.end_time += timedelta(minutes=delay_minutes)
    target_node.status = NodeStatus.AT_RISK.value # Mark as at risk due to delay
    
    impacts = {
        "direct": [target_node.id],
        "downstream_shifted": [],
        "downstream_broken": []
    }
    
    queue = deque([target_node])
    visited = set([target_node.id])

    while queue:
        current_node = queue.popleft()
        
        # Get all downstream dependencies (edges where this node is the source)
        outgoing_edges = DependencyEdge.query.filter_by(source_node_id=current_node.id).all()
        
        for edge in outgoing_edges:
            child_node = db.session.get(ItineraryNode, edge.target_node_id)
            if not child_node or child_node.id in visited:
                continue
                
            required_start_time = current_node.end_time + timedelta(minutes=edge.min_buffer_minutes)
            
            # Evaluate constraint equation
            if child_node.start_time < required_start_time:
                # Constraint Violated
                shift_amount = (required_start_time - child_node.start_time).total_seconds() / 60
                
                # Check hard constraints and flexibility
                is_broken = False
                
                if child_node.hard_cutoff and required_start_time > child_node.hard_cutoff:
                    is_broken = True
                elif child_node.node_type in [NodeType.FLIGHT.value, NodeType.TRAIN.value]:
                    # Flights and Trains are generally non-flexible
                    is_broken = True
                    
                if is_broken:
                    child_node.status = NodeStatus.BROKEN.value
                    impacts["downstream_broken"].append(child_node.id)
                else:
                    # Shiftable node
                    child_node.start_time = required_start_time
                    child_node.end_time += timedelta(minutes=shift_amount)
                    child_node.status = NodeStatus.AT_RISK.value
                    
                    impacts["downstream_shifted"].append(child_node.id)
                    queue.append(child_node)
                    
            visited.add(child_node.id)

    db.session.commit()
    return impacts
