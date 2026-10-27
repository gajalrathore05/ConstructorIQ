import json
import logging
from sqlalchemy.orm import Session
from app.services.ai_service import ai_service
from app.models.models import Analysis
from app.core.config import settings
from app.schemas.schemas import ValuationRequest

logger = logging.getLogger(__name__)

VALUATION_SCHEMA = """{
  "estimated_value_min": 0.0,
  "estimated_value_max": 0.0,
  "price_per_sqft": 0.0,
  "key_factors": ["Factor 1", "Factor 2"],
  "assumptions": ["Assumption 1", "Assumption 2"],
  "limitations": ["Limitation 1", "Limitation 2"]
}"""

VALUATION_SYSTEM = """You are a real estate valuation AI with expertise in construction costs and property markets.
RULES:
- Always label estimates as PRELIMINARY ILLUSTRATIVE ESTIMATES
- Do NOT claim access to live market data
- Provide ranges, not precise point estimates
- Base estimates on construction cost benchmarks and location context
- Clearly state all assumptions made
- Recommend professional appraisal for actual transactions
- Values should be in the same currency implied by the location (USD for US, INR for India, etc.)
"""

DEMO_VALUATION = {
    "estimated_value_min": 0,
    "estimated_value_max": 0,
    "price_per_sqft": 0,
    "key_factors": ["Location", "Property size", "Construction quality", "Property age"],
    "assumptions": ["⚠️ DEMO MODE — Configure AI provider for actual estimates."],
    "limitations": [
        "DEMO MODE — Configure GEMINI_API_KEY or OPENAI_API_KEY for actual valuation estimates.",
        "This is a preliminary illustrative estimate only — not a certified appraisal.",
        "Consult a licensed real estate appraiser for actual transactions."
    ]
}


async def estimate_valuation(request: ValuationRequest, db: Session) -> dict:
    is_demo = False

    if not settings.ai_available:
        result = dict(DEMO_VALUATION)
        is_demo = True
    else:
        amenities_str = ", ".join(request.amenities) if request.amenities else "Not specified"
        prompt = (
            f"Provide a preliminary illustrative property valuation estimate:\n"
            f"Location: {request.location}\n"
            f"Property Type: {request.property_type}\n"
            f"Built-up Area: {request.built_up_area} sqft\n"
            f"Land Area: {request.land_area or 'N/A'}\n"
            f"Bedrooms: {request.bedrooms or 'N/A'}\n"
            f"Bathrooms: {request.bathrooms or 'N/A'}\n"
            f"Property Age: {request.property_age or 'Unknown'} years\n"
            f"Construction Quality: {request.construction_quality or 'Standard'}\n"
            f"Floor: {request.floor_number or 'N/A'}\n"
            f"Amenities: {amenities_str}\n"
            f"Additional Info: {request.comparable_info or 'None'}\n\n"
            "Provide value range based on typical construction costs and location. State all assumptions."
        )

        structured, json_demo = await ai_service.generate_structured_json(
            prompt, VALUATION_SCHEMA, VALUATION_SYSTEM
        )
        if json_demo or structured is None:
            result = dict(DEMO_VALUATION)
            is_demo = True
        else:
            result = structured

    result["disclaimer"] = (
        "This is a preliminary illustrative estimate only — not a certified appraisal. "
        "Based on general construction cost benchmarks, not verified market transactions. "
        "Obtain a valuation from a licensed real estate appraiser for any purchase, sale, or financing decision."
    )
    result["is_demo"] = is_demo

    analysis = Analysis(
        analysis_type="valuation",
        title=f"Property Valuation — {request.location}",
        status="completed",
        input_summary=f"{request.property_type}, {request.built_up_area} sqft, {request.location}",
        result_json=json.dumps(result)
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    result["analysis_id"] = analysis.id
    return result
