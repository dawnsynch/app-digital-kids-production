import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, apiClient } from '../api/client'
import type { LearnerPracticeAssessment, LearnerPracticeOptions, User } from '../api/types'
import { AuthProvider, useAuth } from '../auth/AuthContext'
import { PracticeProvider, usePractice } from './PracticeContext'

const learner: User = { id: 20, full_name: 'Amina', email: null, username: null, role: 'learner', parent_id: 10, student_id: 30, is_active: true, created_at: '2026-11-09T00:00:00Z' }
const options: LearnerPracticeOptions = { learner_name: 'Amina', grade: 5, terms: [1, 2, 3], subjects: [{ name: 'Mathematics', strands: ['Fractions'] }], difficulty: ['Easy', 'Medium', 'Hard'], question_counts: [5, 10] }
const assessment: LearnerPracticeAssessment = { assessment_id: 7, grade: 5, term: 1, subject: 'Mathematics', strand: 'Fractions', difficulty: 'Medium', status: 'ready', questions: [{ id: 1, question: 'Explain a half.', marks: 2, skill_tested: 'Fractions', question_type: 'text' }] }

function Harness() {
  const auth = useAuth()
  const practice = usePractice()
  return <div>
    <span data-testid="auth">{auth.user?.full_name || 'none'}</span>
    <span data-testid="options">{practice.options?.learner_name || 'none'}</span>
    <span data-testid="assessment">{practice.assessment?.assessment_id || 'none'}</span>
    <span data-testid="draft">{practice.drafts[1] || 'none'}</span>
    <span data-testid="loading">{String(practice.loading)}</span>
    <span role="alert">{practice.error}</span>
    <button onClick={() => void auth.redeemLearner('challenge', '246810')}>authenticate</button>
    <button onClick={() => void practice.loadOptions().catch(() => undefined)}>options</button>
    <button onClick={() => void practice.generate({ term: 1, subject: 'Mathematics', strand: 'Fractions', difficulty: 'Medium', question_count: 5 }).catch(() => undefined)}>generate</button>
    <button onClick={() => practice.setDraft(1, 'one half')}>draft</button>
    <button onClick={() => auth.logout()}>logout</button>
  </div>
}

function renderHarness() {
  return render(<AuthProvider><PracticeProvider><Harness /></PracticeProvider></AuthProvider>)
}

afterEach(() => {
  cleanup()
  apiClient.setAccessToken(null)
  vi.restoreAllMocks()
})

describe('PracticeProvider', () => {
  it('loads learner-scoped options, generates once and retains in-memory drafts', async () => {
    vi.spyOn(apiClient, 'redeemLearnerHandoff').mockResolvedValue({ access_token: 'learner-token', token_type: 'bearer', user: learner })
    vi.spyOn(apiClient, 'currentUser').mockResolvedValue(learner)
    vi.spyOn(apiClient, 'learnerPracticeOptions').mockResolvedValue(options)
    vi.spyOn(apiClient, 'generateLearnerPractice').mockResolvedValue(assessment)
    renderHarness()
    fireEvent.click(screen.getByRole('button', { name: 'authenticate' }))
    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('Amina'))
    fireEvent.click(screen.getByRole('button', { name: 'options' }))
    await waitFor(() => expect(screen.getByTestId('options')).toHaveTextContent('Amina'))
    fireEvent.click(screen.getByRole('button', { name: 'generate' }))
    await waitFor(() => expect(screen.getByTestId('assessment')).toHaveTextContent('7'))
    expect(apiClient.generateLearnerPractice).toHaveBeenCalledOnce()
    expect(apiClient.generateLearnerPractice).toHaveBeenCalledWith(expect.objectContaining({ request_id: expect.stringMatching(/^[a-zA-Z0-9_-]{16,64}$/) }))
    fireEvent.click(screen.getByRole('button', { name: 'draft' }))
    expect(screen.getByTestId('draft')).toHaveTextContent('one half')
  })

  it('shows a safe retryable failure and reuses the request id on retry', async () => {
    vi.spyOn(apiClient, 'generateLearnerPractice').mockRejectedValueOnce(new ApiError('provider details', 503)).mockResolvedValueOnce(assessment)
    renderHarness()
    fireEvent.click(screen.getByRole('button', { name: 'generate' }))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Questions could not be prepared safely'))
    const firstId = vi.mocked(apiClient.generateLearnerPractice).mock.calls[0][0].request_id
    fireEvent.click(screen.getByRole('button', { name: 'generate' }))
    await waitFor(() => expect(screen.getByTestId('assessment')).toHaveTextContent('7'))
    expect(vi.mocked(apiClient.generateLearnerPractice).mock.calls[1][0].request_id).toBe(firstId)
  })

  it('clears assessment and drafts when the authenticated identity logs out', async () => {
    vi.spyOn(apiClient, 'redeemLearnerHandoff').mockResolvedValue({ access_token: 'learner-token', token_type: 'bearer', user: learner })
    vi.spyOn(apiClient, 'currentUser').mockResolvedValue(learner)
    vi.spyOn(apiClient, 'generateLearnerPractice').mockResolvedValue(assessment)
    renderHarness()
    fireEvent.click(screen.getByRole('button', { name: 'authenticate' }))
    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('Amina'))
    fireEvent.click(screen.getByRole('button', { name: 'generate' }))
    await waitFor(() => expect(screen.getByTestId('assessment')).toHaveTextContent('7'))
    fireEvent.click(screen.getByRole('button', { name: 'draft' }))
    fireEvent.click(screen.getByRole('button', { name: 'logout' }))
    await waitFor(() => expect(screen.getByTestId('assessment')).toHaveTextContent('none'))
    expect(screen.getByTestId('draft')).toHaveTextContent('none')
  })
})
