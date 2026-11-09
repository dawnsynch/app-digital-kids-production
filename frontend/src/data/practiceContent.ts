import type { ComponentType, SVGProps } from 'react'
import {
  CalendarIcon,
  GradeIcon,
  MathGridIcon,
  PieIcon,
} from '../components/icons/Icons'
import { IMAGES } from './images'

export type PracticeIconType = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>

/** The three stages shown in the practice progress indicator. */
export type PracticeStep = {
  id: 'setup' | 'review' | 'practice'
  label: string
}

export const PRACTICE_STEPS: PracticeStep[] = [
  { id: 'setup', label: 'Set Up' },
  { id: 'review', label: 'Review' },
  { id: 'practice', label: 'Practice' },
]

export type SetupField = {
  id: 'grade' | 'term' | 'subject' | 'strand'
  /** Step number shown in the blue marker. */
  step: number
  label: string
  icon: PracticeIconType
  defaultValue: string
  options: string[]
}

export const SETUP_FIELDS: SetupField[] = [
  {
    id: 'grade',
    step: 1,
    label: 'Choose your grade',
    icon: GradeIcon,
    defaultValue: 'Grade 6',
    options: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'],
  },
  {
    id: 'term',
    step: 2,
    label: 'Choose your term',
    icon: CalendarIcon,
    defaultValue: 'Term 2',
    options: ['Term 1', 'Term 2', 'Term 3'],
  },
  {
    id: 'subject',
    step: 3,
    label: 'Choose your subject',
    icon: MathGridIcon,
    defaultValue: 'Mathematics',
    options: ['Mathematics', 'English', 'Science', 'Bible Learning', 'Coding & Technology'],
  },
  {
    id: 'strand',
    step: 4,
    label: 'Choose your strand',
    icon: PieIcon,
    defaultValue: 'Fractions',
    options: ['Fractions', 'Decimals', 'Measurement', 'Geometry', 'Algebra'],
  },
]

export type Difficulty = {
  id: 'easy' | 'medium' | 'challenge'
  label: string
  /** Colour of the option label. */
  color: string
  /** Border colour used when the option is selected. */
  accent: string
  /** Background colour used when the option is selected. */
  background: string
  image: string
}

export const DIFFICULTIES: Difficulty[] = [
  {
    id: 'easy',
    label: 'Easy',
    color: '#0b0a3d',
    accent: '#3f9d3f',
    background: '#f4fbf4',
    image: IMAGES.difficultyEasy,
  },
  {
    id: 'medium',
    label: 'Medium',
    color: '#fe642c',
    accent: '#fe8833',
    background: '#fef9f0',
    image: IMAGES.difficultyMedium,
  },
  {
    id: 'challenge',
    label: 'Challenge',
    color: '#7c3aed',
    accent: '#7c3aed',
    background: '#f8f4ff',
    image: IMAGES.difficultyChallenge,
  },
]

export const QUESTION_COUNTS = [5, 10, 15, 20]

/** Rough practice length for each question count. */
export function estimateMinutes(questions: number): number {
  return questions
}

/** Copy for Kito's tip, adapted to the selected strand. */
export function kitoTip(strand: string): string {
  return `Great choice! Practicing ${strand} will help you grow more confident and do even better in class.`
}
