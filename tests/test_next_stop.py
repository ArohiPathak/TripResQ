import pytest
from datetime import datetime, timedelta, timezone
from app import create_app
from app.core.db import db

@pytest.fixture
def client():
    app = create_app({"TESTING": True, "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:"})
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client

def test_next_stop_flight_and_train_destinations(client):
    # 1. Create Trip
    res = client.post('/api/trips', json={"name": "Multi-Stop Transit Journey"})
    assert res.status_code == 201
    trip_id = res.json["id"]

    # 2. Add past node, future flight, future cab, future hotel
    now = datetime.now(timezone.utc)
    
    # Past train (already completed 2 hours ago)
    client.post('/api/nodes', json={
        "trip_id": trip_id,
        "node_type": "TRAIN",
        "title": "Local Express Train",
        "location": "Pune to Mumbai",
        "start_time": (now - timedelta(hours=5)).isoformat(),
        "end_time": (now - timedelta(hours=2)).isoformat()
    })

    # Upcoming Flight (arrives in 3 hours at Delhi)
    res_flight = client.post('/api/nodes', json={
        "trip_id": trip_id,
        "node_type": "FLIGHT",
        "title": "Flight AI-502",
        "location": "Mumbai to Delhi Airport",
        "start_time": (now + timedelta(hours=1)).isoformat(),
        "end_time": (now + timedelta(hours=3)).isoformat()
    })
    flight_id = res_flight.json["id"]

    # Upcoming Cab to Connaught Place
    client.post('/api/nodes', json={
        "trip_id": trip_id,
        "node_type": "CAB",
        "title": "Airport Taxi",
        "location": "Delhi Airport to Connaught Place",
        "start_time": (now + timedelta(hours=3, minutes=30)).isoformat(),
        "end_time": (now + timedelta(hours=4, minutes=30)).isoformat()
    })

    # Upcoming Hotel
    client.post('/api/nodes', json={
        "trip_id": trip_id,
        "node_type": "HOTEL",
        "title": "The Imperial Hotel",
        "location": "Janpath, Connaught Place, New Delhi",
        "start_time": (now + timedelta(hours=5)).isoformat(),
        "end_time": (now + timedelta(days=1)).isoformat()
    })

    # 3. Call GET /api/trips/<trip_id>/next-stop
    res = client.get(f'/api/trips/{trip_id}/next-stop')
    assert res.status_code == 200
    data = res.json
    assert data["available"] is True
    assert data["node_id"] == flight_id
    assert data["node_type"] == "FLIGHT"
    assert "Delhi Airport" in data["name"]

def test_next_stop_empty_or_completed_trip(client):
    # Empty trip
    res = client.post('/api/trips', json={"name": "Empty Journey"})
    trip_id = res.json["id"]

    res = client.get(f'/api/trips/{trip_id}/next-stop')
    assert res.status_code == 200
    data = res.json
    assert data["available"] is False
    assert data["reason"] == "NO_UPCOMING_STOP"

def test_next_stop_nonexistent_trip(client):
    res = client.get('/api/trips/non-existent-uuid/next-stop')
    assert res.status_code == 200
    data = res.json
    assert data["available"] is False
    assert data["reason"] == "NO_ACTIVE_TRIP"

def test_next_stop_historical_or_past_demo_trip(client):
    # Trip with historical/past dates (e.g. seeded hackathon demo)
    res = client.post('/api/trips', json={"name": "Past Demo Trip"})
    trip_id = res.json["id"]
    now = datetime.now(timezone.utc)

    # All nodes completed in the past
    client.post('/api/nodes', json={
        "trip_id": trip_id,
        "node_type": "FLIGHT",
        "title": "Flight 6E-301 (IndiGo)",
        "location": "Mumbai BOM T1 → Goa GOI",
        "destination": "Goa (GOI)",
        "start_time": (now - timedelta(days=2, hours=4)).isoformat(),
        "end_time": (now - timedelta(days=2, hours=2)).isoformat()
    })
    client.post('/api/nodes', json={
        "trip_id": trip_id,
        "node_type": "HOTEL",
        "title": "Taj Fort Aguada Check-In",
        "location": "Taj Fort Aguada, Sinquerim, Goa",
        "destination": "Goa",
        "start_time": (now - timedelta(days=2, hours=1)).isoformat(),
        "end_time": (now - timedelta(days=1)).isoformat()
    })

    res = client.get(f'/api/trips/{trip_id}/next-stop')
    assert res.status_code == 200
    data = res.json
    assert data["available"] is True
    assert data["destination"] == "Goa"
    assert "Goa Airport" in data["name"] or "Goa" in data["name"]

def test_next_stop_city_code_resolution(client):
    # Test airport / railway codes like HYD, PNQ, BLR
    res = client.post('/api/trips', json={"name": "Code Resolution Trip"})
    trip_id = res.json["id"]
    now = datetime.now(timezone.utc)

    client.post('/api/nodes', json={
        "trip_id": trip_id,
        "node_type": "FLIGHT",
        "title": "Flight to Hyderabad",
        "location": "DEL to HYD",
        "start_time": (now + timedelta(hours=1)).isoformat(),
        "end_time": (now + timedelta(hours=3)).isoformat()
    })

    res = client.get(f'/api/trips/{trip_id}/next-stop')
    assert res.status_code == 200
    data = res.json
    assert data["available"] is True
    assert data["destination"] == "Hyderabad"
    assert data["name"] == "Hyderabad Airport"
