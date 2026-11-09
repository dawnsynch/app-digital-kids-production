import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, apiClient } from '../api/client'
import type { User } from '../api/types'
import { AuthProvider, useAuth } from './AuthContext'

const parent: User = {
  id: 10,
  full_name: 'Test Parent',
  email: 'parent@example.com',
  username: null,
  role: 'parent',
  parent_id: null,
  student_id: null,
  is_active: true,
  created_at: '2026-11-09T00:00:00Z',
}
const learner: User = { ...parent, id: 11, full_name: 'Secure Learner', email: null, role: 'learner', parent_id: 10, student_id: 31 }

function Harness() {
  const { status, user, login, register, redeemLearner, logoutLearner, logout } = useAuth()
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="user">{user?.full_name || 'none'}</span>
      <button onClick={() => void login({ email: 'parent@example.com', password: 'password123' }).catch(() => undefined)}>login</button>
      <button onClick={() => void register({ full_name: 'Test Parent', email: 'parent@example.com', password: 'password123' }).catch(() => undefined)}>register</button>
      <button onClick={() => void redeemLearner('challenge', '246810').catch(() => undefined)}>redeem learner</button>
      <button onClick={() => void logoutLearner()}>logout learner</button>
      <button onClick={logout}>logout</button>
    </div>
  )
}

afterEach(() => {
  cleanup()
  apiClient.setAccessToken(null)
  vi.restoreAllMocks()
})

describe('AuthProvider', () => {
  it('verifies /auth/me before entering authenticated state and logs out in memory', async () => {
    let releaseIdentity: ((value: User) => void) | undefined
    vi.spyOn(apiClient, 'login').mockResolvedValue({ access_token: 'test-token', token_type: 'bearer', user: parent })
    vi.spyOn(apiClient, 'currentUser').mockImplementation(() => new Promise((resolve) => { releaseIdentity = resolve }))
    render(<AuthProvider><Harness /></AuthProvider>)

    fireEvent.click(screen.getByRole('button', { name: 'login' }))
    expect(screen.getByTestId('status')).toHaveTextContent('checking')
    await waitFor(() => expect(apiClient.currentUser).toHaveBeenCalledOnce())
    await act(async () => releaseIdentity?.(parent))
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'))
    expect(screen.getByTestId('user')).toHaveTextContent('Test Parent')

    fireEvent.click(screen.getByRole('button', { name: 'logout' }))
    expect(screen.getByTestId('status')).toHaveTextContent('anonymous')
    expect(screen.getByTestId('user')).toHaveTextContent('none')
  })

  it('registers through the same verified session path', async () => {
    vi.spyOn(apiClient, 'registerParent').mockResolvedValue({ access_token: 'registration-token', token_type: 'bearer', user: parent })
    vi.spyOn(apiClient, 'currentUser').mockResolvedValue(parent)
    render(<AuthProvider><Harness /></AuthProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'register' }))
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'))
    expect(apiClient.currentUser).toHaveBeenCalledOnce()
  })

  it('returns to anonymous state when identity verification fails', async () => {
    vi.spyOn(apiClient, 'login').mockResolvedValue({ access_token: 'bad-token', token_type: 'bearer', user: parent })
    vi.spyOn(apiClient, 'currentUser').mockRejectedValue(new ApiError('Invalid token', 401))
    render(<AuthProvider><Harness /></AuthProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'login' }))
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('anonymous'))
    expect(screen.getByTestId('user')).toHaveTextContent('none')
  })

  it('replaces the parent identity with a verified learner session and revokes it on logout', async () => {
    vi.spyOn(apiClient, 'redeemLearnerHandoff').mockResolvedValue({ access_token: 'learner-token', token_type: 'bearer', user: learner })
    vi.spyOn(apiClient, 'currentUser').mockResolvedValue(learner)
    vi.spyOn(apiClient, 'learnerLogout').mockResolvedValue(null)
    render(<AuthProvider><Harness /></AuthProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'redeem learner' }))
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('Secure Learner'))
    fireEvent.click(screen.getByRole('button', { name: 'logout learner' }))
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('anonymous'))
    expect(apiClient.learnerLogout).toHaveBeenCalledOnce()
  })
})
