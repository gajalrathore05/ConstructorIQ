import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.database import Base, get_db

TEST_DATABASE_URL = "sqlite:///./test_constructiq.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_teardown():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


client = TestClient(app)


# ── Health ────────────────────────────────────────────────────────────────────

def test_health():
    r = client.get("/api/v1/health")
    assert r.status_code == 200
    d = r.json()
    assert d["status"] == "healthy"
    assert "ai_available" in d
    assert "demo_mode" in d


# ── Dashboard ─────────────────────────────────────────────────────────────────

def test_dashboard_empty():
    r = client.get("/api/v1/dashboard")
    assert r.status_code == 200
    d = r.json()
    assert "stats" in d
    assert d["stats"]["total_projects"] == 0


# ── Projects ──────────────────────────────────────────────────────────────────

def test_create_project():
    r = client.post("/api/v1/projects/", json={
        "name": "Test Tower", "location": "Mumbai",
        "budget": 5000000, "status": "active"
    })
    assert r.status_code == 201
    d = r.json()
    assert d["name"] == "Test Tower"
    assert d["id"] is not None


def test_list_projects():
    client.post("/api/v1/projects/", json={"name": "Alpha"})
    client.post("/api/v1/projects/", json={"name": "Beta"})
    r = client.get("/api/v1/projects/")
    assert r.status_code == 200
    assert len(r.json()) >= 2


def test_get_project():
    pid = client.post("/api/v1/projects/", json={"name": "GetMe"}).json()["id"]
    r = client.get(f"/api/v1/projects/{pid}")
    assert r.status_code == 200
    assert r.json()["name"] == "GetMe"


def test_update_project():
    pid = client.post("/api/v1/projects/", json={"name": "UpdateMe"}).json()["id"]
    r = client.put(f"/api/v1/projects/{pid}", json={"status": "active", "progress": 45})
    assert r.status_code == 200
    assert r.json()["status"] == "active"
    assert r.json()["progress"] == 45


def test_delete_project():
    pid = client.post("/api/v1/projects/", json={"name": "DeleteMe"}).json()["id"]
    assert client.delete(f"/api/v1/projects/{pid}").status_code == 204
    assert client.get(f"/api/v1/projects/{pid}").status_code == 404


def test_project_not_found():
    assert client.get("/api/v1/projects/99999").status_code == 404


def test_invalid_project_name_empty():
    r = client.post("/api/v1/projects/", json={"name": ""})
    assert r.status_code == 422


# ── Tasks ─────────────────────────────────────────────────────────────────────

def _make_project(name="Proj"):
    return client.post("/api/v1/projects/", json={"name": name}).json()["id"]


def test_create_task():
    pid = _make_project("TaskProj")
    r = client.post(f"/api/v1/projects/{pid}/tasks", json={
        "title": "Foundation Work", "priority": "high", "status": "todo"
    })
    assert r.status_code == 201
    assert r.json()["title"] == "Foundation Work"


def test_list_tasks():
    pid = _make_project("ListTaskProj")
    client.post(f"/api/v1/projects/{pid}/tasks", json={"title": "T1"})
    client.post(f"/api/v1/projects/{pid}/tasks", json={"title": "T2"})
    r = client.get(f"/api/v1/projects/{pid}/tasks")
    assert r.status_code == 200
    assert len(r.json()) == 2


def test_update_task():
    pid = _make_project("UpdateTaskProj")
    tid = client.post(f"/api/v1/projects/{pid}/tasks", json={"title": "Roof"}).json()["id"]
    r = client.put(f"/api/v1/tasks/{tid}", json={"status": "completed"})
    assert r.status_code == 200
    assert r.json()["status"] == "completed"


def test_delete_task():
    pid = _make_project("DelTaskProj")
    tid = client.post(f"/api/v1/projects/{pid}/tasks", json={"title": "Bye"}).json()["id"]
    assert client.delete(f"/api/v1/tasks/{tid}").status_code == 204
    assert client.delete(f"/api/v1/tasks/{tid}").status_code == 404


# ── Analyses ──────────────────────────────────────────────────────────────────

def test_analyses_empty():
    r = client.get("/api/v1/analyses")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_analysis_not_found():
    assert client.get("/api/v1/analyses/99999").status_code == 404


# ── Valuation (demo mode) ─────────────────────────────────────────────────────

def test_valuation_demo():
    r = client.post("/api/v1/valuation/estimate", json={
        "location": "Mumbai", "property_type": "apartment", "built_up_area": 1200.0
    })
    assert r.status_code == 200
    d = r.json()
    assert "analysis_id" in d
    assert "disclaimer" in d
    assert "is_demo" in d


# ── Planning (demo mode) ──────────────────────────────────────────────────────

def test_planning_demo():
    r = client.post("/api/v1/planning/generate", json={
        "project_name": "Test Mall", "project_type": "commercial"
    })
    assert r.status_code == 200
    d = r.json()
    assert "phases" in d
    assert "suggested_tasks" in d
    assert "analysis_id" in d


# ── Diary ─────────────────────────────────────────────────────────────────────

def test_diary_crud():
    r = client.post("/api/v1/diary", json={
        "entry_date": "2024-01-15", "progress_notes": "Foundation complete"
    })
    assert r.status_code == 201
    eid = r.json()["id"]

    r2 = client.get(f"/api/v1/diary/{eid}")
    assert r2.status_code == 200
    assert r2.json()["entry_date"] == "2024-01-15"

    r3 = client.put(f"/api/v1/diary/{eid}", json={"progress_notes": "Updated notes"})
    assert r3.status_code == 200
    assert r3.json()["progress_notes"] == "Updated notes"

    assert client.delete(f"/api/v1/diary/{eid}").status_code == 204


# ── Weather (no key configured) ───────────────────────────────────────────────

def test_weather_no_key():
    r = client.get("/api/v1/weather?location=Delhi")
    assert r.status_code == 200
    d = r.json()
    # Should gracefully return not-live response
    assert "location" in d
