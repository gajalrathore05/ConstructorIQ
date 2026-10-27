from app.db.database import engine, Base
from app.models import models  # noqa: F401 - registers all models

def init_database():
    Base.metadata.create_all(bind=engine)
    print("Database tables created.")

if __name__ == "__main__":
    init_database()
