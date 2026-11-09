# Phase 1C secure learner authentication

Date: 2026-11-09
Decision: **CONDITIONAL GO for Phase 2A CBC Practice integration; NO GO for production**

## 1. Authentication design

Phase 1C reuses the existing `User` learner identity linked one-to-one to `Student`; it does not add a second identity model. An owning parent configures a six-digit learner PIN after re-entering the parent password. The parent then requests a short-lived, learner-bound handoff challenge. The child redeems that single-use challenge with the PIN and receives a distinct learner-role token.

The handoff secret is returned only in the response body and passed through React Router memory state. It is never placed in a URL, log, `localStorage`, or `sessionStorage`. Creating a handoff clears the browser's parent token and learner-management context before the PIN screen is shown. A successful redemption installs only the learner token.

## 2. Data model and migrations

Additive Alembic revision `20261109_01` introduces:

- `User.learner_pin_hash`, `learner_access_enabled`, `learner_session_version`, `pin_failed_attempts`, and `pin_locked_until`;
- `learner_handoffs`, containing only a SHA-256 challenge digest, learner/parent binding, expiry, use/revocation state, and failed-attempt count;
- `learner_sessions`, containing a random token ID, learner/user binding, credential version, expiry, and revocation state.

The migration supports both an existing Phase 1 database and an empty database. It was verified against a copy of the active SQLite database and a separate fresh temporary database. Docker runs `alembic upgrade head` before Uvicorn. Local development must do the same. No migration was run against the active database during implementation or testing.

## 3. PIN security controls

- Exactly six numeric digits are required; validation exists in both React and Pydantic.
- PINs use PBKDF2-HMAC-SHA256 with a random per-record salt and 310,000 iterations.
- Plaintext PINs are never persisted, returned, or logged.
- PIN setup, reset, and disablement require the currently authenticated owning parent plus parent-password re-verification.
- Responses to incorrect PINs are generic and fields are cleared in React.
- Five failed attempts trigger a server-enforced cooldown (default 60 seconds); the API returns HTTP 429 and `Retry-After`.
- Reset and disablement increment the credential version and revoke all open handoffs and active learner sessions.
- Disablement also removes the PIN hash and prevents new handoffs.

## 4. Session lifecycle

1. Parent authenticates normally and selects an owned learner.
2. `POST /students/{id}/learner-handoff` creates a random 48-byte URL-safe secret with a default 180-second lifetime.
3. React clears the parent token immediately after receiving the challenge.
4. `POST /auth/learner/redeem` validates challenge digest, learner binding, expiry, revocation/use state, cooldown, and PIN.
5. A conditional database update consumes the challenge exactly once before creating the session.
6. The learner JWT contains learner audience/type, role, `student_id`, random `jti`, credential version, and expiry. Default lifetime is 30 minutes.
7. Every authenticated request checks token signature, algorithm, expiry, audience/type, linked user/student, credential version, session row, and revocation state.
8. Learner logout revokes the session row before the browser clears its memory-only token.

No refresh token or general persistent browser session was added. A refresh intentionally loses the memory-only token and requires a new parent authorization.

## 5. API contracts

| Method and endpoint | Authorization | Purpose |
| --- | --- | --- |
| `GET /students/{id}/learner-access` | Owning parent | Return boolean PIN/access state; never return credential data |
| `POST /students/{id}/learner-pin` | Owning parent + parent password | Create or reset the learner PIN and revoke prior learner access |
| `POST /students/{id}/learner-pin/disable` | Owning parent + parent password | Disable learner access and revoke sessions/handoffs |
| `POST /students/{id}/learner-handoff` | Owning parent | Issue a short-lived single-use challenge for a configured learner |
| `POST /auth/learner/redeem` | Challenge + learner PIN | Atomically consume the challenge and issue a learner session |
| `GET /auth/learner/me` | Active learner session | Return the verified learner user and linked student profile |
| `POST /auth/learner/logout` | Active learner session | Revoke the current server-side learner session |

The existing `/auth/login` learner username/password path now also creates a revocable learner session and rejects disabled learner identities. Parent/admin tokens retain their existing account-token audience and cannot use learner-only endpoints.

## 6. React component changes

- `ManageLearnerPinDialog` provides parent-reverified PIN setup/reset and disablement without browser persistence.
- `ParentSelectLearnerPage` requests the handoff, handles unconfigured access, and removes the parent session before PIN entry.
- `LearnerPinPage` now uses the backend challenge/PIN flow with loading, invalid PIN, expired challenge, and cooldown states; repeat submission is disabled.
- `AuthContext` can replace a parent identity with a verified learner identity and performs server-backed learner logout.
- `LearnerRoute` protects `/learner/dashboard` from anonymous and parent identities.
- `AuthenticatedLearnerDashboardPage` loads `/auth/learner/me`, shows the verified learner name/grade, labels existing dashboard cards as preview content, and exposes learner logout.
- The shared header uses the authenticated learner name and no longer displays a fabricated grade for learner sessions.

Existing fonts, illustrations, cards, navigation shell, colors, and responsive behavior were preserved.

## 7. Role and ownership enforcement

- All PIN-management and handoff queries include the authenticated parent's ID; cross-parent probes receive 404.
- Parent ownership is never accepted from request payloads.
- Learner tokens contain and are checked against the linked `student_id` and server-side session row.
- Learners retain existing `ensure_student_access` scoping and cannot create/manage learners or use parent-only endpoints.
- Parent tokens receive 403 from learner-only identity/logout APIs.
- Direct `/learner/dashboard` navigation requires an authenticated learner role.
- Starting handoff removes the parent bearer token from the browser, so it cannot be reused from the child-facing context.
- Starting another handoff revokes the parent's earlier unused handoffs, requiring renewed authorization when switching learners.

## 8. Test evidence

Phase 1C baseline before changes: backend 14 passed; React unit 8 passed; TypeScript/build passed; Playwright 112 passed and 2 intentional skips. Phase 1B was already committed as `98a1768` and the working tree was clean.

| Gate | Final result | Assessment |
| --- | --- | --- |
| Backend pytest | **19 passed**, 3 existing deprecation warnings | PASS |
| React unit | **9 passed** | PASS |
| TypeScript | **PASS** | PASS |
| Vite production build | **PASS**, 181 modules | PASS |
| Playwright desktop/mobile | **126 passed, 2 intentional skips** | PASS |
| Focused Phase 1C Playwright | **14 passed** across desktop/mobile | PASS |
| Final visual capture | **2 passed** (Chromium and Pixel 5) | PASS |
| npm audit | **0 critical, 0 high, 2 moderate** | Unchanged React Router advisories; breaking v7 upgrade deferred |
| Alembic existing-copy migration | **PASS** | Active database not touched |
| Alembic fresh migration | **PASS** | Empty deployment path verified |
| Docker development images | **PASS** | API, React, legacy Streamlit |
| Docker production-style images | **PASS** | API and React/Nginx |

Security tests cover PIN hashing/non-disclosure, password re-verification, ownership, correct/incorrect PIN, expired/reused challenges, threshold/cooldown, learner token scoping, parent/learner role rejection, sibling isolation, logout revocation, reset revocation, and disablement. Browser tests cover the complete parent-to-learner handoff, generic invalid feedback, cooldown, expiry, protected routing, logout, parent-token removal, renewed authorization, cross-parent denial, and desktop/mobile layouts.

The first uncached Docker dependency attempt exposed an optional Uvicorn/PyYAML resolver issue and a later transient registry lookup failure. Alembic was isolated to `requirements-migrations.txt`, leaving the validated application/legacy dependency layer unchanged; all final Docker targets then built successfully.

## 9. Known limitations

- The in-process/API deployment assumes a shared relational database for revocation checks; horizontal scaling is supported at the database level but has not been load-tested.
- Cooldown is learner-account scoped. Distributed edge-level IP/device throttling and abuse telemetry remain deployment work.
- There is no parent self-service PIN recovery beyond authenticated reset/disable.
- No refresh tokens exist; this is intentional for Phase 1C.
- Existing learning cards remain demo/preview content and are not yet persisted to the verified learner.
- Legacy username/password learner accounts remain supported for compatibility but should be product-reviewed before production.
- The two moderate React Router advisories remain pending a separately tested major-version upgrade.
- Production still needs centralized secret management, HTTPS enforcement, security event monitoring, backup rehearsal, and operational alerting.

## 10. Recommendation

**CONDITIONAL GO for Phase 2A CBC Practice integration.** The completion criteria are met: an owning parent can configure a PIN, issue a single-use handoff, remove parent privilege from the child-facing context, and establish a restricted, expiring, revocable learner session.

Conditions for Phase 2A:

- every revision request must derive or verify the authenticated learner's `student_id` server-side;
- learner answers must remain learner-scoped while marking stays parent-only under the existing policy;
- preview metrics must not be presented as persisted progress;
- all Phase 1A–1C security and temporary-database gates must remain mandatory;
- deployment hardening and the moderate dependency advisories must be tracked before production.

This remains **NO GO for production** until those operational controls are completed.
