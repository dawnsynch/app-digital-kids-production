# React–FastAPI integration plan

## Integration boundary delivered

`frontend/src/api/client.ts` provides a single fetch wrapper with:

- configurable `VITE_API_BASE_URL` (default `/api`);
- in-memory bearer-token attachment via `setAccessToken`;
- JSON serialization and typed responses;
- a consistent `ApiError` containing HTTP status and backend detail;
- typed methods for health, auth, students, learner accounts, revision, coding, spiritual lessons, and learner progress.

Contracts live in `frontend/src/api/types.ts`. Components should import directly from these two modules; UI components should not call `fetch` themselves.

## Connectivity

| Environment | Browser base URL | Routing |
| --- | --- | --- |
| Vite local development | `/api` | Vite proxies to `http://localhost:8000` and strips `/api` |
| Docker development | `/api` | Vite proxy reaches the published host API port |
| Production image | `/api` | Nginx proxies to `http://api:8000` |
| Separate-host deployment | absolute `VITE_API_BASE_URL` | FastAPI `ALLOWED_ORIGINS` must include the web origin |

## Recommended wiring order (separate milestone)

1. Add an auth/session context that owns the in-memory access token and calls `apiClient.setAccessToken`. Decide persistence and logout behavior before storing tokens in browser storage.
2. Replace parent registration and sign-in preview submission with `registerParent` and `login`; retain validation and visual design.
3. Replace demo learner selection with `listStudents`, then add the existing backend student/account operations where the UI already has a matching flow.
4. Wire Practice to revision options, generation, answer saving, and parent-only marking while preserving backend role checks.
5. Wire Coding & Technology and Bible Learning to their existing lesson endpoints and record interactions with the existing interaction API.
6. Wire Home, Progress, and Achievements to progress summary data. Do not manufacture backend metrics that do not exist.
7. Add contract tests around error states, expired tokens, forbidden cross-parent access, and mock-AI mode.

## Known contract decisions

- The React registration form includes `phone`, terms, and adult confirmation. The backend registration contract accepts only `full_name`, `email`, and `password`; the extra fields must not be silently persisted without a future schema decision.
- React currently uses a four-digit demo PIN, while the backend learner login uses username/password. A PIN API does not exist and must not be invented during consolidation.
- Revision generation/answer saving is available to an authorized learner or owning parent; final marking is parent-only.
- Coding and spiritual lesson endpoints exist. No general `/learn` catalog endpoint exists.
- The backend has no dedicated achievements, settings, help, notification, or profile-update API.

## Security invariants

- Treat backend authorization as authoritative; route hiding in React is only presentation.
- Never expose or log passwords, JWTs, or password hashes.
- Keep JWT secrets server-side and environment-driven.
- Preserve learner scoping and parent ownership checks.
- Do not ship a production build with the development fallback JWT secret.

