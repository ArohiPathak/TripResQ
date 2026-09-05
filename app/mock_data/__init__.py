"""
app/mock_data — Centralized deterministic mock-data layer for TripResQ.

Provides realistic, consistent data for the entire application so every
feature works end-to-end without relying on real external APIs.

All data is seeded into the existing SQLite database through the existing
Flask models — no separate mock database.
"""

from app.mock_data.seed import seed_demo_trip, DEMO_TRIP_ID, DEMO_TRIP_NAME

__all__ = ["seed_demo_trip", "DEMO_TRIP_ID", "DEMO_TRIP_NAME"]
