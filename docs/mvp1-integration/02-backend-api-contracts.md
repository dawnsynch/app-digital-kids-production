# Backend API contracts

Evidence sources: FastAPI's generated `app.openapi()` document, `backend/app/schemas.py`, route dependencies, and ownership helpers in `backend/app/access.py`. `HTTPBearer` in OpenAPI means a bearer token is required; role and ownership constraints are enforced by Python dependencies and therefore require source inspection in addition to OpenAPI.

Status: **Client** means a typed method exists in `frontend/src/api/client.ts`; **Preview** means a React screen exists but still uses demo/static data; **Missing** means the client method or UI integration does not yet exist.

## Health and authentication

| Method and endpoint | Request → response | Role / ownership | React surface | Status | Required changes | Test coverage |
| --- | --- | --- | --- | --- | --- | --- |
| `GET /health` | none → operational health object | Public | Deployment/diagnostic use | Client | Add explicit backend response model so OpenAPI describes diagnostics | Full contract test |
| `POST /auth/register-parent` | `ParentRegisterRequest` → `TokenResponse` | Public | `/parent/register` | **Integrated** | Phone/consent persistence still requires a separately approved contract | Success, duplicate email, validation, hash non-disclosure |
| `POST /auth/login` | `LoginRequest` → `TokenResponse` | Public; learner login creates a revocable learner session | `/parent/sign-in`; legacy learner username login | **Integrated** | Review legacy learner password UX before production | Valid/invalid login, role separation, revocable learner session |
| `GET /auth/me` | none → `UserOut` | Any authenticated active user | Auth bootstrap/role routing | **Integrated** | No Phase 1A contract change required | Valid, missing, invalid, tampered, expired, inactive, all roles, hash exclusion |
| `POST /auth/learner/redeem` | `LearnerRedeemRequest` → `TokenResponse` | Single-use challenge plus PIN | `/learner/pin` | **Integrated in Phase 1C** | None for Phase 1C | Correct/incorrect PIN, expiry, reuse, cooldown |
| `GET /auth/learner/me` | none → `LearnerIdentityOut` | Active, unrevoked learner session only | `/learner/dashboard` | **Integrated in Phase 1C** | Reuse for Phase 2A identity | Parent denial, learner identity/scoping |
| `POST /auth/learner/logout` | none → 204 | Active learner session only | Learner dashboard | **Integrated in Phase 1C** | None | Server-side revocation verified |

## Learner profiles

| Method and endpoint | Request → response | Role / ownership | React surface | Status | Required changes | Test coverage |
| --- | --- | --- | --- | --- | --- | --- |
| `GET /students` | none → `StudentOut[]` | Parent sees own children; learner sees only linked student; admin denied | `/parent/select-learner`, future Profile | **Integrated** | Reuse selection context for Practice/Progress later | Own list, linked learner, and admin policy tested |
| `POST /students` | `StudentCreate` → `StudentOut` | Parent only; new row assigned to current parent | `/parent/select-learner` | **Integrated** | No Phase 1B contract change required | Parent success, validation, learner denial tested |
| `GET /students/{student_id}` | path ID → `StudentOut` | Owning parent or linked learner; cross-parent probe returns 404 | Learner details and selection context | **Integrated** | No Phase 1B contract change required | Own learner and cross-parent concealment tested |
| `PATCH /students/{student_id}` | `StudentUpdate` → `StudentOut` | Parent only; ownership-filtered; no ownership field accepted | Learner edit dialog | **Integrated (Phase 1B)** | Retain stable IDs and linked records | Own update, validation, role denial, cross-parent concealment, assessment link tested |
| `POST /students/{student_id}/learner-account` | `LearnerAccountCreate` → `UserOut` | Parent only and must own student | Parent learner management | Client; no active form | Define username/password UX; do not substitute the four-digit PIN | Owner and cross-parent denial tested |
| `GET /students/{student_id}/learner-access` | none → `LearnerAccessStatus` | Owning parent | Learner PIN management | **Integrated in Phase 1C** | None | Ownership and state tested |
| `POST /students/{student_id}/learner-pin` | PIN + parent password → `LearnerAccessStatus` | Owning parent with password re-verification | Manage PIN dialog | **Integrated in Phase 1C** | None | Hashing, validation, reset revocation, cross-parent denial |
| `POST /students/{student_id}/learner-pin/disable` | parent password → `LearnerAccessStatus` | Owning parent with password re-verification | Manage PIN dialog | **Integrated in Phase 1C** | None | Disablement and session revocation tested |
| `POST /students/{student_id}/learner-handoff` | none → `LearnerHandoffOut` | Owning parent; configured learner only | Learner selection | **Integrated in Phase 1C** | None | Binding, replacement, missing PIN, ownership tested |

## CBC revision, answers, and marking

Phase 2A established learner-safe generation. Phase 2B adds immutable submission and a parent-controlled marking/release lifecycle:

| Endpoint | Request → response | Authorization | React consumer | Status |
|---|---|---|---|---|
| `GET /revision/learner/options` | none → `LearnerPracticeOptions` | Active learner only | `/learner/practice`, Subjects, Mathematics | **Integrated Phase 2A** |
| `POST /revision/learner/generate` | `LearnerPracticeGenerateRequest` → `LearnerPracticeAssessment` | Active learner; identity/grade server-derived | Practice setup | **Integrated Phase 2A** |
| `GET /revision/learner/{assessment_id}` | path ID → `LearnerPracticeAssessment` | Owning active learner | Question player/direct resume | **Integrated Phase 2A** |
| `POST /revision/learner/{assessment_id}/submit` | request ID + answer list → `LearnerAssessmentSubmissionReceipt` | Owning active learner | Final answer review/submission | **Integrated Phase 2B** |
| `GET /revision/learner/{assessment_id}/submission` | path ID → submission receipt | Owning active learner | Receipt/resume | **Integrated Phase 2B** |
| `GET /revision/learner/assessments` | none → safe recent assessment list | Active learner; own student only | Recent Practice | **Integrated Phase 2B** |
| `GET /revision/learner/{assessment_id}/feedback` | path ID → released result | Owning active learner; released only | Released feedback | **Integrated Phase 2B** |
| `GET /revision/parent/assessments` | optional learner/status filters → owned list | Parent only | Parent assessment workspace | **Integrated Phase 2B** |
| `GET /revision/parent/assessments/{assessment_id}` | path ID → answers/result/audit detail | Owning parent; cross-family concealed | Parent review | **Integrated Phase 2B** |
| `POST /revision/parent/assessments/{assessment_id}/mark` | request ID → detail/result | Owning parent; submitted/failed only | AI marking action | **Integrated Phase 2B** |
| `POST /revision/parent/assessments/{assessment_id}/review` | request ID → status | Owning parent; valid result only | Explicit parent review | **Integrated Phase 2B** |
| `POST /revision/parent/assessments/{assessment_id}/release` | request ID → status | Owning parent; reviewed result only | Explicit release | **Integrated Phase 2B** |

The generic generate/detail routes remain parent-only because their internal model includes marking material. The legacy `POST /revision/submit` remains parent-only and can mark only the immutable submitted snapshot. The old `/revision/answers` learner-save behavior now returns `409` and directs clients to the idempotent final submission endpoint.

| Method and endpoint | Request → response | Role / ownership | React surface | Status | Required changes | Test coverage |
| --- | --- | --- | --- | --- | --- | --- |
| `GET /revision/options` | none → untyped grades/terms/subjects/difficulty object | Any authenticated user | `/practice`, `/subjects` | Client + Preview | Add backend response schema and load setup options | Authentication exercised indirectly |
| `POST /revision/generate` | `RevisionGenerateRequest` → `RevisionGenerateResponse` | Owning parent or linked learner for `student_id` | `/practice` | Client + Preview | Bind selected learner and retain returned assessment ID | Parent generation tested |
| `POST /revision/answers` | legacy request → `409` migration response | Authenticated legacy callers | None | Deprecated in Phase 2B | Use learner final submission; no mutable post-submission save | Regression test verifies rejection |
| `GET /revision/{assessment_id}` | path ID → internal assessment detail | Owning parent only | Legacy parent flow | Preserved | New React parent review uses its explicit typed detail contract | Cross-parent denial tested |
| `POST /revision/submit` | existing request → `RevisionSubmitResponse` | Parent only; immutable answers must already be submitted and exactly match | Legacy parent marking | Preserved/protected | Prefer idempotent parent assessment marking endpoint | Learner denial, immutable snapshot, parent success tested |

## Learning content

| Method and endpoint | Request → response | Role / ownership | React surface | Status | Required changes | Test coverage |
| --- | --- | --- | --- | --- | --- | --- |
| `POST /learning/coding` | `CodingLessonRequest` → `CodingLessonResponse` | Authenticated; learner may request only own grade; parent grade is not ownership-bound | `/coding-technology` | Client + Preview | Connect selected topic and track resulting interaction; consider binding parent request to child in later contract | Learner allowed/blocked grade tested |
| `POST /learning/spiritual` | `SpiritualLessonRequest` → `SpiritualLessonResponse` | Same grade rule as coding | `/bible-learning` | Client + Preview | Connect selected theme and track interaction | Learner allowed grade tested |
| `POST /hobbies/activity` | `HobbyActivityRequest` → `HobbyActivityResponse` | Authenticated and must own/link payload student | No current core route | Client missing | Keep out of Phase 1 UI until an approved existing screen is mapped | No Phase 0B regression test |

## Learning interactions and progress

| Method and endpoint | Request → response | Role / ownership | React surface | Status | Required changes | Test coverage |
| --- | --- | --- | --- | --- | --- | --- |
| `POST /learning-interactions` | `LearningInteractionCreate` → `LearningInteractionOut` | Authenticated and must own/link student | Coding, Bible, future activities | Client missing | Add typed methods; record only after content generation succeeds | Ownership helper covered indirectly |
| `GET /learning-interactions/me` | none → `LearningInteractionOut[]` | Learner gets linked student's interactions; parent gets interactions created by that parent | Dashboard/history | Client missing | Confirm parent semantics are desired before use | Not directly covered |
| `GET /learning-interactions/student/{student_id}` | path ID → `LearningInteractionOut[]` | Owning parent or linked learner | Progress/history | Client missing | Add typed method and empty state | Not directly covered |
| `PATCH /learning-interactions/{interaction_id}` | `LearningInteractionUpdate` → `LearningInteractionOut` | Owning parent or linked learner | Completion/review actions | Client missing | Define field-level permissions: current code lets either owner role update response, status, and assignment | Not directly covered |
| `GET /progress/student/{student_id}` | none → `ProgressSummary` | Owning parent or linked learner | `/`, `/progress`, learner profile | Client + Preview | Replace static attempts/progress where fields map directly | Cross-parent denial tested |
| `GET /progress/summary` | none → untyped parent aggregate | Parent only; query filters all attempts/interactions to parent's children | Parent dashboard designs | Client missing | Add response model/client method before UI wiring | Learner denial tested |

## Administration

All routes below use `require_admin`. There is no React admin route in the current `App.tsx`, although design references exist.

| Method and endpoint | Request → response | Filters | Status | Required changes | Test coverage |
| --- | --- | --- | --- | --- | --- |
| `GET /admin/parents` | none → `UserOut[]` | none | Missing | Add admin auth/bootstrap and client only in administration phase | Parent denial tested |
| `GET /admin/learners` | none → `UserOut[]` | `parent_id` | Missing | Add typed query/response | Role denial only |
| `GET /admin/students` | untyped array | `parent_id`, `learner_id`, `grade` | Missing | Introduce response schema before client generation | Role denial only |
| `GET /admin/assessments` | untyped array | parent, learner, grade, subject, date range | Missing | Introduce response schema | Role denial only |
| `GET /admin/interactions` | untyped array | parent, learner, grade, module, date range | Missing | Introduce response schema | Role denial only |
| `GET /admin/progress` | untyped array | parent, learner, grade | Missing | Introduce response schema | Role denial only |
| `GET /admin/summary` | untyped aggregate | none | Missing | Introduce response schema | Parent denial tested; admin success not tested |

## Contract risks and required preparation

1. Add response models for health, revision options/detail, progress summary aggregate, and custom admin rows before generating frontend types from OpenAPI.
2. Retain Phase 1C learner token audience/type, session revocation, and parent-to-learner credential isolation in every future learner route.
3. Define field-level permissions for interaction updates rather than relying only on student ownership.
4. Add positive admin tests with an isolated seeded admin account before implementing the admin UI.
5. Add hobbies and learning-interaction regression tests before those methods are wired.
6. Keep backend 401/403 checks as mandatory integration tests; client-side route guards are not authorization controls.

