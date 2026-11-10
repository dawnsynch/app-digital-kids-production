# Phase 2B answer submission, parent marking, and feedback

Date: 10 November 2026  
Decision: **CONDITIONAL GO for Phase 2C discovery and contract design; NO GO for production or analytics implementation**

## 1. Implementation summary

Phase 2B completes the existing CBC assessment lifecycle without adding a second quiz model or replacing the marking engine. An authenticated learner can answer, review, and atomically submit an assessment. The server stores one ordered, immutable final-answer snapshot. The owning parent can list the submission, inspect it read-only, invoke the existing mock/OpenAI marking service, explicitly confirm review, and release the result. Only then can the linked learner retrieve feedback.

The clean Phase 2A baseline is commit `d88f2d7 phase 2A complete`. The source repositories were not modified. Phase 2B remains an uncommitted reviewable working-tree change. No paid OpenAI call was made.

## 2. Reused and extended components

- Reused `AssessmentAttempt`, its question/answer/result JSON, the existing OpenAI service, ownership helpers, learner sessions, parent authentication, and CBC question player.
- Extended `AssessmentAttempt` with submission/marking request IDs, versions, lifecycle timestamps, safe failure text, and reviewer/releaser IDs.
- Added only an append-only `AssessmentAuditEvent`; no duplicate assessment, answer, or marking model was introduced.
- Replaced the unsafe legacy learner answer-save behavior with the final submission contract. The legacy parent `/revision/submit` route remains protected and delegates to the new immutable workflow after submission.

## 3. Lifecycle and enforced transitions

```text
ready -> submitted -> marking -> needs_review -> marked -> released
                         |
                         +-> marking_failed -> marking (new request ID)
```

`in_progress` is intentionally not persisted: pre-submission drafts remain browser-memory-only. Every transition is checked on the backend. Invalid transitions return `409`. A completed marking is never overwritten, and release requires a valid result plus an explicit recorded parent review.

## 4. Submission locking and idempotency

- Learner identity and student ownership come only from the active learner session.
- Submitted IDs must be unique members of the assessment question set; unknown or duplicate IDs return `422`.
- Answers are limited to 2,000 characters and extra request fields are forbidden.
- Missing questions are normalized into the ordered snapshot with an empty answer, so partial submission is explicit and auditable.
- A conditional `ready -> submitted` database update is the atomic submission lock.
- The unique submission request ID prevents replay across assessments.
- Identical repeated content returns the original receipt, including when a client has lost its first response. Altered content after submission returns `409`.
- React sends no scores, answer keys, status, learner ID, or marking instructions.

## 5. API contracts

| Endpoint | Authorization | Result |
| --- | --- | --- |
| `POST /revision/learner/{id}/submit` | owning active learner | Immutable snapshot and submission receipt |
| `GET /revision/learner/{id}/submission` | owning active learner | Submission receipt/status |
| `GET /revision/learner/assessments` | active learner | Safe recent assessment list |
| `GET /revision/learner/{id}/feedback` | owning active learner; released only | Released score, per-question feedback, strengths and recommendations |
| `GET /revision/parent/assessments` | parent | Owned submissions; optional learner and status filters |
| `GET /revision/parent/assessments/{id}` | owning parent | Questions, immutable answers, parent-only guides/result, and audit history |
| `POST /revision/parent/assessments/{id}/mark` | owning parent | Starts one idempotent marking attempt |
| `POST /revision/parent/assessments/{id}/review` | owning parent | Records explicit review and reviewer |
| `POST /revision/parent/assessments/{id}/release` | owning parent | Releases only a reviewed valid result |

Cross-parent detail/action probes return the same `404` as a missing record. Role violations return `403`; missing/expired/revoked credentials return `401`; lifecycle conflicts return `409`; malformed payloads return `422`.

## 6. Parent marking and release

Marking reads the stored question and answer snapshots; the browser cannot supply either at marking time. A unique request ID, committed `marking` state, per-parent hourly limit (default 50), existing provider timeout/retry settings, and completed-result short circuit prevent accidental duplicate charges. Failed output moves to `marking_failed` with safe copy and can be retried only with a new request ID.

The structured result must contain exactly the original question IDs, question text, expected answers, submitted learner answers, per-question available marks, internally consistent totals, and a consistent percentage. Any mismatch is rejected before persistence. The parent UI labels the output as AI-assisted, exposes individual feedback and the marking guide, and requires separate review and release actions.

Parent correction is not implemented. Supporting corrections safely requires an immutable original result, correction version, reason, reviewer, and timestamp; silently editing the AI result would violate this phase's audit requirement.

## 7. Audit events

The append-only audit trail records `assessment_created`, `answers_submitted`, `marking_requested`, `marking_completed` or `marking_failed`, `marking_reviewed`, and `results_released`. Each event includes assessment ID, actor user ID/role, timestamp, old/new status, and relevant version. Submission metadata contains only the unanswered count. PINs, JWTs, provider secrets, prompts, and unnecessary learner personal data are not recorded.

## 8. Database migration

Alembic revision `20261110_03` adds the lifecycle columns, unique request indexes, and `assessment_audit_events`. It was validated to head on:

- a disposable copy of the active database: 29 users, 13 students, and 16 assessments preserved;
- a fresh disposable SQLite database;
- a second `upgrade head` is a no-op by Alembic revision tracking.

SQLite cannot add foreign-key constraints with plain `ALTER TABLE`. Therefore the two nullable reviewer/releaser actor columns are added as SQLite-safe integers; PostgreSQL receives explicit foreign keys. Audit-event actor and assessment references retain database foreign keys on SQLite. PostgreSQL migration remains a separate milestone.

The primary active database was not migrated or reset and retained SHA-256 `496560a31490ef473135b57d55fa6f9be2ae013d6092aae9d9a4ac6bffc22e8c`. Verification deviation: opening the active SQLite file for a row-count check caused SQLite to clean up its empty WAL and SHM runtime sidecars. The WAL was empty before cleanup; the primary database hash and data were unchanged. Exact sidecar-file preservation therefore cannot be claimed for this run.

## 9. React changes

- The question player adds completion dots, retained drafts, answer review, unanswered warning, confirmation, retry-safe submission, receipt, and a read-only submitted view.
- `PracticeProvider` owns a stable submission idempotency key and full ordered snapshot.
- Recent Practice lets a reauthenticated learner reopen a released assessment.
- Parent Assessment Review adds owned list/filter, detail, marking, explicit review, release, and history states.
- The typed API client and TypeScript contracts cover every Phase 2B route.
- Existing branding and layout are retained. Desktop and Pixel 5 screenshots were visually inspected; cards, controls, results, and history remain readable without horizontal overflow.

## 10. Security controls verified

- learner ownership, sibling/cross-learner denial, and immutable answers;
- parent-only marking/review/release and cross-parent concealment;
- no marking before submission and no release before valid review;
- no learner feedback before release;
- revoked/expired session enforcement inherited from Phase 1C;
- request replay cannot change answers or create a second valid marking result;
- answer keys remain absent from learner assessment responses before release;
- standard tests force deterministic mock AI and expose no OpenAI credential to React.

The existing codebase has no active admin workflow for this assessment surface, so no new implicit admin override was introduced.

## 11. Verification evidence

| Check | Final result |
| --- | --- |
| Phase 2A baseline | commit `d88f2d7`; backend 23, React 12, full Playwright 132 passed + 2 skips |
| Backend final | 27 passed; 3 existing deprecation warnings |
| React unit final | 13 passed |
| TypeScript | PASS |
| Vite production build | PASS; 185 modules |
| Focused Phase 2A + 2B Playwright | 12 passed, desktop and mobile |
| Focused Phase 2B Playwright | 6 passed, desktop and mobile |
| Full Playwright first final attempt | 135 passed, 2 skipped, 3 failed: two obsolete Phase 2A copy assertions and one form-state test race |
| Full Playwright after corrections | 138 passed, 2 intentional mobile skips; 140 total |
| Copied/fresh Alembic upgrade | PASS at `20261110_03`; copied row counts preserved |
| Development Docker images | API + web PASS |
| Production-style Docker images | API + Nginx web PASS |
| npm audit | 0 critical, 0 high, 2 moderate React Router advisories; major-version fix required |
| Browser tooling | Browser plugin unavailable; repository Playwright used as required fallback |

Pytest still reports the pre-existing Starlette/httpx and FastAPI `on_event` deprecations. Playwright still reports the pre-existing `NO_COLOR`/`FORCE_COLOR` warning. The two moderate router advisories are unchanged and were not force-fixed during feature integration.

## 12. Known limitations

- Drafts remain memory-only until final submission and are lost on refresh/logout.
- Only the current free-text question type is supported.
- Parent corrections are deliberately deferred; review is accept/release only.
- Marking runs in the request process; there is no durable background job/queue for a server crash during a real provider call.
- SQLite remains a single-server MVP datastore.
- Real paid-provider behavior, latency, token cost, and production monitoring were not validated.
- Longitudinal progress, trends, recommendations, and analytics remain preview/unimplemented.

## 13. Phase 2C dependencies and decision

**CONDITIONAL GO for Phase 2C discovery, data definitions, privacy review, and API contract design only. Do not begin analytics implementation yet.** Phase 2B's learner-to-parent-to-learner lifecycle is functionally complete under isolated test and mock AI.

Before writing Progress Tracking or Learner Performance Analytics:

1. define authoritative score, attempt, completion, strand mastery, and retry semantics;
2. define whether released results alone feed analytics and how corrected/withdrawn results would version;
3. establish child-data minimization, retention, parent visibility, export/deletion, and audit requirements;
4. design aggregation that remains correct under SQLite now and PostgreSQL later;
5. decide and implement the parent-correction/versioning contract;
6. resolve or formally accept the two moderate router advisories and the active-sidecar verification deviation;
7. validate real-provider failure recovery and operational monitoring before production.

Production remains **NO GO** pending the wider MVP production gates: secrets/TLS, backups and restore drills, dependency remediation, real-provider controls, observability, and database operations.
