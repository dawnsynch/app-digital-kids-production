import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowRightIcon, GearIcon } from '../components/icons/Icons'
import AuthCard from '../components/parent-auth/AuthCard'
import AuthFeedback from '../components/parent-auth/AuthFeedback'
import { DEMO_LEARNERS } from '../data/parentAuth'
import { useAuth } from '../auth/AuthContext'

export default function ParentSelectLearnerPage() {
  const [feedback, setFeedback] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const registrationSuccess = Boolean((location.state as { registrationSuccess?: boolean } | null)?.registrationSuccess)

  const signOut = () => {
    logout()
    navigate('/parent/sign-in', { replace: true, state: { signedOut: true } })
  }

  return (
    <AuthCard title="Who’s Learning Today?" subtitle="Choose a learner to continue." icon="👥">
      {registrationSuccess ? <AuthFeedback tone="success">Your parent account was created and verified successfully.</AuthFeedback> : null}
      <AuthFeedback>Signed in as <strong>{user?.full_name}</strong>. Learner profiles remain development previews until Phase 1B.</AuthFeedback>
      <button type="button" className="parent-auth-signout" onClick={signOut}>Sign Out</button>
      <div className="learner-choice-grid">
        {DEMO_LEARNERS.map((learner) => (
          <article className={`learner-choice learner-choice--${learner.tone}`} key={learner.id}>
            <img src={learner.image} alt="" />
            <h2>{learner.name}</h2><p>{learner.grade}</p><strong>🔥 {learner.streak}</strong><small>📖 {learner.subject}</small>
            <button type="button" className="parent-auth-button" onClick={() => navigate(`/learner/pin?learner=${learner.id}`)}>Continue as {learner.name} <ArrowRightIcon size={17} /></button>
          </article>
        ))}
      </div>
      <div className="parent-entry-actions">
        <button type="button" onClick={() => setFeedback('Adding a learner requires a connected parent account and learner-profile service.')}><span>＋</span><strong>Add Learner</strong><small>Create a new learner profile</small></button>
        <button type="button" onClick={() => setFeedback('The full Parent Dashboard belongs to Phase 2C and is not implemented here.')}><GearIcon size={30} /><strong>Parent Dashboard</strong><small>Manage learners, progress and settings</small></button>
      </div>
      {feedback ? <AuthFeedback>{feedback}</AuthFeedback> : null}
    </AuthCard>
  )
}
