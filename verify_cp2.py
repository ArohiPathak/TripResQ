import requests
import time

BASE_URL = "http://127.0.0.1:5000"

def test_api():
    print("1. Creating Trip...")
    r = requests.post(f"{BASE_URL}/api/trips", json={"name": "API Test Trip"})
    trip = r.json()
    print("Trip:", trip)
    trip_id = trip["id"]
    
    print("\n2. Adding Flight Node...")
    r = requests.post(f"{BASE_URL}/api/nodes", json={
        "trip_id": trip_id,
        "node_type": "FLIGHT",
        "title": "Flight to Paris",
        "location": "CDG Airport",
        "start_time": "2026-10-01T10:00:00Z",
        "end_time": "2026-10-01T14:00:00Z"
    })
    print("Flight Node:", r.json())
    
    print("\n3. Adding Hotel Node...")
    r = requests.post(f"{BASE_URL}/api/nodes", json={
        "trip_id": trip_id,
        "node_type": "HOTEL",
        "title": "Paris Hotel",
        "location": "Paris Downtown",
        "start_time": "2026-10-01T16:00:00Z",
        "end_time": "2026-10-05T10:00:00Z"
    })
    print("Hotel Node:", r.json())
    
    print("\n4. Fetching Graph...")
    r = requests.get(f"{BASE_URL}/api/trips/{trip_id}/graph")
    graph = r.json()
    print("Nodes:", len(graph["nodes"]))
    print("Edges:", len(graph["edges"]))
    if graph["edges"]:
        edge = graph["edges"][0]
        print(f"Edge computed min_buffer_minutes: {edge['min_buffer_minutes']}")
    else:
        print("No edges found!")

if __name__ == "__main__":
    test_api()
