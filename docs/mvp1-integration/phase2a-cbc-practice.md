# Phase 2A CBC practice integration

Date: 10 November 2026  
Decision: **CONDITIONAL GO for Phase 2B answer submission and parent marking integration; NO GO for production**

## 1. Implementation summary

Phase 2A connects the authenticated learner Practice, Subjects, and Mathematics experience to the existing FastAPI revision engine. A verified learner can select backend-supported CBC options, generate deterministic mock or configured OpenAI questions, open a learner-authorized assessment, move between questions, and retain draft text in browser memory. No React action saves answers, marks work, calculates scores, or writes progress.

The Phase 1C baseline was committed before Phase 2A as `bfcc9f1 feat: add secure learner authentication`. The original repositories were not modified. The active SQLite database was not migrated or opened by the automated tests.

## 2. Existing revision engine assessment

Before Phase 2A:

- `POST /revision/generate` already generated questions through `generate_revision_questions` and persisted one `AssessmentAttempt` after generation.
- mock mode returned deterministic free-text questions with internal expected answers and marking guides;
- OpenAI mode used a strict JSON schema, a configured timeout, and bounded retries;
- `POST /revision/submit` was already parent-only;
- the generic generate and retrieve responses exposed `expected_answer` and `marking_guide` to linked learner tokens;
- generic generation accepted a client `student_id` and did not validate the requested subject against the learner's CBC grade;
- Practice, Subjects, and Mathematics were branded preview screens with static option lists.

Phase 2A retains the internal question and parent-marking model while separating learner presentation from privileged marking data. The generic generate and detail routes are now parent-only. Existing `POST /revision/answers` remains available for backward compatibility but is not called by the Phase 2A React application.

## 3. Final API contracts

All learner routes require an active, unrevoked learner token with the learner audience and derive `student_id` and grade from that identity.

| Route | Contract | Authorization | Notes |
|---|---|---|---|
| `GET /revision/learner/options` | `LearnerPracticeOptions` | learner only | Learner name/grade, terms, grade-supported subjects/strands, difficulty, counts |
| `POST /revision/learner/generate` | `LearnerPracticeGenerateRequest` → `LearnerPracticeAssessment` | learner only | No ownership or grade fields accepted; requires idempotency `request_id` |
| `GET /revision/learner/{assessment_id}` | `LearnerPracticeAssessment` | owning learner only | Assessment ID is only a locator; ownership is checked server-side |
| `POST /revision/generate` | existing request/response | parent only | Preserved parent/MVP generation with internal marking data |
| `GET /revision/{assessment_id}` | existing detail | owning parent only | Prevents answer-key disclosure to learner tokens |
| `POST /revision/submit` | existing submit/result | owning parent only | Unchanged parent-only marking boundary |

Learner questions contain only `id`, `question`, `marks`, `skill_tested`, and `question_type`. Expected answers, marking guides, saved answers, result data, model prompts, provider errors, and diagnostics are excluded.

## 4. Assessment and question data model

The existing `assessment_attempts` table remains the only quiz/assessment model. Alembic revision `20261109_02` adds:

- nullable, unique, indexed `request_id` for request idempotency;
- indexed `status`, defaulting to `ready` for existing records.

Generation uses a small lifecycle:

1. Validate authenticated identity and curriculum inputs.
2. Insert `created` with an empty internal question list, reserving the idempotency key before any billable generation call.
3. Generate and validate the complete internal question structure.
4. Replace the placeholder content and mark the assessment `ready`.
5. Delete the `created` row on provider or validation failure, leaving no partial assessment.

Concurrent or repeated requests with the same key cannot start a second generation call. A completed request returns the existing assessment. Existing assessment relationships and data are preserved.

## 5. React integration

- `/learner/practice` is protected and loads learner-safe options from FastAPI.
- `/learner/practice/:assessmentId` is a protected, reusable question player.
- `/learner/subjects` and `/learner/subjects/mathematics` preserve the existing cards/art and route their actions into learner Practice with subject/strand query defaults.
- public `/practice`, `/subjects`, and `/subjects/mathematics` remain non-authoritative previews for existing design coverage.
- `PracticeProvider` owns options, current assessment, safe errors, request idempotency, and in-memory drafts.
- changing identity or logging out clears options, assessment, request state, and drafts.
- the question player supports previous/next navigation, progress, keyboard-operable native controls, retained drafts, a leave confirmation, mobile layout, and safe unsupported-format copy.

The player explicitly labels answers as drafts and has no submit, mark, score, or progress-writing control.

## 6. Authentication and authorization

- learner identity is derived from the verified learner session, not a request body;
- grade is fixed to the linked `Student.grade`;
- parent tokens receive 403 on learner-practice routes;
- learner tokens receive 403 on generic parent generation/detail and parent marking;
- cross-learner assessment retrieval receives 403;
- revoked, expired, invalid, or logged-out sessions receive 401 through the existing server-side session check;
- all learner React routes use `LearnerRoute`, so direct URLs cannot bypass authentication;
- assessment ownership is checked after lookup; possession of an integer ID grants no access.

## 7. AI safety, reliability, and limits

- mock mode remains deterministic and is forced in pytest and Playwright;
- learner personal information is not sent to the provider; generation receives grade, term, subject, strand, difficulty, and count only;
- subjects and strands are selected from server-maintained CBC mappings;
- Pydantic rejects extra ownership/grade fields and invalid term, difficulty, or count;
- the configured maximum question count is enforced;
- per-learner successful/active generation attempts are limited by `MAX_AI_REQUESTS_PER_LEARNER_PER_HOUR`;
- the `created` idempotency reservation prevents repeat/concurrent billable calls for the same request key;
- strict provider output is revalidated before persistence and learner serialization;
- provider/validation failures return stable 503 copy without diagnostics and leave no assessment row;
- existing OpenAI timeout and retry controls remain unchanged.

## 8. Verification evidence

| Check | Result |
|---|---|
| Phase 1C committed baseline | `bfcc9f1`; clean baseline before Phase 2A |
| Baseline backend | 19 passed, 3 existing deprecation warnings |
| Baseline React | 9 passed; strict typecheck/build passed |
| Final backend | 23 passed, 3 existing deprecation warnings |
| Final React unit | 12 passed |
| TypeScript strict check | PASS |
| Vite production build | PASS, 183 modules |
| Focused Phase 2A Playwright | 6 passed (desktop and mobile) |
| Full Playwright | 132 passed, 2 intentional mobile skips; 134 total |
| Development Docker build | API and web PASS |
| Production-style Docker build | API and Nginx web PASS |
| Alembic copied DB | `20261109_02 (head)` PASS |
| Alembic fresh DB | `20261109_02 (head)` PASS |
| npm audit | 0 critical, 0 high, 2 moderate React Router advisories; unchanged class, major upgrade required |

Pytest continues to report the existing Starlette `httpx` compatibility deprecation and FastAPI `on_event` deprecations. Playwright reports the existing Node `NO_COLOR`/`FORCE_COLOR` warning. The first Playwright attempts were blocked by sandbox port permission and an unrelated process using port 8000; neither was an application regression. The isolated Playwright API port is now 8010, while normal local development remains 8000.

Active database SHA-256 values before and after copied/fresh migration tests were identical:

- DB: `496560a31490ef473135b57d55fa6f9be2ae013d6092aae9d9a4ac6bffc22e8c`
- WAL: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
- SHM: `fd4c9fda9cd3f9ae7c962b0ddf37232294d55580e1aa165aa06129b8549389eb`

## 9. Known limitations

- Only free-text questions are generated by the current revision engine; the player safely declines unknown types.
- Draft answers are intentionally memory-only and disappear on logout, identity change, refresh, or tab close.
- Existing progress percentages, lesson counts, streaks, and recommendations outside Practice remain preview data.
- Real paid OpenAI generation was not executed in automated validation.
- SQLite remains appropriate only for the current single-server MVP; PostgreSQL remains a separate milestone.
- Two moderate React Router advisories require a reviewed major-version migration and are not force-fixed during consolidation.

## 10. Phase 2B dependencies and recommendation

**CONDITIONAL GO for Phase 2B answer submission and parent marking integration.** Phase 2A completion criteria are met: authenticated learners configure CBC revision, receive learner-safe persisted questions, navigate them on desktop/mobile, retain drafts, and cannot cross learner or parent boundaries.

Before Phase 2B implementation:

1. define an explicit draft/final answer state and idempotent submission contract;
2. decide whether learner submission locks or versions answers;
3. add a parent review queue that never exposes parent credentials to the learner context;
4. keep marking invocation parent-only and audit every marking transition;
5. define score/progress semantics before writing analytics;
6. test retry, duplicate submission, stale assessment, sibling isolation, and parent ownership end to end.

Production remains **NO GO** until dependency advisories, production secrets/TLS/operations, real-provider monitoring, database backup operations, and the broader MVP integration gates are resolved.
