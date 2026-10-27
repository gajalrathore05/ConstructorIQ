from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.schemas import ValuationRequest
from app.services.valuation_service import estimate_valuation

router = APIRouter()


@router.post("/estimate")
async def estimate(request: ValuationRequest, db: Session = Depends(get_db)):
    return await estimate_valuation(request, db)
