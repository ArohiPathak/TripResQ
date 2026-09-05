"""
Deterministic mock refund/compensation data for TripResQ demo scenario.
"""

REFUND_SCHEDULE = {
    "FLIGHT": {
        "base_refund": 8500,
        "cancellation_fee": 0,
        "travel_credit": 600,
        "statutory_refund_pct": 100,
        "processing_time": "Immediate",
        "description": "Full statutory refund under DGCA regulations for carrier-initiated cancellation.",
    },
    "CAB": {
        "base_refund": 800,
        "cancellation_fee": 0,
        "travel_credit": 0,
        "statutory_refund_pct": 100,
        "processing_time": "Immediate",
        "description": "Zero-fee cancellation and full deposit refund for disrupted cab transfer.",
    },
    "HOTEL": {
        "base_refund": 3200,
        "cancellation_fee": 0,
        "travel_credit": 0,
        "statutory_refund_pct": 100,
        "processing_time": "Within 24 hours",
        "description": "Full room deposit refund for force majeure delay notification.",
    },
    "TRAIN": {
        "base_refund": 1850,
        "cancellation_fee": 0,
        "travel_credit": 200,
        "statutory_refund_pct": 100,
        "processing_time": "3-5 business days",
        "description": "Full ticket refund processed through IRCTC statutory channel.",
    },
}


def get_total_refund(node_types: list) -> dict:
    """Calculate total refund across all affected node types."""
    total_refund = 0
    total_credit = 0
    breakdown = []

    for nt in node_types:
        entry = REFUND_SCHEDULE.get(nt.upper(), {})
        refund = entry.get("base_refund", 0)
        credit = entry.get("travel_credit", 0)
        total_refund += refund
        total_credit += credit
        breakdown.append({
            "type": nt,
            "refund": refund,
            "credit": credit,
            "description": entry.get("description", ""),
        })

    return {
        "total_refund": total_refund,
        "total_credit": total_credit,
        "breakdown": breakdown,
    }
