from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Project, Task, Analysis

router = APIRouter()


@router.get("")
def get_dashboard(db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    total_projects = len(projects)
    active_projects = sum(1 for p in projects if p.status == "active")
    completed_projects = sum(1 for p in projects if p.status == "completed")
    total_budget = sum(p.budget or 0 for p in projects)
    total_spent = sum(p.spent or 0 for p in projects)
    avg_progress = (sum(p.progress or 0 for p in projects) / total_projects) if total_projects else 0

    total_analyses = db.query(Analysis).count()

    today = date.today().isoformat()
    overdue_tasks = db.query(Task).filter(
        Task.status != "completed",
        Task.due_date != None,
        Task.due_date < today
    ).count()

    recent_projects = db.query(Project).order_by(Project.id.desc()).limit(5).all()
    recent_analyses = db.query(Analysis).order_by(Analysis.id.desc()).limit(6).all()

    # Budget chart data
    budget_chart = [
        {"name": p.name[:20], "budget": p.budget or 0, "spent": p.spent or 0}
        for p in projects[-6:]
    ]

    # Analysis type breakdown
    from sqlalchemy import func
    type_counts = db.query(Analysis.analysis_type, func.count(Analysis.id)).group_by(Analysis.analysis_type).all()
    analysis_breakdown = [{"type": t, "count": c} for t, c in type_counts]

    return {
        "stats": {
            "total_projects": total_projects,
            "active_projects": active_projects,
            "completed_projects": completed_projects,
            "total_analyses": total_analyses,
            "overdue_tasks": overdue_tasks,
            "average_progress": round(avg_progress, 1),
            "total_budget": total_budget,
            "total_spent": total_spent,
        },
        "recent_projects": [
            {
                "id": p.id, "name": p.name, "status": p.status,
                "progress": p.progress or 0, "budget": p.budget or 0,
                "spent": p.spent or 0, "location": p.location,
                "target_end_date": p.target_end_date,
            }
            for p in recent_projects
        ],
        "recent_analyses": [
            {
                "id": a.id, "type": a.analysis_type, "title": a.title,
                "status": a.status,
                "created_at": a.created_at.isoformat() if a.created_at else None
            }
            for a in recent_analyses
        ],
        "budget_chart": budget_chart,
        "analysis_breakdown": analysis_breakdown,
    }
