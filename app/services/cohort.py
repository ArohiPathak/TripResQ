"""
Cohort Service for TripResQ
Manages Trip Cohorts, multi-traveler groupings, and PNR preservation.
"""
from typing import Dict, Any, Optional
from app.core.db import db
from app.models.trip import Trip
from app.models.cohort import TripCohort, Traveler, TravelerType

DEMO_COHORT_DATA: Dict[str, Any] = {
    "cohort_id": "COHORT-001",
    "name": "Family Trip",
    "members": [
        {
            "traveler_id": "T1",
            "name": "Rahul",
            "type": "ADULT",
            "pnr": "PNR-A123",
            "guardian_ids": []
        },
        {
            "traveler_id": "T2",
            "name": "Priya",
            "type": "ADULT",
            "pnr": "PNR-B456",
            "guardian_ids": []
        },
        {
            "traveler_id": "T3",
            "name": "Aarav",
            "type": "CHILD",
            "pnr": "PNR-C789",
            "guardian_ids": ["T1", "T2"]
        }
    ],
    "settings": {
        "keep_group_together": True,
        "child_requires_guardian": True,
        "adjacent_seating_preference": True
    }
}

def get_cohort_for_trip(trip_id: str) -> Optional[TripCohort]:
    """Retrieve the cohort linked to a specific trip."""
    return TripCohort.query.filter_by(trip_id=trip_id).first()

def get_cohort_by_id(cohort_id: str) -> Optional[TripCohort]:
    """Retrieve a cohort by its public identifier (e.g. COHORT-001)."""
    return TripCohort.query.filter_by(cohort_id=cohort_id).first()

def create_cohort_for_trip(trip_id: str, data: Dict[str, Any]) -> TripCohort:
    """
    Create or replace a Trip Cohort with its constituent travelers and PNRs.
    """
    trip = db.session.get(Trip, trip_id)
    if not trip:
        raise ValueError(f"Trip '{trip_id}' not found")

    members_raw = data.get("members", [])
    if not members_raw or not isinstance(members_raw, list):
        raise ValueError("Cohort must contain at least one member in 'members' list")

    cohort_id = data.get("cohort_id", "COHORT-001")
    name = data.get("name", "Family Trip")
    settings = data.get("settings", {})

    # Validate travelers
    traveler_objects = []
    seen_ids = set()
    for idx, m in enumerate(members_raw):
        t_id = m.get("traveler_id") or f"T{idx + 1}"
        if t_id in seen_ids:
            raise ValueError(f"Duplicate traveler_id '{t_id}' in cohort members")
        seen_ids.add(t_id)

        t_name = m.get("name")
        if not t_name:
            raise ValueError(f"Member at index {idx} requires a 'name'")

        t_type = (m.get("type") or TravelerType.ADULT.value).upper()
        if t_type not in [e.value for e in TravelerType]:
            raise ValueError(f"Invalid traveler type '{t_type}'. Allowed: {[e.value for e in TravelerType]}")

        t_pnr = m.get("pnr")
        if not t_pnr:
            raise ValueError(f"Member '{t_name}' requires a 'pnr'")

        guardian_ids = m.get("guardian_ids", [])
        if not isinstance(guardian_ids, list):
            guardian_ids = []

        traveler_objects.append({
            "traveler_id": t_id,
            "name": t_name,
            "type": t_type,
            "pnr": t_pnr,
            "guardian_ids": guardian_ids
        })

    # Validate guardian references exist in cohort
    for t in traveler_objects:
        if t["type"] in [TravelerType.CHILD.value, TravelerType.INFANT.value]:
            for g_id in t["guardian_ids"]:
                if g_id not in seen_ids:
                    raise ValueError(f"Guardian ID '{g_id}' for traveler '{t['traveler_id']}' does not exist in cohort")

    # Clean up existing cohort for this trip if one exists
    existing = TripCohort.query.filter_by(trip_id=trip_id).all()
    for old_cohort in existing:
        db.session.delete(old_cohort)
    db.session.flush()

    # Create new TripCohort
    cohort = TripCohort(
        cohort_id=cohort_id,
        trip_id=trip_id,
        name=name,
        keep_group_together=settings.get("keep_group_together", True),
        child_requires_guardian=settings.get("child_requires_guardian", True),
        adjacent_seating_preference=settings.get("adjacent_seating_preference", True)
    )
    db.session.add(cohort)
    db.session.flush()

    for t_data in traveler_objects:
        traveler = Traveler(
            cohort_pk=cohort.id,
            traveler_id=t_data["traveler_id"],
            name=t_data["name"],
            type=t_data["type"],
            pnr=t_data["pnr"],
            guardian_ids=t_data["guardian_ids"]
        )
        db.session.add(traveler)

    db.session.commit()
    return cohort

def create_demo_cohort_for_trip(trip_id: str) -> TripCohort:
    """Instantiate the deterministic demo cohort for development/testing."""
    return create_cohort_for_trip(trip_id, DEMO_COHORT_DATA)

def get_or_create_demo_cohort(trip_id: str) -> TripCohort:
    """Retrieve existing cohort or instantiate the deterministic demo cohort."""
    existing = get_cohort_for_trip(trip_id)
    if existing:
        return existing
    return create_demo_cohort_for_trip(trip_id)
