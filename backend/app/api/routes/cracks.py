import os
import uuid
import logging
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.db.database import get_db
from app.services.crack_service import analyze_crack_image
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

ALLOWED = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024


@router.post("/analyze")
async def analyze_crack(
    image: UploadFile = File(...),
    structure_type: Optional[str] = Form(None),
    material: Optional[str] = Form(None),
    location_description: Optional[str] = Form(None),
    symptoms: Optional[str] = Form(None),
    project_id: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    if image.content_type not in ALLOWED:
        raise HTTPException(status_code=400, detail="Invalid image type. Use JPEG, PNG, or WebP.")
    content = await image.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=400, detail=f"Image too large. Max {settings.MAX_UPLOAD_SIZE_MB}MB.")

    uploads_dir = os.path.join(settings.UPLOAD_DIR, "cracks")
    os.makedirs(uploads_dir, exist_ok=True)
    ext = os.path.splitext(image.filename or "img")[1] or ".jpg"
    filepath = os.path.join(uploads_dir, f"{uuid.uuid4()}{ext}")
    with open(filepath, "wb") as f:
        f.write(content)

    return await analyze_crack_image(filepath, structure_type, material, location_description, symptoms, project_id, db)
