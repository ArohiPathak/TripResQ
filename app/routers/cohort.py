from flask import Blueprint, request, jsonify
from app.services.cohort import (
    create_cohort_for_trip,
    get_cohort_for_trip,
    create_demo_cohort_for_trip,
    get_cohort_by_id
)

cohort_bp = Blueprint('cohort', __name__, url_prefix='/api')

@cohort_bp.route('/trips/<trip_id>/cohort', methods=['POST'])
def create_trip_cohort(trip_id):
    """
    Create a new Trip Cohort linking multiple travelers across separate PNRs
    ---
    tags:
      - Trip Cohort
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
            name:
              type: string
              default: Family Trip
            cohort_id:
              type: string
              default: COHORT-001
            settings:
              type: object
              properties:
                keep_group_together:
                  type: boolean
                child_requires_guardian:
                  type: boolean
                adjacent_seating_preference:
                  type: boolean
            members:
              type: array
              items:
                type: object
                properties:
                  traveler_id:
                    type: string
                  name:
                    type: string
                  type:
                    type: string
                    enum: [ADULT, CHILD, INFANT]
                  pnr:
                    type: string
                  guardian_ids:
                    type: array
                    items:
                      type: string
    responses:
      201:
        description: Cohort created successfully
      400:
        description: Validation error
      404:
        description: Trip not found
    """
    data = request.get_json(silent=True) or {}
    try:
        # If payload is empty or has demo=True or missing members, support creating demo cohort
        if not data or data.get("demo") is True or not data.get("members"):
            cohort = create_demo_cohort_for_trip(trip_id)
        else:
            cohort = create_cohort_for_trip(trip_id, data)
        return jsonify(cohort.to_dict()), 201
    except ValueError as e:
        msg = str(e)
        if "not found" in msg.lower():
            return jsonify({"error": msg}), 404
        return jsonify({"error": msg}), 400
    except Exception as e:
        return jsonify({"error": f"Failed to create cohort: {str(e)}"}), 500

@cohort_bp.route('/trips/<trip_id>/cohort', methods=['GET'])
def get_trip_cohort(trip_id):
    """
    Fetch the active Trip Cohort for a trip
    ---
    tags:
      - Trip Cohort
    parameters:
      - in: path
        name: trip_id
        type: string
        required: true
    responses:
      200:
        description: Cohort retrieved successfully
      404:
        description: Cohort not found
    """
    cohort = get_cohort_for_trip(trip_id)
    if not cohort:
        # Check if demo cohort generation was requested via query param
        if request.args.get('demo', '').lower() == 'true':
            try:
                cohort = create_demo_cohort_for_trip(trip_id)
                return jsonify(cohort.to_dict()), 200
            except ValueError as e:
                return jsonify({"error": str(e)}), 404
        return jsonify({"error": f"Cohort not found for trip '{trip_id}'"}), 404

    return jsonify(cohort.to_dict()), 200

@cohort_bp.route('/trips/<trip_id>/cohort/demo', methods=['POST'])
def create_demo_cohort(trip_id):
    """
    Create the standard deterministic demo cohort for development and testing
    ---
    tags:
      - Trip Cohort
    parameters:
      - in: path
        name: trip_id
        type: string
        required: true
    responses:
      201:
        description: Demo cohort created
      404:
        description: Trip not found
    """
    try:
        cohort = create_demo_cohort_for_trip(trip_id)
        return jsonify(cohort.to_dict()), 201
    except ValueError as e:
        msg = str(e)
        if "not found" in msg.lower():
            return jsonify({"error": msg}), 404
        return jsonify({"error": msg}), 400
    except Exception as e:
        return jsonify({"error": f"Failed to create demo cohort: {str(e)}"}), 500

@cohort_bp.route('/cohorts/<cohort_id>', methods=['GET'])
def get_cohort(cohort_id):
    """
    Fetch cohort by public cohort identifier
    ---
    tags:
      - Trip Cohort
    parameters:
      - in: path
        name: cohort_id
        type: string
        required: true
    responses:
      200:
        description: Cohort found
      404:
        description: Cohort not found
    """
    cohort = get_cohort_by_id(cohort_id)
    if not cohort:
        return jsonify({"error": f"Cohort '{cohort_id}' not found"}), 404
    return jsonify(cohort.to_dict()), 200

from app.services.cohort_constraints import validate_cohort_recovery, get_demo_cohort_scenarios

@cohort_bp.route('/trips/<trip_id>/cohort/validate-plan', methods=['POST'])
def validate_recovery_plan_endpoint(trip_id):
    """
    Validate a candidate recovery plan or traveler assignments against a Trip Cohort
    ---
    tags:
      - Cohort Constraint Engine
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
            plan:
              type: object
            traveler_assignments:
              type: object
            advance_party_allowed:
              type: boolean
    responses:
      200:
        description: Validation result returned
      404:
        description: Cohort or trip not found
    """
    cohort = get_cohort_for_trip(trip_id)
    if not cohort:
        return jsonify({"error": f"Cohort not found for trip '{trip_id}'"}), 404

    data = request.get_json(silent=True) or {}
    plan = data.get("plan") or data

    result = validate_cohort_recovery(cohort, plan, trip_context=data)
    return jsonify({
        "trip_id": trip_id,
        "cohort_id": cohort.cohort_id,
        "validation": result
    }), 200

@cohort_bp.route('/trips/<trip_id>/cohort/fracture-simulation', methods=['GET'])
def get_fracture_simulation_endpoint(trip_id):
    """
    Get deterministic evaluation for the core demo scenario:
    Airline Split vs TripResQ Unified Family Rescue vs Advance Party
    ---
    tags:
      - Cohort Constraint Engine
    parameters:
      - in: path
        name: trip_id
        type: string
        required: true
    responses:
      200:
        description: Simulation scenarios returned
    """
    cohort = get_cohort_for_trip(trip_id)
    scenarios_data = get_demo_cohort_scenarios(trip_id, cohort=cohort)
    return jsonify(scenarios_data), 200
