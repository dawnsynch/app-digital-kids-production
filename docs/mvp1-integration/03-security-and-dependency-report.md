# Security and dependency report

## Audit method

`npm audit --json` and `npm outdated --json` were run against the locked frontend dependency tree on 2026-11-09.

## Current advisories

| Package | Relationship | Installed/affected | Severity | Main exposure | Available fix |
| --- | --- | --- | --- | --- | --- |
| `vite` | Direct dev dependency | 5.4.21; advisory ranges include Vite through 6.4.x | High aggregate | Development server path/access and editor-launch handling | Vite 8.3.7, major upgrade |
| `esbuild` | Transitive through Vite | affected through 0.24.2 | Moderate | A malicious site may interact with/read from the dev server | Via Vite 8, major upgrade |
| `react-router-dom` | Direct runtime dependency | 6.30.6; affected React Router range below 7.18.0 | Moderate | Backslash open redirect; SSR error deserialization advisory | React Router DOM 7.18.5, major upgrade |
| `react-router` | Transitive through `react-router-dom` | 6.30.6 | Moderate | Same router advisories | Via React Router DOM 7.18.5 |

Audit totals: **1 high, 3 moderate, 0 critical**.

## Safe updates applied

- `@playwright/test`: 1.64.1 → 1.65.0.
- `@types/node`: 26.6.5 → 26.6.6.

These remain within declared compatible ranges. TypeScript, build, and rendered tests must pass after the lockfile change.

No audit finding has a non-breaking fix within the current Vite 5 or React Router 6 major. `npm audit fix --force` was not used because it would cross major versions and could change build, routing, and deployment behavior.

## Residual-risk decision

- Do not expose the Vite development server to untrusted networks. Bind to loopback for normal local work; the Docker development port is for trusted developer machines only.
- Production serves static assets from Nginx, not the Vite development server, which materially reduces the Vite runtime exposure.
- The application does not use React Router SSR hydration, reducing applicability of that advisory, but the open-redirect issue remains relevant to navigation inputs. Do not route to untrusted user-provided destinations.
- Major upgrades require a dedicated compatibility branch, migration notes, full Playwright regression, Docker rebuild, and deployment smoke test.
- Production release remains blocked until the high advisory is upgraded or explicitly risk-accepted by the security owner.

## Application security observations

- Backend JWT authorization and ownership dependencies are the security boundary; React route guards must never replace them.
- JWT secret and OpenAI credentials remain server-only environment variables. Only `VITE_*` variables are browser-visible.
- Current access tokens are bearer tokens with a 60-minute default expiry and no refresh/revocation endpoint.
- Password hashes are PBKDF2-SHA256 with per-password random salts and are excluded by response schemas.
- CORS credentials are enabled; production origins must be explicit and must never use a wildcard.

## CI policy

CI currently fails at critical severity using `npm audit --audit-level=critical` while reporting the accepted high/moderate baseline. Raising the mandatory threshold to high is a production-readiness milestone after the Vite major upgrade. This exception applies only to the recorded advisories; any critical advisory blocks image publication immediately.

