import requests

BASE_URL = "http://localhost:5000/api"

def test_full_integration_flow():
    print("--- 1. Testing Trip Creation ---")
    resp = requests.post(f"{BASE_URL}/trips", json={"name": "End To End Test Journey"})
    assert resp.status_code == 201, f"Failed trip creation: {resp.text}"
    trip_data = resp.json()
    trip_id = trip_data["id"]
    print(f"Success! Created Trip ID: {trip_id}")

    print("--- 2. Ingesting Nodes ---")
    nodes_data = [
        {"trip_id": trip_id, "node_type": "FLIGHT", "title": "Flight AI-101", "location": "NYC to LON", "start_time": "2026-09-10T10:00:00Z", "end_time": "2026-09-10T18:00:00Z"},
        {"trip_id": trip_id, "node_type": "CAB", "title": "Airport Express Cab", "location": "LHR Airport to Hotel", "start_time": "2026-09-10T19:00:00Z", "end_time": "2026-09-10T20:00:00Z"},
        {"trip_id": trip_id, "node_type": "HOTEL", "title": "London Ritz Hotel", "location": "Central London", "start_time": "2026-09-10T21:00:00Z", "end_time": "2026-09-11T12:00:00Z"}
    ]
    created_node_ids = []
    for nd in nodes_data:
        r = requests.post(f"{BASE_URL}/nodes", json=nd)
        assert r.status_code == 201, f"Failed node add: {r.text}"
        created_node_ids.append(r.json()["id"])
    print(f"Success! Added {len(created_node_ids)} nodes.")

    print("--- 3. Fetching Graph ---")
    r = requests.get(f"{BASE_URL}/trips/{trip_id}/graph")
    assert r.status_code == 200
    graph = r.json()
    assert len(graph["nodes"]) == 3
    assert len(graph["edges"]) == 2
    print(f"Success! Fetched graph with {len(graph['nodes'])} nodes & {len(graph['edges'])} computed edges.")

    print("--- 4. Applying Disruption (300 min delay on Flight) ---")
    flight_id = created_node_ids[0]
    r = requests.post(f"{BASE_URL}/trips/{trip_id}/disrupt", json={
        "node_id": flight_id,
        "delay_minutes": 300,
        "reason": "Severe Weather & Storms"
    })
    assert r.status_code == 200
    disrupt_res = r.json()
    impacts = disrupt_res["impacts"]
    print(f"Success! Disruption impact: {impacts}")

    print("--- 5. Fetching Recovery Proposals ---")
    r = requests.post(f"{BASE_URL}/trips/{trip_id}/recover")
    assert r.status_code == 200
    rec_data = r.json()
    proposals = rec_data.get("proposals", [])
    print(f"Success! Generated {len(proposals)} recovery proposals.")

    print("--- 6. Applying Recovery Plan ---")
    r = requests.post(f"{BASE_URL}/trips/{trip_id}/apply-plan", json={"proposals": proposals})
    assert r.status_code == 200
    apply_res = r.json()
    updated_graph = apply_res["updated_graph"]
    statuses = [n["status"] for n in updated_graph["nodes"]]
    print(f"Success! Trip restored! Node statuses: {statuses}")
    assert all(s in ["OK", "healthy"] for s in statuses)

if __name__ == "__main__":
    test_full_integration_flow()
