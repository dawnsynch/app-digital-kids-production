# Phase 1A parent authentication

Date: 2026-11-09  
Decision: **CONDITIONAL GO for Phase 1B learner-profile integration; NO GO for production or new learning modules.**

## 1. Implementation summary

React now uses the existing FastAPI authentication engine for parent registration and login. A single `AuthProvider` owns the in-memory bearer token and verified current user. Registration and login set the token only long enough to call `GET /auth/me`; protected parent UI is rendered only after that identity check succeeds. `/parent/select-learner` is the Phase 1A protected landing page and exposes a visible sign-out action.

The existing parent branding, fonts, artwork, form layout, responsive behavior, learner-preview cards, FastAPI password hashing, JWT implementation, SQLite database, and Streamlit reference were retained. No learner PIN authentication, learner-profile integration, learning feature, refresh token, browser cookie, database migration, or replacement auth backend was introduced.

The active database was not used by automated tests. Backend tests create and remove a temporary database through `tests/conftest.py`; Playwright creates a new random directory under the operating-system temp directory and starts a dedicated FastAPI process on port 8000. It refuses to reuse an already-running API. The active database and WAL hashes remain the Phase 0B values:

- database: `496560a31490ef473135b57d55fa6f9be2ae013d6092aae9d9a4ac6bffc22e8c`
- WAL: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`

## 2. API contracts

| Method and route | Request | Response | Behavior |
| --- | --- | --- | --- |
| `POST /auth/register-parent` | `full_name`, `email`, `password` | `access_token`, `token_type`, safe `user` | Creates a parent; normalizes email/name; duplicate email is 400; password minimum is 8 characters |
| `POST /auth/login` | parent `email`, `password` | `access_token`, `token_type`, safe `user` | Invalid, unknown, or inactive credentials return the same 401 response |
| `GET /auth/me` | Bearer access token | explicit `UserOut` | Reloads identity from the database; missing, malformed, tampered, expired, unknown-user, and inactive-user tokens return 401 |

`UserOut` includes ID, name, permitted email/username and relationship identifiers, role, active state, and creation time. It cannot serialize `password_hash` or JWT configuration. No logout endpoint exists; logout is client-side state clearing.

Necessary compatible backend changes were limited to normalized Pydantic parent input validation and catching a database uniqueness race as the existing duplicate-email 400 response. Existing paths and response shapes were preserved.

## 3. Authentication and session architecture

```text
register/login -> FastAPI token response -> token held by ApiClient in memory
              -> GET /auth/me -> verified User in AuthProvider
              -> parent-role guard -> protected landing

401 on authenticated request -> clear token and user -> anonymous
403 on authenticated request -> preserve session -> access denied
logout -> clear token and user -> sign-in
full browser refresh -> memory cleared -> sign-in
```

The token is never written to `localStorage`, `sessionStorage`, cookies, URLs, UI messages, or logs. Form mutations run only from submit handlers, and submit buttons are disabled while requests are active. The API remains the authorization authority; React guards provide navigation and disclosure protection only.

## 4. Routes and components modified

| Surface | Change |
| --- | --- |
| `frontend/src/auth/AuthContext.tsx` | Added login, registration, verified identity, logout, 401 clearing, user, and auth status |
| `frontend/src/auth/AuthRoutes.tsx` | Added public-parent redirect and authenticated parent-role guard |
| `frontend/src/api/client.ts` | Added consistent authenticated 401 notification and safer validation-error extraction |
| `frontend/src/main.tsx` | Mounted one application-wide `AuthProvider` |
| `frontend/src/App.tsx` | Kept public onboarding routes public and protected `/parent/select-learner` |
| `ParentRegisterPage.tsx` | Replaced fake timer with real registration and accessible validation/error/loading states |
| `ParentSignInPage.tsx` | Replaced demo credentials with real login, `/auth/me` verification, and safe error/loading states |
| `ParentSelectLearnerPage.tsx` | Displays verified parent identity and visible logout; learner data remains explicitly preview-only |
| `ParentAuthLayout.tsx` and `parent-auth.css` | Removed inaccurate no-session banner and added a design-consistent sign-out control |

Unknown application routes retain the existing fallback behavior. Learner routes and `/learner/pin` were not converted to authenticated routes in this phase.

## 5. Security controls

- Existing PBKDF2-SHA256 password hashing, HS256 JWT signing, configured expiry, database role checks, and ownership dependencies are retained.
- `/auth/me` loads the active user from SQLite rather than trusting token profile data; role authorization uses the current database record.
- Explicit response models exclude password hashes and secrets.
- Registration normalizes names/emails and handles duplicate-email checks plus uniqueness races.
- Invalid, expired, tampered, inactive-user, and missing tokens fail closed with 401.
- Parent UI rejects learner/admin roles; backend role dependencies remain authoritative.
- Access tokens are memory-only; 401 clears the session, while 403 deliberately does not.
- Playwright and pytest use isolated temporary SQLite databases and synthetic users.
- Docker and local proxy configuration retain same-origin `/api` connectivity and existing CORS allowlists.

## 6. Test results

Final results on 2026-11-09:

| Gate | Result |
| --- | --- |
| Backend pytest | **11 passed**, 3 deprecation warnings |
| TypeScript | **PASS** |
| Frontend unit tests | **5 passed** in 2 files |
| Vite production build | **PASS**, 178 modules transformed |
| Playwright Chromium + Pixel 5 | **94 passed, 2 intentional mobile skips** out of 96 |
| Focused final auth screenshot run | **2 passed** |
| npm audit | **0 critical, 0 high, 2 moderate** |
| FastAPI Docker image | **PASS** (`digital-kids-api:phase1a`) |
| React/Nginx Docker image | **PASS** (`digital-kids-web:phase1a`) |

Phase 0B started at 6 backend tests, no frontend unit suite, 90 passed/2 skipped Playwright tests, and 1 high/3 moderate npm findings. Phase 1A adds five backend tests, five unit tests, and four net Playwright cases. The Vite/Vitest test-build toolchain was security-upgraded, eliminating the high finding and avoiding two critical test-only findings observed during the initial Vitest installation. The remaining two moderate findings are React Router advisories whose available npm remediation is the breaking React Router 7 upgrade; that migration was not mixed into authentication consolidation.

Two intermediate Playwright runs failed only in newly added test code: an ambiguous confirm-password locator, then a text click that did not check the terms checkbox. Both locators were corrected and the complete final suite passed. No application regression was suppressed or bypassed.

The three pytest warnings are existing FastAPI/Starlette lifecycle and TestClient deprecations. The two Playwright skips are the existing mobile exclusions for desktop sidebar interactions.

## 7. Known limitations

- A full page refresh requires the parent to authenticate again because the token is intentionally memory-only.
- Client logout does not revoke a JWT already issued by the backend; no refresh, revocation, or deny-list service exists.
- Password reset is not implemented.
- Authentication rate limiting/account lockout is not implemented and is required before a production recommendation.
- Phone number and consent checkboxes are retained UI requirements but are not persisted because the existing backend contract has no approved fields for them.
- Learner cards remain development preview data. Selecting one reaches the pre-existing PIN preview, not an authenticated learner session.
- Two moderate React Router advisories remain pending a separately tested major-version migration.
- The consolidated repository's `main` branch has no commits, so consolidated Git ancestry and commit provenance are unavailable. Source provenance is documented separately; it has not been invented here.

## 8. Next implementation dependencies

Phase 1B may integrate only existing learner-profile contracts:

1. load the authenticated parent's learners with `GET /students`;
2. implement loading, empty, 401, and 403 states without fabricating learner records;
3. add/create a learner only through the existing parent-authorized endpoint and an approved UI flow;
4. retain cross-parent ownership tests and the ephemeral Playwright stack;
5. decide whether phone/consent persistence requires an approved schema milestone;
6. keep learner PIN authentication, learning modules, refresh sessions, PostgreSQL, and production deployment out of scope unless separately authorized.

Before production, add auth throttling, a deliberate persistent-session/revocation design, password recovery, secrets/deployment review, React Router remediation, and production observability.

## 9. Recommendation

**CONDITIONAL GO for Phase 1B learner-profile integration.** The Phase 1A completion criteria are met: a parent can register, retrieve verified identity, reach a role-protected React landing page, sign out, sign in with real credentials, and is rejected after logout or refresh. Backend token and role boundaries pass isolated tests.

The condition is that Phase 1B remains limited to existing learner-profile APIs and keeps all tests off the active SQLite database. This is still **NO GO for production, learner PIN authentication, PostgreSQL migration, or new learning features**.
