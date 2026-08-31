from enum import Enum
import datetime
from app.core.db import db
import uuid

class NodeType(str, Enum):
    FLIGHT = "FLIGHT"
    TRAIN = "TRAIN"
    CAB = "CAB"
    HOTEL = "HOTEL"
    ACTIVITY = "ACTIVITY"

class NodeStatus(str, Enum):
    OK = "OK"
    AT_RISK = "AT_RISK"
    BROKEN = "BROKEN"

class ItineraryNode(db.Model):
    __tablename__ = 'itinerary_nodes'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    trip_id = db.Column(db.String(36), db.ForeignKey('trips.id'), nullable=False)
    
    node_type = db.Column(db.String(50), nullable=False)  # NodeType enum string
    title = db.Column(db.String(255), nullable=False)
    location = db.Column(db.String(255), nullable=True)
    
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    
    buffer_time = db.Column(db.Integer, default=0) # Intrinsic buffer for this node (in mins)
    hard_cutoff = db.Column(db.DateTime, nullable=True) # e.g., latest possible check-in
    
    status = db.Column(db.String(50), default=NodeStatus.OK.value) # NodeStatus enum string

    # Relationships to edges
    outgoing_edges = db.relationship(
        'DependencyEdge', 
        foreign_keys='DependencyEdge.source_node_id',
        backref='source_node', 
        lazy=True, 
        cascade="all, delete-orphan"
    )
    incoming_edges = db.relationship(
        'DependencyEdge', 
        foreign_keys='DependencyEdge.target_node_id',
        backref='target_node', 
        lazy=True, 
        cascade="all, delete-orphan"
    )
