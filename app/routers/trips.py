from flask import Blueprint, request, jsonify
from app.core.db import db
from app.models.trip import Trip
from app.models.node import ItineraryNode
from app.models.edge import DependencyEdge

trips_bp = Blueprint('trips', __name__, url_prefix='/api/trips')

@trips_bp.route('', methods=['POST'])
def create_trip():
    data = request.get_json()
    if not data or 'name' not in data:
        return jsonify({"error": "Name is required"}), 400
        
    trip = Trip(name=data['name'])
    db.session.add(trip)
    db.session.commit()
    
    return jsonify({"id": trip.id, "name": trip.name}), 201

@trips_bp.route('/<trip_id>/graph', methods=['GET'])
def get_trip_graph(trip_id):
    trip = db.session.get(Trip, trip_id)
    if not trip:
        return jsonify({"error": "Trip not found"}), 404
        
    # Get nodes
    nodes = ItineraryNode.query.filter_by(trip_id=trip_id).all()
    node_list = []
    for node in nodes:
        node_list.append({
            "id": node.id,
            "type": node.node_type,
            "title": node.title,
            "location": node.location,
            "start_time": node.start_time.isoformat(),
            "end_time": node.end_time.isoformat(),
            "status": node.status
        })
        
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
