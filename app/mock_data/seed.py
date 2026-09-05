"""
Central demo trip seeder for TripResQ.
Creates the full Delhi → Goa Family Vacation scenario in the existing SQLite database.
Uses existing models (Trip, ItineraryNode, DependencyEdge, TripCohort, Traveler)
and existing services (linker, cohort) — no new tables, no second database.
"""

from datetime import datetime, timedelta
from app.core.db import db
from app.models.trip import Trip
from app.models.node import ItineraryNode, NodeStatus
from app.services.linker import run_auto_linker
from app.services.cohort import create_demo_cohort_for_trip

from app.mock_data.flights import FLIGHTS
from app.mock_data.cabs import CABS
from app.mock_data.hotels import HOTELS

# Deterministic demo trip ID so the same scenario is reproducible
DEMO_TRIP_ID = "DEMO-TRIP-001"
DEMO_TRIP_NAME = "Delhi → Goa Family Vacation"


def _today_str():
    """Today's date as YYYY-MM-DD string."""
    return datetime.utcnow().strftime("%Y-%m-%d")


def _make_dt(hour: int, minute: int) -> datetime:
    """Create a datetime for today at the given hour:minute UTC."""
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    return today + timedelta(hours=hour, minutes=minute)


def demo_trip_exists() -> bool:
    """Check if the demo trip already exists in the database."""
    return db.session.get(Trip, DEMO_TRIP_ID) is not None


def delete_demo_trip():
    """Remove existing demo trip and all cascaded data (nodes, edges, cohort)."""
    existing = db.session.get(Trip, DEMO_TRIP_ID)
    if existing:
        db.session.delete(existing)
        db.session.commit()


def seed_demo_trip(force: bool = False) -> dict:
    """
    Seed the deterministic demo trip into the existing SQLite database.
    
    Creates:
    - 1 Trip record
    - 4 ItineraryNode records (2 flights + 1 cab + 1 hotel)
    - DependencyEdge records via run_auto_linker()
    - 1 TripCohort with 3 Travelers via create_demo_cohort_for_trip()
    
    Args:
        force: If True, delete and re-create even if the trip exists.
    
    Returns:
        Dict with trip_id and created node IDs.
    """
    if demo_trip_exists():
        if force:
            delete_demo_trip()
        else:
            # Return existing trip info
            trip = db.session.get(Trip, DEMO_TRIP_ID)
            nodes = ItineraryNode.query.filter_by(trip_id=DEMO_TRIP_ID).order_by(
                ItineraryNode.start_time
            ).all()
            return {
                "trip_id": DEMO_TRIP_ID,
                "trip_name": trip.name,
                "node_ids": [n.id for n in nodes],
                "already_existed": True,
            }

    # 1. Create Trip
    trip = Trip(id=DEMO_TRIP_ID, name=DEMO_TRIP_NAME)
    db.session.add(trip)
    db.session.flush()

    created_node_ids = []

    # 2. Create flight nodes
    for flight in FLIGHTS:
        node = ItineraryNode(
            trip_id=DEMO_TRIP_ID,
            node_type="FLIGHT",
            title=flight["title"],
            origin=flight.get("origin"),
            destination=flight.get("destination"),
            operator=flight.get("airline"),
            service_number=flight.get("code"),
            location=flight["location"],
            start_time=_make_dt(flight["start_hour"], flight["start_min"]),
            end_time=_make_dt(flight["end_hour"], flight["end_min"]),
            buffer_time=0,
            status=NodeStatus.OK.value,
        )
        db.session.add(node)
        db.session.flush()
        created_node_ids.append(node.id)

    # 3. Create cab node
    for cab in CABS:
        node = ItineraryNode(
            trip_id=DEMO_TRIP_ID,
            node_type="CAB",
            title=cab["title"],
            origin=cab.get("origin"),
            destination=cab.get("destination"),
            operator=cab.get("service"),
            location=cab["location"],
            start_time=_make_dt(cab["start_hour"], cab["start_min"]),
            end_time=_make_dt(cab["end_hour"], cab["end_min"]),
            buffer_time=0,
            hard_cutoff=_make_dt(cab["hard_cutoff_hour"], cab["hard_cutoff_min"]),
            status=NodeStatus.OK.value,
        )
        db.session.add(node)
        db.session.flush()
        created_node_ids.append(node.id)

    # 4. Create hotel node
    for hotel in HOTELS:
        node = ItineraryNode(
            trip_id=DEMO_TRIP_ID,
            node_type="HOTEL",
            title=hotel["title"],
            destination=hotel.get("city", "Goa"),
            location=hotel["location"],
            start_time=_make_dt(hotel["start_hour"], hotel["start_min"]),
            end_time=_make_dt(hotel["end_hour"], hotel["end_min"]),
            buffer_time=0,
            hard_cutoff=_make_dt(hotel["hard_cutoff_hour"], hotel["hard_cutoff_min"]),
            status=NodeStatus.OK.value,
        )
        db.session.add(node)
        db.session.flush()
        created_node_ids.append(node.id)

    db.session.commit()

    # 5. Run auto-linker to create dependency edges between consecutive nodes
    run_auto_linker(DEMO_TRIP_ID)

    # 6. Create demo cohort (Rahul, Priya, Aarav) using existing service
    try:
        create_demo_cohort_for_trip(DEMO_TRIP_ID)
    except Exception:
        pass  # Cohort may already exist if trip was partially created before

    return {
        "trip_id": DEMO_TRIP_ID,
        "trip_name": DEMO_TRIP_NAME,
        "node_ids": created_node_ids,
        "already_existed": False,
    }
