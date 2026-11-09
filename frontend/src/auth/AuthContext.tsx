import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ApiError, apiClient } from '../api/client'
import type { LoginCredentials, ParentRegistration, User } from '../api/types'

export type AuthenticationStatus = 'anonymous' | 'checking' | 'authenticated'

type AuthContextValue = {
  status: AuthenticationStatus
  user: User | null
  login: (credentials: LoginCredentials) => Promise<User>
  register: (registration: ParentRegistration) => Promise<User>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthenticationStatus>('anonymous')
  const [user, setUser] = useState<User | null>(null)

  const clearSession = useCallback(() => {
    apiClient.setAccessToken(null)
    setUser(null)
    setStatus('anonymous')
  }, [])

  useEffect(() => {
    apiClient.setAuthenticationFailureHandler(clearSession)
    return () => apiClient.setAuthenticationFailureHandler(null)
  }, [clearSession])

  const establishSession = useCallback(async (operation: () => Promise<{ access_token: string }>) => {
    setStatus('checking')
    try {
      const token = await operation()
      apiClient.setAccessToken(token.access_token)
      const verifiedUser = await apiClient.currentUser()
      setUser(verifiedUser)
      setStatus('authenticated')
      return verifiedUser
    } catch (error) {
      clearSession()
      throw error
    }
  }, [clearSession])

  const login = useCallback(
    (credentials: LoginCredentials) => establishSession(() => apiClient.login(credentials)),
    [establishSession],
  )

  const register = useCallback(
    (registration: ParentRegistration) => establishSession(() => apiClient.registerParent(registration)),
    [establishSession],
  )

  const value = useMemo(() => ({ status, user, login, register, logout: clearSession }), [status, user, login, register, clearSession])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>')
  return value
}

export function authenticationErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof ApiError)) return 'The service is unavailable. Check your connection and try again.'
  if (error.status === 401) return 'The email or password is incorrect.'
  if (error.status === 403) return 'This account does not have permission to use the parent area.'
  if (error.status === 400 && /already exists/i.test(error.message)) return 'An account with this email already exists. Try signing in instead.'
  if (error.status === 422) return 'Please check the information entered and try again.'
  return fallback
}
