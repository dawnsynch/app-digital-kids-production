# MVP 1 functional screen matrix

Status meanings: **Available** = matching backend capability exists; **Integrated** = React and FastAPI are connected and verified; **Partial** = some data/actions exist; **Gap** = no matching API; **Preview** = React intentionally uses static/demo behavior.

## Seven learning screens

| React screen / route | Preserved UI behavior | Existing backend capability | Integration status | Required validation before GO |
| --- | --- | --- | --- | --- |
| Learning dashboard `/` | Streak, current learning, practice, chart, achievements | `/progress/student/{id}`, `/progress/summary`, interaction history | Partial / Preview | Map real attempts/interactions to supported cards; label unsupported streak/star metrics |
| Learn `/learn` | Learning paths and recommendations | Coding and spiritual lesson generation; interaction records | Partial / Preview | Define which current cards map to existing modules without adding a catalog service |
| Practice `/learner/practice` | Verified setup plus recent submitted/released assessments | learner options, generation, and recent-assessment APIs | **Integrated through Phase 2B** | Progress analytics remain out of scope |
| Practice player `/learner/practice/:assessmentId` | Draft navigation, completion indicators, review, final submission, receipt, read-only state, released feedback | learner assessment, idempotent submit/status, and released-feedback APIs | **Integrated through Phase 2B** | Drafts remain memory-only until final submission; free text only |
| Choose Subjects `/learner/subjects` | Existing CBC cards route supported subjects to learner Practice | Learner practice options contract | **Integrated in Phase 2A** | Static progress/lesson counts remain clearly non-authoritative preview data |
| Mathematics `/learner/subjects/mathematics` | Existing strand cards and recommendation preselect Mathematics/strand | Learner practice options/generation | **Integrated in Phase 2A** | Static progress remains preview; generation and ownership are real |
| Coding & Technology `/coding-technology` | Skills, continue card, challenge, progress | `/learning/coding`, learning interactions, progress | Available / Preview | Connect lesson generation and tracking; no code sandbox exists |
| Bible Learning `/bible-learning` | Skills, verse, lessons, practice, progress | `/learning/spiritual`, learning interactions, progress | Available / Preview | Connect spiritual lesson generation and tracking; decide static verse ownership |

## Account and supporting screens

| Screen / route | Backend match | Current status / gap |
| --- | --- | --- |
| Parent registration `/parent/register` | `POST /auth/register-parent` | **Integrated in Phase 1A**. Phone/consent fields are UI-only and not persisted backend fields. |
| Parent sign-in `/parent/sign-in` | `POST /auth/login`, `GET /auth/me` | **Integrated in Phase 1A** with real credentials and in-memory bearer session. |
| Learner selection `/parent/select-learner` | `GET/POST /students`, `GET/PATCH /students/{id}` | **Integrated in Phase 1B** with real parent-owned data, create/view/edit, loading/empty/error/retry states, and memory-only authorized selection. |
| Parent assessments `/parent/assessments` | Parent-owned assessment list with learner/status filters | **Integrated in Phase 2B**; shows submitted workflow states only and conceals other families. |
| Parent assessment review `/parent/assessments/:assessmentId` | Immutable answers, parent guide, AI marking, explicit review/release, audit history | **Integrated in Phase 2B**; correction/versioning remains a later contract. |
| Learner PIN `/learner/pin` | PIN setup, single-use handoff, redeem, learner identity, logout, and revocation endpoints | **Integrated in Phase 1C**; six-digit PIN is server-verified and browser-memory-only. Direct access without handoff is rejected. |
| Verified learner dashboard `/learner/dashboard` | `GET /auth/learner/me`, revocable learner JWT/session | **Integrated in Phase 1C**; identity is real, while unrelated learning metrics remain preview content. |
| Progress `/progress` | learner progress and parent summary endpoints | Partial; React is static. |
| Achievements `/achievements` | No achievements endpoint | Gap. |
| Profile `/profile` | `GET /auth/me`, `GET /students/{id}`; no update endpoint | Read-only partial. |
| Settings `/settings` | No settings endpoint | Gap. |
| Help `/help` | No help endpoint | Gap. |

## Backend-only MVP capabilities retained

- Parent-owned child creation and learner account creation.
- Parent/learner authentication and role enforcement.
- CBC revision generation, immutable learner submission, parent-controlled marking/review/release, and released learner feedback.
- Coding, spiritual, and hobbies/creativity content generation.
- Learning interaction tracking.
- Admin reporting routes.
- Mock AI fallback and OpenAI mode.

