import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, apiClient } from '../api/client'
import type { Student, User } from '../api/types'
import { AuthProvider, useAuth } from '../auth/AuthContext'
import { LearnerSelectionProvider, LearnerSessionBoundary, useLearnerSelection } from './LearnerSelectionContext'

const parent: User = {
  id: 21, full_name: 'Learner Parent', email: 'learner-parent@example.com', username: null,
  role: 'parent', parent_id: null, student_id: null, is_active: true, created_at: '2026-11-09T00:00:00Z',
}

const learner: Student = {
  id: 31, parent_id: parent.id, name: 'Amina', grade: 5, age_group: '10-12', created_at: '2026-11-09T00:00:00Z',
}

function LearnerHarness() {
  const { learners, selectedLearner, status, error, refreshLearners, createLearner, updateLearner, selectLearner } = useLearnerSelection()
  return (
    <div>
      <span data-testid="learner-status">{status}</span>
      <span data-testid="learner-count">{learners.length}</span>
      <span data-testid="selected">{selectedLearner?.name || 'none'}</span>
      <span data-testid="learner-error">{error}</span>
      <button onClick={() => void refreshLearners()}>load learners</button>
      <button onClick={() => void createLearner({ name: 'Amina', grade: 5, age_group: '10-12' })}>create learner</button>
      <button onClick={() => void updateLearner(learner.id, { name: 'Amina Updated' })}>update learner</button>
      <button onClick={() => selectLearner(learner.id)}>select learner</button>
    </div>
  )
}

function SessionHarness() {
  const { user, login, logout } = useAuth()
  return (
    <>
      <span data-testid="auth-user">{user?.full_name || 'none'}</span>
      <button onClick={() => void login({ email: parent.email!, password: 'password123' })}>login parent</button>
      <button onClick={logout}>logout parent</button>
      <LearnerHarness />
    </>
  )
}

afterEach(() => {
  cleanup()
  apiClient.setAccessToken(null)
})

describe('LearnerSelectionProvider', () => {
  it('exposes loading and empty states', async () => {
    let release: ((value: Student[]) => void) | undefined
    vi.spyOn(apiClient, 'listStudents').mockImplementation(() => new Promise((resolve) => { release = resolve }))
    render(<LearnerSelectionProvider><LearnerHarness /></LearnerSelectionProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'load learners' }))
    expect(screen.getByTestId('learner-status')).toHaveTextContent('loading')
    await act(async () => release?.([]))
    await waitFor(() => expect(screen.getByTestId('learner-status')).toHaveTextContent('ready'))
    expect(screen.getByTestId('learner-count')).toHaveTextContent('0')
  })

  it('creates, updates, and selects only learners in the authorized list', async () => {
    vi.spyOn(apiClient, 'createStudent').mockResolvedValue(learner)
    vi.spyOn(apiClient, 'updateStudent').mockResolvedValue({ ...learner, name: 'Amina Updated' })
    render(<LearnerSelectionProvider><LearnerHarness /></LearnerSelectionProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'select learner' }))
    expect(screen.getByTestId('selected')).toHaveTextContent('none')
    fireEvent.click(screen.getByRole('button', { name: 'create learner' }))
    await waitFor(() => expect(screen.getByTestId('learner-count')).toHaveTextContent('1'))
    fireEvent.click(screen.getByRole('button', { name: 'select learner' }))
    expect(screen.getByTestId('selected')).toHaveTextContent('Amina')
    fireEvent.click(screen.getByRole('button', { name: 'update learner' }))
    await waitFor(() => expect(screen.getByTestId('selected')).toHaveTextContent('Amina Updated'))
  })

  it('shows backend failures, retries, and clears selection when identity logs out', async () => {
    vi.spyOn(apiClient, 'login').mockResolvedValue({ access_token: 'parent-token', token_type: 'bearer', user: parent })
    vi.spyOn(apiClient, 'currentUser').mockResolvedValue(parent)
    vi.spyOn(apiClient, 'listStudents')
      .mockRejectedValueOnce(new ApiError('Unavailable', 500))
      .mockResolvedValue([learner])
    render(<AuthProvider><LearnerSessionBoundary><SessionHarness /></LearnerSessionBoundary></AuthProvider>)

    fireEvent.click(screen.getByRole('button', { name: 'login parent' }))
    await waitFor(() => expect(screen.getByTestId('auth-user')).toHaveTextContent(parent.full_name))
    fireEvent.click(screen.getByRole('button', { name: 'load learners' }))
    await waitFor(() => expect(screen.getByTestId('learner-status')).toHaveTextContent('error'))
    expect(screen.getByTestId('learner-error')).toHaveTextContent('We could not load learner profiles.')
    fireEvent.click(screen.getByRole('button', { name: 'load learners' }))
    await waitFor(() => expect(screen.getByTestId('learner-count')).toHaveTextContent('1'))
    fireEvent.click(screen.getByRole('button', { name: 'select learner' }))
    expect(screen.getByTestId('selected')).toHaveTextContent('Amina')
    fireEvent.click(screen.getByRole('button', { name: 'logout parent' }))
    expect(screen.getByTestId('selected')).toHaveTextContent('none')
  })
})
