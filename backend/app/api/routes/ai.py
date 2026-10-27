import os
import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional
from app.db.database import get_db
from app.models.models import Conversation, Message
from app.services.ai_service import ai_service
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_SIZE = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024


@router.post("/chat")
async def chat(
    message: str = Form(...),
    conversation_id: Optional[int] = Form(None),
    project_id: Optional[int] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    if not message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # Get or create conversation
    if conversation_id:
        conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conv:
            conv = Conversation(title=message[:100])
            db.add(conv)
            db.commit()
            db.refresh(conv)
    else:
        conv = Conversation(title=message[:100])
        db.add(conv)
        db.commit()
        db.refresh(conv)

    # Handle image upload
    image_path = None
    if image and image.filename:
        if image.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(status_code=400, detail="Invalid image type. Use JPEG, PNG, or WebP.")
        content = await image.read()
        if len(content) > MAX_SIZE:
            raise HTTPException(status_code=400, detail=f"Image too large. Max {settings.MAX_UPLOAD_SIZE_MB}MB.")
        uploads_dir = os.path.join(settings.UPLOAD_DIR, "chat")
        os.makedirs(uploads_dir, exist_ok=True)
        ext = os.path.splitext(image.filename)[1] if image.filename else ".jpg"
        filename = f"{uuid.uuid4()}{ext}"
        image_path = os.path.join(uploads_dir, filename)
        with open(image_path, "wb") as f:
            f.write(content)

    # Save user message
    user_msg = Message(conversation_id=conv.id, role="user", content=message, image_path=image_path)
    db.add(user_msg)
    db.commit()

    # Build history
    all_msgs = db.query(Message).filter(Message.conversation_id == conv.id).order_by(Message.id).all()
    history = [{"role": m.role, "content": m.content} for m in all_msgs[:-1]]

    # Get AI response
    if image_path:
        raw_response, is_demo = await ai_service.analyze_image(
            image_path,
            f"Please analyze this construction image and answer: {message}",
            "You are ConstructIQ, an expert construction AI. Analyze the image professionally."
        )
        if raw_response is None:
            raw_response = (
                "Image analysis is in demo mode. Configure an AI provider "
                "(GEMINI_API_KEY or OPENAI_API_KEY) to analyze images."
            )
            is_demo = True
    else:
        raw_response, is_demo = await ai_service.chat(message, history)

    # Save assistant message
    assistant_msg = Message(conversation_id=conv.id, role="assistant", content=raw_response)
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    return {
        "conversation_id": conv.id,
        "message_id": assistant_msg.id,
        "response": raw_response,
        "is_demo": is_demo
    }


@router.get("/conversations")
def list_conversations(db: Session = Depends(get_db)):
    convs = db.query(Conversation).order_by(Conversation.id.desc()).limit(50).all()
    return [{"id": c.id, "title": c.title, "created_at": c.created_at} for c in convs]


@router.get("/conversations/{conversation_id}/messages")
def get_messages(conversation_id: int, db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    msgs = db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.id).all()
    return [
        {"id": m.id, "role": m.role, "content": m.content,
         "image_path": m.image_path, "created_at": str(m.created_at) if m.created_at else None}
        for m in msgs
    ]


@router.delete("/conversations/{conversation_id}", status_code=204)
def delete_conversation(conversation_id: int, db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    db.delete(conv)
    db.commit()
