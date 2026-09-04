"""
app/services/cohort_constraints.py
Cohort Constraint Engine for TripResQ.
Validates whether candidate recovery plans violate Trip Cohort constraints:
1. CHILD_GUARDIAN (HARD): Minors (CHILD / INFANT) must remain on the same transit flight as >= 1 designated guardian.
2. COHORT_COHESION (HARD): By default, cohort members must not be split across different transit flights (unless advance party is permitted).
3. BOOKING_DEPENDENCY (SOFT): Warnings for shared dependencies (e.g. primary car driver or hotel guest on a later flight).
"""

from typing import Dict, List, Any, Optional, Union
from app.models.cohort import TripCohort, Traveler, TravelerType

RULE_CHILD_GUARDIAN = "CHILD_GUARDIAN"
RULE_COHORT_COHESION = "COHORT_COHESION"
RULE_BOOKING_DEPENDENCY = "BOOKING_DEPENDENCY"

SEVERITY_HARD = "HARD"
SEVERITY_SOFT = "SOFT"


def _normalize_cohort(cohort: Union[TripCohort, Dict[str, Any]]) -> Dict[str, Any]:
    """Ensures cohort is represented as a normalized dictionary."""
    if hasattr(cohort, "to_dict"):
        return cohort.to_dict()
    elif isinstance(cohort, dict):
        return cohort
    raise ValueError(f"Unsupported cohort format: {type(cohort)}")


def extract_flight_assignments(
    cohort_dict: Dict[str, Any],
    recovery_plan: Dict[str, Any],
    trip_context: Optional[Dict[str, Any]] = None
) -> Dict[str, str]:
    """
    Extracts traveler_id -> flight_id assignment mapping.
    Supports:
    - recovery_plan["traveler_assignments"] = {"T1": "Flight-A", ...}
    - recovery_plan["flight_assignments"] = ...
    - trip_context["traveler_assignments"] = ...
    - Default: all members assigned to the plan's transit node_id or unified slot
    """
    members = cohort_dict.get("members", [])
    pnr_to_id = {m.get("pnr"): m.get("traveler_id") for m in members if m.get("pnr")}
    name_to_id = {m.get("name"): m.get("traveler_id") for m in members if m.get("name")}

    raw = (
        recovery_plan.get("traveler_assignments") or
        recovery_plan.get("flight_assignments") or
        recovery_plan.get("assignments") or
        (trip_context.get("traveler_assignments") if trip_context else None) or
        {}
    )

    assignments: Dict[str, str] = {}

    if isinstance(raw, dict):
        for key, flight_val in raw.items():
            # Resolve key to traveler_id
            t_id = key
            if key in pnr_to_id:
                t_id = pnr_to_id[key]
            elif key in name_to_id:
                t_id = name_to_id[key]
            assignments[t_id] = str(flight_val)

    elif isinstance(raw, list):
        for item in raw:
            if isinstance(item, dict):
                t_key = item.get("traveler_id") or item.get("pnr") or item.get("name")
                f_val = item.get("flight_id") or item.get("flight") or item.get("transit_id")
                if t_key and f_val:
                    t_id = pnr_to_id.get(t_key, name_to_id.get(t_key, t_key))
                    assignments[t_id] = str(f_val)

    # Default fallback: If no split assignments are given, all travelers stay unified
    # on the recovery plan's primary transit node
    default_flight = (
        recovery_plan.get("flight_id") or
        recovery_plan.get("node_id") or
        recovery_plan.get("id") or
        "FLIGHT-UNIFIED"
    )
    for m in members:
        t_id = m.get("traveler_id")
        if t_id and t_id not in assignments:
            assignments[t_id] = str(default_flight)

    return assignments


def validate_cohort_recovery(
    cohort: Union[TripCohort, Dict[str, Any]],
    recovery_plan: Dict[str, Any],
    trip_context: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Validates whether a candidate recovery plan is safe for the Trip Cohort.
    
    Returns:
    {
      "valid": bool,
      "violations": [
         {
           "rule": "CHILD_GUARDIAN" | "COHORT_COHESION" | "BOOKING_DEPENDENCY",
           "severity": "HARD" | "SOFT",
           "traveler_id": "...",
           "message": "..."
         }
      ],
      "warnings": [...],
      "seating": {
         "preference": "ADJACENT" | "STANDARD",
         "status": "REQUESTED" | "NOT_REQUESTED"
      }
    }
    """
    cohort_dict = _normalize_cohort(cohort)
    members = cohort_dict.get("members", [])
    settings = cohort_dict.get("settings", {})
    context = trip_context or {}

    violations: List[Dict[str, Any]] = []

    # Extract flight assignments for each member
    assignments = extract_flight_assignments(cohort_dict, recovery_plan, context)

    # -------------------------------------------------------------------------
    # RULE 1 (HARD): CHILD / INFANT GUARDIAN
    # Minors must be on the same flight as >= 1 designated guardian.
    # -------------------------------------------------------------------------
    child_requires_guardian = settings.get("child_requires_guardian", True)

    if child_requires_guardian:
        for traveler in members:
            t_type = (traveler.get("type") or TravelerType.ADULT.value).upper()
            if t_type in [TravelerType.CHILD.value, TravelerType.INFANT.value]:
                t_id = traveler.get("traveler_id")
                t_name = traveler.get("name", t_id)
                child_flight = assignments.get(t_id)

                if not child_flight:
                    continue

                # Determine eligible guardians
                guardian_ids = traveler.get("guardian_ids") or []
                if not guardian_ids:
                    # Default: All adults in cohort
                    guardian_ids = [
                        m.get("traveler_id") for m in members
                        if (m.get("type") or TravelerType.ADULT.value).upper() == TravelerType.ADULT.value
                    ]

                # Check if at least one guardian is on child_flight
                has_guardian_on_flight = any(
                    assignments.get(g_id) == child_flight for g_id in guardian_ids
                )

                if not has_guardian_on_flight:
                    violations.append({
                        "rule": RULE_CHILD_GUARDIAN,
                        "severity": SEVERITY_HARD,
                        "traveler_id": t_id,
                        "traveler_name": t_name,
                        "flight": child_flight,
                        "message": f"{t_name} would be separated from all designated guardians."
                    })

    # Extract set of distinct flights assigned to travelers
    assigned_flights = {
        assignments.get(m.get("traveler_id"))
        for m in members
        if assignments.get(m.get("traveler_id"))
    }

    # -------------------------------------------------------------------------
    # RULE 2 (HARD): COHORT COHESION & ADVANCE PARTY STRATEGY
    # By default, members of the same cohort should remain on the same flight.
    # Exception: advance_party_allowed allows adults to travel ahead, BUT
    # unaccompanied minors are NEVER permitted.
    # -------------------------------------------------------------------------
    keep_together = settings.get("keep_group_together", True)

    # Determine if advance party is enabled
    advance_party_allowed = False
    if "advance_party_allowed" in context:
        advance_party_allowed = bool(context["advance_party_allowed"])
    elif "advance_party_allowed" in recovery_plan:
        advance_party_allowed = bool(recovery_plan["advance_party_allowed"])
    elif "advance_party_allowed" in settings:
        advance_party_allowed = bool(settings["advance_party_allowed"])

    if keep_together and len(assigned_flights) > 1:
        # Group is split across distinct flights
        if advance_party_allowed:
            # Advance party permitted if no child is unaccompanied
            pass
        else:
            violations.append({
                "rule": RULE_COHORT_COHESION,
                "severity": SEVERITY_HARD,
                "message": "The travel cohort would be split across multiple flights."
            })

    # -------------------------------------------------------------------------
    # RULE 3 (SOFT): SHARED BOOKING DEPENDENCIES
    # Warnings for shared bookings (e.g. hotel room lead or rental car driver).
    # -------------------------------------------------------------------------
    shared_deps = (
        context.get("shared_dependencies") or
        recovery_plan.get("shared_dependencies") or
        cohort_dict.get("shared_dependencies") or
        []
    )

    if isinstance(shared_deps, list):
        for dep in shared_deps:
            if isinstance(dep, dict):
                resp_id = dep.get("responsible_traveler_id") or dep.get("traveler_id")
                dep_type = dep.get("type", "booking")
                # If responsible traveler is on a split flight
                if resp_id and len(assigned_flights) > 1:
                    violations.append({
                        "rule": RULE_BOOKING_DEPENDENCY,
                        "severity": SEVERITY_SOFT,
                        "traveler_id": resp_id,
                        "message": dep.get("message") or f"Primary {dep_type.lower()} responsible traveler arrives on a separate flight."
                    })

    # -------------------------------------------------------------------------
    # SEATING PREFERENCE
    # -------------------------------------------------------------------------
    adjacent_preference = bool(settings.get("adjacent_seating_preference", True))
    seating_meta = {
        "preference": "ADJACENT" if adjacent_preference else "STANDARD",
        "status": "REQUESTED" if adjacent_preference else "NOT_REQUESTED"
    }

    has_hard_violations = any(v.get("severity") == SEVERITY_HARD for v in violations)
    warnings = [v for v in violations if v.get("severity") == SEVERITY_SOFT]

    return {
        "valid": not has_hard_violations,
        "violations": violations,
        "warnings": warnings,
        "seating": seating_meta
    }


def get_demo_cohort_scenarios(trip_id: str, cohort: Optional[Union[TripCohort, Dict[str, Any]]] = None) -> Dict[str, Any]:
    """
    Generates deterministic evaluation for the core demo scenario:
    1. Flawed Airline Split:
       - Adult 1 (Rahul) -> Flight A
       - Adult 2 (Priya) -> Flight B
       - Child (Aarav) -> Flight C alone
       -> Yields INVALID (CHILD_GUARDIAN, COHORT_COHESION)
    2. TripResQ Unified Family Rescue:
       - Adult 1 (Rahul) -> Flight X
       - Adult 2 (Priya) -> Flight X
       - Child (Aarav) -> Flight X
       -> Yields VALID
    3. Advance Party Scenario:
       - Adult 1 (Rahul) -> Flight A (Advance)
       - Adult 2 (Priya) -> Flight B
       - Child (Aarav) -> Flight B (Accompanied)
       -> Yields VALID under advance party strategy
    """
    cohort_dict = _normalize_cohort(cohort) if cohort else None
    if not cohort_dict:
        from app.services.cohort import DEMO_COHORT_DATA
        cohort_dict = DEMO_COHORT_DATA

    airline_split_candidate = {
        "id": "plan-airline-split-demo",
        "title": "Airline Automated Split Rebooking",
        "traveler_assignments": {
            "T1": "FLIGHT-A",
            "T2": "FLIGHT-B",
            "T3": "FLIGHT-C"
        }
    }
    split_eval = validate_cohort_recovery(cohort_dict, airline_split_candidate)

    unified_candidate = {
        "id": "plan-unified-rescue-demo",
        "title": "TripResQ Unified Family Rescue",
        "traveler_assignments": {
            "T1": "FLIGHT-X",
            "T2": "FLIGHT-X",
            "T3": "FLIGHT-X"
        }
    }
    unified_eval = validate_cohort_recovery(cohort_dict, unified_candidate)

    advance_party_candidate = {
        "id": "plan-advance-party-demo",
        "title": "Advance Party Route Split",
        "advance_party_allowed": True,
        "traveler_assignments": {
            "T1": "FLIGHT-A",
            "T2": "FLIGHT-B",
            "T3": "FLIGHT-B"
        }
    }
    advance_eval = validate_cohort_recovery(cohort_dict, advance_party_candidate, {"advance_party_allowed": True})

    traveler_details = [
        {
            "traveler_id": "T1",
            "name": "Rahul",
            "role": "ADULT • GUARDIAN",
            "avatar": "👨",
            "pnr": "PNR-A123",
            "flight": "Flight AI-204 (Air India)",
            "departure": "14:15 • Terminal 3",
            "status": "Separated on Flight A",
            "is_minor_alone": False
        },
        {
            "traveler_id": "T2",
            "name": "Priya",
            "role": "ADULT • GUARDIAN",
            "avatar": "👩",
            "pnr": "PNR-B456",
            "flight": "Flight 6E-501 (IndiGo)",
            "departure": "16:30 • Terminal 1",
            "status": "Separated on Flight B",
            "is_minor_alone": False
        },
        {
            "traveler_id": "T3",
            "name": "Aarav",
            "role": "CHILD (AGE 8) • MINOR",
            "avatar": "👦",
            "pnr": "PNR-C789",
            "flight": "Flight UK-812 (Vistara)",
            "departure": "18:00 • Terminal 2",
            "status": "UNACCOMPANIED MINOR HAZARD",
            "is_minor_alone": True
        }
    ]

    return {
        "trip_id": trip_id,
        "cohort": cohort_dict,
        "source": "backend",
        "scenarios": {
            "airline_split": {
                "plan": airline_split_candidate,
                "traveler_details": traveler_details,
                "validation": split_eval
            },
            "unified_rescue": {
                "plan": unified_candidate,
                "validation": unified_eval
            },
            "advance_party": {
                "plan": advance_party_candidate,
                "validation": advance_eval
            }
        }
    }
