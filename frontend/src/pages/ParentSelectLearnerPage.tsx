import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { Student } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import AuthCard from '../components/parent-auth/AuthCard'
import AuthFeedback from '../components/parent-auth/AuthFeedback'
import LearnerProfileDialog from '../components/parent-auth/LearnerProfileDialog'
import { ArrowRightIcon, GearIcon } from '../components/icons/Icons'
import { useLearnerSelection } from '../learners/LearnerSelectionContext'

type DialogState = { mode: 'create' } | { mode: 'view' | 'edit'; learner: Student } | null

const learnerImages = ['/assets/girl-hero.png', '/assets/illus-science.png'] as const

export default function ParentSelectLearnerPage() {
  const [feedback, setFeedback] = useState('')
  const [dialog, setDialog] = useState<DialogState>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const {
    learners,
    selectedLearner,
    status,
    error,
    refreshLearners,
    createLearner,
    updateLearner,
    selectLearner,
  } = useLearnerSelection()
  const registrationSuccess = Boolean((location.state as { registrationSuccess?: boolean } | null)?.registrationSuccess)

  useEffect(() => {
    void refreshLearners()
  }, [refreshLearners])

  const signOut = () => {
    logout()
    navigate('/parent/sign-in', { replace: true, state: { signedOut: true } })
  }

  const continueAs = (learner: Student) => {
    if (!selectLearner(learner.id)) {
      setFeedback('This learner is no longer available. Refresh the list and try again.')
      return
    }
    navigate(`/learner/pin?learner=${learner.id}`)
  }

  return (
    <AuthCard title="Who’s Learning Today?" subtitle="Choose or manage a learner profile." icon="👥">
      {registrationSuccess ? <AuthFeedback tone="success">Your parent account was created and verified successfully.</AuthFeedback> : null}
      <AuthFeedback>Signed in as <strong>{user?.full_name}</strong>. Learner profiles are loaded securely from your account.</AuthFeedback>
      <button type="button" className="parent-auth-signout" onClick={signOut}>Sign Out</button>

      {status === 'loading' || status === 'idle' ? <div className="learner-list-state" role="status"><span className="learner-list-spinner" />Loading learner profiles…</div> : null}
      {status === 'error' ? (
        <div className="learner-list-state learner-list-state--error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => void refreshLearners()}>Retry</button>
        </div>
      ) : null}
      {status === 'ready' && learners.length === 0 ? (
        <div className="learner-empty-state">
          <span aria-hidden="true">🌱</span>
          <h2>No learners yet</h2>
          <p>Create your first learner profile to begin the parent-managed journey.</p>
          <button type="button" className="parent-auth-button" onClick={() => setDialog({ mode: 'create' })}>Add Your First Learner</button>
        </div>
      ) : null}
      {status === 'ready' && learners.length > 0 ? (
        <div className="learner-choice-grid">
          {learners.map((learner, index) => (
            <article className={`learner-choice learner-choice--${index % 2 ? 'green' : 'yellow'}${selectedLearner?.id === learner.id ? ' is-selected' : ''}`} key={learner.id}>
              <img src={learnerImages[index % learnerImages.length]} alt="" />
              <h2>{learner.name}</h2>
              <p>Grade {learner.grade}</p>
              <strong>{learner.age_group ? `Age group ${learner.age_group}` : 'Age group not provided'}</strong>
              {selectedLearner?.id === learner.id ? <small>✓ Selected learner</small> : <small>Parent-managed profile</small>}
              <button type="button" className="parent-auth-button" onClick={() => continueAs(learner)}>Continue as {learner.name} <ArrowRightIcon size={17} /></button>
              <div className="learner-choice__manage">
                <button type="button" onClick={() => setDialog({ mode: 'view', learner })}>View details</button>
                <button type="button" onClick={() => setDialog({ mode: 'edit', learner })}>Edit</button>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      <div className="parent-entry-actions">
        <button type="button" onClick={() => setDialog({ mode: 'create' })}><span>＋</span><strong>Add Learner</strong><small>Create a learner profile</small></button>
        <button type="button" onClick={() => setFeedback('The full Parent Dashboard remains outside Phase 1B.')}><GearIcon size={30} /><strong>Parent Dashboard</strong><small>Manage learners, progress and settings</small></button>
      </div>
      {feedback ? <AuthFeedback>{feedback}</AuthFeedback> : null}

      {dialog ? (
        <LearnerProfileDialog
          mode={dialog.mode}
          learner={'learner' in dialog ? dialog.learner : undefined}
          onClose={() => setDialog(null)}
          onCreate={async (payload) => {
            const learner = await createLearner(payload)
            setFeedback(`${learner.name} was added successfully.`)
          }}
          onUpdate={async (studentId, payload) => {
            const learner = await updateLearner(studentId, payload)
            setFeedback(`${learner.name}'s profile was updated.`)
          }}
          onEdit={() => dialog && 'learner' in dialog && setDialog({ mode: 'edit', learner: dialog.learner })}
        />
      ) : null}
    </AuthCard>
  )
}
