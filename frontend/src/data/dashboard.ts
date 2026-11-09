import type { ComponentType, SVGProps } from 'react'
import {
  AaIcon,
  BarsIcon,
  BarChartIcon,
  BellIcon,
  BookIcon,
  BookSolidIcon,
  BotIcon,
  CodeIcon,
  CrossCircleIcon,
  CrossIcon,
  FlaskIcon,
  GearIcon,
  GlobeIcon,
  HelpIcon,
  HomeIcon,
  MathIcon,
  MenuIcon,
  OpenBookIcon,
  PracticeIcon,
  ShieldCheckIcon,
  SparkleIcon,
  SqrtIcon,
  SubjectIcon,
  ToolsIcon,
  TrophyIcon,
  UserIcon,
} from '../components/icons/Icons'
import type { ImageKey } from './images'

export type IconType = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>

export type NavItem = {
  id: string
  label: string
  icon: IconType
  group: 'main' | 'utility'
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: HomeIcon, group: 'main' },
  { id: 'learn', label: 'Learn', icon: BookIcon, group: 'main' },
  { id: 'practice', label: 'Practice', icon: PracticeIcon, group: 'main' },
  { id: 'subjects', label: 'My Subjects', icon: SubjectIcon, group: 'main' },
  { id: 'coding', label: 'Coding & Technology', icon: CodeIcon, group: 'main' },
  { id: 'ai', label: 'AI Learning', icon: SparkleIcon, group: 'main' },
  { id: 'bible', label: 'Bible Learning', icon: CrossIcon, group: 'main' },
  { id: 'achievements', label: 'Achievements', icon: TrophyIcon, group: 'main' },
  { id: 'progress', label: 'My Progress', icon: BarChartIcon, group: 'main' },
  { id: 'profile', label: 'Profile', icon: UserIcon, group: 'utility' },
  { id: 'help', label: 'Help', icon: HelpIcon, group: 'utility' },
  { id: 'settings', label: 'Settings', icon: GearIcon, group: 'utility' },
]

export type LearningCard = {
  id: string
  title: string[]
  meta: string
  progress: number
  progressColor: string
  icon: IconType
  iconBg: string
  iconColor: string
  imageKey: ImageKey
  action: 'Start' | 'Continue'
  actionColor: string
}

export const LEARNING_CARDS: LearningCard[] = [
  {
    id: 'mathematics',
    title: ['Mathematics', 'Practice'],
    meta: '0/15 Questions',
    progress: 0.27,
    progressColor: '#1d74e8',
    icon: MathIcon,
    iconBg: '#156ce1',
    iconColor: '#ffffff',
    imageKey: 'lessonMathematics',
    action: 'Start',
    actionColor: '#0f62f6',
  },
  {
    id: 'science',
    title: ['Science', 'Lesson'],
    meta: '0/1 Lesson',
    progress: 0.24,
    progressColor: '#3fbe62',
    icon: FlaskIcon,
    iconBg: '#5dbf72',
    iconColor: '#ffffff',
    imageKey: 'lessonScience',
    action: 'Continue',
    actionColor: '#3cb457',
  },
  {
    id: 'coding',
    title: ['Coding', 'Activity'],
    meta: '0/8 Challenges',
    progress: 0.26,
    progressColor: '#7a5cf0',
    icon: CodeIcon,
    iconBg: '#805bef',
    iconColor: '#ffffff',
    imageKey: 'lessonCoding',
    action: 'Start',
    actionColor: '#7a54ee',
  },
  {
    id: 'bible',
    title: ['Bible', 'Reflection'],
    meta: '0/1 Lesson',
    progress: 0.22,
    progressColor: '#f0a91b',
    icon: CrossCircleIcon,
    iconBg: '#fbb505',
    iconColor: '#ffffff',
    imageKey: 'lessonBible',
    action: 'Start',
    actionColor: '#f2a900',
  },
]

export type PracticeTile = {
  id: string
  label: string
  icon: IconType
  bg: string
  color: string
}

export const PRACTICE_TILES: PracticeTile[] = [
  { id: 'mathematics', label: 'Mathematics', icon: SqrtIcon, bg: '#156ce1', color: '#ffffff' },
  { id: 'english', label: 'English', icon: BookSolidIcon, bg: '#8b5cf6', color: '#ffffff' },
  { id: 'kiswahili', label: 'Kiswahili', icon: AaIcon, bg: '#f79330', color: '#ffffff' },
  { id: 'science', label: 'Science', icon: FlaskIcon, bg: '#4db862', color: '#ffffff' },
]

export type ChartSeries = {
  key: 'lessons' | 'questions' | 'minutes'
  label: string
  color: string
  values: number[]
}

export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const CHART_SERIES: ChartSeries[] = [
  { key: 'lessons', label: 'Lessons Completed', color: '#1d4ed8', values: [45, 70, 72, 100, 0, 0, 65] },
  { key: 'questions', label: 'Questions Answered', color: '#4ade80', values: [20, 22, 40, 35, 48, 22, 24] },
  { key: 'minutes', label: 'Minutes Learned', color: '#8b5cf6', values: [0, 0, 0, 0, 115, 110, 0] },
]

export type Achievement = {
  id: string
  label: string[]
  imageKey: ImageKey
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'streak', label: ['5 Day', 'Learning Streak'], imageKey: 'badgeStreak' },
  { id: 'math', label: ['Mathematics', 'Star'], imageKey: 'badgeMath' },
  { id: 'code', label: ['Coding', 'Explorer'], imageKey: 'badgeCode' },
  { id: 'reading', label: ['Reading', 'Champion'], imageKey: 'badgeReading' },
]

export const NOTIFICATIONS = [
  { id: 1, title: 'New badge unlocked', body: 'You earned the Mathematics Star badge.' },
  { id: 2, title: 'Kito has a tip for you', body: 'Revise fractions before Friday’s quiz.' },
  { id: 3, title: 'Weekly report is ready', body: 'You learned for 112 minutes this week.' },
]

export type FeatureItem = {
  id: string
  title: string[]
  icon: IconType
  color: string
}

export const FEATURES: FeatureItem[] = [
  { id: 'cbc', title: ['CBC Aligned', 'Content'], icon: OpenBookIcon, color: '#0fa3c4' },
  { id: 'safe', title: ['Safe & Child', 'Friendly'], icon: ShieldCheckIcon, color: '#3fc48c' },
  { id: 'ai', title: ['AI Powered', 'Learning'], icon: BotIcon, color: '#2f6fe0' },
  { id: 'progress', title: ['Track Progress', 'Easily'], icon: BarsIcon, color: '#5b57e8' },
  { id: 'anywhere', title: ['Learn Anywhere,', 'Anytime'], icon: GlobeIcon, color: '#1f6fe8' },
]

export const MOBILE_BOTTOM_NAV = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'learn', label: 'Learn', icon: BookIcon },
  { id: 'practice', label: 'Practice', icon: ToolsIcon },
  { id: 'progress', label: 'Progress', icon: BarChartIcon },
  { id: 'profile', label: 'Profile', icon: UserIcon },
]

export { BellIcon, MenuIcon }
