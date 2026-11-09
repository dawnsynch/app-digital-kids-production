# Phase 2B Parent Onboarding and Authentication UI

## Scope

Phase 2B implements the five parent/learner entry states shown in `page_designs/Create Parent Account.png`. These are frontend demonstration screens only: they do not create accounts, authenticate users, persist credentials, or issue sessions.

## Implemented screens and routes

| Screen | Route | Local behavior |
| --- | --- | --- |
| Parent introduction | `/parent/get-started` | Routes to registration or sign-in |
| Create parent account | `/parent/register` | Accessible client-side validation, password visibility, preview submission |
| Parent sign-in | `/parent/sign-in` | Clearly fake credentials, local error/loading state, recovery limitation feedback |
| Select learner | `/parent/select-learner` | Development learner selection and unavailable-service feedback |
| Learner PIN | `/learner/pin` | Four keyboard-friendly PIN fields, fake PIN validation, learner switching |

`/parent` redirects to `/parent/get-started`.

## Components and structure

- `ParentAuthLayout` provides a separate onboarding shell and preview disclosure without altering `AppLayout`.
- `AuthCard`, `AuthField`, and `AuthFeedback` provide reusable layout, accessible field, password visibility, validation, and status behavior.
- Phase 2B pages live in `src/pages` and use component-local React state.
- Fake learner and credential fixtures live in `src/data/parentAuth.ts`.
- Scoped styles live in `src/styles/parent-auth.css`.
- The onboarding family illustration lives in `public/assets/parent-auth/family-learning.png` and was generated specifically for this screen.

Existing learner routes, navigation, Kito behavior, and Phase 2A screens remain under the existing learner application shell.

## Demonstration journey

The supported preview path is:

1. Open Get Started.
2. Preview the parent registration form and its validation.
3. Continue to sign-in; registration data is not saved.
4. Use the visibly fake credentials `parent@example.com` and `Demo123!`.
5. Choose a development learner.
6. Use the visibly fake PIN `1234`.
7. Open the existing learner dashboard with a toast explicitly stating that no session was created.

Passwords and PINs are held only in temporary component state. No browser storage is used.

Add Learner, Forgot Password, and Parent Dashboard actions explain their unavailable integration instead of implying completion. The full parent dashboard remains out of scope for Phase 2B.

## Backend dependencies and likely contracts

The following approved service contracts are required before production integration:

- Parent registration: legal-version acceptance, normalized email/phone, password policy, duplicate-account errors, verification state.
- Parent login and logout: credential exchange, secure server-managed session, rate limiting, invalid/locked/unverified states.
- Password recovery: recovery initiation, token verification, reset completion, expiry and throttling behavior.
- Session validation: current parent identity, expiry/refresh behavior, role/permission claims, CSRF requirements.
- Learner linking and selection: authorized learner summaries, add/link learner workflow, selected learner context.
- Learner PIN verification: server-side hashed PIN validation, retry/lockout policy, parent reset flow, short-lived learner session.

No endpoint URLs or production guards were fabricated in this phase.

## Responsive and accessibility behavior

- Desktop uses centered cards and a two-panel introduction surface based on the approved reference.
- Mobile condenses forms to one column, converts learner cards to compact rows, and preserves touch-friendly controls.
- Inputs are explicitly labelled and expose `aria-invalid` and linked error descriptions.
- Validation messages use alert semantics.
- Password visibility controls and PIN focus advancement are keyboard operable.
- All routes are checked for horizontal overflow.

## Testing

`tests/parent-onboarding.spec.ts` covers:

- direct rendering of all five states on desktop and mobile;
- console health and horizontal overflow;
- Get Started and sign-in routing;
- required and email-format validation;
- password visibility;
- the full fake sign-in → learner selection → PIN → learner dashboard path;
- incorrect PIN and unavailable-service feedback;
- keyboard PIN focus advancement.

Quality commands:

```bash
npm run typecheck
npm run build
npx playwright test
```

## Visual QA findings

The implementation follows the approved board’s blue-and-white visual system, centered card geometry, rounded fields, strong primary actions, learner tiles, PIN entry, Kito treatment, and compact mobile hierarchy. The persistent “frontend preview” disclosure is an intentional addition required to prevent the static authentication UI from being mistaken for a live service.

## Known limitations

- No parent account, authentication, authorization, or session is created.
- Registration values do not persist between routes.
- The fake sign-in accepts only the disclosed demonstration credentials.
- Add Learner, password recovery, and Parent Dashboard require future services/screens.
- Legal copy and destination URLs require product/legal approval.
- PIN protection, retry limits, lockout, and recovery require a security-reviewed backend.

## Recommended Phase 2C next steps

Build only the approved parent dashboard surfaces under a separate `ParentLayout`, then connect read-only data after learner/session contracts are approved. Do not connect mutation or account-safety actions until the relevant authorization, audit, and security contracts exist.
