import requests
import sys

BASE_URL = "http://127.0.0.1:5000/api"

def test_recovery():
    print("--- RECOVERY ENGINE TEST ---")
    
    # Re-run verify_cp3 logic to get a broken graph
    print("1. Spinning up trip and applying disruption (simulating CP3)...")
    import verify_cp3 # Requires verify_cp3 to be run without immediate sys.exit, but since we modify verify_cp3 previously, we'll just replicate it or import it.
    
    # Let's just create a quick fresh trip
    trip_id = requests.post(f"{BASE_URL}/trips", json={"name": "Recovery Test"}).json()["id"]
    from datetime import datetime, timedelta, timezone
    now = datetime.now(timezone.utc)
    f = requests.post(f"{BASE_URL}/nodes", json={"trip_id": trip_id, "node_type": "FLIGHT", "title": "Flight", "start_time": now.isoformat(), "end_time": (now + timedelta(hours=2)).isoformat()}).json()
    c = requests.post(f"{BASE_URL}/nodes", json={"trip_id": trip_id, "node_type": "CAB", "title": "Cab", "start_time": (now + timedelta(hours=3)).isoformat(), "end_time": (now + timedelta(hours=4)).isoformat()}).json()
    h = requests.post(f"{BASE_URL}/nodes", json={"trip_id": trip_id, "node_type": "HOTEL", "title": "Hotel", "start_time": (now + timedelta(hours=4, minutes=30)).isoformat(), "end_time": (now + timedelta(hours=24)).isoformat(), "hard_cutoff": (now + timedelta(hours=6)).isoformat()}).json()
    
    requests.post(f"{BASE_URL}/trips/{trip_id}/disrupt", json={"node_id": f["id"], "delay_minutes": 300, "reason": "Late"})
    
    print("\n2. Fetching Recovery Proposals...")
    proposals_res = requests.post(f"{BASE_URL}/trips/{trip_id}/recover")
    proposals = proposals_res.json().get("proposals", [])
    
    if not proposals:
        print("No broken nodes found to recover. Did disruption work?")
        sys.exit(1)
        
    for p in proposals:
        print(f" -> Proposal for '{p['node_title']}': {p['description']}")
        print(f"    Action: {p['action']}")
        
    print("\n3. Submitting the recovery plan...")
    apply_res = requests.post(f"{BASE_URL}/trips/{trip_id}/apply-plan", json={"proposals": proposals})
    final_data = apply_res.json()
    
    print("\n--- FINAL RESTORED GRAPH ---")
    for node in final_data.get("updated_graph", {}).get("nodes", []):
        print(f"[{node['status']}] {node['title']}")

if __name__ == "__main__":
    test_recovery()
