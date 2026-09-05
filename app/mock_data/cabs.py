"""
Deterministic mock cab/transport data for TripResQ demo scenario.
"""

CABS = [
    {
        "id": "cab-goa-transfer",
        "service": "Uber Select",
        "type": "CAB",
        "title": "Airport Cab Transfer (Uber Select)",
        "origin": "Goa Airport (GOI)",
        "destination": "Hotel Taj Fort Aguada",
        "location": "Goa Airport Pickup Zone → Taj Fort Aguada",
        "start_hour": 11,
        "start_min": 30,
        "end_hour": 12,
        "end_min": 15,
        "duration_minutes": 45,
        "price": 800,
        "hard_cutoff_hour": 12,
        "hard_cutoff_min": 0,
    },
]
