from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.models.models import DiaryEntry
from app.schemas.schemas import DiaryEntryCreate, DiaryEntryUpdate, DiaryEntryOut

router = APIRouter()


@router.get("", response_model=List[DiaryEntryOut])
def list_entries(project_id: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(DiaryEntry)
    if project_id:
        q = q.filter(DiaryEntry.project_id == project_id)
    return q.order_by(DiaryEntry.id.desc()).limit(50).all()


@router.post("", response_model=DiaryEntryOut, status_code=201)
def create_entry(entry: DiaryEntryCreate, db: Session = Depends(get_db)):
    db_entry = DiaryEntry(**entry.model_dump())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry


@router.get("/{entry_id}", response_model=DiaryEntryOut)
def get_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(DiaryEntry).filter(DiaryEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Diary entry not found")
    return entry


@router.put("/{entry_id}", response_model=DiaryEntryOut)
def update_entry(entry_id: int, upd: DiaryEntryUpdate, db: Session = Depends(get_db)):
    entry = db.query(DiaryEntry).filter(DiaryEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Diary entry not found")
    for field, value in upd.model_dump(exclude_unset=True).items():
        setattr(entry, field, value)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=204)
def delete_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(DiaryEntry).filter(DiaryEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Diary entry not found")
    db.delete(entry)
    db.commit()
