# React API integration readiness plan

## Current boundary

`frontend/src/api/client.ts` centralizes the base URL, JSON parsing, bearer header, authenticated 401 handling, and `ApiError`. `frontend/src/api/types.ts` models the currently selected MVP contracts. Phase 1A parent registration, login, `/auth/me`, protected routing, and logout now use this boundary; learner-profile and learning screens remain preview/static until their approved phases.

The React best-practices review supports direct imports from the API modules, event-driven mutations, and starting independent requests in parallel. Do not add fetch calls to individual presentational cards.

## Authentication and session model

### Phase 1 recommendation

1. Add a single `AuthProvider` at the application root with states: `checking`, `anonymous`, and `authenticated`.
2. Parent registration/login calls the existing client and immediately sets the bearer token in `apiClient` memory.
3. Store the returned `User` in context and validate identity with `/auth/me` before entering protected routes.
4. Keep the access token in memory for the first integration milestone. A reload returns the user to sign-in; this is safer than introducing persistent bearer storage without refresh/revocation support.
5. On 401, clear auth state and return to sign-in with a session-expired message. On 403, keep the session and render an access-denied state.
6. Logout clears the client token and context. There is currently no backend logout/revocation endpoint.

Do not put JWTs in URLs, logs, analytics, React error messages, or build-time `VITE_*` variables. If persistent sessions become mandatory, add a backend-managed short access token plus rotating HttpOnly, Secure, SameSite refresh cookie as a separate security change; do not default to `localStorage`.

## Role-based routing

- Public routes: parent get-started, registration, and sign-in.
- Authenticated learner routes: learning dashboard, practice, learning modules, own progress/profile.
- Authenticated parent routes: learner selection/management, parent progress summary, marking/review.
- Admin routes: future dedicated layout, guarded by `user.role === 'admin'` after `/auth/me`.
- Unknown/forbidden roles fail closed.

React guards improve navigation and user feedback only. Every API call must still receive backend 401/403 enforcement. Never infer ownership solely from a route parameter.

## Loading, error, and empty states

Use a small shared request-state convention rather than a new data library initially:

```text
idle -> loading -> success(data | empty)
                -> error(ApiError)
```

- Preserve existing page shells during loading; use localized skeletons or status text to avoid full-page layout shifts.
- Distinguish validation errors (422), invalid credentials (401), forbidden ownership/role (403), not found (404), rate/service errors, and network failures.
- Empty arrays are valid successful states and must not be shown as errors.
- Mutations occur in form/button event handlers, disable duplicate submission, and give accessible feedback.
- Independent dashboard requests should start together with `Promise.all`; do not create sequential request waterfalls.
- Never replace real errors with fabricated mock data after a user has authenticated.

## Incremental mock-data replacement

1. Keep presentational components and CSS unchanged.
2. Add page-level container hooks that transform API data into existing view models.
3. Replace one route at a time behind an explicit development flag only when rollback is needed.
4. Remove a mock constant only after its API-backed route and empty/error states pass tests.
5. Keep metrics with no backend source visibly labeled preview/static until a contract exists; never manufacture streaks, stars, achievements, or lesson counts.

Suggested order: auth → learner list → practice options/generation → answers → parent marking → progress → coding → spiritual learning → admin.

## Contract synchronization

1. First add missing FastAPI response models identified in the contract report.
2. Export the OpenAPI document deterministically in CI.
3. Add `openapi-typescript` as a development-only generator in the integration phase, producing a generated file separate from handwritten UI view models.
4. Fail CI when regeneration changes the committed generated contract.
5. Keep handwritten adapters between generated snake_case API models and UI-specific display models.
6. Add a backend OpenAPI snapshot test for critical operation IDs and response schemas.

Until generation is introduced, every backend schema change must update `frontend/src/api/types.ts` in the same change and pass TypeScript plus backend contract tests.

## Integration-test strategy

- Backend tests create two parents and one linked learner to prove cross-tenant 403 behavior.
- Add tests for hobbies, interaction mutation permissions, admin success, expired tokens, inactive users, and malformed ownership IDs.
- Playwright integration tests use an ephemeral API database and create data through the API, never the active database.
- Use separate browser contexts for Parent A, Parent B, and learner sessions. Assert that URLs and DOM do not reveal another family's names or records and that direct API calls return 403.
- Run with `MOCK_AI_MODE=true` in CI so revision/coding/spiritual flows are deterministic and do not expose credentials or incur network cost.
- Retain the current visual/layout suite as a regression gate while adding API-backed journey tests.

## API client improvements required during integration

- Add an optional abort signal and handle non-JSON/204 responses defensively.
- Add typed methods for assessment detail, interactions, parent summary, hobbies, and later admin contracts.
- Keep token mutation within `AuthProvider`; do not call `setAccessToken` from arbitrary components.
- Add a single 401 callback/interceptor behavior without making the client dependent on React.
- Avoid a barrel file for all API exports; import the client and generated types directly to preserve clear bundle boundaries.

