import os
from sqlalchemy import create_engine, event, inspect, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from .config import get_settings

settings = get_settings()

if settings.database_url.startswith("sqlite"):
    # Ensure ./data exists for local SQLite use.
    os.makedirs("data", exist_ok=True)
    engine = create_engine(
        settings.database_url,
        connect_args={"check_same_thread": False, "timeout": 30},
        future=True,
    )
else:
    engine = create_engine(settings.database_url, future=True)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


class Base(DeclarativeBase):
    pass


if settings.database_url.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragmas(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON;")
        cursor.execute("PRAGMA busy_timeout=30000;")
        try:
            cursor.execute("PRAGMA journal_mode=WAL;")
        except Exception:
            pass
        cursor.close()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    from . import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    _run_lightweight_migrations()


def _run_lightweight_migrations() -> None:
    """Small SQLite-friendly migrations for the Phase 1 auth upgrade."""
    inspector = inspect(engine)
    if "students" not in inspector.get_table_names():
        return

    student_columns = {column["name"] for column in inspector.get_columns("students")}
    if "parent_id" not in student_columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE students ADD COLUMN parent_id INTEGER"))
