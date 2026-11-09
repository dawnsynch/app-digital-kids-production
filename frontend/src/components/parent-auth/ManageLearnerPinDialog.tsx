import { useState, type FormEvent } from 'react'
import { ApiError, apiClient } from '../../api/client'
import type { Student } from '../../api/types'
import Modal from '../learner/Modal'
import AuthFeedback from './AuthFeedback'

type Props = {
  learner: Student
  onClose: () => void
  onSaved: (message: string) => void
}

export default function ManageLearnerPinDialog({ learner, onClose, onSaved }: Props) {
  const [parentPassword, setParentPassword] = useState('')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (!/^\d{6}$/.test(pin)) {
      setError('Enter a six-digit numeric PIN.')
      return
    }
    if (pin !== confirmPin) {
      setError('The PIN confirmation does not match.')
      return
    }
    setSubmitting(true)
    try {
      await apiClient.configureLearnerPin(learner.id, parentPassword, pin)
      onSaved(`${learner.name}'s learner PIN is ready. Previous learner sessions were signed out.`)
      onClose()
    } catch (requestError) {
      setError(requestError instanceof ApiError && requestError.status === 403
        ? 'Parent password verification failed.'
        : 'Learner access could not be updated. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const disable = async () => {
    setError('')
    if (!parentPassword) {
      setError('Enter your parent password before disabling learner access.')
      return
    }
    setSubmitting(true)
    try {
      await apiClient.disableLearnerPin(learner.id, parentPassword)
      onSaved(`${learner.name}'s learner access was disabled and active learner sessions were revoked.`)
      onClose()
    } catch (requestError) {
      setError(requestError instanceof ApiError && requestError.status === 403
        ? 'Parent password verification failed.'
        : 'Learner access could not be disabled.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title={`Manage ${learner.name}'s PIN`} onClose={onClose}>
      <AuthFeedback>PIN changes require your parent password. The PIN is sent only to the API and is never saved in this browser.</AuthFeedback>
      <form className="learner-profile-form" onSubmit={submit} noValidate>
        <label>
          <span>Parent password</span>
          <input type="password" value={parentPassword} onChange={(event) => setParentPassword(event.target.value)} autoComplete="current-password" />
        </label>
        <label>
          <span>New six-digit learner PIN</span>
          <input type="password" inputMode="numeric" maxLength={6} value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 6))} autoComplete="new-password" />
        </label>
        <label>
          <span>Confirm learner PIN</span>
          <input type="password" inputMode="numeric" maxLength={6} value={confirmPin} onChange={(event) => setConfirmPin(event.target.value.replace(/\D/g, '').slice(0, 6))} autoComplete="new-password" />
        </label>
        {error ? <AuthFeedback tone="error">{error}</AuthFeedback> : null}
        <button type="submit" className="parent-auth-button" disabled={submitting || !parentPassword}>{submitting ? 'Updating Access…' : 'Set or Reset PIN'}</button>
        <button type="button" className="learner-pin-disable" disabled={submitting} onClick={() => void disable()}>Disable Learner Access</button>
      </form>
    </Modal>
  )
}
