/**
 * Content for the “What Would You Like to Learn?” page.
 *
 * The copy, colours and progress values are taken verbatim from the approved
 * design mockup (`screen_designs/Digital Kids Learn Page Mockup.png`).
 * Artwork is referenced through the shared image manifest so it can be swapped
 * without touching this file.
 */

export type LearningPath = {
  id: string
  /** Headline, split into the lines used by the reference design. */
  titleLines: string[]
  /** Supporting copy, split into the lines used by the reference design. */
  descriptionLines: string[]
  /** Category badge (circular icon). */
  badge: string
  /** Large illustration rendered on the right of the card. */
  art: string
  /** Vertical offset of the artwork inside the card, in px. */
  artTop: number
  /** Height of the artwork box, in px. */
  artHeight: number
  /** Card height, matching the reference design. */
  cardHeight: number
  /** Headline colour. */
  titleColor: string
  /** Accent used for the button, progress bar and percentage. */
  accent: string
  progress: number
  action: 'Continue' | 'Explore'
}

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'cbc',
    titleLines: ['CBC Learning'],
    descriptionLines: ['Learn and revise your', 'school subjects.'],
    badge: '/assets/learning/badge-cbc.png',
    art: '/assets/learning/path-cbc.png',
    artTop: 8,
    artHeight: 221,
    cardHeight: 285,
    titleColor: '#0b1fb8',
    accent: '#0054f0',
    progress: 65,
    action: 'Continue',
  },
  {
    id: 'coding',
    titleLines: ['Coding &', 'Technology'],
    descriptionLines: ['Learn computers, coding', 'and digital skills.'],
    badge: '/assets/learning/badge-coding.png',
    art: '/assets/learning/path-coding.png',
    artTop: 18,
    artHeight: 206,
    cardHeight: 285,
    titleColor: '#0b1fb8',
    accent: '#23a6cd',
    progress: 48,
    action: 'Explore',
  },
  {
    id: 'ai',
    titleLines: ['Artificial', 'Intelligence'],
    descriptionLines: ['Discover how Artificial', 'Intelligence works.'],
    badge: '/assets/learning/badge-ai.png',
    art: '/assets/learning/path-ai.png',
    artTop: 6,
    artHeight: 186,
    cardHeight: 238,
    titleColor: '#2a0fb8',
    accent: '#7c57e7',
    progress: 40,
    action: 'Explore',
  },
  {
    id: 'bible',
    titleLines: ['Bible Learning'],
    descriptionLines: ['Learn Bible stories,', 'verses and life lessons.'],
    badge: '/assets/learning/badge-bible.png',
    art: '/assets/learning/path-bible.png',
    artTop: 6,
    artHeight: 186,
    cardHeight: 238,
    titleColor: '#a16000',
    accent: '#e39c03',
    progress: 55,
    action: 'Explore',
  },
]

export type RecommendedItem = {
  id: string
  /** Small grey label above the title. */
  eyebrow: string
  title: string
  /** Call-to-action link under the title. */
  linkLabel: string
  linkColor: string
  /** Progress bar fill colour. */
  barColor: string
  progress: number
  percent: number
  badge: string
  art: string
}

export const RECOMMENDED: RecommendedItem[] = [
  {
    id: 'states-of-matter',
    eyebrow: 'Science Lesson',
    title: 'States of Matter',
    linkLabel: 'Continue Lesson',
    linkColor: '#17795f',
    barColor: '#31ab62',
    progress: 70,
    percent: 70,
    badge: '/assets/learning/badge-science.png',
    art: '/assets/learning/rec-science.png',
  },
  {
    id: 'quiz-app',
    eyebrow: 'Coding Project',
    title: 'Build a Quiz App',
    linkLabel: 'Continue Project',
    linkColor: '#7456da',
    barColor: '#7456da',
    progress: 40,
    percent: 40,
    badge: '/assets/learning/badge-quiz.png',
    art: '/assets/learning/rec-quiz.png',
  },
]

/** Additional recommendations revealed by the “View All” control. */
export const RECOMMENDED_EXTRA: RecommendedItem[] = [
  {
    id: 'multiplication',
    eyebrow: 'Maths Practice',
    title: 'Multiplication Tables',
    linkLabel: 'Continue Practice',
    linkColor: '#17795f',
    barColor: '#31ab62',
    progress: 55,
    percent: 55,
    badge: '/assets/learning/badge-science.png',
    art: '/assets/learning/rec-science.png',
  },
  {
    id: 'storytelling',
    eyebrow: 'Creative Arts',
    title: 'Draw a Landscape',
    linkLabel: 'Continue Project',
    linkColor: '#7456da',
    barColor: '#7456da',
    progress: 25,
    percent: 25,
    badge: '/assets/learning/badge-quiz.png',
    art: '/assets/learning/rec-quiz.png',
  },
]
