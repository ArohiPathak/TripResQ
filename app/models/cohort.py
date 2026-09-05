import uuid
import datetime
from enum import Enum
from app.core.db import db

class TravelerType(str, Enum):
    ADULT = "ADULT"
    CHILD = "CHILD"
    INFANT = "INFANT"

class TripCohort(db.Model):
    __tablename__ = 'trip_cohorts'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    cohort_id = db.Column(db.String(100), nullable=False, default="COHORT-001")
    trip_id = db.Column(db.String(36), db.ForeignKey('trips.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False, default="Family Trip")
    
    # Group preservation settings
    keep_group_together = db.Column(db.Boolean, default=True)
    child_requires_guardian = db.Column(db.Boolean, default=True)
    adjacent_seating_preference = db.Column(db.Boolean, default=True)
    
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    travelers = db.relationship(
        'Traveler',
        backref='cohort',
        lazy=True,
        cascade="all, delete-orphan",
        order_by="Traveler.traveler_id"
    )

    @property
    def members(self):
        """Direct access to traveler members list."""
        return self.travelers

    def to_dict(self):
        return {
            "id": self.id,
            "cohort_id": self.cohort_id,
            "trip_id": self.trip_id,
            "name": self.name,
            "members": [t.to_dict() for t in self.travelers],
            "member_ids": [t.traveler_id for t in self.travelers],
            "settings": {
                "keep_group_together": bool(self.keep_group_together),
                "child_requires_guardian": bool(self.child_requires_guardian),
                "adjacent_seating_preference": bool(self.adjacent_seating_preference)
            },
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class Traveler(db.Model):
    __tablename__ = 'travelers'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    cohort_pk = db.Column(db.String(36), db.ForeignKey('trip_cohorts.id'), nullable=False)
    
    traveler_id = db.Column(db.String(50), nullable=False)  # e.g., "T1", "T2", "T3"
    name = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(50), nullable=False, default=TravelerType.ADULT.value)
    pnr = db.Column(db.String(50), nullable=False)
    guardian_ids = db.Column(db.JSON, default=list)  # e.g. ["T1", "T2"]

    def to_dict(self):
        return {
            "traveler_id": self.traveler_id,
            "name": self.name,
            "type": self.type,
            "pnr": self.pnr,
            "guardian_ids": list(self.guardian_ids or [])
        }
