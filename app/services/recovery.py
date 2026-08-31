from datetime import timedelta, datetime
from app.core.db import db
from app.models.node import ItineraryNode, NodeStatus, NodeType

def generate_recovery_proposals(trip_id: str):
    """
    Finds BROKEN nodes and generates deterministic proposals to recover the graph.
    """
    broken_nodes = ItineraryNode.query.filter_by(trip_id=trip_id, status=NodeStatus.BROKEN.value).all()
    proposals = []
    
    for node in broken_nodes:
        if node.node_type == NodeType.HOTEL.value:
            # Proposal: Notify hotel of late arrival and extend hard cutoff
            new_cutoff = node.hard_cutoff + timedelta(hours=12) if node.hard_cutoff else node.start_time + timedelta(hours=12)
            proposals.append({
                "node_id": node.id,
                "node_title": node.title,
                "action": "EXTEND_CUTOFF",
                "updates": {
                    "hard_cutoff": new_cutoff.isoformat(),
                    "title": node.title + " (LATE CHECK-IN APPROVED)",
                    "status": NodeStatus.OK.value
                },
                "description": "Automatically notify the hotel of a late arrival up to 12 hours."
            })
        elif node.node_type == NodeType.CAB.value:
            # Proposal: Rebook cab 2 hours later
            proposals.append({
                "node_id": node.id,
                "node_title": node.title,
                "action": "REBOOK_CAB",
                "updates": {
                    "start_time": (node.start_time + timedelta(hours=2)).isoformat(),
                    "end_time": (node.end_time + timedelta(hours=2)).isoformat(),
                    "status": NodeStatus.OK.value,
                    "title": node.title + " (Rebooked)"
                },
                "description": "Rebook the airport transfer for the newly estimated arrival time."
            })
        elif node.node_type in [NodeType.FLIGHT.value, NodeType.TRAIN.value]:
            # Proposal: Rebook next day
            proposals.append({
                "node_id": node.id,
                "node_title": node.title,
                "action": "REBOOK_TRANSIT",
                "updates": {
                    "start_time": (node.start_time + timedelta(hours=24)).isoformat(),
                    "end_time": (node.end_time + timedelta(hours=24)).isoformat(),
                    "status": NodeStatus.OK.value,
                    "title": node.title + " (Next Day Rebooking)"
                },
                "description": "Rebook the transit ticket for the next available slot (24 hours later)."
            })
        else:
            # Generic recovery: Just set it to OK
            proposals.append({
                "node_id": node.id,
                "node_title": node.title,
                "action": "OVERRIDE_OK",
                "updates": {
                    "status": NodeStatus.OK.value
                },
                "description": "Manually override status to OK."
            })
            
    return proposals

def apply_recovery_plan(trip_id: str, proposals: list):
    """
    Applies the selected proposals to the database.
    Also finds any AT_RISK nodes and marks them as OK (since the plan resolves the trip).
    """
    for prop in proposals:
        node_id = prop.get("node_id")
        updates = prop.get("updates", {})
        
        node = db.session.get(ItineraryNode, node_id)
        if not node or node.trip_id != trip_id:
            continue
            
        if "start_time" in updates:
            node.start_time = datetime.fromisoformat(updates["start_time"])
        if "end_time" in updates:
            node.end_time = datetime.fromisoformat(updates["end_time"])
        if "hard_cutoff" in updates:
            node.hard_cutoff = datetime.fromisoformat(updates["hard_cutoff"])
        if "title" in updates:
            node.title = updates["title"]
        if "status" in updates:
            node.status = updates["status"]
            
    # As part of recovery, reset any AT_RISK downstream nodes back to OK
    at_risk_nodes = ItineraryNode.query.filter_by(trip_id=trip_id, status=NodeStatus.AT_RISK.value).all()
    for node in at_risk_nodes:
        node.status = NodeStatus.OK.value
        
    db.session.commit()
    
    # Run auto linker again to recalculate edges after times shifted
    from app.services.linker import run_auto_linker
    run_auto_linker(trip_id)
