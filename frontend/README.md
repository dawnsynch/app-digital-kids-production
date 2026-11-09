# Digital Kids — Learning Assistant

A React + TypeScript application for the **Digital Kids** learning platform, built
from the approved UI/UX mockups.

| Page | Route | Description |
| --- | --- | --- |
| Home | `/` | The dashboard (streak, today’s learning, quick practice, weekly progress, achievements). |
| Learn | `/learn` | **What Would You Like to Learn?** — learning paths, progress and recommended lessons. |
| Practice | `/practice` | **Let’s Practice** — set up a quiz in a few easy steps. |
| Choose Subjects | `/subjects` | **Choose a Subject** — browse every subject, progress and lesson count. |
| Mathematics | `/subjects/mathematics` | **Mathematics** — strands, overall progress and Kito's recommendation. |
| Coding & Technology | `/coding-technology` | **Coding & Technology** — learning paths, technology skills, a coding challenge and progress. |

## Stack

- React 18 + TypeScript
- Vite 5
- React Router 6 (client-side routing, browser back/forward supported)
- Plain CSS3 (custom properties, Grid, Flexbox, container query units) — no CSS framework
- Self-hosted Nunito web fonts (`public/fonts`)

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production bundle
npm run preview  # serve the production build
```

> **Deployment note** — routing uses the History API. When hosting the built
> `dist/` folder on a static host, add an SPA rewrite so unknown paths fall back
> to `index.html` (e.g. Netlify: `/* /index.html 200`).

## Project structure

```
public/
  assets/              # imagery served as-is (avatar, mascots, badges, hero art)
  fonts/               # Nunito 400 / 600 / 700 / 800 (woff2)
scripts/
  extract-learning-assets.py    # regenerates public/assets/learning from the mockup
  extract-practice-assets.py   # regenerates src/assets/practice from the mockup
  extract-subjects-assets.py   # regenerates src/assets/subjects from the mockup
  extract-mathematics-assets.py # regenerates src/assets/mathematics from the mockup
  extract-coding-technology-assets.py # regenerates src/assets/coding-technology
src/
  assets/
    practice/          # artwork extracted from the Let's Practice mockup
    subjects/          # artwork extracted from the Choose Subjects mockup
    mathematics/       # artwork extracted from the Mathematics mockup
    coding-technology/ # artwork extracted from the Coding & Technology mockup
  components/
    layout/          # shared application shell
      AppLayout.tsx        # sidebar + header + routed content + footer
      Sidebar.tsx          # navigation + Kito chat card
      Header.tsx           # greeting, grade, streak, stars, notifications, avatar
      FeatureStrip.tsx     # lower platform-highlights footer
      MobileTopBar.tsx     # compact header used below 1024px
      MobileBottomNav.tsx  # sticky bottom navigation used below 1024px
    desktop/         # home dashboard sections
      Dashboard.tsx, ContinueLearning.tsx, StreakCard.tsx, LearningCard.tsx,
      QuickPractice.tsx, ProgressChart.tsx, KeepImproving.tsx, RecentAchievements.tsx
    learning/        # learn page sections
      LearningPathCard.tsx
      RecommendedCard.tsx
    practice/        # let's practice page sections
      PracticeHeader.tsx
      StepIndicator.tsx
      SetupFieldRow.tsx
      DifficultyPicker.tsx
      QuestionCountPicker.tsx
      KitoTipCard.tsx
    subjects/        # choose subjects page sections
      SubjectCard.tsx
      SubjectFilters.tsx
    mathematics/     # mathematics subject page sections
      MathStrandCard.tsx
      MathProgressRing.tsx
    coding-technology/ # coding & technology page sections
      CodingHeroBanner.tsx
      CodingContinueCard.tsx
      TechSkillCard.tsx
      CodingRecommendationCard.tsx
      CodingChallengeCard.tsx
      CodingProgressPanel.tsx
    icons/Icons.tsx  # inline SVG icon set (currentColor)
    ui/UIContext.tsx # toast provider + `useUI()` hook
  data/
    dashboard.ts       # nav items, lessons, chart series, achievements…
    learningContent.ts # learn page content (copy, colours, progress, artwork)
    practiceContent.ts # practice page content (steps, setup fields, difficulties)
    subjects.ts       # choose subjects page content (8 subjects, grades, terms)
    mathematicsContent.ts # mathematics page content (4 strands, overview figures)
    codingTechnologyContent.ts # coding page content (6 skills, progress, challenge)
    images.ts          # image manifest — swap artwork here
  pages/
    HomePage.tsx
    LearnPage.tsx
    PracticePage.tsx
    ChooseSubjectsPage.tsx
    MathematicsPage.tsx
    CodingTechnologyPage.tsx
  styles/
    base.css         # tokens, reset, buttons, toasts, popovers
    layout.css       # app shell, sidebar, header, feature strip
    dashboard.css    # home dashboard sections
    learn.css        # learn page sections
    practice.css     # let's practice page sections
    subjects.css     # choose subjects page sections
    mathematics.css  # mathematics subject page sections
    coding-technology.css # coding & technology page sections
    responsive.css   # breakpoints
```

## Images

All imagery is referenced through centralised manifests so it can be swapped
without touching the components.

* `src/data/images.ts` — shared imagery (avatar, mascots, badges, hero art) plus
  the practice-page artwork imported from `src/assets/practice/`.
* `src/data/learningContent.ts` / `src/data/practiceContent.ts` — artwork paths
  per content item.

To replace any image, drop the new file into `public/assets/` (or
`src/assets/`) and update the matching key — no component changes required.
Every `<img>` has explicit dimensions/`object-fit` so nothing reflows.

### Extracted artwork

The learning-path illustrations, the practice hero, the difficulty characters,
Kito the robot and the pie chart were **extracted directly from the approved
mockups** with the scripts in `scripts/`. The scripts chroma-key artwork off the
card background and, where needed, inpaint overlapping text so the art can be
layered under real HTML text. Re-run them with:

```bash
python3 scripts/extract-learning-assets.py
python3 scripts/extract-practice-assets.py
python3 scripts/extract-subjects-assets.py
python3 scripts/extract-mathematics-assets.py
python3 scripts/extract-coding-technology-assets.py
```

## Responsive behaviour

Responsiveness is implemented purely with CSS — no device frames or scaled
previews are rendered anywhere in the app.

| Viewport | Layout |
| --- | --- |
| ≥ 1081px | Learn shows the 2 × 2 learning-path grid; Practice shows the 2-column setup grid with the tip card beside the CTA; Choose Subjects shows a compact 4 × 2 subject grid (≈275px tall cards); Mathematics shows the 2 × 2 strand grid with the summary cards on the right; Coding & Technology shows the 3 × 2 skill grid and the 3-panel bottom row |
| 1025 – 1080px | Practice setup grid stacks to a single column; subject grid drops to 2 per row; the Mathematics summary cards drop below the page title; the Coding skill grid drops to 2 per row |
| 769 – 1024px | Sidebar collapses into an off-canvas drawer; a compact top bar and sticky bottom navigation appear |
| 621 – 768px | Single-column content, 2-up question options, compact setup rows |
| ≤ 620px | Learning paths become compact cards; practice setup rows stack the select below the label; difficulty options become a list; subject cards become 2 per row (1 from 430px); Mathematics strands stack and the illustration moves below the stats; the Coding banner artwork stacks under the copy |

No horizontal overflow occurs between 320px and 1920px.

## Interactions

- Sidebar navigation with active state; **Home**, **Learn** and **Practice** are
  real routes (browser back/forward works), the remaining items raise a toast
- "Chat with Kito" turns the mascot card into a working chat panel
- Notification bell opens a popover with a "mark all as read" action
- Home: "View All" expands the learning grid; lesson buttons confirm with a
  `Started ✓` state; quick practice tiles, feature strip items and achievement
  badges are clickable; the weekly chart renders hover tooltips
- Learn: learning-path buttons confirm with a `Started ✓` state, recommended
  lesson links and "View All" are interactive
- Practice: the four setup fields are real select controls; the difficulty and
  question-count pickers are keyboard-accessible radio groups; the "About X
  minutes" panel and Kito's tip update with the current selection; the step
  indicator and "Start Practice" raise an explicit placeholder state because no
  practice engine is connected yet
- Choose Subjects: the grade/term pickers update the "Grade X • Term Y" line;
  each subject tile reports its progress and lesson count; "Practice" starts that
  subject and "Ask Kito for Help" raises a toast. Subject cards are compact
  (≈275px tall, 114px illustration) and every Practice button in a row aligns
- Mathematics: the Mathematics subject card opens `/subjects/mathematics` from
  its title, badge or illustration while its **Practice** button still routes to
  `/practice`; strand buttons and "Practice Fractions" report the action
  (or route to the practice page). "My Subjects" stays highlighted as the
  active parent menu item on the detail page
- Coding & Technology: the sidebar item routes to `/coding-technology` and is
  highlighted; every card button (skill, continue lesson, start lesson, start
  challenge, View All) reports its action via a toast — no fake progress or a
  code-execution sandbox is invented
- Mobile drawer, bottom navigation and toast feedback
