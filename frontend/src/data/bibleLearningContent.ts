import { IMAGES } from './images'

export type BibleStory = {
  id: string
  nameLines: string[]
  /** Strand brand colour — title, progress bar and button. */
  color: string
  /** Progress bar colour. */
  barColor: string
  /** Coloured circle badge. */
  badge: string
  /** Character illustration. */
  illustration: string
  /** Completion percentage. */
  progress: number
  /** e.g. "14 Lessons" */
  count: string
  /** e.g. "Beginner" */
  level: string
  action: 'Continue' | 'Explore' | 'Start'
  /** Optional short description. */
  description?: string
}

export const BIBLE_STRANDS: BibleStory[] = [
  {
    id: 'bible-stories',
    nameLines: ['Bible Stories'],
    color: '#f7a53d',
    barColor: '#f59e0b',
    badge: IMAGES.bibleBadgeStories,
    illustration: IMAGES.bibleSkillStories,
    progress: 30,
    count: '14 Lessons',
    level: 'Beginner',
    action: 'Continue',
    description: 'Discover important Bible stories and the lessons they teach us.',
  },
  {
    id: 'memory-verses',
    nameLines: ['Memory Verses'],
    color: '#d354e2',
    barColor: '#d946ef',
    badge: IMAGES.bibleBadgeMemory,
    illustration: IMAGES.bibleSkillMemory,
    progress: 25,
    count: '12 Verses',
    level: '3 In Progress',
    action: 'Start',
    description: 'Learn and remember important Bible verses.',
  },
  {
    id: 'christian-character',
    nameLines: ['Christian Character'],
    color: '#2fb37e',
    barColor: '#22c55e',
    badge: IMAGES.bibleBadgeCharacter,
    illustration: IMAGES.bibleSkillCharacter,
    progress: 40,
    count: '9 Lessons',
    level: 'Growing',
    action: 'Explore',
    description: 'Learn about kindness, honesty, patience, courage and forgiveness.',
  },
  {
    id: 'life-lessons',
    nameLines: ['Life Lessons'],
    color: '#f5a623',
    barColor: '#f59e0b',
    badge: IMAGES.bibleBadgeLife,
    illustration: IMAGES.bibleSkillLife,
    progress: 0,
    count: '8 Lessons',
    level: 'Explorer',
    action: 'Start',
    description: 'Discover how Bible lessons can guide everyday choices.',
  },
  {
    id: 'prayer-reflection',
    nameLines: ['Prayer & Reflection'],
    color: '#7b5ee6',
    barColor: '#a855f7',
    badge: IMAGES.bibleBadgePrayer,
    illustration: IMAGES.bibleSkillPrayer,
    progress: 40,
    count: 'Personal',
    level: 'Personal',
    action: 'Start',
    description: 'Take time to pray, reflect, and think about what you have learned.',
  },
  {
    id: 'people-of-bible',
    nameLines: ['People of the Bible'],
    color: '#e86a3b',
    barColor: '#ea580c',
    badge: IMAGES.bibleBadgePeople,
    illustration: IMAGES.bibleSkillPeople,
    progress: 0,
    count: '10 Stories',
    level: 'Explorer',
    action: 'Explore',
    description: 'Learn about people whose lives teach us faith, courage and wisdom.',
  },
]

/** Summary figures shown in the page header. */
export const BIBLE_OVERVIEW = {
  progress: 60,
  term: 'Term 2',
  termLabel: 'Current Term',
  streak: 7,
}

/** Recommended story for today. */
export const BIBLE_RECOMMENDED = {
  title: 'Esther’s Courage',
  body: "Learn how Esther made a brave choice to help her people.",
  duration: '7 minutes',
  level: 'Bible Story',
  points: '+20 Points',
  action: 'Start Lesson',
}

/** Practice card — “Put It Into Practice” */
export const BIBLE_PRACTICE = {
  title: 'Kindness',
  description: 'Look for one way to help someone today.',
  items: ['Help at home', 'Encourage a friend', 'Share something', 'Say thank you'],
  action: "I've Done This",
}

/** Progress figures for the “My Bible Learning Progress” panel. */
export const BIBLE_PROGRESS = {
  lessonsCompleted: 16,
  memoryVerses: 12,
  reflectionsCompleted: 8,
  daysStreak: 5,
  stars: 420,
  level: 3,
  levelName: 'Faith Explorer',
  xp: 240,
  xpMax: 400,
  nextLevel: 'Digital Creator',
  nextLevelNumber: 4,
  achievement: 'Verse Keeper',
  achievementDescription: 'Learned 10 memory verses.',
}
