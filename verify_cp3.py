import requests

BASE_URL = "http://127.0.0.1:5000/api"

print("--- FETCHING TRIPS TO DISRUPT ---")
trips_res = requests.get(f"{BASE_URL}/trips/invalid_id/graph") # Hack to check if our API is running
# Actually, we don't have a GET /trips endpoint to list trips. 
# We'll just create a fresh trip for this test so we can reliably fetch its nodes.

print("\n1. Seeding Data for Disruption Test...")
trip_id = requests.post(f"{BASE_URL}/trips", json={"name": "Disruption Cascade Trip"}).json()["id"]

requests.post(f"{BASE_URL}/nodes", json={
    "trip_id": trip_id,
    "node_type": "FLIGHT",
    "title": "Flight A",
    "location": "Airport 1",
    "start_time": "2026-10-01T10:00:00Z",
    "end_time": "2026-10-01T12:00:00Z"
})
node_a = requests.get(f"{BASE_URL}/trips/{trip_id}/graph").json()["nodes"][0]["id"]

requests.post(f"{BASE_URL}/nodes", json={
    "trip_id": trip_id,
    "node_type": "CAB",
    "title": "Cab to Hotel",
    "location": "Airport 1",
    "start_time": "2026-10-01T13:30:00Z", # Starts 1.5 hrs after Flight A
    "end_time": "2026-10-01T14:30:00Z"
})

requests.post(f"{BASE_URL}/nodes", json={
    "trip_id": trip_id,
    "node_type": "HOTEL",
    "title": "Hotel Check-in",
    "location": "Downtown",
    "start_time": "2026-10-01T15:00:00Z", # 30 mins after cab ends
    "end_time": "2026-10-02T10:00:00Z",
    "hard_cutoff": "2026-10-01T18:00:00Z" # Miss check-in if delayed past 6 PM
})

print("Initial Graph Seeded.")

print("\n2. Executing Disruption (+300 minutes on Flight A)...")
res = requests.post(f"{BASE_URL}/trips/{trip_id}/disrupt", json={
    "node_id": node_a,
    "delay_minutes": 300, # 5 hour delay
    "reason": "Severe Weather"
})
data = res.json()

print("\n--- DIAGNOSTIC IMPACTS ---")
print(data.get("impacts"))

print("\n--- UPDATED GRAPH STATUS ---")
for node in data.get("updated_graph", {}).get("nodes", []):
    print(f"[{node['status']}] {node['title']} (Starts: {node['start_time']})")
