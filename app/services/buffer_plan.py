"""
Buffer Plan Engine.

This is the concrete action behind the Risk Radar's question: "...want a
buffer plan pre-computed?" Given a flagged connection (an edge between two
nodes), it turns the explainable risk breakdown into a short, ordered list
of concrete steps a traveller can take *before* anything goes wrong, plus a
projected "before / after" risk reduction if the buffer is applied.

Two modes:
  - generate_buffer_plan(): read-only, safe to call as often as you like.
    This powers the "Pre-compute buffer plan" button.
  - apply_buffer_plan(): shifts the downstream node later (only for node
    types that can realistically be moved — CAB, HOTEL, ACTIVITY) to
    proactively rebuild a safe buffer *before* a disruption happens,
    re-links the graph, and returns the updated risk score.
    Flights and trains have fixed schedules, so auto-apply is blocked; the plan
    instead recommends switching to an earlier/later scheduled departure.
"""

from datetime import timedelta

from app.core.db import db
from app.models.node import ItineraryNode, NodeType
from app.models.edge import DependencyEdge
from app.services.risk import (
    score_connection,
    SAFE_BUFFER_MINUTES,
    CONFIGURED_WEIGHTS,
    _buffer_risk,
    _risk_level,
)

# Node types whose start time can realistically be shifted by an automated agent
SHIFTABLE_TYPES = {NodeType.CAB.value, NodeType.HOTEL.value, NodeType.ACTIVITY.value}


def _load_connection(trip_id: str, edge_id: str):
    edge = db.session.get(DependencyEdge, edge_id)
    if not edge:
        raise ValueError("Connection not found")

    source = db.session.get(ItineraryNode, edge.source_node_id)
    target = db.session.get(ItineraryNode, edge.target_node_id)
    if not source or not target or source.trip_id != trip_id or target.trip_id != trip_id:
        raise ValueError("Connection does not belong to this trip")

    return edge, source, target


def _projected_risk_score(breakdown: dict, projected_buffer_minutes: float, target_type: str) -> int:
    """Project the risk score if the buffer is increased to projected_buffer_minutes."""
    factors = breakdown.get("factors", {})
    hist_f = factors.get("historical", {})
    seas_f = factors.get("seasonal", {})

    available_factors = {}
    if hist_f.get("available") and hist_f.get("raw_score") is not None:
        available_factors["historical"] = hist_f["raw_score"]

    projected_buffer_r = _buffer_risk(projected_buffer_minutes, target_type)
    available_factors["buffer"] = projected_buffer_r
    available_factors["seasonal"] = seas_f.get("raw_score", 0.15)

    total_weight = sum(CONFIGURED_WEIGHTS[f] for f in available_factors)
    effective_weights = {
        f: CONFIGURED_WEIGHTS[f] / total_weight for f in available_factors
    }

    weighted_risk = sum(effective_weights[f] * available_factors[f] for f in available_factors)
    return max(0, min(100, round(weighted_risk * 100)))


def _build_steps(target: ItineraryNode, extra_needed: int, safe_buffer: int) -> list:
    steps = []

    if extra_needed > 0:
        if target.node_type in (NodeType.FLIGHT.value, NodeType.TRAIN.value):
            steps.append({
                "action": "SWITCH_LATER_DEPARTURE",
                "auto_applicable": False,
                "detail": (
                    f"Look for a {target.node_type.title()} departing at least "
                    f"{extra_needed} min later to rebuild a {safe_buffer}-min safety margin — "
                    f"fixed schedules cannot be auto-shifted."
                ),
            })
        else:
            steps.append({
                "action": "DELAY_START",
                "auto_applicable": True,
                "detail": f"Push '{target.title}' back by {extra_needed} min to build in a {safe_buffer}-min buffer after the incoming leg.",
            })

    if target.node_type == NodeType.CAB.value:
        steps.append({
            "action": "PRE_BOOK_BACKUP_CAB",
            "auto_applicable": False,
            "detail": "Pre-book a backup cab slotted ~30 min after the primary pickup in case of delay.",
        })
    elif target.node_type == NodeType.HOTEL.value:
        steps.append({
            "action": "NOTIFY_HOTEL",
            "auto_applicable": False,
            "detail": "Send an advance late-check-in notice so the room is held automatically.",
        })
    elif target.node_type in (NodeType.FLIGHT.value, NodeType.TRAIN.value):
        steps.append({
            "action": "FLAG_FALLBACK_SLOT",
            "auto_applicable": False,
            "detail": "Flag the next available departure as a one-tap fallback if this connection slips.",
        })

    steps.append({
        "action": "MONITOR",
        "auto_applicable": False,
        "detail": "Keep this connection pinned to the Risk Radar for proactive re-scoring.",
    })
    return steps


def generate_buffer_plan(trip_id: str, edge_id: str) -> dict:
    """Read-only: compute a concrete buffer plan for one flagged connection."""
    edge, source, target = _load_connection(trip_id, edge_id)
    breakdown = score_connection(source, target, edge.min_buffer_minutes)

    safe_buffer = SAFE_BUFFER_MINUTES.get(target.node_type, 30)
    current_buffer = breakdown["connection_buffer_minutes"]
    extra_needed = breakdown["recommended_extra_buffer_minutes"]
    projected_buffer = current_buffer + max(extra_needed, 0)

    projected_risk = _projected_risk_score(breakdown, projected_buffer, target.node_type)
    steps = _build_steps(target, extra_needed, safe_buffer)
    can_auto_apply = any(s["auto_applicable"] for s in steps) and extra_needed > 0

    return {
        "trip_id": trip_id,
        "edge_id": edge.id,
        "source_node_id": source.id,
        "target_node_id": target.id,
        "target_title": target.title,
        "current": {
            "buffer_minutes": current_buffer,
            "risk_score": breakdown["risk_score"],
            "risk_level": breakdown["risk_level"],
            "data_confidence": breakdown["data_confidence"],
        },
        "projected": {
            "buffer_minutes": projected_buffer,
            "risk_score": projected_risk,
            "risk_level": _risk_level(projected_risk),
            "data_confidence": breakdown["data_confidence"],
        },
        "risk_reduction": max(0, breakdown["risk_score"] - projected_risk),
        "steps": steps,
        "can_auto_apply": can_auto_apply,
        "message": breakdown["message"],
    }


def apply_buffer_plan(trip_id: str, edge_id: str) -> dict:
    """
    Actually shift the downstream node later (for shiftable types only) to
    proactively rebuild a safe buffer BEFORE any disruption occurs.
    """
    edge, source, target = _load_connection(trip_id, edge_id)
    breakdown = score_connection(source, target, edge.min_buffer_minutes)

    safe_buffer = SAFE_BUFFER_MINUTES.get(target.node_type, 30)
    current_buffer = breakdown["connection_buffer_minutes"]
    extra_needed = breakdown["recommended_extra_buffer_minutes"]

    if extra_needed <= 0:
        return {
            "applied": False,
            "reason": "This connection is already comfortably buffered — no change needed.",
        }

    if target.node_type not in SHIFTABLE_TYPES:
        return {
            "applied": False,
            "reason": (
                f"{target.node_type.title()} has a fixed external schedule and cannot be "
                f"auto-shifted. Switch to a departure at least {extra_needed} min later instead."
            ),
        }

    # Push the downstream node LATER to widen the gap after incoming leg
    shift = timedelta(minutes=extra_needed)
    target.start_time += shift
    target.end_time += shift
    db.session.commit()

    # Re-run auto linker to update edges
    from app.services.linker import run_auto_linker
    run_auto_linker(trip_id)

    source = db.session.get(ItineraryNode, source.id)
    target = db.session.get(ItineraryNode, target.id)
    new_edge = DependencyEdge.query.filter_by(
        source_node_id=source.id, target_node_id=target.id
    ).first()
    new_min_buffer = new_edge.min_buffer_minutes if new_edge else 0

    new_breakdown = score_connection(source, target, new_min_buffer)

    return {
        "applied": True,
        "trip_id": trip_id,
        "edge_id": new_edge.id if new_edge else None,
        "target_node_id": target.id,
        "shifted_minutes_later": extra_needed,
        "new_start_time": target.start_time.isoformat(),
        "new_end_time": target.end_time.isoformat(),
        "before": {
            "buffer_minutes": current_buffer,
            "risk_score": breakdown["risk_score"],
            "risk_level": breakdown["risk_level"],
            "data_confidence": breakdown["data_confidence"],
        },
        "after": {
            "buffer_minutes": new_breakdown["connection_buffer_minutes"],
            "risk_score": new_breakdown["risk_score"],
            "risk_level": new_breakdown["risk_level"],
            "data_confidence": new_breakdown["data_confidence"],
        },
        "message": f"Proactively buffered '{target.title}' by {extra_needed} min before any disruption occurred.",
    }