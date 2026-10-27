from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
from datetime import datetime


# --- Project schemas ---
class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    location: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[str] = None
    target_end_date: Optional[str] = None
    budget: Optional[float] = 0.0
    spent: Optional[float] = 0.0
    status: Optional[str] = "planning"
    progress: Optional[int] = 0

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[str] = None
    target_end_date: Optional[str] = None
    budget: Optional[float] = None
    spent: Optional[float] = None
    status: Optional[str] = None
    progress: Optional[int] = None

class ProjectOut(ProjectBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True


# --- Task schemas ---
class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    assigned_to: Optional[str] = None
    start_date: Optional[str] = None
    due_date: Optional[str] = None
    priority: Optional[str] = "medium"
    status: Optional[str] = "todo"
    estimated_cost: Optional[float] = 0.0
    dependencies: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assigned_to: Optional[str] = None
    start_date: Optional[str] = None
    due_date: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    estimated_cost: Optional[float] = None
    dependencies: Optional[str] = None

class TaskOut(TaskBase):
    id: int
    project_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True


# --- Analysis schemas ---
class AnalysisOut(BaseModel):
    id: int
    project_id: Optional[int] = None
    analysis_type: str
    title: Optional[str] = None
    status: str
    input_summary: Optional[str] = None
    result_json: Optional[str] = None
    image_path: Optional[str] = None
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True


# --- Valuation ---
class ValuationRequest(BaseModel):
    location: str
    property_type: str
    built_up_area: float
    land_area: Optional[float] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    property_age: Optional[int] = None
    construction_quality: Optional[str] = None
    floor_number: Optional[int] = None
    amenities: Optional[List[str]] = []
    comparable_info: Optional[str] = None


# --- Planning ---
class PlanningRequest(BaseModel):
    project_name: str
    project_type: str
    location: Optional[str] = None
    total_area: Optional[float] = None
    budget: Optional[float] = None
    duration_months: Optional[int] = None
    special_requirements: Optional[str] = None


# --- Diary entry ---
class DiaryEntryBase(BaseModel):
    entry_date: str
    project_id: Optional[int] = None
    weather_conditions: Optional[str] = None
    temperature: Optional[float] = None
    progress_notes: Optional[str] = None
    workforce_notes: Optional[str] = None
    equipment_notes: Optional[str] = None
    material_notes: Optional[str] = None
    issues: Optional[str] = None
    upcoming_activities: Optional[str] = None

class DiaryEntryCreate(DiaryEntryBase):
    pass

class DiaryEntryUpdate(BaseModel):
    weather_conditions: Optional[str] = None
    temperature: Optional[float] = None
    progress_notes: Optional[str] = None
    workforce_notes: Optional[str] = None
    equipment_notes: Optional[str] = None
    material_notes: Optional[str] = None
    issues: Optional[str] = None
    upcoming_activities: Optional[str] = None

class DiaryEntryOut(DiaryEntryBase):
    id: int
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True
