import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ApiError, apiClient } from '../api/client'
import type { LearnerPracticeAssessment, LearnerPracticeGenerateRequest, LearnerPracticeOptions, LearnerReleasedFeedback, LearnerSubmissionReceipt } from '../api/types'
import { useAuth } from '../auth/AuthContext'

type PracticeContextValue = {
  options: LearnerPracticeOptions | null
  assessment: LearnerPracticeAssessment | null
  receipt: LearnerSubmissionReceipt | null
  feedback: LearnerReleasedFeedback | null
  drafts: Record<number, string>
  loading: boolean
  error: string
  loadOptions: () => Promise<LearnerPracticeOptions>
  generate: (payload: Omit<LearnerPracticeGenerateRequest, 'request_id'>) => Promise<LearnerPracticeAssessment>
  loadAssessment: (assessmentId: number) => Promise<LearnerPracticeAssessment>
  submitAssessment: (assessmentId: number) => Promise<LearnerSubmissionReceipt>
  loadFeedback: (assessmentId: number) => Promise<LearnerReleasedFeedback>
  setDraft: (questionId: number, answer: string) => void
  clear: () => void
}

const PracticeContext = createContext<PracticeContextValue | null>(null)

function friendlyError(error: unknown) {
  if (!(error instanceof ApiError)) return 'Practice is unavailable. Check your connection and try again.'
  if (error.status === 401) return 'Your learner session has expired. Please sign in again.'
  if (error.status === 429) return 'You have reached the practice generation limit. Please try again later.'
  if (error.status === 503) return 'Questions could not be prepared safely. Please try again.'
  return error.status >= 500 ? 'Practice is temporarily unavailable. Please try again.' : error.message
}

export function PracticeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const identity = user?.role === 'learner' ? `${user.id}:${user.student_id}` : 'anonymous'
  const [options, setOptions] = useState<LearnerPracticeOptions | null>(null)
  const [assessment, setAssessment] = useState<LearnerPracticeAssessment | null>(null)
  const [receipt, setReceipt] = useState<LearnerSubmissionReceipt | null>(null)
  const [feedback, setFeedback] = useState<LearnerReleasedFeedback | null>(null)
  const [drafts, setDrafts] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const requestId = useRef<string | null>(null)
  const submissionRequestId = useRef<string | null>(null)

  const clear = useCallback(() => {
    setOptions(null)
    setAssessment(null)
    setReceipt(null)
    setFeedback(null)
    setDrafts({})
    setError('')
    requestId.current = null
    submissionRequestId.current = null
  }, [])

  useEffect(() => clear(), [identity, clear])

  const loadOptions = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const value = await apiClient.learnerPracticeOptions()
      setOptions(value)
      return value
    } catch (caught) {
      const message = friendlyError(caught)
      setError(message)
      throw caught
    } finally {
      setLoading(false)
    }
  }, [])

  const generate = useCallback(async (payload: Omit<LearnerPracticeGenerateRequest, 'request_id'>) => {
    if (loading) throw new Error('Practice generation is already in progress')
    requestId.current ||= crypto.randomUUID().replace(/-/g, '')
    const idempotencyKey = requestId.current
    setLoading(true)
    setError('')
    try {
      const value = await apiClient.generateLearnerPractice({ ...payload, request_id: idempotencyKey })
      setAssessment(value)
      setDrafts({})
      setReceipt(null)
      setFeedback(null)
      requestId.current = null
      return value
    } catch (caught) {
      setError(friendlyError(caught))
      throw caught
    } finally {
      setLoading(false)
    }
  }, [loading])

  const loadAssessment = useCallback(async (assessmentId: number) => {
    setLoading(true)
    setError('')
    try {
      const value = await apiClient.learnerPracticeAssessment(assessmentId)
      setAssessment(value)
      if (value.answers) setDrafts(Object.fromEntries(value.answers.map((item) => [item.question_id, item.answer])))
      return value
    } catch (caught) {
      setError(friendlyError(caught))
      throw caught
    } finally {
      setLoading(false)
    }
  }, [])

  const submitAssessment = useCallback(async (assessmentId: number) => {
    if (!assessment || assessment.assessment_id !== assessmentId) throw new Error('Assessment is not loaded')
    submissionRequestId.current ||= crypto.randomUUID().replace(/-/g, '')
    const requestKey = submissionRequestId.current
    const answers = assessment.questions.map((question) => ({ question_id: question.id, answer: drafts[question.id] || '' }))
    setLoading(true)
    setError('')
    try {
      const value = await apiClient.submitLearnerAssessment(assessmentId, requestKey, answers)
      setReceipt(value)
      setAssessment((current) => current ? { ...current, status: 'submitted', answers, submitted_at: value.submitted_at } : current)
      submissionRequestId.current = null
      return value
    } catch (caught) {
      const message = caught instanceof ApiError && caught.status === 503
        ? 'Answers could not be submitted safely. Please retry.'
        : friendlyError(caught)
      setError(message)
      throw caught
    } finally {
      setLoading(false)
    }
  }, [assessment, drafts])

  const loadFeedback = useCallback(async (assessmentId: number) => {
    setLoading(true)
    setError('')
    try {
      const value = await apiClient.learnerReleasedFeedback(assessmentId)
      setFeedback(value)
      return value
    } catch (caught) {
      setError(friendlyError(caught))
      throw caught
    } finally {
      setLoading(false)
    }
  }, [])

  const setDraft = useCallback((questionId: number, answer: string) => {
    setDrafts((current) => ({ ...current, [questionId]: answer }))
  }, [])

  const value = useMemo(() => ({
    options, assessment, receipt, feedback, drafts, loading, error, loadOptions, generate, loadAssessment,
    submitAssessment, loadFeedback, setDraft, clear,
  }), [options, assessment, receipt, feedback, drafts, loading, error, loadOptions, generate, loadAssessment, submitAssessment, loadFeedback, setDraft, clear])

  return <PracticeContext.Provider value={value}>{children}</PracticeContext.Provider>
}

export function usePractice() {
  const value = useContext(PracticeContext)
  if (!value) throw new Error('usePractice must be used inside <PracticeProvider>')
  return value
}
