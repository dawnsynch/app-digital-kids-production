# Deployment Readiness Assessment

## Starting Git Status

- Branch: `deployment-readiness`
- Repository is not clean. Existing modified/untracked work is present and will be preserved.
- No reset, clean, or overwrite operations will be used.

## Current Repository Structure

- Backend application: `backend/app`
- Streamlit frontend: `frontend/streamlit_app.py`
- Current API Dockerfile: `Dockerfile.api`
- Current UI Dockerfile: `Dockerfile.ui`
- Current Compose file: `docker-compose.yml`
- Existing docs directory: `docs/` (currently empty before this assessment)

## What Already Exists

- FastAPI backend entry point: `backend.app.main:app`
- Streamlit frontend entry point: `frontend/streamlit_app.py`
- SQLite database configuration in `backend/app/config.py`
- SQLite engine/session setup in `backend/app/database.py`
- Table initialization via `Base.metadata.create_all(...)`
- Lightweight SQLite migration logic for `students.parent_id`
- JWT auth, password hashing, and role-based access control
- Parent, learner, admin, hobbies, and learning-interaction features already in the codebase
- Health endpoint already exists at `GET /health`
- OpenAI integration and mock AI mode already exist
- CORS middleware already exists
- Existing Dockerfiles and Compose file already exist

## Current Runtime Details

- Backend entry point: [main.py](/Users/denisgikundi/Desktop/aipoc/digital-kids-assistant/digital-kids-assistant-phase1/backend/app/main.py)
- Streamlit entry point: [streamlit_app.py](/Users/denisgikundi/Desktop/aipoc/digital-kids-assistant/digital-kids-assistant-phase1/frontend/streamlit_app.py)
- Current database URL default: `sqlite:///./data/digital_kids_assistant.db`
- Current SQLite file location for local development: `data/digital_kids_assistant.db`
- SQLAlchemy engine/session module: [database.py](/Users/denisgikundi/Desktop/aipoc/digital-kids-assistant/digital-kids-assistant-phase1/backend/app/database.py)
- Settings module already uses `pydantic-settings`: [config.py](/Users/denisgikundi/Desktop/aipoc/digital-kids-assistant/digital-kids-assistant-phase1/backend/app/config.py)
- JWT creation/validation and PBKDF2 password hashing exist in [security.py](/Users/denisgikundi/Desktop/aipoc/digital-kids-assistant/digital-kids-assistant-phase1/backend/app/security.py)

## Authentication and RBAC Status

- Passwords are hashed with PBKDF2-SHA256 plus random salt.
- Password verification compares submitted passwords against the stored hash.
- JWT secret is environment-backed and validated at runtime.
- Access tokens include `sub`, `role`, and `exp`.
- Invalid and expired tokens are rejected.
- Current reusable dependencies already include:
  - authenticated user
  - parent-only
  - learner-only
  - admin-only
  - parent-or-admin
- Ownership checks already exist for students, assessments, and learning interactions.

## OpenAI and Mock AI Status

- OpenAI integration is backend-only.
- Mock AI mode already exists.
- Current setting name is `use_mock_ai`; requested deployment setting is `MOCK_AI_MODE`.
- Current OpenAI integration lacks timeout/retry hardening and clearer production validation behavior.

## Existing Docker / Compose Status

- `Dockerfile.api` and `Dockerfile.ui` already exist, but both are minimal.
- Current containers run as root.
- Current Dockerfiles do not set `PYTHONDONTWRITEBYTECODE` or `PYTHONUNBUFFERED`.
- Current Dockerfiles do not use `--proxy-headers`.
- Current UI Dockerfile does not set Streamlit headless flags explicitly.
- Current Compose file is `docker-compose.yml`, not `compose.yaml`.
- Current Compose services are named `api` and `ui`, not `backend` and `frontend`.
- Current Compose binds ports publicly (`8000:8000`, `8501:8501`) instead of loopback-only.
- Current Compose has no health check and no Docker network hardening.

## Existing Environment Handling

- `.env.example` exists but is incomplete for deployment.
- `.env` exists locally and contains sensitive values; it must remain uncommitted.
- Existing config does not yet support all requested production variables:
  - `APP_ENV`
  - `PUBLIC_API_URL`
  - `MOCK_AI_MODE`
  - `ALLOWED_ORIGINS`
  - `TZ`
  - `MAX_QUESTIONS_PER_REQUEST`
  - `MAX_ANSWER_LENGTH`
  - `MAX_AI_REQUESTS_PER_LEARNER_PER_HOUR`
  - `OPENAI_TIMEOUT_SECONDS`

## Existing Health / Init / Migration Status

- Health endpoint already exists, but response payload is not yet aligned with the requested production shape:
  - current: `{"status": "ok", "service": settings.app_name}`
  - requested: `{"status": "healthy", "service": "digital-kids-learning-api"}`
- Database initialization currently happens on app startup.
- No Alembic or migration framework exists.
- No explicit production initialization script exists yet.

## Existing Tests

- No `tests/` directory or automated pytest suite is present.
- Existing validation relies on ad hoc smoke scripts and in-process checks.

## Hard-Coded URLs / Secrets / Risks Found

- Frontend default API URL is hard-coded to `http://localhost:8000`.
- README contains local `localhost` examples, which are fine for dev docs but not production defaults.
- Current config default CORS origin is `http://localhost:8501`.
- A local `.env` file exists and contains a real-looking OpenAI API key. This is a security risk and should be rotated if it was ever committed or shared.
- Smoke scripts use example plaintext test passwords, which is acceptable for test code but should be documented as test-only.

## Production Security Risks Identified

- Current `.gitignore` does not exclude enough deployment-sensitive files and directories.
- Current Compose publishes internal services publicly instead of loopback-only.
- Current Dockerfiles run as root.
- No `.dockerignore` exists yet.
- SQLite production pragmas are not yet enabled:
  - WAL mode
  - foreign key enforcement
  - busy timeout
- No backup/restore scripts exist.
- No deployment validation script exists.
- No Nginx templates exist.
- No frontend Streamlit production config exists.
- No focused automated tests exist for deployment-critical auth and role rejection behavior.

## Safe To Retain

- Current FastAPI app/module structure
- Current Streamlit page structure
- Current auth model and token format
- Current password hashing strategy
- Current SQLite-first approach
- Current mock AI behavior
- Current role/ownership enforcement patterns
- Current startup table initialization approach, unless a small explicit init script is needed for production documentation

## What Needs Modification

- Centralized settings expansion and validation
- SQLite engine pragmas and timeout configuration
- Health endpoint payload
- Input/request limits configuration
- OpenAI timeout/retry handling
- `.env.example`
- `.gitignore` and `.dockerignore`
- Dockerfiles
- Production `compose.yaml`
- Streamlit production config
- Nginx templates
- Backup/restore/validation scripts
- Deployment documentation
- Focused tests for auth and deployment-critical access control

## Planned Changes

1. Harden settings and database engine configuration without changing business logic.
2. Add deployment-safe ignore rules and placeholder persistent directories.
3. Improve backend/frontend Dockerfiles and add production `compose.yaml`.
4. Add Streamlit production config and Nginx templates.
5. Add backup, restore, and deployment validation scripts.
6. Add focused auth/role tests and validate the health endpoint and deployment behavior.
7. Document Ubuntu server deployment and operational steps in `docs/server-deployment-guide.md`.
