# Learner banner and illustration layout fixes

## Root causes

- The two page stylesheets contained later overrides that changed flex layouts into absolutely positioned image layers. Those layers shared the same space as lesson text, progress bars, and controls.
- Hero and featured-card images did not have dedicated media columns, so image size depended on intrinsic asset dimensions and fixed percentages.
- Category illustrations were absolutely positioned inside text regions. Longer titles and descriptions could therefore collide with the art.
- The Verse of the Day actions were absolutely positioned at the bottom of the card, which allowed the buttons to cover the quotation at narrow widths.
- Several supplied Bible illustration PNGs include a small remnant of source-screen text at their left edge. Rendering those decorative assets directly exposed that remnant at some aspect ratios.
- A few older responsive selectors used class names that do not exist in the rendered DOM, so their intended mobile corrections never applied.

## Files changed

- `src/components/bible-learning/ContinueBibleCard.tsx`
- `src/components/bible-learning/VerseOfTheDay.tsx`
- `src/components/bible-learning/BibleSkillCard.tsx`
- `src/styles/coding-technology.css`
- `src/styles/bible-learning.css`
- `tests/learner-banner-layout-fixes.spec.ts`
- `docs/learner-banner-layout-fixes.md`

## Corrections

### Hero banners

Both heroes now use bounded grid columns for icon, copy, and decorative media. The illustration uses a controlled crop and remains inside the rounded banner. On small mobile screens the decorative hero art is hidden to preserve title and description space.

### Featured learning cards

The Coding Continue Learning card now has independent content and media columns. Its progress bar is wholly contained in the content column, while the editor and student illustration are clipped inside the media column. Mobile uses a true stacked layout.

The David and Goliath card now has a dedicated media container instead of placing the illustration over the lesson content. It keeps a two-column composition on tablet and desktop and stacks at 620px and below. The existing asset is rendered as clipped decorative media so its embedded left-edge source remnant is not shown and David's face remains visible.

### Verse of the Day

The card now uses named grid regions for header/quotation, decorative book art, and actions. Buttons remain in normal flow and form a separate action row, so they cannot cover the quotation or reference. The book asset is clipped within its media cell.

### Category illustrations

Coding and Bible category cards now reserve a fixed grid column for art. Illustrations use bounded width/height regions, keep their aspect ratio, and cannot overlap titles, progress information, metadata, or buttons. Bible art uses a clipped decorative background inside that region to hide source-edge remnants while keeping faces fully visible.

## Responsive validation

Rendered screenshots were captured and reviewed at 1440px, 1280px, 768px, and 390px for both routes.

- 1440px and 1280px: balanced banner/media proportions, three-column category grids where space allows, no overlap or horizontal overflow.
- 768px: featured cards retain readable two-column layouts; category cards use the established responsive grid; controls remain visible.
- 390px: featured content stacks, hero copy remains readable, Verse actions stay in their own row, category art remains bounded, and there is no horizontal overflow.

Screenshots used for review are stored in `/tmp` as `coding-technology-after-{width}.png` and `bible-learning-after-{width}.png`; corresponding before captures use `coding-before-{width}.png` and `bible-before-{width}.png`.

## Verification

- `npm run typecheck` — passed.
- `npm run build` — passed.
- Focused Playwright layout and interaction run — 42 passed.
- Full Playwright regression suite — 90 passed, 2 intentionally skipped on mobile because the desktop sidebar is replaced by mobile navigation.
- Browser console checks — passed with no page errors.
- Continue Lesson interactions — passed.
- Learner routes and parent onboarding regression coverage — passed.

## Remaining visual issues

No blocking layout issues remain in the requested sections. The fixed mobile navigation can appear across the middle of a full-page stitched screenshot because fixed elements are captured relative to the viewport; in normal browser use it remains pinned to the bottom as designed.
