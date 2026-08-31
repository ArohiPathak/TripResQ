import datetime
from app.core.db import db
import uuid

class Trip(db.Model):
    __tablename__ = 'trips'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    nodes = db.relationship('ItineraryNode', backref='trip', lazy=True, cascade="all, delete-orphan")
