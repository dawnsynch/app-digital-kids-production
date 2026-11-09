import { IMAGES } from './images'

export type Subject = {
  id: string
  /** Subject name, split into the lines used by the reference design. */
  nameLines: string[]
  /** Brand colour of the subject (title, progress bar, badge, button). */
  color: string
  /** Rounded-square category badge. */
  badge: string
  /** Character illustration. */
  illustration: string
  /** Completion percentage shown on the card. */
  progress: number
  /** Number of lessons available in the subject. */
  lessons: number
  /** Optional detail page for this subject. */
  detailPath?: string
}

export const SUBJECTS: Subject[] = [
  {
    id: 'mathematics',
    nameLines: ['Mathematics'],
    color: '#1a4df0',
    badge: IMAGES.subjectBadgeMathematics,
    illustration: IMAGES.subjectIllustrationMathematics,
    progress: 65,
    lessons: 12,
    detailPath: '/subjects/mathematics',
  },
  {
    id: 'english',
    nameLines: ['English'],
    color: '#3e9d61',
    badge: IMAGES.subjectBadgeEnglish,
    illustration: IMAGES.subjectIllustrationEnglish,
    progress: 58,
    lessons: 10,
  },
  {
    id: 'kiswahili',
    nameLines: ['Kiswahili'],
    color: '#6b3ce0',
    badge: IMAGES.subjectBadgeKiswahili,
    illustration: IMAGES.subjectIllustrationKiswahili,
    progress: 50,
    lessons: 9,
  },
  {
    id: 'science',
    nameLines: ['Science &', 'Technology'],
    color: '#0e93ad',
    badge: IMAGES.subjectBadgeScience,
    illustration: IMAGES.subjectIllustrationScience,
    progress: 72,
    lessons: 14,
  },
  {
    id: 'social-studies',
    nameLines: ['Social Studies'],
    color: '#e63700',
    badge: IMAGES.subjectBadgeSocial,
    illustration: IMAGES.subjectIllustrationSocial,
    progress: 46,
    lessons: 8,
  },
  {
    id: 'agriculture',
    nameLines: ['Agriculture'],
    color: '#338929',
    badge: IMAGES.subjectBadgeAgriculture,
    illustration: IMAGES.subjectIllustrationAgriculture,
    progress: 39,
    lessons: 6,
  },
  {
    id: 'creative-arts',
    nameLines: ['Creative Arts'],
    color: '#e0358f',
    badge: IMAGES.subjectBadgeArts,
    illustration: IMAGES.subjectIllustrationArts,
    progress: 61,
    lessons: 7,
  },
  {
    id: 'religious-education',
    nameLines: ['Religious', 'Education'],
    color: '#d18a06',
    badge: IMAGES.subjectBadgeReligious,
    illustration: IMAGES.subjectIllustrationReligious,
    progress: 55,
    lessons: 9,
  },
]

export const GRADE_OPTIONS = [
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
]

export const TERM_OPTIONS = ['Term 1', 'Term 2', 'Term 3']
