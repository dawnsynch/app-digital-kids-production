export const DEMO_PARENT = {
  email: 'parent@example.com',
  password: 'Demo123!',
  pin: '1234',
} as const

export const DEMO_LEARNERS = [
  { id: 'amina', name: 'Amina', grade: 'Grade 5', streak: '7 Day Streak', subject: 'Mathematics · Fractions', image: '/assets/girl-hero.png', tone: 'yellow' },
  { id: 'david', name: 'David', grade: 'Grade 3', streak: '4 Day Streak', subject: 'Science · Plants', image: '/assets/illus-science.png', tone: 'green' },
] as const
