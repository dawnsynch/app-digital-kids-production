# Digital Kids Learning Platform — UI + Backend

Consolidated Phase 1 repository containing the existing FastAPI MVP and the existing React/Vite interface. This consolidation does **not** add learning features or replace business logic. The Streamlit application remains available as a legacy reference.

## Status

**Phase 1B recommendation: CONDITIONAL GO for Phase 1C secure learner authentication; NO GO for production or new learning modules.** Authenticated parents can create, list, view, edit, and select only their own learner profiles. Selection is memory-only and is not learner authentication; the PIN screen remains a non-authorizing preview. See the [Phase 1B report](docs/mvp1-integration/phase1b-learner-profiles.md).

## Repository layout

```text
backend/                       FastAPI application imported from Repository A
tests/                         Existing backend tests
frontend/                      React + TypeScript + Vite app imported from Repository B
  src/api/                     Reusable typed API client and contracts
legacy/streamlit/              Temporary Streamlit UI and its marketing assets
data/                          Local SQLite data (ignored by Git; never reset by scripts)
deployment/                    Existing backup, restore, validation, and Nginx references
docs/                          Architecture, integration, mapping, migration, and baseline reports
compose.yaml                   Docker development stack
docker-compose.server-build.yml Server-side image build
docker-compose.prod.yml        Prebuilt-image deployment definition
Dockerfile.api                 FastAPI image
Dockerfile.legacy-streamlit    Optional legacy UI image
```

## Local development

Prerequisites: Python 3.12+, Node.js 20+ (Node 22 recommended), npm, and optionally Docker.

```bash
cp .env.example .env
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd frontend && npm ci && cd ..
```

Run the API and React app in separate terminals:

```bash
# Terminal 1, repository root
source .venv/bin/activate
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2
cd frontend
npm run dev
```

- React: <http://localhost:5173>
- API: <http://localhost:8000>
- API docs: <http://localhost:8000/docs>
- Health: <http://localhost:8000/health>

Vite proxies `/api/*` to the API and removes the `/api` prefix. Set `VITE_API_BASE_URL` to an absolute API URL when a proxy is not used. FastAPI CORS allows the Vite and legacy Streamlit local origins by default and can be overridden with `ALLOWED_ORIGINS`.

The default configuration uses mock AI. Set a real `OPENAI_API_KEY` and explicitly disable `MOCK_AI_MODE` only when intended. Never commit `.env`.

### Legacy Streamlit reference

```bash
source .venv/bin/activate
streamlit run legacy/streamlit/frontend/streamlit_app.py
```

The reference UI opens at <http://localhost:8501> and talks to the same API.

## Docker development

```bash
cp .env.example .env
docker compose up --build
```

This starts React on port 5173 and FastAPI on port 8000. The existing `./data` directory is bind-mounted at `/app/data`; Compose does not copy, migrate, reset, or delete the SQLite database. Do not run `docker compose down -v` when preserving development volumes.

Start the optional Streamlit reference too:

```bash
docker compose --profile legacy up --build
```

For a production-style local build, use `docker compose -f docker-compose.server-build.yml up --build` and open port 8080.

## Verification

```bash
source .venv/bin/activate
APP_ENV=test DATABASE_URL=sqlite:////tmp/digital-kids-test.db \
  JWT_SECRET_KEY=test-only-secret MOCK_AI_MODE=true python -m pytest -q

cd frontend
npm run build
npm run typecheck
npm run test:unit
npm run test:e2e
```

The backend suite uses a forced temporary SQLite database configured before FastAPI imports. Playwright starts FastAPI with a newly generated temporary SQLite path and never reuses an API already listening on port 8000. Set `PYTHON_EXECUTABLE` when the required Python environment is not available as `python3`.

Create and verify a non-overwriting SQLite backup with:

```bash
python3 scripts/sqlite_backup.py \
  --source data/digital_kids_assistant.db \
  --output /safe/backup/location/digital-kids.db
```

## Integration and migration documents

- [Architecture and provenance](docs/architecture-and-provenance.md)
- [API integration plan](docs/api-integration-plan.md)
- [MVP 1 screen mapping](docs/mvp1-screen-matrix.md)
- [Baseline verification report](docs/baseline-verification.md)
- [PostgreSQL migration milestone](docs/postgresql-migration-milestone.md)
- [Phase 0B stabilization and integration readiness](docs/mvp1-integration/01-stabilization-report.md)
- [Backend API contracts](docs/mvp1-integration/02-backend-api-contracts.md)
- [Security and dependency report](docs/mvp1-integration/03-security-and-dependency-report.md)
- [SQLite backup/restore report](docs/mvp1-integration/04-sqlite-backup-restore-report.md)
- [React integration plan](docs/mvp1-integration/05-react-api-integration-plan.md)
- [Implementation backlog](docs/mvp1-integration/06-implementation-backlog.md)
- [CI/CD quality gates](docs/mvp1-integration/07-quality-gates.md)
- [GO / NO-GO assessment](docs/mvp1-integration/08-go-no-go-assessment.md)
- [Phase 1A parent authentication](docs/mvp1-integration/phase1a-parent-authentication.md)
- [Phase 1B learner profiles](docs/mvp1-integration/phase1b-learner-profiles.md)

New learning-module development remains out of scope until the existing MVP screens are integrated and accepted.

