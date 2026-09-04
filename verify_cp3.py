import requests
from datetime import datetime, timedelta, timezone

BASE_URL = "http://127.0.0.1:5000/api"

print("1. Creating Trip...")
trip_res = requests.post(f"{BASE_URL}/trips", json={"name": "BFS Disruption Test"})
trip_id = trip_res.json()["id"]

now = datetime.now(timezone.utc)

print("2. Ingesting Nodes (Flight -> Cab -> Hotel)...")
# Flight
flight = requests.post(f"{BASE_URL}/nodes", json={
    "trip_id": trip_id, "node_type": "FLIGHT", "title": "Flight to Paris",
    "start_time": now.isoformat(), "end_time": (now + timedelta(hours=2)).isoformat()
}).json()

# Cab
cab = requests.post(f"{BASE_URL}/nodes", json={
    "trip_id": trip_id, "node_type": "CAB", "title": "Airport Transfer",
    "start_time": (now + timedelta(hours=3)).isoformat(), "end_time": (now + timedelta(hours=4)).isoformat()
}).json()

# Hotel (Hard Cutoff at +6 hours)
hotel = requests.post(f"{BASE_URL}/nodes", json={
    "trip_id": trip_id, "node_type": "HOTEL", "title": "Hotel Check-in",
    "start_time": (now + timedelta(hours=4, minutes=30)).isoformat(), "end_time": (now + timedelta(hours=24)).isoformat(),
    "hard_cutoff": (now + timedelta(hours=6)).isoformat()
}).json()

print("\n3. Triggering 5-Hour Flight Delay (Ripple Effect)...")
disrupt_res = requests.post(f"{BASE_URL}/trips/{trip_id}/disrupt", json={
    "node_id": flight["id"], "delay_minutes": 300, "reason": "Severe Weather"
})
impacts = disrupt_res.json().get("impacts", {})

print(f"\n--- DISRUPTION RESULTS ---")
print(f"Directly Impacted: {impacts.get('direct')}")
print(f"Shifted Downstream (At Risk): {impacts.get('downstream_shifted')}")
print(f"Broken Downstream (Cutoff Exceeded): {impacts.get('downstream_broken')}")