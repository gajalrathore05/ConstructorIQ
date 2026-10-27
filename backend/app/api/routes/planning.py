from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.schemas import PlanningRequest
from app.services.planning_service import generate_plan

router = APIRouter()


@router.post("/generate")
async def generate(request: PlanningRequest, db: Session = Depends(get_db)):
    return await generate_plan(request, db)
