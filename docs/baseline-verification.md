# Baseline verification report

Verification date: 2026-11-09 (Africa/Nairobi)

## Source baseline

| Check | Result | Classification |
| --- | --- | --- |
| Repository A availability | Present; Git HEAD `a054b80`; tracked worktree clean at initial inspection | Source fact |
| Repository B availability | Present; not a Git repository | History unavailable |
| Destination history | Destination was not a Git repository | History unavailable |
| Repository B TypeScript (`tsc` app + node configs, no emit) | PASS | Existing baseline |
| Repository B Vite production build to `/tmp` | PASS; 178 modules transformed | Existing baseline |
| Repository A pytest using isolated `/tmp` SQLite DB | **1 passed, 1 failed** | Existing baseline failure |
| SQLite `PRAGMA integrity_check` | `ok` | Existing data check |

The source baseline failure was `test_health_endpoint_is_public`: the test expected exactly `status` and `service`, while the endpoint intentionally returned four AI diagnostics. Phase 0B corrected the stale assertion without removing fields; see `docs/mvp1-integration/01-stabilization-report.md`.

Warnings observed in the backend baseline:

- Starlette `TestClient` reports an upcoming `httpx` compatibility deprecation.
- FastAPI reports that `@app.on_event("startup")` is deprecated in favor of lifespan handlers.

## Consolidated verification

The following commands are the acceptance suite:

```bash
APP_ENV=test DATABASE_URL=sqlite:////tmp/digital-kids-consolidated.db \
JWT_SECRET_KEY=test-secret MOCK_AI_MODE=true \
  .venv/bin/python -m pytest -p no:cacheprovider -q tests

cd frontend
npm run typecheck
npm run build
npm run test:e2e
docker compose config
```

| Check | Result | Assessment |
| --- | --- | --- |
| Backend pytest with isolated per-test SQLite | **6 passed, 0 failed** | Phase 0B stabilized |
| React TypeScript build mode | PASS | Consolidated typed client compiles |
| React Vite production build | PASS; 178 modules transformed | Matches source module count |
| Vite `/api/health` proxy to FastAPI | PASS; healthy mock-AI response returned | Local apps communicate |
| CORS for `http://localhost:5173` | PASS; `access-control-allow-origin` present | Direct browser API access permitted when configured |
| Imported Playwright suite | **90 passed, 2 skipped** across desktop Chromium and Pixel 5 projects | Rendered baseline passed |
| Docker Compose model | PASS (`docker compose config`) | Development definition resolves |
| Docker development image build | PASS; API and web images built | Dockerfiles and build contexts resolve |
| npm audit | **4 vulnerabilities: 3 moderate, 1 high** | Inherited dependency risk; see below |

The health response is now treated as an explicit operational contract and has regression coverage.

### Dependency advisory baseline

The lockfile resolves Vite 5 and React Router 6. The audit reports advisories through the installed Vite/esbuild and React Router dependency chains. npm proposes major-version upgrades (Vite 8 and React Router 7), which are deliberately not applied during consolidation because they require compatibility work and could change behavior. Address these in a dedicated dependency-hardening milestone before production exposure; do not expose the Vite development server to untrusted networks.

## Data preservation record

- The source database, WAL, and SHM files were not deleted or reset.
- A destination snapshot was captured together after inspection; at capture its SHA-256 values matched the source files:
  - database: `496560a31490ef473135b57d55fa6f9be2ae013d6092aae9d9a4ac6bffc22e8c`
  - SHM: `1b821c8915f54d918ae0deac0e1f466cf947c7d5cb52ad9e7226395c395ae6ab`
  - WAL (empty after SQLite checkpoint): `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
- SQLite inspection caused SQLite to checkpoint the WAL into the main database; logical contents passed integrity checking. This filesystem-level side effect is disclosed here rather than described as an untouched byte representation.
- `data/*` is Git-ignored to prevent accidental database commits; `.gitkeep` is the only intended tracked data entry.
- Compose uses `./data:/app/data` and contains no migration, reset, prune, or volume-delete command.

## Recommendation

**CONDITIONAL GO** for the repository consolidation and continued integration work.

Conditions before feature development:

1. Run and require the new hosted CI checks.
2. Wire and validate the required MVP flows without expanding scope.
3. Re-run authentication, ownership, revision/marking, coding, spiritual, and progress checks as integrated browser/API flows.
4. Resolve or formally accept the inherited npm advisories before production exposure.
5. Rehearse restore on the deployment host before any deployment switch.

Until those gates pass, the recommendation for new learning feature development is **NO GO**.

