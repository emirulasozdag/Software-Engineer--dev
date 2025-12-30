"""Add assignment questions and answers tables

This migration adds support for TEXT/TEST assignments with questions.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

def upgrade():
    # Add new columns to assignments table
    with op.batch_alter_table('assignments', schema=None) as batch_op:
        batch_op.add_column(sa.Column('content_type', sa.Enum('TEXT', 'TEST', name='assignmentcontenttype'), nullable=False, server_default='TEXT'))
        batch_op.add_column(sa.Column('content_text', sa.Text(), nullable=True))
    
    # Create assignment_questions table
    op.create_table(
        'assignment_questions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('assignment_id', sa.Integer(), nullable=False),
        sa.Column('question_type', sa.Enum('MULTIPLE_CHOICE', 'TRUE_FALSE', name='questiontype'), nullable=False),
        sa.Column('question_text', sa.Text(), nullable=False),
        sa.Column('question_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('points', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('correct_answer', sa.String(length=255), nullable=False),
        sa.ForeignKeyConstraint(['assignment_id'], ['assignments.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create question_options table
    op.create_table(
        'question_options',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('question_id', sa.Integer(), nullable=False),
        sa.Column('option_letter', sa.String(length=1), nullable=False),
        sa.Column('option_text', sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(['question_id'], ['assignment_questions.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create student_answers table
    op.create_table(
        'student_answers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('student_assignment_id', sa.Integer(), nullable=False),
        sa.Column('question_id', sa.Integer(), nullable=False),
        sa.Column('answer', sa.String(length=255), nullable=False),
        sa.Column('is_correct', sa.Boolean(), nullable=True),
        sa.Column('points_earned', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['question_id'], ['assignment_questions.id'], ),
        sa.ForeignKeyConstraint(['student_assignment_id'], ['student_assignments.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade():
    # Drop tables
    op.drop_table('student_answers')
    op.drop_table('question_options')
    op.drop_table('assignment_questions')
    
    # Remove columns from assignments
    with op.batch_alter_table('assignments', schema=None) as batch_op:
        batch_op.drop_column('content_text')
        batch_op.drop_column('content_type')
