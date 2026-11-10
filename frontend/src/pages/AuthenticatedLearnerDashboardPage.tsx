import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../api/client'
import type { LearnerIdentity } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import Dashboard from '../components/desktop/Dashboard'

export default function AuthenticatedLearnerDashboardPage() {
  const [identity, setIdentity] = useState<LearnerIdentity | null>(null)
  const [error, setError] = useState('')
  const { logoutLearner } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    apiClient.learnerIdentity()
      .then((value) => { if (active) setIdentity(value) })
      .catch(() => { if (active) setError('Learner identity could not be verified.') })
    return () => { active = false }
  }, [])

  const signOut = async () => {
    await logoutLearner()
    navigate('/parent/sign-in', { replace: true, state: { learnerSignedOut: true } })
  }

  return (
    <>
      <section className="learner-session-banner" aria-live="polite">
        {identity ? (
          <div>
            <span>Verified learner session</span>
            <strong>{identity.learner.name} · Grade {identity.learner.grade}</strong>
            <small>Practice, Subjects and Mathematics are connected to your secure learner session.</small>
          </div>
        ) : <span>{error || 'Verifying learner identity…'}</span>}
        <button type="button" onClick={() => void signOut()}>Learner Sign Out</button>
      </section>
      <Dashboard />
    </>
  )
}
