from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    location = Column(String(300))
    description = Column(Text)
    start_date = Column(String(20))
    target_end_date = Column(String(20))
    budget = Column(Float, default=0.0)
    spent = Column(Float, default=0.0)
    status = Column(String(20), default="planning")
    progress = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    analyses = relationship("Analysis", back_populates="project")
    diary_entries = relationship("DiaryEntry", back_populates="project", cascade="all, delete-orphan")


class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    assigned_to = Column(String(100))
    start_date = Column(String(20))
    due_date = Column(String(20))
    priority = Column(String(20), default="medium")
    status = Column(String(20), default="todo")
    estimated_cost = Column(Float, default=0.0)
    dependencies = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    project = relationship("Project", back_populates="tasks")


class Analysis(Base):
    __tablename__ = "analyses"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    analysis_type = Column(String(50), nullable=False)
    title = Column(String(300))
    status = Column(String(20), default="completed")
    input_summary = Column(Text)
    result_json = Column(Text)
    image_path = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    project = relationship("Project", back_populates="analyses")


class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    image_path = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    conversation = relationship("Conversation", back_populates="messages")


class DiaryEntry(Base):
    __tablename__ = "diary_entries"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    entry_date = Column(String(20), nullable=False)
    weather_conditions = Column(String(200))
    temperature = Column(Float)
    progress_notes = Column(Text)
    workforce_notes = Column(Text)
    equipment_notes = Column(Text)
    material_notes = Column(Text)
    issues = Column(Text)
    upcoming_activities = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    project = relationship("Project", back_populates="diary_entries")


class UploadedFile(Base):
    __tablename__ = "uploaded_files"
    id = Column(Integer, primary_key=True, index=True)
    original_filename = Column(String(300))
    stored_filename = Column(String(300))
    file_path = Column(String(500))
    file_size = Column(Integer)
    mime_type = Column(String(100))
    analysis_id = Column(Integer, ForeignKey("analyses.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
