# Phase 1B learner profile integration

Date: 2026-11-09  
Decision: **CONDITIONAL GO for Phase 1C secure learner authentication; NO GO for production or additional learning features**

## 1. Current learner model assessment

The existing SQLAlchemy model already supports multiple learners per parent. `User.students` is a one-to-many relationship through `Student.parent_id`; each `Student` may have one optional learner `User` through `User.student_id`. No duplicate learner model is required.

`AssessmentAttempt.student_id` and `LearningInteraction.student_id` reference the stable student primary key. Profile edits update the existing row and therefore retain assessments and learning interactions. The supported CBC grades remain 5, 6, and 7. The persisted profile fields are `name`, `grade`, and optional `age_group`.

The pre-existing learner username/password account endpoint remains intact, but it is not used by the Phase 1B selection or PIN-preview flow.

## 2. API contracts reused or introduced

| Method | Contract | Authorization and behavior | Phase 1B action |
| --- | --- | --- | --- |
| `GET /students` | none → `StudentOut[]` | Parent receives only rows whose `parent_id` matches the verified token identity; linked learner receives only its own profile; other roles receive 403 | Reused and connected |
| `POST /students` | `StudentCreate` → `StudentOut` | Parent only; `parent_id` is always derived from the verified token | Reused and connected |
| `GET /students/{id}` | path ID → `StudentOut` | Owning parent or linked learner; a parent probing another parent's ID receives 404 | Reused; typed client added |
| `PATCH /students/{id}` | `StudentUpdate` → `StudentOut` | Parent only and ownership-filtered; permits only name, grade, and age group | Introduced because no safe update contract existed |

`StudentCreate` and `StudentUpdate` normalize whitespace, require a two-to-120-character learner name, limit grades to 5–7, and limit `age_group` to 50 characters. An empty PATCH body is rejected. The update schema has no ownership field, and no delete endpoint was added.

Administration retains its explicit route: admins use `GET /admin/students`. Admins are not silently treated as parents by `/students`.

## 3. Database changes

No schema, migration, seed, or data rewrite was needed. Existing IDs and foreign keys are unchanged. SQLite remains the Phase 1 database; PostgreSQL remains the separate milestone described in `docs/postgresql-migration-milestone.md`.

All automated tests used temporary SQLite databases. The active database was not opened by the test services. Its SHA-256 remained `496560a31490ef473135b57d55fa6f9be2ae013d6092aae9d9a4ac6bffc22e8c`; the empty WAL remained `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.

## 4. React pages and components modified

- `ParentSelectLearnerPage` now loads real profiles and supplies loading, empty, list, retry, create, view, edit, validation, success, and failure states.
- `LearnerProfileDialog` provides accessible create, detail, and edit dialogs while preserving the existing visual language.
- `LearnerPinPage` shows the selected real learner when selection is valid, labels the screen as preview-only, and creates neither a token nor learner session.
- `ApiClient` and the TypeScript contracts now expose typed list/create/detail/update learner operations.
- Existing branding, assets, typography, card styling, navigation, and responsive behavior are retained. Authenticated learner selection no longer uses `DEMO_LEARNERS`.

The parent dashboard action remains honestly labeled as outside Phase 1B. No new learning module was introduced.

## 5. Learner selection context design

`LearnerSelectionProvider` owns the authorized learner collection, load status, error state, and selected learner ID. Selection succeeds only when the requested numeric ID exists in the currently loaded collection. A refresh clears a selection that is no longer returned by the API.

`LearnerSessionBoundary` is keyed by authenticated user ID and role. Logout or an identity change remounts the provider and clears the learner collection and selection. State is memory-only: no learner selection, credential, profile, or token is written to `localStorage` or `sessionStorage`.

This context is reusable by later Practice and Progress integration, but it is presentation state—not an authorization or authentication boundary. Every backend operation independently enforces ownership.

## 6. Ownership and security controls

- Parent identity comes only from the verified bearer token; client ownership input is never accepted.
- Parent list, detail, and update queries include `Student.parent_id == current_user.id`.
- Cross-parent detail and update probes return 404, reducing learner-ID enumeration.
- Create and update require the parent role. Learner-role management attempts are denied; linked learners retain their existing scoped read behavior.
- Admin behavior is explicit through `/admin/students`; `/students` returns 403 to admins.
- Responses use explicit Pydantic models and do not expose password hashes or learner credentials.
- Updates cannot change `id`, `parent_id`, `created_at`, or linked account ownership.
- Authentication failures clear the Phase 1A in-memory parent session. No token was moved into browser storage.
- No hard deletion, PIN persistence, PIN verification endpoint, or learner token issuance was added.

## 7. Test and validation results

Phase 1A baseline was verified before implementation and committed as `430312d chore: establish consolidated Phase 1A baseline`. Repository A was clean; Repository B had no Git metadata available, so no history was invented. Secret/ignore review confirmed that `.env`, SQLite/WAL/SHM files, Docker data, dependency folders, build output, and test artifacts were excluded.

| Gate | Phase 1A baseline | Phase 1B result | Assessment |
| --- | ---: | ---: | --- |
| Backend pytest | 11 passed | **14 passed**, 3 deprecation warnings | PASS; 3 learner-profile tests added |
| React unit tests | 5 passed | **8 passed** | PASS; context lifecycle/error tests added |
| TypeScript | PASS | **PASS** | No regression |
| Production build | PASS | **PASS**, 180 modules | No regression |
| Playwright desktop/mobile | 94 passed, 2 skipped | **112 passed, 2 intentional skips** | PASS; 18 Phase 1B scenarios added |
| Focused visual capture | n/a | **2 passed** (Chromium and Pixel 5) | PASS; no clipping or horizontal-overflow defect observed |
| npm audit | 0 critical, 0 high, 2 moderate | **0 critical, 0 high, 2 moderate** | Unchanged; React Router v7 remediation is breaking and deferred |
| Docker | PASS | **PASS** | API, React dev, legacy Streamlit, and production React/Nginx images built |

Backend tests cover own create/list/detail/update, invalid fields and grades, learner/admin policy, cross-parent concealment, and assessment-link preservation. React tests cover loading, empty, create, edit, authorized selection, failure/retry, and logout/identity clearing. Playwright covers registration and login paths, existing data, profile changes, cross-parent denial, selection navigation, auth expiry, retry, logout, responsive layouts, and the Phase 1A refresh policy.

The three backend warnings are pre-existing framework deprecations (`on_event`/TestClient compatibility), not Phase 1B failures. The two Playwright skips are the pre-existing intentional skips.

## 8. Known limitations

- `age_group` remains free text because changing the persisted contract was not required.
- Learner avatars are presentation assets selected by card order, not stored profile data.
- There is no delete/archive workflow.
- Selected learner state intentionally disappears on full refresh because Phase 1A authentication is memory-only.
- The seven learning screens are not yet bound to this selection context; that is later integration work.
- The existing learner username/password account contract remains separate and is not surfaced by this UI.
- The two moderate React Router advisories remain until a planned, tested major-version upgrade.
- Production readiness still requires secret management, hardened deployment configuration, observability, rate limiting, and an agreed learner-authentication threat model.

## 9. Phase 1C learner PIN design recommendation

Treat Phase 1C as a security feature, not as an extension of the preview keypad. Recommended design:

1. A parent creates, rotates, or revokes a learner credential through a parent-authenticated backend endpoint.
2. The backend generates or accepts a policy-compliant PIN, stores only a slow salted hash, and returns plaintext only in a tightly controlled one-time setup response.
3. Learner sign-in uses a dedicated endpoint bound to a learner account/student, with generic failure messages, per-account and per-origin rate limits, progressive delays or lockout, and auditable attempts.
4. Successful verification returns a short-lived learner-role access token scoped to the linked `student_id`; it must be revocable and must never grant parent operations.
5. Recovery requires a currently authenticated parent. PIN rotation revokes prior learner sessions.
6. Add CSRF/cookie analysis if transport moves away from bearer tokens, secret/key rotation, security event logging without PIN values, abuse monitoring, and a formal threat-model review.
7. Keep all authorization checks server-side and add tests for guessing, replay, enumeration, inactive accounts, revocation, rotation, expiry, and cross-family access.

No part of that design is implemented in Phase 1B. The current `1234` interaction is demonstrative UI only and cannot grant protected access.

## 10. Recommendation

**CONDITIONAL GO for Phase 1C secure learner authentication design and implementation.** Phase 1B completion criteria are met: an authenticated parent can create, list, view, update, and select only their own learners, and the role/ownership boundaries are verified at backend and browser levels.

Conditions before Phase 1C implementation:

- approve the learner-authentication threat model and recovery/lockout policy;
- define learner-token lifetime, storage, revocation, and parent session interaction;
- add production-grade rate limiting and audit-event requirements;
- retain temporary-database isolation and all Phase 1A/1B regression gates.

This is still **NO GO for production deployment or new learning-feature development**. Phase 1C must not treat the current selection context or preview PIN as authentication.
