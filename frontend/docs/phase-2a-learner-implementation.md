# Phase 2A Learner UI Implementation

## Scope

Phase 2A adds five learner-facing screens to the existing Digital Kids Learning Assistant while retaining the established React/Vite application shell and all earlier routes:

| Screen | Route |
| --- | --- |
| Achievements | `/achievements` |
| Progress | `/progress` |
| Profile | `/profile` |
| Help | `/help` |
| Settings | `/settings` |

The implementation follows the supplied `page_designs/kidsdashboard` desktop and mobile references. It reuses the existing sidebar, header, mobile top bar, bottom navigation, typography, icons, images, and toast system.

## Architecture

- Page components live in `src/pages`.
- Shared learner UI primitives live in `src/components/learner`.
- Screen fixture data and default settings live in `src/data/learnerPages.ts`.
- Phase-specific styles are isolated in `src/styles/learner-pages.css` and imported after the common application styles.
- Routes and active navigation handling are defined in `src/App.tsx` and `src/components/layout/AppLayout.tsx`.

No backend, authentication, persistent storage, network support service, or parent account was introduced.

## Interaction model

- Achievements can expand the full badge collection and open existing practice/coding routes.
- Progress links into existing practice and subject routes.
- Profile supports session-only display-name, avatar, interest, favorite-subject, learning-style, and comfort preference previews.
- Help provides a working FAQ accordion, selectable help topics, and an explicitly local Kito guidance dialog.
- Settings provide accessible switch controls, text size, contrast, language, reminders, sound, volume, and account navigation.

Actions requiring unavailable services show clear local-preview or connected-account messages. Settings and profile changes are intentionally held in React state only and are not represented as saved account changes.

## Responsive behavior

Desktop uses the existing persistent sidebar and multi-column dashboard layout. Tablet layouts collapse dense grids, while phone layouts use the existing mobile top and bottom navigation, single-column content, compact metric grids, touch-friendly controls, and overflow-safe cards.

## Verification

Automated coverage is in `tests/learner-pages.spec.ts` and verifies:

- all five routes render without console errors;
- desktop and mobile layouts avoid horizontal overflow;
- sidebar navigation and route transitions work;
- achievement badge expansion works;
- profile edits remain session-only;
- FAQ and Kito help interactions work;
- accessible settings switches update correctly;
- the existing Kito sidebar chat remains functional.

Run the checks with:

```bash
npm run typecheck
npm run build
npx playwright test
```

## Out of scope

Parent and administrator experiences, backend persistence, real support messaging, authentication, learner switching, and account security management remain intentionally deferred beyond Phase 2A.
