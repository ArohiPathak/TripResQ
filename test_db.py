# test_db.py
from app import create_app
from app.core.db import db
from app.models.trip import Trip
from app.models.node import ItineraryNode, NodeType, NodeStatus
from app.models.edge import DependencyEdge, ConstraintType
import datetime

app = create_app()

with app.app_context():
    # 1. Create a trip
    trip = Trip(name="HackCelestial 2026 Pitch Trip")
    db.session.add(trip)
    db.session.commit()

    # 2. Create nodes (Flight and Hotel)
    now = datetime.datetime.utcnow()
    node1 = ItineraryNode(
        trip_id=trip.id,
        node_type=NodeType.FLIGHT.value,
        title="Flight to Paris",
        start_time=now,
        end_time=now + datetime.timedelta(hours=2),
        status=NodeStatus.OK.value
    )
    node2 = ItineraryNode(
        trip_id=trip.id,
        node_type=NodeType.HOTEL.value,
        title="Paris Hotel Check-in",
        start_time=now + datetime.timedelta(hours=3),
        end_time=now + datetime.timedelta(hours=24),
        status=NodeStatus.OK.value
    )
    db.session.add_all([node1, node2])
    db.session.commit()

    # 3. Create temporal dependency edge
    edge = DependencyEdge(
        source_node_id=node1.id,
        target_node_id=node2.id,
        min_buffer_minutes=60,
        constraint_type=ConstraintType.TEMPORAL.value
    )
    db.session.add(edge)
    db.session.commit()

    print("\n--- SCHEMA VERIFICATION SUCCESS ---")
    print(f"Trip Name: {trip.name} (ID: {trip.id})")
    print(f"Nodes Created: {len(trip.nodes)}")
    print(f"Edge Created: {edge.source_node.title} -> {edge.target_node.title} (Buffer: {edge.min_buffer_minutes}m)")
    print("-----------------------------------\n")
