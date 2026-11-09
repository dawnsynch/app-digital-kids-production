# MVP 1 React-to-FastAPI implementation backlog

This backlog connects existing React screens to existing FastAPI business logic. It does not authorize new learning modules or fabricated metrics.

## Phase 1 — Authentication and role-based portals

- **Dependencies:** stable auth schemas; decision that learner username/password is used until a secure PIN contract exists.
- **Reuse:** parent auth pages, `ParentAuthLayout`, `ApiClient.registerParent/login/currentUser`, backend JWT roles.
- **Tasks:** add `AuthProvider`; memory-only token lifecycle; public/protected/role guards; wire registration/sign-in; 401/403/logout feedback; preserve current styling.
- **Contracts:** `POST /auth/register-parent`, `POST /auth/login`, `GET /auth/me`.
- **Acceptance:** real parent can register/sign in; fake credentials are removed from the integrated path; learner/parent/admin route guards fail closed; no token in URL, logs, or local storage.
- **Verification:** backend auth tests; Playwright registration/login/logout/session-expiry journeys; direct forbidden-route checks.

## Phase 2 — Learner profiles

- **Dependencies:** Phase 1 parent session; approved learner-account UX.
- **Reuse:** select-learner and profile screens, student routes, ownership dependencies.
- **Tasks:** load parent children; implement empty state; select active learner in context; wire child and learner-account creation only to existing approved UI; retain demo PIN screen as non-production until replaced.
- **Contracts:** `GET/POST /students`, `GET /students/{id}`, `POST /students/{id}/learner-account`.
- **Acceptance:** parent sees only own children; learner sees only linked profile; cross-parent IDs return 403; password never returned.
- **Verification:** two-parent backend regression and multi-context Playwright access test.

## Phase 3 — CBC Practice setup and generation

- **Dependencies:** authenticated user and active learner; typed response model for revision options.
- **Reuse:** existing Practice controls and backend mock/OpenAI generation.
- **Tasks:** replace static options; map UI difficulty casing; submit generation; store assessment ID; add loading/error/retry; preserve maximum question rules.
- **Contracts:** `GET /revision/options`, `POST /revision/generate`, `GET /revision/{id}`.
- **Acceptance:** generated questions match selected grade/term/subject/topic; unauthorized learner/parent cannot generate for another child; no API key reaches browser.
- **Verification:** deterministic mock-AI tests and Playwright setup-to-question flow.

## Phase 4 — Quiz answer submission and marking

- **Dependencies:** Phase 3 assessment state; approved question/review UI using existing designs.
- **Reuse:** revision answer/marking services and parent-only dependency.
- **Tasks:** learner saves answers; resume assessment; parent review invokes marking; render strengths, weak areas, recommendations, and per-question feedback.
- **Contracts:** `POST /revision/answers`, `GET /revision/{id}`, `POST /revision/submit`.
- **Acceptance:** learner save succeeds but learner marking returns 403; owning parent can mark; other parent cannot view or mark; duplicate submission behavior is explicit.
- **Verification:** backend role tests plus learner/parent Playwright contexts.

## Phase 5 — Progress and results

- **Dependencies:** completed/marked assessments; response model for parent summary.
- **Reuse:** `/progress` and dashboard presentation, progress endpoints.
- **Tasks:** map real attempts and averages; render empty/new learner state; label or remove unsupported stars/streaks/achievement metrics; fetch independent dashboard data in parallel.
- **Contracts:** `GET /progress/student/{id}`, `GET /progress/summary`.
- **Acceptance:** percentages and counts match backend; owning learner/parent only; no static data is presented as real progress.
- **Verification:** seeded assessment results and cross-parent denial tests.

## Phase 6 — Parent dashboard

- **Dependencies:** Phases 1, 2, and 5; product mapping for existing parent dashboard designs.
- **Reuse:** parent designs, students list, parent progress aggregate, interaction history.
- **Tasks:** learner switcher; family summary; recent attempts/interactions; parent-only navigation; honest empty/unsupported sections.
- **Contracts:** `/students`, `/progress/summary`, `/progress/student/{id}`, `/learning-interactions/student/{id}`.
- **Acceptance:** data is restricted to current parent's children and changes correctly with learner selection.
- **Verification:** Parent A/Parent B seeded dashboards and direct-ID probes.

## Phase 7 — Coding & Technology

- **Dependencies:** authenticated active learner; interaction client methods.
- **Reuse:** current coding dashboard, `POST /learning/coding`, mock/OpenAI service, interaction model.
- **Tasks:** connect topic/lesson generation; render returned lesson; record interaction after success; show prior interactions where UI supports them; preserve card layout.
- **Contracts:** `POST /learning/coding`, `POST/GET/PATCH /learning-interactions*`.
- **Acceptance:** learner can request only own grade; generated content appears without replacing static design structure; failed generation is not recorded as completed.
- **Verification:** grade-scope backend tests, mock-AI Playwright lesson journey, console/layout regression.

## Phase 8 — Bible Learning

- **Dependencies:** same interaction foundation as Phase 7.
- **Reuse:** Bible dashboard, `POST /learning/spiritual`, interaction tracking.
- **Tasks:** map selected theme; render reference, summary, reflection, activity, and prayer; record/resume interaction; keep static verse content explicitly separate if not API-owned.
- **Contracts:** `POST /learning/spiritual`, learning-interaction routes.
- **Acceptance:** own-grade rule holds; content fields render safely; interaction ownership is enforced.
- **Verification:** backend spiritual/interaction tests and Playwright generation/history journey.

## Phase 9 — Basic administration

- **Dependencies:** admin provisioning procedure; response schemas for every admin endpoint; positive admin tests; dedicated admin route layout approval.
- **Reuse:** existing admin routes and design reference images.
- **Tasks:** introduce typed admin models; filters; summary/tables; admin-only guard; pagination decision before large datasets; avoid exposing hashes/tokens or raw AI secrets.
- **Contracts:** all `/admin/*` GET routes.
- **Acceptance:** admin succeeds; parent/learner receive 403; filters return expected records; no untyped payload remains in the client boundary.
- **Verification:** seeded admin tests, role-negative tests, filter tests, and admin Playwright smoke tests.

## Cross-cutting definition of done

- Backend ownership tests and React journey tests pass.
- TypeScript and OpenAPI-generated contracts are synchronized.
- Loading, empty, validation, 401, 403, 404, and network error states exist.
- Existing desktop/mobile layout tests remain green.
- No real database, OpenAI call, or production credential is used in CI.
- README and the contract matrix are updated with each completed phase.

