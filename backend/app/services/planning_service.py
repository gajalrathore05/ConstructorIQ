import json
import logging
from sqlalchemy.orm import Session
from app.services.ai_service import ai_service
from app.models.models import Analysis
from app.core.config import settings
from app.schemas.schemas import PlanningRequest

logger = logging.getLogger(__name__)

PLANNING_SCHEMA = """{
  "phases": [
    {
      "name": "Phase name",
      "duration_weeks": 4,
      "description": "Phase description",
      "key_activities": ["Activity 1", "Activity 2"]
    }
  ],
  "suggested_tasks": [
    {
      "title": "Task title",
      "description": "Task description",
      "duration_days": 7,
      "dependencies": [],
      "priority": "high",
      "estimated_cost": null
    }
  ],
  "risks": ["Risk 1", "Risk 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}"""

PLANNING_SYSTEM = """You are a construction project planning AI expert.
Generate practical, professional construction project plans.
RULES:
- Provide realistic time estimates based on project type and scope
- Include all typical construction phases
- Identify common risks for this project type
- All plans are AI SUGGESTIONS requiring review by qualified professionals
- Be specific and practical
"""

DEMO_PLANNING = {
    "phases": [
        {"name": "Pre-Construction", "duration_weeks": 4, "description": "Planning, permits, procurement", "key_activities": ["Site survey", "Permit applications", "Contractor selection", "Design finalization"]},
        {"name": "Foundation", "duration_weeks": 6, "description": "Excavation and foundation work", "key_activities": ["Excavation", "Foundation laying", "Waterproofing", "Backfill"]},
        {"name": "Superstructure", "duration_weeks": 12, "description": "Main structural work", "key_activities": ["Structural framing", "Roofing", "MEP rough-in", "Masonry"]},
        {"name": "Finishing", "duration_weeks": 8, "description": "Interior and exterior finishing", "key_activities": ["Plastering", "Painting", "Fixtures and fittings", "Flooring"]},
        {"name": "Handover", "duration_weeks": 2, "description": "Final inspection and handover", "key_activities": ["Final inspection", "Punch list resolution", "Documentation", "Handover"]}
    ],
    "suggested_tasks": [
        {"title": "Site Survey & Geotechnical Investigation", "description": "Topographic survey and soil testing", "duration_days": 14, "dependencies": [], "priority": "critical", "estimated_cost": None},
        {"title": "Building Permit Application", "description": "Submit drawings and obtain permits", "duration_days": 30, "dependencies": ["Site Survey"], "priority": "critical", "estimated_cost": None},
        {"title": "Contractor Procurement", "description": "Solicit bids and award contracts", "duration_days": 21, "dependencies": [], "priority": "high", "estimated_cost": None},
        {"title": "Foundation Work", "description": "Excavation, formwork, concrete pour", "duration_days": 42, "dependencies": ["Building Permit Application"], "priority": "critical", "estimated_cost": None}
    ],
    "risks": [
        "⚠️ DEMO MODE — Configure AI provider for project-specific risk analysis.",
        "Weather-related construction delays",
        "Material supply chain disruptions",
        "Labor availability and productivity",
        "Unforeseen site conditions (rock, groundwater)",
        "Regulatory/permit delays"
    ],
    "recommendations": [
        "⚠️ DEMO MODE — Configure GEMINI_API_KEY or OPENAI_API_KEY for detailed recommendations.",
        "Engage all major contractors early in the planning phase",
        "Build a 10–15% contingency into the budget",
        "Establish clear communication protocols with all stakeholders",
        "Conduct weekly site progress meetings"
    ]
}


async def generate_plan(request: PlanningRequest, db: Session) -> dict:
    is_demo = False

    if not settings.ai_available:
        result = dict(DEMO_PLANNING)
        is_demo = True
    else:
        prompt = (
            f"Generate a comprehensive construction project plan:\n"
            f"Project: {request.project_name}\n"
            f"Type: {request.project_type}\n"
            f"Location: {request.location or 'Not specified'}\n"
            f"Area: {request.total_area or 'Not specified'} sqft\n"
            f"Budget: {request.budget or 'Not specified'}\n"
            f"Duration: {request.duration_months or 'Not specified'} months\n"
            f"Requirements: {request.special_requirements or 'None'}\n\n"
            "Provide realistic phases, task breakdown, risk identification, and recommendations."
        )

        structured, json_demo = await ai_service.generate_structured_json(
            prompt, PLANNING_SCHEMA, PLANNING_SYSTEM
        )
        if json_demo or structured is None:
            result = dict(DEMO_PLANNING)
            is_demo = True
        else:
            result = structured

    result["disclaimer"] = (
        "This is an AI-generated preliminary project plan for reference only. "
        "All schedules, costs, and recommendations must be reviewed and validated by "
        "qualified construction professionals before implementation."
    )
    result["is_demo"] = is_demo

    analysis = Analysis(
        analysis_type="planning",
        title=f"Project Plan: {request.project_name}",
        status="completed",
        input_summary=f"{request.project_type}, {request.location or 'unspecified'}",
        result_json=json.dumps(result)
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    result["analysis_id"] = analysis.id
    return result
