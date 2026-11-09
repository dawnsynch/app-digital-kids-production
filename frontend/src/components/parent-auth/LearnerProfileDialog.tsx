import { useState, type FormEvent } from 'react'
import type { Student, StudentCreate, StudentUpdate } from '../../api/types'
import { learnerRequestError } from '../../learners/LearnerSelectionContext'
import Modal from '../learner/Modal'
import AuthFeedback from './AuthFeedback'

type Props = {
  mode: 'create' | 'view' | 'edit'
  learner?: Student
  onClose: () => void
  onCreate: (payload: StudentCreate) => Promise<unknown>
  onUpdate: (studentId: number, payload: StudentUpdate) => Promise<unknown>
  onEdit: () => void
}

export default function LearnerProfileDialog({ mode, learner, onClose, onCreate, onUpdate, onEdit }: Props) {
  const [name, setName] = useState(learner?.name ?? '')
  const [grade, setGrade] = useState<5 | 6 | 7>(learner?.grade ?? 5)
  const [ageGroup, setAgeGroup] = useState(learner?.age_group ?? '')
  const [errors, setErrors] = useState<{ name?: string; ageGroup?: string; form?: string }>({})
  const [submitting, setSubmitting] = useState(false)

  if (mode === 'view' && learner) {
    return (
      <Modal title="Learner Details" onClose={onClose}>
        <dl className="learner-profile-details">
          <div><dt>Name</dt><dd>{learner.name}</dd></div>
          <div><dt>Grade</dt><dd>Grade {learner.grade}</dd></div>
          <div><dt>Age group</dt><dd>{learner.age_group || 'Not provided'}</dd></div>
          <div><dt>Profile ID</dt><dd>{learner.id}</dd></div>
        </dl>
        <AuthFeedback>Learner selection is not authentication. PIN access remains unavailable in Phase 1B.</AuthFeedback>
        <button type="button" className="parent-auth-button learner-profile-dialog__action" onClick={onEdit}>Edit Learner</button>
      </Modal>
    )
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const nextErrors: typeof errors = {}
    if (name.trim().length < 2) nextErrors.name = 'Enter at least 2 characters for the learner name.'
    if (ageGroup.trim().length > 50) nextErrors.ageGroup = 'Use no more than 50 characters.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    try {
      const payload = { name: name.trim(), grade, age_group: ageGroup.trim() || null }
      if (mode === 'edit' && learner) await onUpdate(learner.id, payload)
      else await onCreate({ name: payload.name, grade: payload.grade, age_group: payload.age_group || undefined })
      onClose()
    } catch (error) {
      setErrors({ form: learnerRequestError(error, `We could not ${mode === 'edit' ? 'update' : 'create'} this learner.`) })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title={mode === 'edit' ? 'Edit Learner' : 'Add Learner'} onClose={onClose}>
      <form className="learner-profile-form" onSubmit={submit} noValidate>
        <label>
          <span>Learner name</span>
          <input value={name} onChange={(event) => setName(event.target.value)} aria-invalid={Boolean(errors.name)} autoComplete="off" />
          {errors.name ? <small role="alert">{errors.name}</small> : null}
        </label>
        <label>
          <span>CBC grade</span>
          <select value={grade} onChange={(event) => setGrade(Number(event.target.value) as 5 | 6 | 7)}>
            <option value={5}>Grade 5</option>
            <option value={6}>Grade 6</option>
            <option value={7}>Grade 7</option>
          </select>
        </label>
        <label>
          <span>Age group <em>Optional</em></span>
          <input value={ageGroup} onChange={(event) => setAgeGroup(event.target.value)} aria-invalid={Boolean(errors.ageGroup)} placeholder="e.g. 10-12" />
          {errors.ageGroup ? <small role="alert">{errors.ageGroup}</small> : null}
        </label>
        {errors.form ? <AuthFeedback tone="error">{errors.form}</AuthFeedback> : null}
        <button type="submit" className="parent-auth-button" disabled={submitting}>{submitting ? 'Saving Learner…' : mode === 'edit' ? 'Save Changes' : 'Create Learner'}</button>
      </form>
    </Modal>
  )
}
