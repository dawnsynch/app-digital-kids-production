export const ACHIEVEMENT_METRICS = [
  { icon: '⭐', value: '820', label: 'Total Stars', tone: 'orange' as const },
  { icon: '📚', value: '2,450', label: 'Learning Points', tone: 'purple' as const },
  { icon: '🔥', value: '7 Days', label: 'Current Streak', tone: 'orange' as const },
  { icon: '🏅', value: '18', label: 'Badges Earned', tone: 'green' as const },
  { icon: '🎯', value: '12', label: 'Challenges Completed', tone: 'pink' as const },
]

export const FEATURED_BADGES = [
  { id: 'math', icon: '⭐', title: 'Mathematics Star', description: 'Completed 5 math practice sessions.', earned: 'Apr 10', tone: 'orange' },
  { id: 'coding', icon: '⌨️', title: 'Coding Explorer', description: 'Finished your first 5 coding lessons.', earned: 'Apr 8', tone: 'purple' },
  { id: 'verse', icon: '📖', title: 'Verse Keeper', description: 'Learned 10 memory verses.', earned: 'Apr 6', tone: 'orange' },
  { id: 'science', icon: '🧪', title: 'Science Curious Mind', description: 'Completed 8 science lessons.', earned: 'Apr 4', tone: 'green' },
  { id: 'reader', icon: '📘', title: 'Reading Champion', description: 'Read 12 learning passages.', earned: 'Mar 28', tone: 'blue' },
  { id: 'quick', icon: '🏆', title: 'Quick Thinker', description: 'Completed 5 practice activities.', earned: 'Mar 24', tone: 'purple' },
]

export const ACHIEVEMENT_CATEGORIES = [
  { icon: '📖', title: 'CBC Learning', earned: 6, total: 12, tone: 'blue' },
  { icon: '⌨️', title: 'Coding & Technology', earned: 3, total: 8, tone: 'purple' },
  { icon: '✝️', title: 'Bible Learning', earned: 2, total: 7, tone: 'orange' },
  { icon: '🔥', title: 'Study Streaks', earned: 4, total: 6, tone: 'orange' },
  { icon: '✅', title: 'Practice & Quizzes', earned: 5, total: 10, tone: 'purple' },
  { icon: '🏆', title: 'Special Milestones', earned: 1, total: 4, tone: 'green' },
]

export const PROGRESS_METRICS = [
  { icon: '📖', value: '42', label: 'Lessons Completed', tone: 'blue' as const },
  { icon: '📚', value: '286', label: 'Questions Answered', tone: 'purple' as const },
  { icon: '🕘', value: '8h 45m', label: 'Learning Time', tone: 'blue' as const },
  { icon: '⭐', value: '82%', label: 'Average Score', tone: 'orange' as const },
]

export const SUBJECT_PROGRESS = [
  { icon: '➗', title: 'Mathematics', progress: 72, status: 'Strong', detail: '14 lessons completed', score: '86%', tone: 'blue' },
  { icon: '📖', title: 'English', progress: 68, status: 'Strong', detail: '11 lessons completed', score: '82%', tone: 'purple' },
  { icon: '🧪', title: 'Science & Technology', progress: 58, status: 'Improving', detail: '9 lessons completed', score: '76%', tone: 'green' },
  { icon: 'Aa', title: 'Kiswahili', progress: 45, status: 'Needs Practice', detail: '7 lessons completed', score: '68%', tone: 'orange' },
]

export const RECENT_LEARNING = [
  { icon: '➗', title: 'Mathematics Practice — Fractions', status: '8 / 10 correct', when: 'Today', tone: 'blue' },
  { icon: '🧪', title: 'Science Lesson — States of Matter', status: 'Completed', when: 'Yesterday', tone: 'green' },
  { icon: '⌨️', title: 'Coding Activity — Repeating Loops', status: 'Completed', when: 'Yesterday', tone: 'purple' },
  { icon: '📖', title: 'Bible Learning — David and Goliath', status: 'Reflection done', when: '2 days ago', tone: 'orange' },
]

export const FAVORITE_SUBJECTS = [
  { id: 'math', icon: '➗', label: 'Mathematics', tone: 'blue' },
  { id: 'science', icon: '🧪', label: 'Science & Technology', tone: 'green' },
  { id: 'coding', icon: '⌨️', label: 'Coding & Technology', tone: 'purple' },
  { id: 'english', icon: '📖', label: 'English', tone: 'purple' },
]

export const PROFILE_GOALS = [
  { id: 'math', icon: '➗', title: 'Practice Mathematics', detail: '3 times per week', done: 2, total: 3, tone: 'blue' },
  { id: 'coding', icon: '⌨️', title: 'Learn Coding', detail: 'Complete 2 lessons this week', done: 1, total: 2, tone: 'purple' },
  { id: 'bible', icon: '✝️', title: 'Read & Learn', detail: 'Complete 1 Bible lesson this week', done: 1, total: 1, tone: 'orange' },
]

export const LEARNING_INTERESTS = [
  'Build my first website',
  'Get better at fractions',
  'Learn Artificial Intelligence',
  'Improve reading',
  'Learn coding',
  'Memorize Bible verses',
]

export const HELP_TOPICS = [
  { id: 'lessons', icon: '📖', title: 'Learning & Lessons', description: 'How lessons and subjects work', tone: 'purple' },
  { id: 'practice', icon: '✅', title: 'Practice & Quizzes', description: 'Starting practice and reviewing answers', tone: 'green' },
  { id: 'progress', icon: '📊', title: 'My Progress', description: 'Understanding scores and progress', tone: 'blue' },
  { id: 'coding', icon: '⌨️', title: 'Coding & Technology', description: 'Help with technology lessons', tone: 'purple' },
  { id: 'bible', icon: '✝️', title: 'Bible Learning', description: 'Stories, verses and reflections', tone: 'orange' },
  { id: 'achievements', icon: '🏆', title: 'Achievements', description: 'Stars, streaks and badges', tone: 'purple' },
]

export const HELP_FAQS = [
  { question: 'How do I start a practice quiz?', answer: 'Go to Practice, choose your grade, subject and topic, then select Start Practice.' },
  { question: 'How do I continue a lesson?', answer: 'Open Learn and select Continue on the learning path you want to resume.' },
  { question: 'What happens when I get an answer wrong?', answer: 'You can review the explanation and try a similar question again.' },
  { question: 'How do I earn stars and achievements?', answer: 'Complete lessons, practice activities, challenges and learning streaks.' },
  { question: 'How do I ask Kito for help?', answer: 'Use Ask Kito on this page or Chat with Kito in the sidebar.' },
  { question: 'Where can I see my progress?', answer: 'Open My Progress from the sidebar or the Progress tab on mobile.' },
]

export type LearnerSettingKey =
  | 'readAloud'
  | 'showHints'
  | 'kitoSuggestions'
  | 'celebrations'
  | 'highContrast'
  | 'reducedMotion'
  | 'focusMode'
  | 'learningReminder'
  | 'streakReminder'
  | 'newActivities'
  | 'learningSounds'
  | 'celebrationSounds'

export const DEFAULT_LEARNER_SETTINGS: Record<LearnerSettingKey, boolean> = {
  readAloud: true,
  showHints: true,
  kitoSuggestions: true,
  celebrations: true,
  highContrast: false,
  reducedMotion: false,
  focusMode: false,
  learningReminder: true,
  streakReminder: true,
  newActivities: true,
  learningSounds: true,
  celebrationSounds: true,
}
