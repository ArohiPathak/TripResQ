from flask import Blueprint, request, jsonify
from app.core.db import db
from app.models.trip import Trip
from app.services.risk import get_cached_risk_radar, get_alerts
from app.services.buffer_plan import generate_buffer_plan, apply_buffer_plan

risk_bp = Blueprint('risk', __name__, url_prefix='/api/trips')


@risk_bp.route('/<trip_id>/risk-radar', methods=['GET'])
def get_risk_radar(trip_id):
    """
    Proactive Risk Radar / Confidence Score for every connection in a trip.

    Runs BEFORE any disruption happens: a rule-based heuristic (route
    history + seasonal weather + buffer thinness) scores each connection
    and flags the risky ones - e.g. "Your 45-min layover in Delhi has a
    62% historical delay risk for this route/season - want a buffer plan
    pre-computed?"

    Served from a background-refreshed cache (see refresh_all_trips_risk_cache)
    so it's cheap to poll; pass ?refresh=true to force an immediate recompute.
    ---
    tags:
      - Risk Radar
    parameters:
      - in: path
        name: trip_id
        type: string
        required: true
      - in: query
        name: refresh
        type: boolean
        required: false
    responses:
      200:
        description: Risk Radar report returned successfully
      404:
        description: Trip not found
    """
    trip = db.session.get(Trip, trip_id)
    if not trip:
        return jsonify({"error": "Trip not found"}), 404

    force_refresh = request.args.get('refresh', 'false').lower() == 'true'
    data = get_cached_risk_radar(trip_id, force_refresh=force_refresh)
    return jsonify(data), 200


@risk_bp.route('/<trip_id>/risk-radar/alerts', methods=['GET'])
def get_risk_alerts(trip_id):
    """
    Proactive alert feed: connections that newly crossed into HIGH/CRITICAL
    risk on a background refresh cycle - i.e. things the Risk Radar caught
    before a disruption ever happened.
    ---
    tags:
      - Risk Radar
    parameters:
      - in: path
        name: trip_id
        type: string
        required: true
      - in: query
        name: limit
        type: integer
        required: false
    responses:
      200:
        description: Alert list returned successfully
      404:
        description: Trip not found
    """
    trip = db.session.get(Trip, trip_id)
    if not trip:
        return jsonify({"error": "Trip not found"}), 404

    limit = request.args.get('limit', 20, type=int)
    alerts = get_alerts(trip_id, limit=limit)
    return jsonify({"trip_id": trip_id, "alerts": alerts}), 200


@risk_bp.route('/<trip_id>/connections/<edge_id>/buffer-plan', methods=['POST'])
def post_buffer_plan(trip_id, edge_id):
    """
    Pre-compute a concrete buffer plan for a flagged connection - the
    action behind the Risk Radar's "want a buffer plan pre-computed?" CTA.
    Read-only: does not change the itinerary.
    ---
    tags:
      - Risk Radar
    parameters:
      - in: path
        name: trip_id
        type: string
        required: true
      - in: path
        name: edge_id
        type: string
        required: true
    responses:
      200:
        description: Buffer plan generated
      400:
        description: Invalid connection
      404:
        description: Trip not found
    """
    trip = db.session.get(Trip, trip_id)
    if not trip:
        return jsonify({"error": "Trip not found"}), 404

    try:
        plan = generate_buffer_plan(trip_id, edge_id)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify(plan), 200


@risk_bp.route('/<trip_id>/connections/<edge_id>/buffer-plan/apply', methods=['POST'])
def post_apply_buffer_plan(trip_id, edge_id):
    """
    Apply the buffer plan: proactively shift the downstream node earlier
    (for shiftable node types) to rebuild a safe buffer BEFORE a disruption
    occurs, instead of only reacting after a webhook fires.
    ---
    tags:
      - Risk Radar
    parameters:
      - in: path
        name: trip_id
        type: string
        required: true
      - in: path
        name: edge_id
        type: string
        required: true
    responses:
      200:
        description: Buffer plan applied (or explanation of why it could not be)
      400:
        description: Invalid connection
      404:
        description: Trip not found
    """
    trip = db.session.get(Trip, trip_id)
    if not trip:
        return jsonify({"error": "Trip not found"}), 404

    try:
        result = apply_buffer_plan(trip_id, edge_id)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify(result), 200