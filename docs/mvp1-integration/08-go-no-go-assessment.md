# Phase 0B GO / NO-GO assessment

## Decision

**CONDITIONAL GO** to begin Phase 1 React-to-FastAPI functional integration.

**NO GO** for production deployment or new learning-module development.

## Evidence supporting integration start

- Backend suite stabilized at 6 passing tests with isolated per-test SQLite data.
- Critical ownership and role boundaries now have regression coverage.
- The intentional health diagnostic contract is preserved and tested.
- React type-check and production build pass; the rendered suite passes 90 tests with 2 intentional skips across desktop and mobile projects.
- SQLite backup and isolated restore passed integrity, foreign-key, hash, record-count, and FastAPI-open checks.
- The typed API client and phased screen mapping provide a single integration boundary.
- API tests also pass inside the freshly built Python 3.12 image; both development images and the final Nginx production web image build successfully.
- CI now prevents image publication until backend, frontend, security, and Docker gates pass.

## Conditions

1. Run the new GitHub Actions workflow on the actual remote and require its checks on `main`; local validation cannot prove hosted permissions, caches, or branch protection.
2. Accept the documented Vite/React Router residual risk for development only and schedule the major-version hardening branch before production.
3. Keep production deployment disabled until the high advisory is upgraded or formally risk-accepted.
4. Add missing FastAPI response models before generating frontend types for revision detail, aggregates, and administration.
5. Resolve learner PIN product/security expectations; do not wire the demo PIN to username/password implicitly.
6. Preserve SQLite backup/restore evidence before any deployment cutover.

## Remaining blockers by target

| Target | Blocker |
| --- | --- |
| Begin authentication integration | Hosted CI has not yet run; learner PIN decision is needed only for learner auth, not parent auth |
| Complete all MVP integration | Missing response models, interaction permission granularity, and unimplemented page adapters |
| Production deployment | High npm advisory, no hosted gate evidence, no deployment restore rehearsal on target host |
| New feature development | Existing MVP screens are not yet functionally integrated and validated end to end |

## Exact next milestone

Start **Phase 1A: Parent authentication foundation**:

1. add `AuthProvider` with memory-only access token and authenticated user;
2. wire parent registration, login, `/auth/me`, logout, 401, and 403 states;
3. add public/protected/parent route guards while keeping backend authorization authoritative;
4. remove fake parent credentials only from the real integrated journey;
5. add Playwright tests against an ephemeral FastAPI/SQLite stack for registration, login, reload behavior, logout, invalid credentials, and forbidden learner/parent routes;
6. rerun all Phase 0B gates.

Learner PIN/authentication, learner profiles, and CBC practice follow as separate milestones after Phase 1A is accepted.

