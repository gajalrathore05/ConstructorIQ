import json
import logging
import os
from typing import Optional
from sqlalchemy.orm import Session
from app.services.ai_service import ai_service
from app.models.models import Analysis
from app.core.config import settings

logger = logging.getLogger(__name__)

DEMO_CRACK = {
    "summary": "⚠️ DEMO MODE — No AI provider configured. Configure GEMINI_API_KEY or OPENAI_API_KEY for real crack analysis.",
    "observations": [
        "Demo: A crack is present on the structure. (This is sample data — not based on your image.)",
        "Demo: Pattern and severity cannot be assessed without real image analysis."
    ],
    "crack_details": {
        "location": "Unable to determine (demo mode)",
        "pattern": "Unable to determine (demo mode)",
        "estimated_width": None,
        "potential_causes": ["Settlement", "Thermal movement", "Structural loading — all unconfirmed in demo mode"],
        "recommended_actions": ["Engage a qualified structural engineer for on-site assessment."]
    },
    "urgency_level": "monitor",
    "limitations": [
        "DEMO MODE — No real image analysis performed.",
        "Crack width cannot be measured from photographs without a calibrated scale reference.",
        "Image-based analysis cannot determine structural integrity.",
        "A licensed structural engineer must assess potentially serious cracks."
    ]
}

CRACK_SCHEMA = """{
  "summary": "Brief overall summary of crack observations",
  "observations": ["Specific visual observation 1", "Observation 2"],
  "crack_details": {
    "location": "Location description or null",
    "pattern": "Pattern description (diagonal/horizontal/vertical/map/etc.)",
    "estimated_width": null,
    "potential_causes": ["Cause 1", "Cause 2"],
    "recommended_actions": ["Action 1", "Action 2"]
  },
  "urgency_level": "immediate|high|medium|low|monitor",
  "limitations": ["Limitation 1", "Limitation 2"]
}"""

CRACK_SYSTEM = """You are an expert structural engineer and crack analysis AI.
Analyze photographs of structural cracks.
RULES:
- Only describe what is actually visible in the image
- NEVER estimate crack width without a calibrated scale reference in the image — always set estimated_width to null
- Distinguish between visual observations and engineering conclusions
- Do NOT certify structural safety or condemn a structure from a photo
- Urgency: immediate=visible structural distress, high=significant/prompt attention, medium=monitor+assess, low=cosmetic, monitor=watch progression
"""


async def analyze_crack_image(
    image_path: str,
    structure_type: Optional[str],
    material: Optional[str],
    location_description: Optional[str],
    symptoms: Optional[str],
    project_id: Optional[int],
    db: Session
) -> dict:
    is_demo = False

    if not settings.ai_available:
        result = dict(DEMO_CRACK)
        is_demo = True
    else:
        context = "\n".join(filter(None, [
            f"Structure type: {structure_type}" if structure_type else None,
            f"Material: {material}" if material else None,
            f"Location: {location_description}" if location_description else None,
            f"Additional symptoms: {symptoms}" if symptoms else None,
        ])) or "No additional context provided."

        prompt = (
            f"Analyze this structural crack photograph.\n\nContext:\n{context}\n\n"
            "Describe the crack pattern, location, and visible characteristics. "
            "Do NOT estimate width without a scale reference. "
            "Identify potential causes based on crack pattern. "
            "Recommend appropriate next steps."
        )

        raw, img_demo = await ai_service.analyze_image(image_path, prompt, CRACK_SYSTEM)

        if img_demo or raw is None:
            result = dict(DEMO_CRACK)
            is_demo = True
        else:
            struct_prompt = f"Convert this crack analysis into structured JSON:\n\n{raw}"
            structured, json_demo = await ai_service.generate_structured_json(
                struct_prompt, CRACK_SCHEMA,
                "Convert crack analysis text into the requested JSON schema."
            )
            if json_demo or structured is None:
                result = {
                    "summary": raw[:600] if raw else "Analysis completed.",
                    "observations": [raw] if raw else [],
                    "crack_details": None,
                    "urgency_level": "monitor",
                    "limitations": ["Structured output unavailable. See observations."]
                }
            else:
                result = structured

    result["disclaimer"] = (
        "This analysis is for preliminary informational purposes only. "
        "It does not constitute an engineering report or structural safety certification. "
        "A licensed structural engineer must be consulted for any structural concerns."
    )
    result["is_demo"] = is_demo

    analysis = Analysis(
        project_id=project_id,
        analysis_type="crack",
        title="Structural Crack Analysis",
        status="completed",
        input_summary=f"Image: {os.path.basename(image_path)}, Structure: {structure_type or 'unspecified'}",
        result_json=json.dumps(result),
        image_path=image_path
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    result["analysis_id"] = analysis.id
    result["status"] = "completed"
    return result
