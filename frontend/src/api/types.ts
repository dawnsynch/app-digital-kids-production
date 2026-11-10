export type UserRole = 'parent' | 'learner' | 'admin'

export interface User {
  id: number
  full_name: string
  email: string | null
  username: string | null
  role: UserRole
  parent_id: number | null
  student_id: number | null
  is_active: boolean
  created_at: string
}

export interface AuthToken {
  access_token: string
  token_type: 'bearer'
  user: User
}

export interface LearnerAccessStatus {
  student_id: number
  pin_configured: boolean
  access_enabled: boolean
}

export interface LearnerHandoff {
  challenge: string
  expires_in_seconds: number
  learner: Student
}

export interface LearnerIdentity {
  user: User
  learner: Student
}

export interface ParentRegistration {
  full_name: string
  email: string
  password: string
}

export type LoginCredentials =
  | { email: string; password: string; username?: never }
  | { username: string; password: string; email?: never }

export interface Student {
  id: number
  parent_id: number | null
  name: string
  grade: 5 | 6 | 7
  age_group: string | null
  created_at: string
}

export interface StudentCreate {
  name: string
  grade: 5 | 6 | 7
  age_group?: string
}

export interface StudentUpdate {
  name?: string
  grade?: 5 | 6 | 7
  age_group?: string | null
}

export interface LearnerAccountCreate {
  full_name?: string
  username: string
  password: string
}

export interface HealthStatus {
  status: 'healthy'
  service: string
  ai_mode: 'mock' | 'openai'
  openai_configured: boolean
  openai_model: string
  mock_reason: string | null
}

export interface RevisionOptions {
  grades: Array<5 | 6 | 7>
  terms: Array<1 | 2 | 3>
  subjects: Record<string, string[]>
  difficulty: Array<'Easy' | 'Medium' | 'Hard'>
}

export interface RevisionGenerateRequest {
  student_id: number
  term: 1 | 2 | 3
  subject: string
  topic: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  question_count: number
}

export interface RevisionQuestion {
  id: number
  question: string
  expected_answer: string
  marking_guide: string
  marks: number
  skill_tested: string
}

export interface RevisionAssessment {
  assessment_id: number
  student_id: number
  grade: 5 | 6 | 7
  term: 1 | 2 | 3
  subject: string
  topic: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  questions: RevisionQuestion[]
}

export interface RevisionAnswer {
  question_id: number
  answer: string
}

export interface RevisionResult {
  assessment_id: number
  score: number
  total_marks: number
  percentage: number
  overall_feedback: string
  weak_areas: string[]
  strengths: string[]
  recommendations: string[]
  marked_questions: Array<{
    question_id: number
    question: string
    student_answer: string
    expected_answer: string
    marks_awarded: number
    total_marks: number
    feedback: string
  }>
}

export interface LearnerPracticeOptions {
  learner_name: string
  grade: 5 | 6 | 7
  terms: Array<1 | 2 | 3>
  subjects: Array<{ name: string; strands: string[] }>
  difficulty: Array<'Easy' | 'Medium' | 'Hard'>
  question_counts: number[]
}

export interface LearnerPracticeGenerateRequest {
  request_id: string
  term: 1 | 2 | 3
  subject: string
  strand: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  question_count: number
}

export interface LearnerPracticeQuestion {
  id: number
  question: string
  marks: number
  skill_tested: string
  question_type: string
}

export interface LearnerPracticeAssessment {
  assessment_id: number
  grade: 5 | 6 | 7
  term: 1 | 2 | 3
  subject: string
  strand: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  status: 'ready'
  questions: LearnerPracticeQuestion[]
}

export interface CodingLessonRequest {
  grade: 5 | 6 | 7
  topic: string
  lesson_minutes: number
}

export interface CodingLesson {
  title: string
  explanation: string
  real_life_example: string
  activity: string
  quiz: string[]
  parent_notes: string
}

export interface SpiritualLessonRequest {
  grade: 5 | 6 | 7
  theme: string
  lesson_minutes: number
}

export interface SpiritualLesson {
  title: string
  bible_reference: string
  memory_verse_summary: string
  story_lesson: string
  reflection_questions: string[]
  practical_activity: string
  prayer: string
}

export interface ProgressSummary {
  student: Student
  attempts_count: number
  average_percentage: number | null
  recent_attempts: Array<{
    assessment_id: number
    date: string
    grade: number
    term: number
    subject: string
    topic: string
    has_answers: boolean
    is_marked: boolean
    status: string
    score: number | null
    total_marks: number | null
    percentage: number | null
  }>
  learning_interactions: unknown[]
}
