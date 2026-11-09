# Digital Kids UI Design Implementation Plan

Date: 2026-11-06  
Status: Discovery and mapping complete; implementation not yet started for `page_designs` screens.

## 1. Executive summary

The repository is a learner-only React application with seven implemented page routes and a reusable learner shell. The `page_designs` directory adds five learner screens, a five-step parent onboarding/sign-in journey, nine parent dashboard screens, and two admin screens.

The current application has no authentication service, API client, persistence layer, role model, or route guards. Parent and admin designs can therefore be implemented as responsive React interfaces with typed development fixtures, but their account, authorization, assignment, and reporting actions cannot be represented as production-integrated functionality until backend contracts are supplied. Unsupported actions must remain visibly identified as previews or disabled/demo actions.

The implementation should preserve all existing learner routes, page-specific work, shared navigation behavior, styling tokens, and responsive breakpoints. Parent and admin experiences should receive role-specific layouts that reuse the existing visual identity without replacing the learner `AppLayout`.

## 2. Existing application architecture

| Area | Current implementation |
| --- | --- |
| Framework | React 18.3.1 with TypeScript |
| Build tooling | Vite 5.4 |
| Routing | React Router DOM 6.30 with `BrowserRouter`, nested routes, and an `Outlet`-based shell |
| Styling | Plain CSS files imported from `src/styles/index.css`; CSS custom properties, Grid, and Flexbox |
| UI library | None |
| Icons | Repository-owned inline SVG components in `src/components/icons/Icons.tsx` |
| State | Component-local React state plus `UIContext` for toast notifications |
| Data | Static typed data modules under `src/data/` |
| Authentication | Not present |
| Authorization / roles | Not present |
| API integration | Not present; no `fetch`, Axios, service layer, or API client |
| Persistence | Not present; no local/session storage use |
| Tests | Playwright layout and interaction tests; no Vitest/RTL configuration |
| Quality scripts | `npm run typecheck` and `npm run build`; no lint script |

### Current route inventory

| Route | Component | Status |
| --- | --- | --- |
| `/` | `HomePage` | Existing and implemented |
| `/learn` | `LearnPage` | Existing and implemented |
| `/practice` | `PracticePage` | Existing and implemented with explicitly disclosed demo limitations |
| `/subjects` | `ChooseSubjectsPage` | Existing and implemented |
| `/subjects/mathematics` | `MathematicsPage` | Existing and implemented |
| `/coding-technology` | `CodingTechnologyPage` | Existing and implemented |
| `/bible-learning` | `BibleLearningPage` | Existing and implemented |

The learner sidebar already displays Achievements, My Progress, Profile, Help, and Settings, but these entries currently only show toast notifications. They do not have routes or page components.

## 3. Existing design system

### Typography

- Self-hosted Nunito at weights 400, 600, 700, and 800.
- Strong rounded headings, typically 17–34px depending on hierarchy.
- Body and control text typically 11–15px with weights 600–800.
- All buttons inherit Nunito; no browser-default control typography is used.

### Color and surface tokens

| Token | Value / use |
| --- | --- |
| Board background | `#f2f4fc` |
| Primary ink | `#0d1233` |
| Secondary ink | `#1a2140` |
| Muted text | `#52596b`, `#8a91a4` |
| Primary brand | `#0435e9` |
| Bright brand | `#0f62f6` |
| Deep brand | `#0a12c9` |
| Sidebar gradient | `#002b87` → `#003ca8` → `#00349b` |
| Card surface | `#ffffff` |
| Borders | `#e9ebf3`, `#eef0f7` |
| Common radii | 8px, 10px, 12px, 14px, 16px, pill radius |
| Elevation | Low blue/indigo shadows, normally 4–26px blur |

Semantic accents already used consistently: blue for primary actions, green for completion/safety, purple for coding/AI, orange for focus/warnings/Bible content, and yellow for stars/achievements.

### Shared layout conventions

- Desktop learner sidebar: 223px fixed-width flex item.
- Desktop page padding: 28px 30px 30px.
- Shared learner top header: greeting, grade, streak, stars, notifications, and avatar.
- Shared feature strip footer on learner pages.
- At 1024px and below: off-canvas sidebar, compact mobile top bar, and fixed bottom navigation.
- Additional responsive breakpoints: 1180px, 768px, 620px, and 460px.
- Existing content cards use subtle borders, white surfaces, rounded corners, and restrained shadows.

## 4. Shared components and reuse assessment

### Reuse without modification

- `UIContext` and toast notification behavior.
- `Icons.tsx` icon primitives where their metaphors match the references.
- Brand logo, Kito mascot, learner avatar, and font assets from `src/data/images.ts`.
- Existing progress-bar, card, status, and action styling conventions.
- Mobile drawer and bottom-navigation interaction patterns.
- Existing chart rendering approaches from `ProgressChart` and page-specific CSS/SVG charts.
- Existing responsive spacing, typography, and surface tokens.

### Reuse with narrow extension

- Add real routes to the existing learner `Sidebar` and `MobileBottomNav` without changing their established appearance.
- Extend `AppLayout` active-route detection for learner Progress, Achievements, Profile, Help, and Settings.
- Convert only clearly repeated patterns into small shared primitives: `PageIdentity`, `MetricCard`, `ProgressBar`, `StatusBadge`, `LearnerSelector`, `SectionHeader`, and responsive chart/list wrappers.
- Keep existing page-specific components intact unless a new screen can safely consume a generalized version without changing its current rendering.

### Genuine component gaps

- Parent-specific `ParentLayout`, sidebar, header, learner selector, and mobile navigation.
- Admin-specific `AdminLayout`, sidebar, header, role selector, and mobile navigation.
- Authentication/onboarding layout for registration, sign-in, learner selection, and learner PIN.
- Accessible switch/toggle and segmented-control primitives.
- Responsive data-table/list component for parent and admin records.
- Filter/select toolbar used by assessments, assignments, and admin user management.
- Modal/menu primitives for learner management actions and account/security flows.
- Typed chart primitives for line, bar, and donut summaries without introducing a chart dependency.

Creating separate role layouts is safer than transforming the learner `AppLayout` into a highly conditional component. Shared primitives should be extracted only after the repeated anatomy is proven in at least two implemented screens.

## 5. Design reference inventory and mapping

All 17 PNG references were opened and inspected at their native 1536×1024 or 1672×941 dimensions. The mapping below is based on visible screen content rather than filenames alone.

### 5.1 Learner experience

| Design reference | Pixel-verified screen | Proposed route | Existing implementation | Classification | Required interactions / notes |
| --- | --- | --- | --- | --- | --- |
| `kidsdashboard/Digital Kids Achievements Dashboard.png` | Achievement journey, totals, level progress, badges, categories, milestones, next achievement | `/achievements` | Sidebar placeholder only | **NEW PAGE** | Badge/category navigation, view-all actions, recommendation CTA |
| `kidsdashboard/Digital Kids Help Dashboard Mockup-1.png` | Kito help hero, help-topic categories, FAQ accordion, report/parent/support actions, safety help | `/help` | Sidebar placeholder only; Kito chat exists | **NEW PAGE** | Working FAQ accordion, Ask Kito, topic selection; support/report actions remain disclosed previews unless services exist |
| `kidsdashboard/Digital Kids Learning Profile Dashboard.png` | Learner identity, stats, journey, favorite subjects, goals, interests, learning preferences, accessibility summary | `/profile` | Sidebar/avatar placeholder only | **NEW PAGE** | Local edit states for profile/interests/goals/preferences; account information requires parent/backend flow |
| `kidsdashboard/Digital Kids Learning Progress Dashboard.png` | Term summary, weekly chart, streak, subject progress, strengths, improvement area, recent learning, next action | `/progress` | Sidebar/bottom-nav placeholder only; several data patterns exist on home | **NEW PAGE** | Time-range/chart state, subject drill-down, practice recommendation routing |
| `kidsdashboard/Digital Kids Settings Dashboard.png` | Learning preferences, accessibility, language, reminders, sound, account links, parent-managed controls | `/settings` | Sidebar placeholder only | **NEW PAGE** | Accessible toggles/selects/sliders and local preview state; persistence/account controls need backend |

### 5.2 Parent account and learner-entry journey

`Create Parent Account.png` is a composite journey board rather than one screen. It contains five distinct desktop/mobile states plus a journey diagram.

| Visible state | Proposed route / state | Classification | Dependencies |
| --- | --- | --- | --- |
| Marketing/get-started panel | `/parent/get-started` | **NEW PAGE** | None for static UI; route to registration/sign-in |
| Create Parent Account form | `/parent/register` | **NEW PAGE — BACKEND BLOCKED** | Registration API, validation rules, terms/privacy URLs, country/phone requirements |
| Parent sign-in | `/parent/sign-in` | **NEW PAGE — BACKEND BLOCKED** | Authentication/session API and password reset flow |
| Learner chooser / add learner / parent dashboard entry | `/parent/select-learner` | **NEW PAGE — BACKEND BLOCKED** | Authenticated parent session and learner records |
| Learner PIN entry / switch learner | `/learner/pin` | **NEW PAGE — BACKEND BLOCKED** | PIN verification, attempt limits, secure learner session |

The journey shown is: parent creates account → adds learner profile → signs in → chooses learner → enters learner PIN → learner dashboard. This must become one coherent authentication/session flow rather than unrelated mock pages.

### 5.3 Parent and guardian experience

| Design reference | Pixel-verified screen | Proposed route | Classification | Key interactions / dependencies |
| --- | --- | --- | --- | --- |
| `parents/Digital Kids Parent Dashboard Mockup.png` | Parent overview for selected learner with summary, subject progress, assessments, focus areas, activity, consistency, recommendations | `/parent` | **NEW PAGE** | Learner switching, progress/assessment links; all metrics require learner data service |
| `parents/Learner Management Parent Dashboard.png` | My Children, add learner, learner cards, grade/subject/access management menu | `/parent/children` | **NEW PAGE** | Add/edit learner, grade/term/subjects, reset PIN, manage access; backend required |
| `parents/Polished Digital Kids Progress Dashboard.png` | Detailed learner progress, trend chart, subject and learning-area progress, activity, recommendation | `/parent/progress` | **NEW PAGE** | Learner selector, subject drill-down, start/assign practice; backend required |
| `parents/Digital Kids Assesment.png` | Assessment overview, filters, recent result table, trend, focus/strong areas, recommended review | `/parent/assessments` | **NEW PAGE** | Subject/term/type filters and result views; assessment data service required |
| `parents/Digital Kids Assignments Dashboard.png` | Assignments & Review overview, learner/subject/status/term filters, recent assignments, performance, create/submission/review tabs | `/parent/assignments` | **NEW PAGE** | Create assignment, submissions, review/results; assignment API required |
| `parents/Digital Kids Recent Activity Screen.png` | Recent learner activity, weekly activity, time breakdown, consistency, area summary, Kito insight | `/parent/activity` | **NEW PAGE** | Learner selector, activity filtering/full log; activity service required |
| `parents/Digital Kids Recommendation.png` | Personalized recommendations, focus/maintain/quick-win summary, assignment scheduling | `/parent/recommendations` | **NEW PAGE** | Assign/schedule recommendation; recommendations and assignment APIs required |
| `parents/Digital Kids Assignment .png` | **Parent Achievements screen despite misleading filename**: badges, streak, points, milestones, categories, near-complete achievements | `/parent/achievements` | **NEW PAGE** | Learner selector, achievement details, encouragement CTA |
| `parents/Digital Kids Account Safety .png` | Parent account, family safety summary, learner PIN/session access, permissions/privacy toggles, security, support | `/parent/account-safety` | **NEW PAGE — SECURITY BACKEND BLOCKED** | Account editing, password/2FA, device sessions, PIN reset, permissions, privacy and audit log APIs |

### 5.4 Administrative experience

| Design reference | Pixel-verified screen | Proposed route | Classification | Key interactions / dependencies |
| --- | --- | --- | --- | --- |
| `admin/Digital Kids Admin Dashboard Overview.png` | Platform overview with users, activities, learning time, activity trend, usage donut, performance, growth, activity log, quick actions, system health | `/admin` | **NEW PAGE — ROLE/BACKEND BLOCKED** | Time range, activity log, reports, system metrics; admin APIs and authorization required |
| `admin/Digital Kids Admin Dashboard.png` | User Management with tabs for users, records, assignments, reviews/results, reports; metrics, searchable/filterable user table, learning records, quick actions | `/admin/users` | **NEW PAGE — ROLE/BACKEND BLOCKED** | Search, role filter, pagination, add/view/edit users, records; admin APIs and authorization required |

The remaining admin sidebar destinations shown in the references—Learners, Parents/Guardians, Assignments & Review, Content & Curriculum, Reports & Analytics, Platform Usage, and Settings—do not each have a corresponding detailed design. They must not be invented. Initially they should either route to the supported tab/state within User Management where appropriate or remain clearly unavailable until designs and requirements are supplied.

## 6. Existing functionality to preserve

- All seven current learner routes and their direct-refresh behavior.
- Learner sidebar appearance, width, grouping, active states, and mobile drawer.
- Learner top header, notification popover, avatar, and grade/streak/star display.
- Mobile top bar and fixed bottom navigation behavior.
- Kito chat interaction and toast feedback.
- Home learning cards, chart hover behavior, quick practice, and achievements.
- Learn-page expansion and lesson-start states.
- Practice setup controls and explicit demo limitation messaging.
- Subject filters and Mathematics/Coding/Bible navigation and actions.
- Existing page-specific CSS, images, and tests.
- Existing visual identity: Nunito, brand blue, white cards, restrained shadows, semantic accent colors.

## 7. Proposed route architecture

```text
/
├── learn, practice, subjects, coding-technology, bible-learning
├── achievements, progress, profile, help, settings          (LearnerLayout/AppLayout)
├── parent
│   ├── get-started, register, sign-in, select-learner       (AuthLayout)
│   ├── index                                                (ParentLayout)
│   ├── children, progress, assignments, assessments
│   ├── activity, recommendations, achievements
│   └── account-safety
├── learner/pin                                              (AuthLayout)
└── admin
    ├── index                                                (AdminLayout)
    └── users                                                (AdminLayout)
```

Until authentication exists, role routes should not claim real protection. During UI implementation they should be explicitly treated as development previews. Production role guards must wait for an approved session/authorization contract.

## 8. Proposed implementation sequence

### Group 1 — Learner route completion

1. Add the five missing learner routes using the existing `AppLayout`.
2. Wire current inert sidebar and mobile-nav entries to those routes.
3. Implement Progress and Achievements first because they reuse existing dashboard data patterns.
4. Implement Profile and Settings with accessible local controls.
5. Implement Help with a working FAQ accordion and existing Kito chat integration.
6. Add learner route/layout Playwright coverage and regression-check all current pages.

### Group 2 — Shared role-ready primitives

1. Add typed fixtures separated by role and marked as development/demo data.
2. Add minimal shared primitives proven necessary by Group 1: metric cards, progress/status rows, page identity, selector/filter controls, and responsive chart wrappers.
3. Do not refactor existing pages merely to consume the new primitives.

### Group 3 — Parent shell and read-only dashboards

1. Build `ParentLayout` using the existing brand tokens and responsive navigation patterns.
2. Implement Parent Dashboard, Learning Progress, Assessments, Activity, Recommendations, and Achievements as read-only fixture-backed previews.
3. Implement responsive table-to-list transformations shown in the mobile references.

### Group 4 — Parent mutation flows

1. Implement Learner Management, Assignments & Review, and Account & Safety UI states.
2. Keep create/edit/reset/security actions disabled or explicitly preview-only until backend contracts exist.
3. Add API adapters only after approved endpoint/data contracts are provided.

### Group 5 — Authentication and learner entry

1. Implement the five-state parent/learner entry journey.
2. Connect registration, sign-in, learner selection, and PIN verification only after the authentication/session contract is available.
3. Add form validation, error, loading, recovery, and locked-out states before claiming completion.

### Group 6 — Admin previews and integration

1. Build `AdminLayout` with admin-specific navigation and responsive behavior.
2. Implement Admin Overview and User Management from the two supplied references.
3. Do not create unreferenced admin screens.
4. Connect metrics, user actions, pagination, and role enforcement only after admin APIs and permissions are available.

### Group 7 — Final validation

1. Typecheck and production build.
2. Run existing and new Playwright suites.
3. Validate desktop, tablet, and mobile layouts with no horizontal overflow.
4. Compare every implemented screen to its native design reference.
5. Verify current learner pages and interactions for regressions.
6. Write `docs/ui-implementation-validation.md` with actual results, limitations, and remaining backend gaps.

## 9. Testing strategy

- Keep Playwright as the existing browser framework; do not introduce another test system.
- Add route identity, major-section visibility, horizontal-overflow, image containment, console-health, and one meaningful interaction test per new page group.
- Add direct-navigation tests for all new routes.
- Test parent/admin table filters, selectors, pagination, accordions, toggles, and responsive list transformations where implemented.
- Validate at minimum 1440×900, 768×1024, 390×844, and 360×800; use native 1536×1024 or 1672×941 design dimensions for fidelity comparison where practical.
- Preserve screenshots outside the repository unless a committed visual-regression baseline is explicitly approved.

## 10. Risks, clarifications, and dependencies

### Blocking production integrations

1. No authentication/session implementation.
2. No parent, learner, or admin role model or route guard.
3. No registration, sign-in, password reset, PIN, 2FA, device-session, or privacy APIs.
4. No learner profile, progress, assessment, assignment, activity, recommendation, achievement, reporting, or platform-metrics APIs.
5. No persistence contract for learner settings or accessibility preferences.
6. No legal URLs/content for Terms of Use, Privacy Policy, or support/reporting workflows.

### Design/behavior ambiguities

- Grade varies between current app data (Grade 6) and several new references (Grade 5). The data model should determine this rather than hardcoding page-specific headers.
- Dates in the parent achievement reference are static 2025 examples and must not be treated as live data.
- `Digital Kids Assignment .png` is mislabeled and maps to Achievements, not Assignments.
- The Create Parent Account board contains multiple routes/states and cannot be implemented accurately as one page.
- Admin sidebar destinations without detailed references require additional designs or explicit product requirements.
- Designs show desktop and phone compositions, but not intermediate tablet states; existing breakpoints should govern tablet behavior.

### Regression risks

- Converting the learner shell into a role-aware monolith could destabilize current pages; separate layouts are recommended.
- Broad changes to `base.css`, `layout.css`, or global navigation data could affect every existing screen; new role/page CSS should remain scoped.
- Dense dashboard designs may become unreadable if naively stacked on mobile; mobile references must drive content prioritization and table-to-list behavior.
- Static fixture data can be mistaken for production information; development surfaces and documentation must clearly identify it.

## 11. Definition of ready for implementation

The discovery phase is complete. Learner screen implementation can begin immediately because it does not depend on authentication or backend services. Parent and admin visual previews can also begin with clearly identified typed fixtures, but production-complete claims and mutating workflows require the blocking contracts above.

Before authentication, account safety, or admin integration work begins, the following are required:

- Approved role/session model.
- API endpoint and data-contract documentation.
- Expected loading, error, empty, and permission-denied behavior.
- Security requirements for learner PINs, password recovery, 2FA, device sessions, and audit logs.
- Decision on how demo/fixture data should be labeled in non-production builds.

