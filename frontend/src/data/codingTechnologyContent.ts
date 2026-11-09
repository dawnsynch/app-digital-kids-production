import type { IconType } from './dashboard'
import {
  BotIcon,
  CodeIcon,
  MonitorIcon,
  ShieldCheckIcon,
  WindowIcon,
} from '../components/icons/Icons'
import { IMAGES } from './images'

export type TechSkill = {
  id: string
  title: string
  description: string
  /** Icon tile colour. */
  accent: string
  /** Progress bar colour. */
  barColor: string
  icon: IconType
  image: string
  progress: number
  /** e.g. “8 Lessons” */
  count: string
  /** e.g. “Beginner” */
  level: string
  action: 'Continue' | 'Explore' | 'Start Building'
}

export const TECH_SKILLS: TechSkill[] = [
  {
    id: 'computer-basics',
    title: 'Computer Basics',
    description: 'Learn how computers, files, applications and devices work.',
    accent: '#1b6ff9',
    barColor: '#33c838',
    icon: MonitorIcon,
    image: IMAGES.codingSkillComputerBasics,
    progress: 60,
    count: '8 Lessons',
    level: 'Beginner',
    action: 'Continue',
  },
  {
    id: 'digital-skills',
    title: 'Digital Skills',
    description: 'Build useful skills for learning, creating and communicating online.',
    accent: '#06b1cf',
    barColor: '#14b24e',
    icon: MonitorIcon,
    image: IMAGES.codingSkillDigitalSkills,
    progress: 35,
    count: '10 Lessons',
    level: 'Beginner',
    action: 'Continue',
  },
  {
    id: 'coding-fundamentals',
    title: 'Coding Fundamentals',
    description: 'Learn how to solve problems and give computers instructions.',
    accent: '#5b53f2',
    barColor: '#555ef0',
    icon: CodeIcon,
    image: IMAGES.codingSkillCodingFundamentals,
    progress: 45,
    count: '12 Lessons',
    level: 'Beginner',
    action: 'Continue',
  },
  {
    id: 'internet-safety',
    title: 'Internet & Online Safety',
    description: 'Learn how to explore the internet safely and responsibly.',
    accent: '#19b1a2',
    barColor: '#61d538',
    icon: ShieldCheckIcon,
    image: IMAGES.codingSkillInternetSafety,
    progress: 25,
    count: '7 Lessons',
    level: 'Beginner',
    action: 'Explore',
  },
  {
    id: 'build-with-code',
    title: 'Build with Code',
    description: 'Use coding skills to create simple projects and solve challenges.',
    accent: '#c147ea',
    barColor: '#db5ada',
    icon: WindowIcon,
    image: IMAGES.codingSkillBuildWithCode,
    progress: 20,
    count: '9 Projects',
    level: 'Explorer',
    action: 'Start Building',
  },
  {
    id: 'robotics',
    title: 'Robotics & Smart Technology',
    description: 'Discover how computers can control machines and smart devices.',
    accent: '#1171fc',
    barColor: '#1057fc',
    icon: BotIcon,
    image: IMAGES.codingSkillRobotics,
    progress: 10,
    count: '6 Lessons',
    level: 'Explorer',
    action: 'Explore',
  },
]

/** The “Continue Learning” banner content. */
export const CODING_CONTINUE = {
  course: 'CODING FUNDAMENTALS',
  lesson: 'Variables & Simple Instructions',
  progress: 65,
  lessonNumber: 6,
  totalLessons: 10,
  description: 'Learn how computers follow instructions using simple coding steps.',
}

/** The recommended next lesson. */
export const CODING_RECOMMENDED = {
  course: 'Coding Fundamentals',
  title: 'Repeating Instructions with Loops',
  body: "You're doing well with coding basics. Let's learn about loops next!",
  duration: '8 minutes',
  level: 'Beginner',
  points: '+20 Learning Points',
}

/** The coding challenge teaser. */
export const CODING_CHALLENGE = {
  title: 'Help the Robot Reach the Star',
  description: 'Put the instructions in the correct order.',
  level: 'Beginner',
  duration: 'About 5 minutes',
  points: '+30 points',
}

/** Progress figures for the “My Technology Progress” panel. */
export const CODING_PROGRESS = {
  lessonsCompleted: 18,
  challenges: 7,
  learningTime: '3h 40m',
  stars: 420,
  level: 3,
  levelName: 'Technology Explorer',
  xp: 240,
  xpMax: 400,
  nextLevel: 'Digital Creator',
  nextLevelNumber: 4,
  achievement: 'Coding Explorer',
  achievementDescription: 'Completed your first 5 coding lessons.',
}
