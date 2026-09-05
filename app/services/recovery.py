from datetime import timedelta, datetime, timezone
from app.core.db import db
from app.models.node import ItineraryNode, NodeStatus, NodeType
from app.services.plan_scorer import (
    score_and_rank_plans,
    PRIORITY_FASTEST,
    PRIORITY_CHEAPEST,
    PRIORITY_MAX_REFUND,
    PRIORITY_LEAST_DISRUPTION
)

def generate_recovery_proposals(trip_id: str):
    """
    Finds BROKEN nodes and generates deterministic proposals to recover the graph.
    Maintained for backwards compatibility with checkpoint tests.
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


def generate_recovery_options(trip_id: str, priority: str = "FASTEST", trip_context: dict = None) -> dict:
    """
    Generates intelligent personalized recovery options for a disrupted trip.
    Calculates heuristic metrics for 4 distinct priorities:
    - FASTEST: Minimum recovery duration and earliest arrival.
    - CHEAPEST: Zero added cost with complimentary carrier protection & vouchers.
    - MAX_REFUND: 100% full cancellation & statutory refund claim.
    - LEAST_DISRUPTION: Minimum itinerary changes, preserving downstream schedule.
    """
    norm_priority = priority.upper() if priority else PRIORITY_FASTEST

<<<<<<< HEAD
    # Check for broken or at-risk nodes
    broken_nodes = ItineraryNode.query.filter_by(trip_id=trip_id, status=NodeStatus.BROKEN.value).all()
    at_risk_nodes = ItineraryNode.query.filter_by(trip_id=trip_id, status=NodeStatus.AT_RISK.value).all()
    impacted_nodes = broken_nodes + at_risk_nodes
    if not impacted_nodes:
=======
    # Check for broken nodes
    broken_nodes = ItineraryNode.query.filter_by(trip_id=trip_id, status=NodeStatus.BROKEN.value).all()
    if not broken_nodes:
>>>>>>> origin/main
        return {
            "trip_id": trip_id,
            "priority": norm_priority,
            "plans": [],
            "message": "No recovery options are currently available."
        }

    nodes = ItineraryNode.query.filter_by(trip_id=trip_id).order_by(ItineraryNode.start_time).all()

    # Identify primary broken transit node
    transit_nodes = [n for n in nodes if n.node_type in [NodeType.FLIGHT.value, NodeType.TRAIN.value]]
    cab_nodes = [n for n in nodes if n.node_type == NodeType.CAB.value]
    hotel_nodes = [n for n in nodes if n.node_type == NodeType.HOTEL.value]

    primary_transit = None
    for n in transit_nodes:
<<<<<<< HEAD
        if n.status in [NodeStatus.BROKEN.value, NodeStatus.AT_RISK.value]:
=======
        if n in broken_nodes:
>>>>>>> origin/main
            primary_transit = n
            break
    if not primary_transit and transit_nodes:
        primary_transit = transit_nodes[0]
<<<<<<< HEAD
    elif not primary_transit and impacted_nodes:
        primary_transit = impacted_nodes[0]
=======
    elif not primary_transit and broken_nodes:
        primary_transit = broken_nodes[0]
>>>>>>> origin/main

    primary_cab = cab_nodes[0] if cab_nodes else None
    primary_hotel = hotel_nodes[0] if hotel_nodes else None

    # Reference timings
    base_start = primary_transit.start_time if primary_transit else nodes[0].start_time
    base_end = primary_transit.end_time if primary_transit else nodes[0].end_time

    node_id_val = primary_transit.id if primary_transit else (nodes[0].id if nodes else "")
    node_title_val = primary_transit.title if primary_transit else (nodes[0].title if nodes else "")

    raw_candidates = []

    # =========================================================================
    # 1. FASTEST PLAN (Express Rebooking Slot)
    # =========================================================================
    fastest_props = []
    f_start = base_start + timedelta(hours=2, minutes=15)
    f_end = base_end + timedelta(hours=2, minutes=15)
    if primary_transit:
        fastest_props.append({
            "node_id": primary_transit.id,
            "node_title": primary_transit.title,
            "action": "REBOOK_EXPRESS_TRANSIT",
            "updates": {
                "start_time": f_start.isoformat(),
                "end_time": f_end.isoformat(),
                "title": f"{primary_transit.title} (Express Slot)",
                "status": NodeStatus.OK.value
            },
            "description": "Rebook to the earliest express connection arriving with minimal delay."
        })
    if primary_cab:
        f_cab_start = f_end + timedelta(minutes=30)
        f_cab_end = f_cab_start + (primary_cab.end_time - primary_cab.start_time)
        fastest_props.append({
            "node_id": primary_cab.id,
            "node_title": primary_cab.title,
            "action": "REBOOK_CAB",
            "updates": {
                "start_time": f_cab_start.isoformat(),
                "end_time": f_cab_end.isoformat(),
                "title": f"{primary_cab.title} (Express Transfer)",
                "status": NodeStatus.OK.value
            },
            "description": "Rebook airport transfer cab synchronized to express arrival."
        })
    if primary_hotel:
        f_cutoff = (primary_hotel.hard_cutoff or primary_hotel.start_time) + timedelta(hours=8)
        fastest_props.append({
            "node_id": primary_hotel.id,
            "node_title": primary_hotel.title,
            "action": "EXTEND_CUTOFF",
            "updates": {
                "hard_cutoff": f_cutoff.isoformat(),
                "title": f"{primary_hotel.title} (LATE CHECK-IN APPROVED)",
                "status": NodeStatus.OK.value
            },
            "description": "Notify hotel front desk of late arrival; room hold guaranteed."
        })

    raw_candidates.append({
        "id": "plan-fastest",
        "priority": PRIORITY_FASTEST,
        "title": "⚡ Express Route Shift",
        "subtitle": "Rescheduled Premium Express Transit",
        "action": "REBOOK_EXPRESS_TRANSIT",
        "node_id": node_id_val,
        "node_title": node_title_val,
        "estimated_cost": 1200,
        "estimated_refund": 0,
        "time_saved_minutes": 180,  # Saves 3 hours vs standard 24h/next-day delay
        "affected_nodes": len(fastest_props),
        "additional_cost": 1200,
        "duration_minutes": 135,
        "refund": 0,
        "details": {
            "transit": "Next immediate express departure (+2h 15m)",
            "cab": "Transfer synchronized automatically",
            "hotel": "Late check-in clearance approved"
        },
        "proposals": fastest_props
    })

    # =========================================================================
    # 2. CHEAPEST PLAN (Complimentary Off-Peak Reschedule)
    # =========================================================================
    budget_props = []
    b_start = base_start + timedelta(hours=4, minutes=30)
    b_end = base_end + timedelta(hours=4, minutes=30)
    if primary_transit:
        budget_props.append({
            "node_id": primary_transit.id,
            "node_title": primary_transit.title,
            "action": "COMPLIMENTARY_OFF_PEAK_REBOOK",
            "updates": {
                "start_time": b_start.isoformat(),
                "end_time": b_end.isoformat(),
                "title": f"{primary_transit.title} (Off-Peak Rebooking)",
                "status": NodeStatus.OK.value
            },
            "description": "Complimentary rebooking on off-peak carrier slot backed by ₹600 travel credit."
        })
    if primary_cab:
        b_cab_start = b_end + timedelta(minutes=30)
        b_cab_end = b_cab_start + (primary_cab.end_time - primary_cab.start_time)
        budget_props.append({
            "node_id": primary_cab.id,
            "node_title": primary_cab.title,
            "action": "REBOOK_CAB",
            "updates": {
                "start_time": b_cab_start.isoformat(),
                "end_time": b_cab_end.isoformat(),
                "title": f"{primary_cab.title} (Off-Peak Transfer)",
                "status": NodeStatus.OK.value
            },
            "description": "Shift airport cab to off-peak arrival window at no added fee."
        })
    if primary_hotel:
        b_cutoff = (primary_hotel.hard_cutoff or primary_hotel.start_time) + timedelta(hours=12)
        budget_props.append({
            "node_id": primary_hotel.id,
            "node_title": primary_hotel.title,
            "action": "EXTEND_CUTOFF",
            "updates": {
                "hard_cutoff": b_cutoff.isoformat(),
                "title": f"{primary_hotel.title} (Late Check-in Approved)",
                "status": NodeStatus.OK.value
            },
            "description": "Notify hotel of delayed arrival without fee or penalty."
        })

    raw_candidates.append({
        "id": "plan-cheapest",
        "priority": PRIORITY_CHEAPEST,
        "title": "💰 Off-Peak Transit Reschedule",
        "subtitle": "Zero-Cost Carrier Protection + Travel Credit",
        "action": "COMPLIMENTARY_OFF_PEAK_REBOOK",
        "node_id": node_id_val,
        "node_title": node_title_val,
        "estimated_cost": 0,
        "estimated_refund": 600,
        "time_saved_minutes": 0,
        "affected_nodes": len(budget_props),
        "additional_cost": 0,
        "duration_minutes": 270,
        "refund": 600,
        "details": {
            "transit": "Complimentary off-peak transit slot (+4h 30m)",
            "cab": "Rescheduled with zero change fee",
            "hotel": "Hotel reservation postponed safely"
        },
        "proposals": budget_props
    })

    # =========================================================================
    # 3. MAX_REFUND PLAN (100% Statutory Refund & Cancellation)
    # =========================================================================
    refund_props = []
    for n in broken_nodes:
        refund_props.append({
            "node_id": n.id,
            "node_title": n.title,
            "action": "CLAIM_STATUTORY_REFUND",
            "updates": {
                "title": f"{n.title} (100% REFUND CLAIMED)",
                "status": NodeStatus.OK.value
            },
            "description": f"Cancel {n.title} and initiate 100% full statutory refund with ₹0 penalty fee."
        })

    raw_candidates.append({
        "id": "plan-refund",
        "priority": PRIORITY_MAX_REFUND,
        "title": "💸 Max Refund & Full Claim",
        "subtitle": "100% Statutory Refund & Downstream Cancellation",
        "action": "CLAIM_STATUTORY_REFUND",
        "node_id": node_id_val,
        "node_title": node_title_val,
        "estimated_cost": 0,
        "estimated_refund": 8500,
        "time_saved_minutes": 0,
        "affected_nodes": len(refund_props),
        "additional_cost": 0,
        "duration_minutes": 0,
        "refund": 8500,
        "details": {
            "transit": "100% full refund claim initiated (₹8,500)",
            "cab": "Zero-fee cancellation processed",
            "hotel": "Full room deposit credited back"
        },
        "proposals": refund_props
    })

    # =========================================================================
    # 4. LEAST_DISRUPTION PLAN (Smart Schedule Preservation)
    # =========================================================================
    protect_props = []
    p_start = base_start + timedelta(hours=1, minutes=15)
    p_end = base_end + timedelta(hours=1, minutes=15)
    if primary_transit:
        protect_props.append({
            "node_id": primary_transit.id,
            "node_title": primary_transit.title,
            "action": "BUFFER_OPTIMIZE_PRESERVE",
            "updates": {
                "start_time": p_start.isoformat(),
                "end_time": p_end.isoformat(),
                "title": f"{primary_transit.title} (Priority Buffer Slot)",
                "status": NodeStatus.OK.value
            },
            "description": "Adjust transit slot by minimum buffer to preserve downstream bookings."
        })

    raw_candidates.append({
        "id": "plan-least-disruption",
        "priority": PRIORITY_LEAST_DISRUPTION,
        "title": "😌 Smart Schedule Preservation",
        "subtitle": "Preserve Original Schedule & Minimize Changes",
        "action": "BUFFER_OPTIMIZE_PRESERVE",
        "node_id": node_id_val,
        "node_title": node_title_val,
        "estimated_cost": 850,
        "estimated_refund": 0,
        "time_saved_minutes": 105,
        "affected_nodes": 1,  # Strictly changes only 1 node
        "additional_cost": 850,
        "duration_minutes": 75,
        "refund": 0,
        "details": {
            "transit": "Minor departure shift (+1h 15m)",
            "cab": "Existing buffer absorbs delay",
            "hotel": "Original check-in time 100% intact"
        },
        "proposals": protect_props
    })

    # Cohort Constraint Validation (NEW in Stage 3)
    from app.services.cohort import get_cohort_for_trip
    from app.services.cohort_constraints import validate_cohort_recovery

    cohort = get_cohort_for_trip(trip_id)
    valid_candidates = []
    rejected_plans = []

    # If caller provided simulated or additional candidates (e.g. simulated split plans)
    if trip_context and "additional_candidates" in trip_context:
        raw_candidates.extend(trip_context["additional_candidates"])

    if cohort is None:
        # Backward compatibility: Trips WITHOUT a cohort skip cohort validation completely
        valid_candidates = raw_candidates
    else:
        for candidate in raw_candidates:
            validation = validate_cohort_recovery(cohort, candidate, trip_context=trip_context)
            if validation["valid"]:
                cand_copy = dict(candidate)
                cand_copy["cohort_valid"] = True
                cand_copy["seating"] = validation.get("seating")
                cand_copy["warnings"] = validation.get("warnings", [])
                valid_candidates.append(cand_copy)
            else:
                rejected_plans.append({
                    "plan_id": candidate.get("id"),
                    "title": candidate.get("title"),
                    "reason": "COHORT_FRACTURE",
                    "violations": validation.get("violations", []),
                    "seating": validation.get("seating")
                })

    # Run multi-criteria scoring & ranking ONLY on surviving valid candidates
    ranked_plans = score_and_rank_plans(valid_candidates, priority=norm_priority)

    result = {
        "trip_id": trip_id,
        "priority": norm_priority,
        "plans": ranked_plans,
        "rejected_plans": rejected_plans
    }
    if cohort:
        result["cohort"] = cohort.to_dict()
        result["fracture_detected"] = len(rejected_plans) > 0

    return result


# Backwards compatibility alias
def generate_recovery_plans(trip_id: str, priority: str = "FASTEST") -> dict:
    options = generate_recovery_options(trip_id=trip_id, priority=priority)
    top_id = options["plans"][0]["id"] if options.get("plans") else None
    return {
        "trip_id": trip_id,
        "priority": options.get("priority", priority),
        "recommended_plan": top_id,
        "plans": options.get("plans", [])
    }


def apply_recovery_plan(trip_id: str, proposals: list):
    """
    Applies the selected proposals to the database.
    Updates only the nodes in proposals, sets AT_RISK nodes to OK,
    and runs the auto linker.
    """
    for prop in proposals:
        node_id = prop.get("node_id")
        updates = prop.get("updates", {})
        
        node = db.session.get(ItineraryNode, node_id)
        if not node or node.trip_id != trip_id:
            continue
            
        if "start_time" in updates:
            st = updates["start_time"]
            node.start_time = datetime.fromisoformat(st) if isinstance(st, str) else st
        if "end_time" in updates:
            et = updates["end_time"]
            node.end_time = datetime.fromisoformat(et) if isinstance(et, str) else et
        if "hard_cutoff" in updates:
            hc = updates["hard_cutoff"]
            node.hard_cutoff = datetime.fromisoformat(hc) if isinstance(hc, str) else hc
        if "title" in updates:
            node.title = updates["title"]
        if "status" in updates:
            node.status = updates["status"]
            
<<<<<<< HEAD
    # Reset any remaining BROKEN or AT_RISK downstream nodes back to OK
    impacted_nodes = ItineraryNode.query.filter(
        ItineraryNode.trip_id == trip_id,
        ItineraryNode.status.in_([NodeStatus.BROKEN.value, NodeStatus.AT_RISK.value])
    ).all()
    for node in impacted_nodes:
=======
    # Reset any AT_RISK downstream nodes back to OK
    at_risk_nodes = ItineraryNode.query.filter_by(trip_id=trip_id, status=NodeStatus.AT_RISK.value).all()
    for node in at_risk_nodes:
>>>>>>> origin/main
        node.status = NodeStatus.OK.value

    db.session.commit()
    
    # Run auto linker again to recalculate edges after times shifted
    from app.services.linker import run_auto_linker
    run_auto_linker(trip_id)
