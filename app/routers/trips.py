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
    data = request.get_json()
    if not data or 'node_id' not in data or 'delay_minutes' not in data:
        return jsonify({"error": "node_id and delay_minutes are required"}), 400
        
    try:
        impacts = apply_disruption(
            trip_id=trip_id,
            node_id=data['node_id'],
            delay_minutes=data['delay_minutes'],
            reason=data.get('reason', 'Unknown Delay')
        )
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
        
    # Return the updated graph and the diagnostic breakdown
    graph_response = get_trip_graph(trip_id)[0].get_json()
    return jsonify({
        "message": "Disruption applied and propagated successfully",
        "impacts": impacts,
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
    return jsonify({
        "message": "Recovery plan applied atomically. Trip restored.",
        "updated_graph": graph_response
    }), 200
