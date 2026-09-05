from flask import Blueprint, request, jsonify
from app.core.db import db
from app.models.trip import Trip
from app.models.node import ItineraryNode
from app.models.edge import DependencyEdge

trips_bp = Blueprint('trips', __name__, url_prefix='/api/trips')

@trips_bp.route('', methods=['POST'])
def create_trip():
    """
    Create a new Trip Session
    ---
    tags:
      - Trips
    parameters:
      - in: body
        name: body
        schema:
          type: object
          properties:
            name:
              type: string
    responses:
      201:
        description: Trip created
    """
    data = request.get_json()
    if not data or 'name' not in data:
        return jsonify({"error": "Name is required"}), 400
        
    trip = Trip(name=data['name'])
    db.session.add(trip)
    db.session.commit()
    
    return jsonify({"id": trip.id, "name": trip.name}), 201

@trips_bp.route('', methods=['GET'])
def list_trips():
    """
    List all Trip Sessions
    ---
    tags:
      - Trips
    responses:
      200:
        description: All trips returned
    """
    trips = Trip.query.order_by(Trip.created_at.desc()).all()
    return jsonify([{
        "id": t.id,
        "name": t.name,
        "created_at": t.created_at.isoformat() if t.created_at else None,
    } for t in trips]), 200

@trips_bp.route('/<trip_id>/risk-radar', methods=['GET'])
def get_risk_radar(trip_id):
    """
    Calculate Risk Radar scores for all nodes in a trip
    ---
    tags:
      - Risk Radar
    parameters:
      - in: path
        name: trip_id
        type: string
        required: true
    responses:
      200:
        description: Risk assessment returned
    """
    trip = db.session.get(Trip, trip_id)
    if not trip:
        return jsonify({"error": "Trip not found"}), 404

    nodes = ItineraryNode.query.filter_by(trip_id=trip_id).order_by(
        ItineraryNode.start_time
    ).all()

    from app.mock_data.weather import WEATHER_CONDITIONS, get_route_risk

    node_risks = []
    overall_risk = 0

    for node in nodes:
        loc = node.location or ""

        # Extract airport codes from location string
        origin_code = None
        dest_code = None
        if "→" in loc:
            parts = loc.split("→")
            origin_part = parts[0].strip()
            dest_part = parts[1].strip()
            # Try to extract 3-letter codes
            for code in WEATHER_CONDITIONS:
                if code in origin_part.upper():
                    origin_code = code
                if code in dest_part.upper():
                    dest_code = code

        # Calculate weather risk
        weather_risk = 0
        weather_data = {}
        if origin_code or dest_code:
            route_risk = get_route_risk(
                origin_code or "BOM", dest_code or "BOM"
            )
            weather_risk = route_risk["combined_risk_score"]
            weather_data = route_risk
        else:
            # For non-transit nodes (hotel, cab at destination), use dest weather
            for code in WEATHER_CONDITIONS:
                if code.lower() in loc.lower() or WEATHER_CONDITIONS[code]["city"].lower() in loc.lower():
                    weather_risk = WEATHER_CONDITIONS[code]["risk_score"]
                    weather_data = WEATHER_CONDITIONS[code]
                    break

        # Calculate buffer risk based on incoming edges
        buffer_risk = 0
        if node.status == "BROKEN":
            buffer_risk = 100
        elif node.status == "AT_RISK":
            buffer_risk = 70
        else:
            # Check buffer adequacy from edges
            from app.models.edge import DependencyEdge
            incoming = DependencyEdge.query.filter_by(target_node_id=node.id).first()
            if incoming:
                source = db.session.get(ItineraryNode, incoming.source_node_id)
                if source:
                    gap_mins = (node.start_time - source.end_time).total_seconds() / 60
                    if gap_mins < 30:
                        buffer_risk = 60
                    elif gap_mins < 60:
                        buffer_risk = 30
                    else:
                        buffer_risk = 10

        # Combined node risk (weather 60%, buffer 40%)
        combined = int(weather_risk * 0.6 + buffer_risk * 0.4)
        overall_risk = max(overall_risk, combined)

        if combined >= 70:
            level = "HIGH"
        elif combined >= 40:
            level = "MEDIUM"
        elif combined >= 15:
            level = "LOW"
        else:
            level = "NONE"

        node_risks.append({
            "node_id": node.id,
            "title": node.title,
            "type": node.node_type,
            "status": node.status,
            "weather_risk": weather_risk,
            "buffer_risk": buffer_risk,
            "combined_risk": combined,
            "risk_level": level,
            "weather": weather_data,
        })

    if overall_risk >= 70:
        trip_level = "HIGH"
    elif overall_risk >= 40:
        trip_level = "MEDIUM"
    elif overall_risk >= 15:
        trip_level = "LOW"
    else:
        trip_level = "NONE"

    return jsonify({
        "trip_id": trip_id,
        "overall_risk": overall_risk,
        "risk_level": trip_level,
        "nodes": node_risks,
    }), 200

@trips_bp.route('/<trip_id>/graph', methods=['GET'])
def get_trip_graph(trip_id):
    """
    Fetch the entire computed Graph for a trip
    ---
    tags:
      - Graph
    parameters:
      - in: path
        name: trip_id
        type: string
        required: true
    responses:
      200:
        description: Graph returned successfully
    """
    trip = db.session.get(Trip, trip_id)
    if not trip:
        return jsonify({"error": "Trip not found"}), 404
        
    # Get nodes
    nodes = ItineraryNode.query.filter_by(trip_id=trip_id).all()
    node_list = []
    for node in nodes:
        node_data = {
            "id": node.id,
            "type": node.node_type,
            "title": node.title,
            "location": node.location,
            "origin": node.origin,
            "destination": node.destination,
            "operator": node.operator,
            "service_number": node.service_number,
            "start_time": node.start_time.isoformat(),
            "end_time": node.end_time.isoformat(),
            "status": node.status
        }
        if node.hard_cutoff:
            node_data["hard_cutoff"] = node.hard_cutoff.isoformat()
        node_list.append(node_data)
        
    # Get edges connected to these nodes
    node_ids = [n.id for n in nodes]
    edges = DependencyEdge.query.filter(DependencyEdge.source_node_id.in_(node_ids)).all()
    
    edge_list = []
    for edge in edges:
        edge_list.append({
            "id": edge.id,
            "source": edge.source_node_id,
            "target": edge.target_node_id,
            "min_buffer_minutes": edge.min_buffer_minutes,
            "constraint_type": edge.constraint_type
        })
        
    return jsonify({
        "trip_id": trip.id,
        "trip_name": trip.name,
        "nodes": node_list,
        "edges": edge_list
    }), 200

from app.services.disruption import apply_disruption

@trips_bp.route('/<trip_id>/disrupt', methods=['POST'])
def disrupt_trip(trip_id):
    """
    Apply a time disruption to a Node and execute BFS propagation
    ---
    tags:
      - Graph Disruption
    parameters:
      - in: path
        name: trip_id
        type: string
        required: true
      - in: body
        name: body
        schema:
          type: object
          properties:
            node_id:
              type: string
            delay_minutes:
              type: integer
            reason:
              type: string
    responses:
      200:
        description: Disruption propagated
    """
    data = request.get_json() or {}
    if not data or 'node_id' not in data:
        return jsonify({"error": "node_id is required"}), 400

    delay_minutes = data.get('delay_minutes', 0)
    disruption_type = data.get('disruption_type') or data.get('type')
    reason = data.get('reason', 'Unknown Delay')

    try:
        res = apply_disruption(
            trip_id=trip_id,
            node_id=data['node_id'],
            delay_minutes=delay_minutes,
            reason=reason,
            disruption_type=disruption_type
        )
        if isinstance(res, tuple):
            impacts, metrics = res
        else:
            impacts = res
            metrics = impacts.get("metrics", {})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    # Return the updated graph and the diagnostic breakdown
    graph_response = get_trip_graph(trip_id)[0].get_json()
    return jsonify({
        "message": "Disruption applied and propagated successfully",
        "impacts": impacts,
        "metrics": metrics,
        "updated_graph": graph_response
    }), 200

from app.services.recovery import generate_recovery_proposals, generate_recovery_plans, apply_recovery_plan

@trips_bp.route('/<trip_id>/recover', methods=['POST'])
def recover_trip(trip_id):
    """
    Generate recovery proposals for broken nodes in the graph (backwards-compatible)
    ---
    tags:
      - Graph Recovery
    parameters:
      - in: path
        name: trip_id
        type: string
        required: true
    responses:
      200:
        description: Proposals and plans generated
    """
    trip = db.session.get(Trip, trip_id)
    if not trip:
        return jsonify({"error": "Trip not found"}), 404

    data = request.get_json(silent=True) or {}
    priority = data.get("priority", "FASTEST")

    proposals = generate_recovery_proposals(trip_id)
    recovery_data = generate_recovery_plans(trip_id=trip_id, priority=priority)

    return jsonify({
        "trip_id": trip_id,
        "proposals": proposals,
        "priority": recovery_data.get("priority"),
        "recommended_plan": recovery_data.get("recommended_plan"),
        "plans": recovery_data.get("plans")
    }), 200

from app.services.recovery import (
    generate_recovery_proposals,
    generate_recovery_plans,
    generate_recovery_options,
    apply_recovery_plan
)

@trips_bp.route('/<trip_id>/recovery-options', methods=['POST'])
def get_recovery_options(trip_id):
    """
    Generate preference-ranked recovery options for broken nodes in a trip
    ---
    tags:
      - Recovery Control
    parameters:
      - in: path
        name: trip_id
        type: string
        required: true
      - in: body
        name: body
        schema:
          type: object
          properties:
            priority:
              type: string
              enum: [FASTEST, CHEAPEST, MAX_REFUND, LEAST_DISRUPTION]
              default: FASTEST
    responses:
      200:
        description: Ranked recovery options returned
    """
    trip = db.session.get(Trip, trip_id)
    if not trip:
        return jsonify({"error": "Trip not found"}), 404

    data = request.get_json(silent=True) or {}
    priority = data.get("priority", "FASTEST")

    result = generate_recovery_options(trip_id=trip_id, priority=priority, trip_context=data)
    return jsonify(result), 200

@trips_bp.route('/<trip_id>/recovery', methods=['POST'])
def get_recovery_plans(trip_id):
    """
    Generate preference-ranked recovery plans for a disrupted trip
    """
    trip = db.session.get(Trip, trip_id)
    if not trip:
        return jsonify({"error": "Trip not found"}), 404

    data = request.get_json(silent=True) or {}
    priority = data.get("priority", "FASTEST")

    recovery_data = generate_recovery_options(trip_id=trip_id, priority=priority, trip_context=data)
    return jsonify(recovery_data), 200
    
@trips_bp.route('/<trip_id>/apply-plan', methods=['POST'])
def apply_plan(trip_id):
    """
    Atomically apply a list of recovery proposals to restore the trip
    ---
    tags:
      - Graph Recovery
    parameters:
      - in: path
        name: trip_id
        type: string
        required: true
      - in: body
        name: body
        schema:
          type: object
          properties:
            proposals:
              type: array
              items:
                type: object
    responses:
      200:
        description: Plan applied and trip restored
    """
    data = request.get_json()
    if not data or 'proposals' not in data:
        return jsonify({"error": "proposals list is required"}), 400
        
    apply_recovery_plan(trip_id, data['proposals'])
    
    # Return the restored graph
    graph_response = get_trip_graph(trip_id)[0].get_json()
    plan_info = data.get('plan') or {}
    
    return jsonify({
        "message": "Recovery plan applied atomically. Trip restored.",
        "updated_graph": graph_response,
        "applied_plan": plan_info,
        "strategy": plan_info.get("title", "Intelligent Personalized Recovery"),
        "priority": plan_info.get("priority", "FASTEST"),
        "replacement": plan_info.get("subtitle", "Confirmed Alternative Connection"),
        "cost": plan_info.get("estimated_cost", 0),
        "time_saved": plan_info.get("time_saved_minutes", 0),
        "refund": plan_info.get("estimated_refund", 0),
        "affected_nodes": plan_info.get("affected_nodes", len(data.get("proposals", [])))
    }), 200


@trips_bp.route('/<trip_id>/next-stop', methods=['GET'])
def get_next_stop(trip_id):
    """
    Detect the user's next upcoming itinerary stop for travel-aware dining and local services.
    ---
    tags:
      - Trips
    parameters:
      - in: path
        name: trip_id
        type: string
        required: true
      - in: query
        name: current_time
        type: string
        required: false
    responses:
      200:
        description: Next stop details or availability status
      404:
        description: Trip not found
    """
    from datetime import datetime, timezone

    trip = db.session.get(Trip, trip_id)
    if not trip:
        return jsonify({
            "available": False,
            "reason": "NO_ACTIVE_TRIP"
        }), 200

    # Optional reference time for testing or simulation
    curr_time_str = request.args.get('current_time')
    if curr_time_str:
        try:
            curr_time = datetime.fromisoformat(curr_time_str.replace('Z', '+00:00'))
        except ValueError:
            curr_time = datetime.now(timezone.utc)
    else:
        curr_time = datetime.now(timezone.utc)

    # Fetch all nodes ordered chronologically by start_time
    nodes = ItineraryNode.query.filter_by(trip_id=trip_id).order_by(ItineraryNode.start_time.asc()).all()
    if not nodes:
        return jsonify({
            "available": False,
            "reason": "NO_UPCOMING_STOP"
        }), 200

    CITY_NAMES = {
        "BOM": "Mumbai", "DEL": "Delhi", "PUN": "Pune", "BLR": "Bangalore",
        "HYD": "Hyderabad", "CCU": "Kolkata", "MAA": "Chennai", "AGR": "Agra",
        "GOI": "Goa", "PNQ": "Pune"
    }

    # Find the first node whose relevant end_time (or start_time for hotel/activity) is in the future
    upcoming_node = None
    for n in nodes:
        node_end = n.end_time
        if node_end.tzinfo is None and curr_time.tzinfo is not None:
            node_end = node_end.replace(tzinfo=timezone.utc)
        elif node_end.tzinfo is not None and curr_time.tzinfo is None:
            curr_time = curr_time.replace(tzinfo=timezone.utc)

        if node_end >= curr_time:
            upcoming_node = n
            break

    if not upcoming_node:
        return jsonify({
            "available": False,
            "reason": "NO_UPCOMING_STOP"
        }), 200

    node_type = (upcoming_node.node_type or "").upper()
    dest = upcoming_node.destination or ""
    dest_name = CITY_NAMES.get(dest.upper(), dest)
    loc = upcoming_node.location or ""
    title = upcoming_node.title or ""

    if node_type == "TRAIN":
        if dest_name:
            stop_name = f"{dest_name} Railway Station"
            stop_location = stop_name
        elif loc and not loc.startswith("Platform"):
            stop_name = loc
            stop_location = loc
        else:
            stop_name = title
            stop_location = loc or title
        destination = dest_name or dest or loc
        arrival_time = upcoming_node.end_time.isoformat()

    elif node_type == "FLIGHT":
        if dest_name:
            stop_name = f"{dest_name} Airport"
            stop_location = stop_name
        elif loc and not loc.startswith("Terminal"):
            stop_name = loc
            stop_location = loc
        else:
            stop_name = title
            stop_location = loc or title
        destination = dest_name or dest or loc
        arrival_time = upcoming_node.end_time.isoformat()

    elif node_type == "CAB":
        stop_name = loc or dest_name or title
        stop_location = loc or dest_name or title
        destination = dest_name or loc or title
        arrival_time = upcoming_node.end_time.isoformat()

    elif node_type == "HOTEL":
        stop_name = title
        stop_location = loc or title
        destination = dest_name or loc or title
        arrival_time = upcoming_node.start_time.isoformat()

    else:  # ACTIVITY or generic
        stop_name = title
        stop_location = loc or title
        destination = dest_name or loc or title
        arrival_time = upcoming_node.start_time.isoformat()

    return jsonify({
        "available": True,
        "trip_id": trip_id,
        "node_id": upcoming_node.id,
        "node_type": node_type,
        "name": stop_name,
        "location": stop_location,
        "destination": destination,
        "arrival_time": arrival_time,
        "latitude": None,
        "longitude": None
    }), 200

