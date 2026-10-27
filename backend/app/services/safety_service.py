import json
import logging
import os
from typing import Optional
from sqlalchemy.orm import Session
from app.services.ai_service import ai_service
from app.models.models import Analysis
from app.core.config import settings

logger = logging.getLogger(__name__)

DEMO_SAFETY = {
    "summary": "⚠️ DEMO MODE — No AI provider configured. This is a sample safety analysis to illustrate the output format. Configure GEMINI_API_KEY or OPENAI_API_KEY for real analysis.",
    "findings": [
        {
            "category": "Personal Protective Equipment",
            "severity": "high",
            "observation": "Demo observation: Workers may be present without full PPE compliance. (This is sample data — not based on your image.)",
            "recommended_action": "Conduct immediate PPE audit. Enforce hard hats, hi-vis vests, safety footwear, and gloves site-wide.",
            "confidence": None
        },
        {
            "category": "Fall Hazard",
            "severity": "medium",
            "observation": "Demo observation: Elevated work areas may lack confirmed fall protection. (Sample data.)",
            "recommended_action": "Verify guardrails, safety nets, or personal fall arrest systems are installed at all elevated work areas.",
            "confidence": None
        }
    ],
    "limitations": [
        "DEMO MODE — No real image analysis was performed.",
        "Configure an AI provider to enable actual computer-vision safety analysis.",
        "AI safety findings are always preliminary and require verification by a qualified site safety professional.",
        "Image quality, angle, and lighting significantly affect detection capability."
    ]
}

SAFETY_SCHEMA = """{
  "summary": "Brief summary of overall site safety observations from the image",
  "findings": [
    {
      "category": "Category name (e.g., PPE, Fall Hazard, Housekeeping, Electrical)",
      "severity": "critical|high|medium|low|informational",
      "observation": "Specific observation supported by visible evidence in the image",
      "recommended_action": "Concrete corrective action",
      "confidence": null
    }
  ],
  "limitations": ["Limitation 1", "Limitation 2"]
}"""

SAFETY_SYSTEM = """You are a construction site safety expert AI.
Analyze construction site images for safety hazards.
RULES:
- Only report what is actually visible in the image
- NEVER fabricate findings not supported by visible evidence
- Use 'Unable to determine from image' when something cannot be assessed
- Always note that findings require verification by a qualified safety professional
- Severity: critical=immediate life danger, high=serious risk, medium=significant concern, low=minor, informational=observation
"""


async def analyze_safety_image(image_path: str, project_id: Optional[int], db: Session) -> dict:
    is_demo = False

    if not settings.ai_available:
        result = dict(DEMO_SAFETY)
        is_demo = True
    else:
        prompt = (
            "Analyze this construction site image for safety hazards. "
            "Identify any visible PPE violations, fall hazards, unsafe access routes, "
            "poor housekeeping, electrical hazards, or other safety issues. "
            "For each finding describe exactly what you see. "
            "If you cannot determine something from the image, say so explicitly."
        )
        raw, img_demo = await ai_service.analyze_image(image_path, prompt, SAFETY_SYSTEM)

        if img_demo or raw is None:
            result = dict(DEMO_SAFETY)
            is_demo = True
        else:
            struct_prompt = f"Convert this safety analysis into structured JSON:\n\n{raw}"
            structured, json_demo = await ai_service.generate_structured_json(
                struct_prompt, SAFETY_SCHEMA,
                "Convert safety analysis text into the requested JSON schema."
            )
            if json_demo or structured is None:
                result = {
                    "summary": raw[:600] if raw else "Analysis completed.",
                    "findings": [],
                    "limitations": ["Structured output unavailable. See summary."]
                }
            else:
                result = structured

    analysis = Analysis(
        project_id=project_id,
        analysis_type="safety",
        title="Construction Site Safety Analysis",
        status="completed",
        input_summary=f"Image: {os.path.basename(image_path)}",
        result_json=json.dumps(result),
        image_path=image_path
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    result["analysis_id"] = analysis.id
    result["status"] = "completed"
    result["is_demo"] = is_demo
    return result
