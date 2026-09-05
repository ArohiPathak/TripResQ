import pytest
from datetime import datetime, timedelta, timezone
from app import create_app
from app.core.db import db
from app.models.node import ItineraryNode, NodeType
from app.models.trip import Trip
from app.services.risk import (
    load_historical_delays,
    lookup_historical_delay,
    calculate_data_confidence,
    score_connection,
    compute_trip_risk_radar,
    _record_new_alerts,
    CONFIGURED_WEIGHTS,
)
from app.services.buffer_plan import generate_buffer_plan, apply_buffer_plan


@pytest.fixture
def client():
    app = create_app({"TESTING": True, "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:"})
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client


# ---------------------------------------------------------------------------
# 1. Historical Delay Matching Tests
# ---------------------------------------------------------------------------
def test_historical_csv_loading():
    records = load_historical_delays()
    assert len(records) > 0
    first = records[0]
    assert "mode" in first
    assert "origin" in first
    assert "destination" in first
    assert "delayed_30" in first
    assert "sample_size" in first


def test_historical_matching_hierarchy():
    # 1. Exact service_number match
    res_svc = lookup_historical_delay(
        mode="FLIGHT", origin="BOM", destination="DEL", month=9,
        operator="IndiGo", service_number="6E-201"
    )
    assert res_svc["available"] is True
    assert res_svc["match_type"] == "service_number_route_month"
    assert res_svc["sample_size"] == 148
    assert res_svc["risk"] == 36 / 148

    # 2. Operator + Route + Month match
    res_op = lookup_historical_delay(
        mode="FLIGHT", origin="BOM", destination="DEL", month=9,
        operator="IndiGo", service_number="UNKNOWN-999"
    )
    assert res_op["available"] is True
    assert res_op["match_type"] == "operator_route_month"

    # 3. Route + Month match
    res_rm = lookup_historical_delay(
        mode="FLIGHT", origin="BOM", destination="DEL", month=9,
        operator="UnknownAir", service_number=None
    )
    assert res_rm["available"] is True
    assert res_rm["match_type"] in ("route_month", "route")

    # 4. Route regardless of month
    res_r = lookup_historical_delay(
        mode="FLIGHT", origin="BOM", destination="DEL", month=5,  # Month 5 has no specific entry
        operator=None, service_number=None
    )
    assert res_r["available"] is True
    assert res_r["match_type"] == "route"

    # 5. Missing / Unmatched route does not invent data
    res_none = lookup_historical_delay(
        mode="FLIGHT", origin="XYZ", destination="ABC", month=1
    )
    assert res_none["available"] is False


# ---------------------------------------------------------------------------
# 2. Data Confidence Calculation Tests
# ---------------------------------------------------------------------------
def test_data_confidence_scoring():
    assert calculate_data_confidence(300)["level"] == "HIGH"
    assert calculate_data_confidence(300)["score"] == 90

    assert calculate_data_confidence(100)["level"] == "MEDIUM"
    assert calculate_data_confidence(100)["score"] == 70

    assert calculate_data_confidence(30)["level"] == "LOW"
    assert calculate_data_confidence(30)["score"] == 50

    assert calculate_data_confidence(10)["level"] == "VERY_LOW"
    assert calculate_data_confidence(10)["score"] == 25

    assert calculate_data_confidence(0)["level"] == "INSUFFICIENT_DATA"
    assert calculate_data_confidence(0)["score"] == 0

    assert calculate_data_confidence(None)["level"] == "INSUFFICIENT_DATA"
    assert calculate_data_confidence(None)["score"] == 0


# ---------------------------------------------------------------------------
# 3. Weight Re-normalization & Explainability Tests
# ---------------------------------------------------------------------------
def test_weight_renormalization_with_and_without_history():
    now = datetime(2026, 9, 10, 10, 0, 0, tzinfo=timezone.utc)

    # Node with matched history (BOM -> DEL, 6E-201 in September)
    flight_matched = ItineraryNode(
        id="f1", trip_id="t1", node_type="FLIGHT", title="IndiGo Flight",
        location="Mumbai", origin="BOM", destination="DEL",
        operator="IndiGo", service_number="6E-201",
        start_time=now, end_time=now + timedelta(hours=2),
    )
    cab_node = ItineraryNode(
        id="c1", trip_id="t1", node_type="CAB", title="Airport Cab",
        location="Delhi", start_time=now + timedelta(hours=2, minutes=30),  # 30 min buffer
        end_time=now + timedelta(hours=3, minutes=30),
    )

    scored_matched = score_connection(flight_matched, cab_node, min_buffer_minutes=30)
    factors_m = scored_matched["factors"]
    assert factors_m["historical"]["available"] is True
    assert factors_m["historical"]["effective_weight"] == 0.40
    assert factors_m["buffer"]["effective_weight"] == 0.40
    assert factors_m["seasonal"]["effective_weight"] == 0.20
    assert scored_matched["data_confidence"]["level"] == "MEDIUM"
    # Verify confidence is NOT (100 - risk_score)
    assert scored_matched["data_confidence"]["score"] != (100 - scored_matched["risk_score"])

    # Node WITHOUT matched history
    flight_unmatched = ItineraryNode(
        id="f2", trip_id="t1", node_type="FLIGHT", title="Custom Air",
        location="Paris", origin="CDG", destination="FCO",
        start_time=now, end_time=now + timedelta(hours=2),
    )
    scored_unmatched = score_connection(flight_unmatched, cab_node, min_buffer_minutes=30)
    factors_u = scored_unmatched["factors"]
    assert factors_u["historical"]["available"] is False
    # Re-normalized: buffer = 0.40 / 0.60 = 0.667, seasonal = 0.20 / 0.60 = 0.333
    assert factors_u["buffer"]["effective_weight"] == pytest.approx(0.667, 0.01)
    assert factors_u["seasonal"]["effective_weight"] == pytest.approx(0.333, 0.01)
    assert scored_unmatched["data_confidence"]["level"] == "INSUFFICIENT_DATA"


# ---------------------------------------------------------------------------
# 4. Zero Artificial Jitter / Determinism Test
# ---------------------------------------------------------------------------
def test_zero_artificial_jitter():
    now = datetime(2026, 9, 10, 10, 0, 0, tzinfo=timezone.utc)
    flight = ItineraryNode(
        id="f1", trip_id="t1", node_type="FLIGHT", title="Flight",
        location="Mumbai", origin="BOM", destination="DEL",
        start_time=now, end_time=now + timedelta(hours=2),
    )
    cab = ItineraryNode(
        id="c1", trip_id="t1", node_type="CAB", title="Cab",
        location="Delhi", start_time=now + timedelta(hours=2, minutes=30),
        end_time=now + timedelta(hours=3, minutes=30),
    )

    score_1 = score_connection(flight, cab, 30)["risk_score"]
    score_2 = score_connection(flight, cab, 30)["risk_score"]
    score_3 = score_connection(flight, cab, 30)["risk_score"]

    assert score_1 == score_2 == score_3


# ---------------------------------------------------------------------------
# 5. Proactive Alert Deduplication Tests
# ---------------------------------------------------------------------------
def test_alert_deduplication():
    trip_id = "test-alert-trip"

    scan_1 = {
        "generated_at": "2026-09-04T10:00:00Z",
        "connections": [
            {
                "source_node_id": "s1",
                "target_node_id": "t1",
                "target_title": "Cab 1",
                "risk_level": "HIGH",
                "risk_score": 68,
                "message": "High risk layover",
            }
        ],
    }

    # First transition to HIGH generates 1 alert
    alerts_1 = _record_new_alerts(trip_id, None, scan_1)
    assert len(alerts_1) == 1

    # Repeated scan while remaining HIGH should generate 0 new alerts
    scan_2 = {
        "generated_at": "2026-09-04T10:00:45Z",
        "connections": [
            {
                "source_node_id": "s1",
                "target_node_id": "t1",
                "target_title": "Cab 1",
                "risk_level": "HIGH",
                "risk_score": 68,
                "message": "High risk layover",
            }
        ],
    }
    alerts_2 = _record_new_alerts(trip_id, scan_1, scan_2)
    assert len(alerts_2) == 0

    # If it falls to LOW then climbs to HIGH again, it creates a new alert
    scan_3_low = {
        "generated_at": "2026-09-04T10:01:30Z",
        "connections": [
            {
                "source_node_id": "s1",
                "target_node_id": "t1",
                "target_title": "Cab 1",
                "risk_level": "LOW",
                "risk_score": 20,
                "message": "Low risk layover",
            }
        ],
    }
    alerts_3 = _record_new_alerts(trip_id, scan_2, scan_3_low)
    assert len(alerts_3) == 0

    scan_4_high = {
        "generated_at": "2026-09-04T10:02:15Z",
        "connections": [
            {
                "source_node_id": "s1",
                "target_node_id": "t1",
                "target_title": "Cab 1",
                "risk_level": "HIGH",
                "risk_score": 65,
                "message": "High risk layover",
            }
        ],
    }
    alerts_4 = _record_new_alerts(trip_id, scan_3_low, scan_4_high)
    assert len(alerts_4) == 1


# ---------------------------------------------------------------------------
# 6. Full E2E Itinerary, Risk Radar & Buffer Plan API Tests
# ---------------------------------------------------------------------------
def test_e2e_risk_radar_and_buffer_plan(client):
    # 1. Create Trip
    res = client.post('/api/trips', json={"name": "Risk Radar E2E Trip"})
    assert res.status_code == 201
    trip_id = res.json["id"]

    now = datetime(2026, 9, 10, 10, 0, 0, tzinfo=timezone.utc)

    # 2. Add Transport Node (Flight BOM -> DEL)
    res_f = client.post('/api/nodes', json={
        "trip_id": trip_id,
        "node_type": "FLIGHT",
        "title": "Flight 6E-201",
        "location": "Mumbai Airport",
        "origin": "BOM",
        "destination": "DEL",
        "operator": "IndiGo",
        "service_number": "6E-201",
        "start_time": now.isoformat(),
        "end_time": (now + timedelta(hours=2)).isoformat(),
    })
    assert res_f.status_code == 201

    # 3. Add Downstream Cab Node with tight buffer (10 min buffer)
    res_c = client.post('/api/nodes', json={
        "trip_id": trip_id,
        "node_type": "CAB",
        "title": "Delhi Airport Cab",
        "location": "Delhi Airport T3",
        "start_time": (now + timedelta(hours=2, minutes=10)).isoformat(),
        "end_time": (now + timedelta(hours=3, minutes=0)).isoformat(),
    })
    assert res_c.status_code == 201

    # 4. Add Downstream Hotel Node
    res_h = client.post('/api/nodes', json={
        "trip_id": trip_id,
        "node_type": "HOTEL",
        "title": "The Grand Delhi",
        "location": "New Delhi",
        "start_time": (now + timedelta(hours=3, minutes=30)).isoformat(),
        "end_time": (now + timedelta(days=1)).isoformat(),
    })
    assert res_h.status_code == 201

    # 5. Verify Graph returns route fields
    graph_res = client.get(f'/api/trips/{trip_id}/graph')
    assert graph_res.status_code == 200
    graph_data = graph_res.json
    assert len(graph_data["nodes"]) == 3
    assert len(graph_data["edges"]) == 2
    flight_node = next(n for n in graph_data["nodes"] if n["type"] == "FLIGHT")
    assert flight_node["origin"] == "BOM"
    assert flight_node["destination"] == "DEL"
    assert flight_node["service_number"] == "6E-201"

    # 6. Query Risk Radar (Runs without /disrupt)
    radar_res = client.get(f'/api/trips/{trip_id}/risk-radar?refresh=true')
    assert radar_res.status_code == 200
    radar_data = radar_res.json
    assert "overall_risk_score" in radar_data
    assert "data_confidence" in radar_data
    assert len(radar_data["connections"]) == 2

    # Check connection breakdown
    first_conn = radar_data["connections"][0]
    assert first_conn["source_origin"] == "BOM"
    assert first_conn["source_destination"] == "DEL"
    assert first_conn["factors"]["historical"]["available"] is True
    assert first_conn["factors"]["historical"]["sample_size"] == 148
    assert first_conn["data_confidence"]["level"] == "MEDIUM"

    edge_id = first_conn["edge_id"]

    # 7. Pre-compute Buffer Plan (Read-Only)
    plan_res = client.post(f'/api/trips/{trip_id}/connections/{edge_id}/buffer-plan')
    assert plan_res.status_code == 200
    plan_data = plan_res.json
    assert plan_data["can_auto_apply"] is True
    assert plan_data["projected"]["risk_score"] < plan_data["current"]["risk_score"]

    # 8. Apply Buffer Plan (Shifts Cab later to build safe buffer)
    apply_res = client.post(f'/api/trips/{trip_id}/connections/{edge_id}/buffer-plan/apply')
    assert apply_res.status_code == 200
    apply_data = apply_res.json
    assert apply_data["applied"] is True
    assert apply_data["shifted_minutes_later"] > 0

    # 9. Verify updated Risk Radar after applying buffer
    updated_radar = client.get(f'/api/trips/{trip_id}/risk-radar?refresh=true').json
    updated_conn = updated_radar["connections"][0]
    assert updated_conn["risk_score"] < first_conn["risk_score"]
