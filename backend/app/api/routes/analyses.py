import os
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional, List
from app.db.database import get_db
from app.models.models import Analysis
from app.schemas.schemas import AnalysisOut
from app.services.report_service import generate_pdf_report

router = APIRouter()


@router.get("", response_model=List[AnalysisOut])
def list_analyses(
    analysis_type: Optional[str] = None,
    project_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    q = db.query(Analysis)
    if analysis_type:
        q = q.filter(Analysis.analysis_type == analysis_type)
    if project_id:
        q = q.filter(Analysis.project_id == project_id)
    return q.order_by(Analysis.id.desc()).offset(skip).limit(limit).all()


@router.get("/{analysis_id}", response_model=AnalysisOut)
def get_analysis(analysis_id: int, db: Session = Depends(get_db)):
    a = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return a


@router.get("/{analysis_id}/report")
def download_report(analysis_id: int, db: Session = Depends(get_db)):
    a = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Analysis not found")
    pdf_path = generate_pdf_report(analysis_id, db)
    if not pdf_path or not os.path.exists(pdf_path):
        raise HTTPException(status_code=500, detail="Could not generate report PDF")
    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"constructiq_report_{analysis_id}.pdf"
    )


@router.delete("/{analysis_id}", status_code=204)
def delete_analysis(analysis_id: int, db: Session = Depends(get_db)):
    a = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Analysis not found")
    db.delete(a)
    db.commit()
