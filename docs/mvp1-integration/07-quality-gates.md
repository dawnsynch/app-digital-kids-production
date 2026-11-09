# CI/CD quality gates

Workflow: `.github/workflows/deploy.yml`.

## Mandatory gates

| Gate | CI command | Failure effect |
| --- | --- | --- |
| Backend tests | `python -m pytest -q` with test-only env and SQLite | Blocks Docker builds and publication |
| TypeScript | `npm run typecheck` | Blocks Docker builds and publication |
| Frontend unit tests | `npm run test:unit` | Blocks Docker builds and publication |
| React production build | `npm run build` | Blocks Docker builds and publication |
| Rendered frontend tests | `npm run test:e2e` after Chromium install | Blocks Docker builds and publication |
| Dependency security | `npm audit --audit-level=critical` | Critical advisory blocks Docker builds/publication |
| API Docker build | BuildKit using `Dockerfile.api` | Blocks publication |
| Web Docker build | BuildKit using `frontend/Dockerfile` | Blocks publication |

The workflow runs quality jobs for pull requests and `main`. Image publication is allowed only on `main` after all tests, security checks, and both Docker builds pass. No deployment job exists in this repository; an external deployment must consume only images produced by this gated workflow.

## Security threshold exception

The current audit contains a known high Vite development-tool advisory with only a major-version fix. CI therefore blocks critical findings during Phase 0B and reports the high/moderate baseline. Production approval additionally requires either:

- a tested Vite 8/React Router 7 upgrade with audit passing at `--audit-level=high`; or
- explicit, time-bounded security-owner acceptance documenting compensating controls.

Any new critical finding is an immediate blocker. Any newly introduced high finding must be reviewed and may not be silently absorbed into the baseline.

## Recommended branch protection

Require these checks on `main`:

- `backend-tests`;
- `frontend-tests`;
- `dependency-security`;
- both `docker-builds` matrix results.

Also require pull requests, at least one reviewer, dismissal of stale approvals, and no direct pushes to `main`. These controls must be configured in the hosting platform; repository files alone cannot enforce them.

## Local pre-push equivalent

```bash
python -m pytest -q
cd frontend
npm ci
npm run typecheck
npm run test:unit
npm run build
npm run test:e2e
npm audit --audit-level=critical
cd ..
docker compose build
```

Use an isolated `DATABASE_URL` and `MOCK_AI_MODE=true` for all automated backend runs.

## Future hardening gates

- Generated OpenAPI contract drift check.
- Python dependency vulnerability scan and pinned/hash-verified lock.
- Container image/SBOM scan.
- Secret scanning.
- High-severity npm audit threshold after major upgrades.
- SQLite backup/restore rehearsal before production deployment.

