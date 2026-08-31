from enum import Enum
from app.core.db import db
import uuid

class ConstraintType(str, Enum):
    TEMPORAL = "TEMPORAL"
    SPATIAL = "SPATIAL"

class DependencyEdge(db.Model):
    __tablename__ = 'dependency_edges'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    source_node_id = db.Column(db.String(36), db.ForeignKey('itinerary_nodes.id'), nullable=False)
    target_node_id = db.Column(db.String(36), db.ForeignKey('itinerary_nodes.id'), nullable=False)
    
    min_buffer_minutes = db.Column(db.Integer, default=0, nullable=False)
    constraint_type = db.Column(db.String(50), default=ConstraintType.TEMPORAL.value) # ConstraintType enum string
