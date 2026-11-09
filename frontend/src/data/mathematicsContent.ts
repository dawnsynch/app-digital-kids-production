import { IMAGES } from './images'

export type MathStrand = {
  id: string
  name: string
  /** Strand brand colour — title, progress bar and button. */
  color: string
  /** Coloured circle badge. */
  badge: string
  /** Character illustration. */
  illustration: string
  /** Completion percentage. */
  progress: number
  lessons: number
  questions: number
  action: 'Continue' | 'Practice'
}

export const MATH_STRANDS: MathStrand[] = [
  {
    id: 'numbers',
    name: 'Numbers',
    color: '#1a4df0',
    badge: IMAGES.mathStrandNumbers,
    illustration: IMAGES.mathIllustrationNumbers,
    progress: 72,
    lessons: 16,
    questions: 120,
    action: 'Continue',
  },
  {
    id: 'fractions',
    name: 'Fractions',
    color: '#6b3ce0',
    badge: IMAGES.mathStrandFractions,
    illustration: IMAGES.mathIllustrationFractions,
    progress: 45,
    lessons: 12,
    questions: 90,
    action: 'Practice',
  },
  {
    id: 'geometry',
    name: 'Geometry',
    color: '#338929',
    badge: IMAGES.mathStrandGeometry,
    illustration: IMAGES.mathIllustrationGeometry,
    progress: 30,
    lessons: 10,
    questions: 75,
    action: 'Practice',
  },
  {
    id: 'measurement',
    name: 'Measurement',
    color: '#e63700',
    badge: IMAGES.mathStrandMeasurement,
    illustration: IMAGES.mathIllustrationMeasurement,
    progress: 60,
    lessons: 14,
    questions: 110,
    action: 'Continue',
  },
]

/** Summary figures shown in the page header. */
export const MATH_OVERVIEW = {
  progress: 58,
  term: 'Term 2',
  termLabel: 'Current Term',
  streak: 7,
}

/** Strand Kito suggests practising today. */
export const MATH_RECOMMENDED_STRAND = 'Fractions'
