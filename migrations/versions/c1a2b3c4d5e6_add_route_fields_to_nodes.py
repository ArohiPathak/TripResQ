"""Add route fields to itinerary nodes

Revision ID: c1a2b3c4d5e6
Revises: b96ae7919d39
Create Date: 2026-09-04 14:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c1a2b3c4d5e6'
down_revision = 'b96ae7919d39'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('itinerary_nodes', schema=None) as batch_op:
        batch_op.add_column(sa.Column('origin', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('destination', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('operator', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('service_number', sa.String(length=255), nullable=True))


def downgrade():
    with op.batch_alter_table('itinerary_nodes', schema=None) as batch_op:
        batch_op.drop_column('service_number')
        batch_op.drop_column('operator')
        batch_op.drop_column('destination')
        batch_op.drop_column('origin')
