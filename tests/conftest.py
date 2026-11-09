import os
import tempfile
from collections.abc import Iterator
from pathlib import Path

import pytest

# Configure an isolated database before pytest imports the application modules.
_test_data_dir = tempfile.TemporaryDirectory(prefix="digital-kids-pytest-")
_test_database_path = os.path.join(_test_data_dir.name, "test.db")
os.environ["APP_ENV"] = "test"
os.environ["DATABASE_URL"] = f"sqlite:///{_test_database_path}"
os.environ["JWT_SECRET_KEY"] = "pytest-only-secret-not-for-production"
os.environ["MOCK_AI_MODE"] = "true"
os.environ.pop("OPENAI_API_KEY", None)

from fastapi.testclient import TestClient  # noqa: E402

from backend.app.database import Base, engine  # noqa: E402
from backend.app.main import app  # noqa: E402


@pytest.fixture(autouse=True)
def isolated_database() -> Iterator[None]:
    engine.dispose()
    for suffix in ("", "-wal", "-shm"):
        Path(f"{_test_database_path}{suffix}").unlink(missing_ok=True)
    Base.metadata.create_all(bind=engine)
    yield
    engine.dispose()


@pytest.fixture
def client() -> Iterator[TestClient]:
    with TestClient(app) as test_client:
        yield test_client

