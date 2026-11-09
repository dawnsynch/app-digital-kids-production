import { Navigate, Outlet, useLocation } from 'react-router-dom'
import AuthCard from '../components/parent-auth/AuthCard'
import AuthFeedback from '../components/parent-auth/AuthFeedback'
import { useAuth } from './AuthContext'

export function ParentRoute() {
  const { status, user, logout } = useAuth()
  const location = useLocation()

  if (status === 'checking') {
    return <AuthCard title="Checking your account…" subtitle="Securely verifying your parent session." compact><AuthFeedback>Please wait.</AuthFeedback></AuthCard>
  }
  if (status === 'anonymous') {
    return <Navigate to="/parent/sign-in" replace state={{ from: location.pathname, sessionRequired: true }} />
  }
  if (user?.role !== 'parent') {
    return (
      <AuthCard title="Parent access required" subtitle="This area is available only to parent and guardian accounts." compact>
        <AuthFeedback tone="error">Your authenticated account does not have the parent role.</AuthFeedback>
        <button type="button" className="parent-auth-button" onClick={logout}>Sign Out</button>
      </AuthCard>
    )
  }
  return <Outlet />
}

export function PublicParentRoute() {
  const { status, user } = useAuth()
  if (status === 'authenticated' && user?.role === 'parent') return <Navigate to="/parent/select-learner" replace />
  return <Outlet />
}

export function LearnerRoute() {
  const { status, user } = useAuth()
  const location = useLocation()
  if (status !== 'authenticated') {
    return <Navigate to="/parent/sign-in" replace state={{ sessionRequired: true, from: location.pathname }} />
  }
  if (user?.role !== 'learner') {
    return <Navigate to="/parent/select-learner" replace />
  }
  return <Outlet />
}
