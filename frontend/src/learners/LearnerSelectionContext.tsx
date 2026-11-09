import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { ApiError, apiClient } from '../api/client'
import type { Student, StudentCreate, StudentUpdate } from '../api/types'
import { useAuth } from '../auth/AuthContext'

export type LearnerListStatus = 'idle' | 'loading' | 'ready' | 'error'

type LearnerSelectionValue = {
  learners: Student[]
  selectedLearner: Student | null
  status: LearnerListStatus
  error: string
  refreshLearners: () => Promise<void>
  createLearner: (payload: StudentCreate) => Promise<Student>
  updateLearner: (studentId: number, payload: StudentUpdate) => Promise<Student>
  selectLearner: (studentId: number) => boolean
}

const LearnerSelectionContext = createContext<LearnerSelectionValue | null>(null)

export function LearnerSelectionProvider({ children }: { children: ReactNode }) {
  const [learners, setLearners] = useState<Student[]>([])
  const [selectedLearnerId, setSelectedLearnerId] = useState<number | null>(null)
  const [status, setStatus] = useState<LearnerListStatus>('idle')
  const [error, setError] = useState('')
  const refreshPromise = useRef<Promise<void> | null>(null)

  const refreshLearners = useCallback(() => {
    if (refreshPromise.current) return refreshPromise.current
    const request = (async () => {
      setStatus('loading')
      setError('')
      try {
        const nextLearners = await apiClient.listStudents()
        setLearners(nextLearners)
        setSelectedLearnerId((current) => current !== null && nextLearners.some((item) => item.id === current) ? current : null)
        setStatus('ready')
      } catch (requestError) {
        setStatus('error')
        setError(learnerRequestError(requestError, 'We could not load learner profiles.'))
      }
    })().finally(() => {
      refreshPromise.current = null
    })
    refreshPromise.current = request
    return request
  }, [])

  const createLearner = useCallback(async (payload: StudentCreate) => {
    const learner = await apiClient.createStudent(payload)
    setLearners((current) => [learner, ...current.filter((item) => item.id !== learner.id)])
    setStatus('ready')
    return learner
  }, [])

  const updateLearner = useCallback(async (studentId: number, payload: StudentUpdate) => {
    const learner = await apiClient.updateStudent(studentId, payload)
    setLearners((current) => current.map((item) => item.id === learner.id ? learner : item))
    return learner
  }, [])

  const selectLearner = useCallback((studentId: number) => {
    if (!learners.some((learner) => learner.id === studentId)) {
      setSelectedLearnerId(null)
      return false
    }
    setSelectedLearnerId(studentId)
    return true
  }, [learners])

  const selectedLearner = learners.find((learner) => learner.id === selectedLearnerId) ?? null
  const value = useMemo(
    () => ({ learners, selectedLearner, status, error, refreshLearners, createLearner, updateLearner, selectLearner }),
    [learners, selectedLearner, status, error, refreshLearners, createLearner, updateLearner, selectLearner],
  )

  return <LearnerSelectionContext.Provider value={value}>{children}</LearnerSelectionContext.Provider>
}

export function LearnerSessionBoundary({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const identityKey = user ? `${user.id}:${user.role}` : 'anonymous'
  return <LearnerSelectionProvider key={identityKey}>{children}</LearnerSelectionProvider>
}

export function useLearnerSelection() {
  const value = useContext(LearnerSelectionContext)
  if (!value) throw new Error('useLearnerSelection must be used inside <LearnerSelectionProvider>')
  return value
}

export function learnerRequestError(error: unknown, fallback: string) {
  if (!(error instanceof ApiError)) return 'The service is unavailable. Check your connection and try again.'
  if (error.status === 401) return 'Your parent session has expired. Please sign in again.'
  if (error.status === 403 || error.status === 404) return 'This learner profile is not available to your account.'
  if (error.status === 422) return 'Please check the learner details and try again.'
  return fallback
}
