# MVP 1 functional screen matrix

Status meanings: **Available** = matching backend capability exists; **Partial** = some data/actions exist; **Gap** = no matching API; **Preview** = React intentionally uses static/demo behavior. None of the gaps below were filled during consolidation.

## Seven learning screens

| React screen / route | Preserved UI behavior | Existing backend capability | Integration status | Required validation before GO |
| --- | --- | --- | --- | --- |
| Learning dashboard `/` | Streak, current learning, practice, chart, achievements | `/progress/student/{id}`, `/progress/summary`, interaction history | Partial / Preview | Map real attempts/interactions to supported cards; label unsupported streak/star metrics |
| Learn `/learn` | Learning paths and recommendations | Coding and spiritual lesson generation; interaction records | Partial / Preview | Define which current cards map to existing modules without adding a catalog service |
| Practice `/practice` | Grade/term/subject/strand/difficulty/count setup | `/revision/options`, `/revision/generate`, `/revision/answers`, parent-only `/revision/submit` | Available / Preview | Wire full learner-save-parent-mark flow and role/error states |
| Choose Subjects `/subjects` | Eight CBC subject cards and filters | CBC subjects returned by `/revision/options` | Partial / Preview | Reconcile UI term/lesson counts with API data; do not fabricate progress |
| Mathematics `/subjects/mathematics` | Strands, progress, recommendation | Generic Mathematics revision generation and progress | Partial / Preview | Map strand selection to revision topic; use actual assessment progress |
| Coding & Technology `/coding-technology` | Skills, continue card, challenge, progress | `/learning/coding`, learning interactions, progress | Available / Preview | Connect lesson generation and tracking; no code sandbox exists |
| Bible Learning `/bible-learning` | Skills, verse, lessons, practice, progress | `/learning/spiritual`, learning interactions, progress | Available / Preview | Connect spiritual lesson generation and tracking; decide static verse ownership |

## Account and supporting screens

| Screen / route | Backend match | Current status / gap |
| --- | --- | --- |
| Parent registration `/parent/register` | `POST /auth/register-parent` | Backend available; React remains explicit preview. Phone/consent fields are not backend fields. |
| Parent sign-in `/parent/sign-in` | `POST /auth/login`, `GET /auth/me` | Backend available; React still uses fake demo credentials. |
| Learner selection `/parent/select-learner` | `GET/POST /students`, `GET/PATCH /students/{id}` | **Integrated in Phase 1B** with real parent-owned data, create/view/edit, loading/empty/error/retry states, and memory-only authorized selection. |
| Learner PIN `/learner/pin` | PIN setup, single-use handoff, redeem, learner identity, logout, and revocation endpoints | **Integrated in Phase 1C**; six-digit PIN is server-verified and browser-memory-only. Direct access without handoff is rejected. |
| Verified learner dashboard `/learner/dashboard` | `GET /auth/learner/me`, revocable learner JWT/session | **Integrated in Phase 1C**; name and grade are real, while learning cards remain explicitly preview content pending Phase 2A. |
| Progress `/progress` | learner progress and parent summary endpoints | Partial; React is static. |
| Achievements `/achievements` | No achievements endpoint | Gap. |
| Profile `/profile` | `GET /auth/me`, `GET /students/{id}`; no update endpoint | Read-only partial. |
| Settings `/settings` | No settings endpoint | Gap. |
| Help `/help` | No help endpoint | Gap. |

## Backend-only MVP capabilities retained

- Parent-owned child creation and learner account creation.
- Parent/learner authentication and role enforcement.
- CBC revision generation, answer saving, parent marking, and progress.
- Coding, spiritual, and hobbies/creativity content generation.
- Learning interaction tracking.
- Admin reporting routes.
- Mock AI fallback and OpenAI mode.

