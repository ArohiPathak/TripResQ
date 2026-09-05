"""
Traveler data for TripResQ demo scenario.
Reuses the canonical DEMO_COHORT_DATA from app/services/cohort.py
to avoid duplication. This module simply re-exports it.
"""

from app.services.cohort import DEMO_COHORT_DATA

# Re-export the canonical traveler/cohort data
TRAVELERS = DEMO_COHORT_DATA["members"]
COHORT_SETTINGS = DEMO_COHORT_DATA["settings"]
COHORT_ID = DEMO_COHORT_DATA["cohort_id"]
COHORT_NAME = DEMO_COHORT_DATA["name"]
