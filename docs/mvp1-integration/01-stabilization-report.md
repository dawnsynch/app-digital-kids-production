# Phase 0B stabilization report

Date: 2026-11-09 (Africa/Nairobi)

## Outcome

Phase 0B establishes a reproducible backend test database, validates database recovery, preserves the React UI baseline, and adds CI quality gates. No learning module or product behavior was added.

## Focused changes

- Corrected the stale health test to validate the intentional operational response: `status`, `service`, `ai_mode`, `openai_configured`, `openai_model`, and `mock_reason`.
- Added `pytest.ini` so tests are discovered from `tests/` with the repository root on `pythonpath`.
- Added a pytest fixture that sets `DATABASE_URL` before importing FastAPI and recreates an isolated temporary SQLite database for every test.
- Expanded backend regression coverage from two broad tests to six focused tests.
- Added non-overwriting SQLite backup and restore-verification utilities.
- Applied safe in-range frontend development dependency updates only.
- Added required CI gates before container images can be published.
- Added the Phase 1 API contract and implementation plan documents.

## Backend test baseline

Command:

```bash
PYTHONDONTWRITEBYTECODE=1 python -m pytest -p no:cacheprovider -q
```

Result: **6 passed, 0 failed**.

Coverage now explicitly verifies:

- public health response contract and mock-AI diagnostics;
- parent registration, login, and `/auth/me`;
- password hashes never appear in API responses;
- parent-to-child ownership isolation;
- learner access only to the linked profile;
- learner denial from parent-only child creation and progress summary;
- learner answer saving versus parent-only AI marking;
- cross-parent assessment and progress denial;
- learner grade restriction on coding and spiritual lessons;
- invalid/missing token rejection;
- parent denial from admin routes.

Three warnings remain: FastAPI startup events are deprecated, and the installed Starlette test client reports its `httpx` compatibility transition. These are maintenance items, not test failures.

## Frontend and runtime baseline

- TypeScript: pass.
- Vite production build: pass.
- Imported Playwright suite after dependency update: **90 passed, 2 intentionally skipped** across desktop Chromium and Pixel 5 projects.
- Vite proxy to FastAPI and CORS: previously validated and unchanged by Phase 0B.
- UI/branding changes: none.
- Docker: API development image, React development image, and final Nginx production stage all build successfully.

The first Playwright attempt after updating Playwright failed before navigation because the matching Chromium revision was not installed. After `npx playwright install chromium`, the identical suite passed. This was an environment prerequisite, not an application regression; CI installs Chromium explicitly.

## Existing issues versus Phase 0B defects

| Item | Classification | Disposition |
| --- | --- | --- |
| Health test expected only two fields | Existing stale test | Fixed without removing diagnostics |
| FastAPI `on_event` deprecation | Existing maintenance debt | Deferred; lifespan migration should be separate |
| Starlette test-client warning | Existing dependency transition | Monitor requirements resolution |
| Vite/React Router audit findings | Existing dependency risk | Documented; major upgrades deferred |
| Admin and several aggregate endpoints lack response models | Existing contract weakness | Must be addressed before their React integration phase |
| React screens still use preview/static data | Expected consolidation state | Replace incrementally per backlog |

## Scope confirmation

The active SQLite database was not reset, migrated, or overwritten. PostgreSQL was not introduced. Existing FastAPI logic, OpenAI/mock-AI behavior, React branding, routes, assets, and legacy Streamlit code remain intact.

