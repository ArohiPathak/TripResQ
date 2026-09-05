from collections import deque
from datetime import timedelta
from app.core.db import db
from app.models.node import ItineraryNode, NodeStatus, NodeType
from app.models.edge import DependencyEdge

def apply_disruption(trip_id: str, node_id: str, delay_minutes: int = 0, reason: str = "Unknown Delay", disruption_type: str = None):
    """
    Executes a BFS propagation engine to recalculate constraints and cascade delays.
    Calculates downstream delay, broken connections, and affected nodes count.
    """
    from app.models.trip import Trip

    # Resilient Trip Lookup
    trip = db.session.get(Trip, trip_id)
    if not trip:
        trip = Trip.query.filter_by(id=trip_id).first() or Trip.query.order_by(Trip.created_at.desc()).first()
        if not trip:
            raise ValueError(f"Trip '{trip_id}' not found")
        trip_id = trip.id

    # Resilient Node Lookup
    target_node = db.session.get(ItineraryNode, node_id)
    if not target_node or target_node.trip_id != trip_id:
        target_node = (
            ItineraryNode.query.filter_by(trip_id=trip_id, id=node_id).first() or
            ItineraryNode.query.filter_by(trip_id=trip_id, title=node_id).first() or
            ItineraryNode.query.filter_by(trip_id=trip_id).order_by(ItineraryNode.start_time).first()
        )
        if not target_node:
            raise ValueError("Invalid node or trip ID")

    # Determine disruption type
    dis_type = (disruption_type or "").lower()
    reason_lower = (reason or "").lower()
    is_cancellation = dis_type in ["cancel", "cancellation", "cancelled"] or "cancel" in reason_lower
    is_lockout = dis_type in ["lockout", "terminal_lockout"] or "lockout" in reason_lower

    effective_delay = int(delay_minutes)
    if (is_cancellation or is_lockout) and effective_delay <= 0:
        effective_delay = 360  # Default 6-hour disruption window

    # Shift the target node's time (both start and end to preserve duration)
    target_node.start_time += timedelta(minutes=effective_delay)
    target_node.end_time += timedelta(minutes=effective_delay)
    
    if is_cancellation or is_lockout:
        target_node.status = NodeStatus.BROKEN.value
    else:
        target_node.status = NodeStatus.AT_RISK.value

    impacts = {
        "direct": [target_node.id],
        "downstream_shifted": [],
        "downstream_broken": []
    }

    queue = deque([target_node])
    visited = set([target_node.id])
    max_downstream_shift = effective_delay

    while queue:
        current_node = queue.popleft()

        # Get all downstream dependencies (edges where this node is the source)
        outgoing_edges = DependencyEdge.query.filter_by(source_node_id=current_node.id).all()

        for edge in outgoing_edges:
            child_node = db.session.get(ItineraryNode, edge.target_node_id)
            if not child_node or child_node.id in visited:
                continue

            required_start_time = current_node.end_time + timedelta(minutes=edge.min_buffer_minutes)

            # If predecessor is broken due to cancellation/lockout, downstream connection cannot proceed
            if is_cancellation or current_node.status == NodeStatus.BROKEN.value:
                shift_amount = max(0, (required_start_time - child_node.start_time).total_seconds() / 60)
                if shift_amount == 0:
                    shift_amount = effective_delay
                child_node.start_time = required_start_time
                child_node.end_time += timedelta(minutes=shift_amount)
                child_node.status = NodeStatus.BROKEN.value

                if child_node.id not in impacts["downstream_broken"]:
                    impacts["downstream_broken"].append(child_node.id)

                queue.append(child_node)
                visited.add(child_node.id)
                continue

            # Evaluate constraint equation
            if child_node.start_time < required_start_time:
                shift_amount = (required_start_time - child_node.start_time).total_seconds() / 60
                max_downstream_shift = max(max_downstream_shift, int(shift_amount))

                # Check hard constraints and flexibility
                is_broken = False

                if child_node.hard_cutoff and required_start_time > child_node.hard_cutoff:
                    is_broken = True
                elif child_node.node_type in [NodeType.FLIGHT.value, NodeType.TRAIN.value]:
                    # Flights and Trains are generally non-flexible
                    is_broken = True

                child_node.start_time = required_start_time
                child_node.end_time += timedelta(minutes=shift_amount)

                if is_broken:
                    child_node.status = NodeStatus.BROKEN.value
                    if child_node.id not in impacts["downstream_broken"]:
                        impacts["downstream_broken"].append(child_node.id)
                else:
                    child_node.status = NodeStatus.AT_RISK.value
                    if child_node.id not in impacts["downstream_shifted"]:
                        impacts["downstream_shifted"].append(child_node.id)

                queue.append(child_node)

            visited.add(child_node.id)

    db.session.commit()

    # Dynamic Cascade Impact Metrics Calculation
    all_nodes = ItineraryNode.query.filter_by(trip_id=trip_id).all()
    broken_nodes = [n for n in all_nodes if n.status == NodeStatus.BROKEN.value]
    affected_nodes = [n for n in all_nodes if n.status != NodeStatus.OK.value]

    broken_connections_count = len(broken_nodes)
    affected_nodes_count = len(affected_nodes)

    metrics = {
        "delay_minutes": int(max_downstream_shift),
        "delayMinutes": int(max_downstream_shift),
        "broken_connections": broken_connections_count,
        "brokenConnections": broken_connections_count,
        "affected_nodes": affected_nodes_count,
        "affectedNodes": affected_nodes_count
    }

    impacts["metrics"] = metrics
    impacts["total_delay_minutes"] = int(max_downstream_shift)
    impacts["broken_connections_count"] = broken_connections_count
    impacts["affected_nodes_count"] = affected_nodes_count

    return impacts, metrics

