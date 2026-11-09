import { useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRightIcon } from '../components/icons/Icons'
import AuthCard from '../components/parent-auth/AuthCard'
import AuthFeedback from '../components/parent-auth/AuthFeedback'
import { DEMO_LEARNERS, DEMO_PARENT } from '../data/parentAuth'
import { useLearnerSelection } from '../learners/LearnerSelectionContext'

export default function LearnerPinPage() {
  const [searchParams] = useSearchParams()
  const learnerId = searchParams.get('learner') || 'amina'
  const { selectedLearner } = useLearnerSelection()
  const selectedMatchesRoute = selectedLearner?.id === Number(learnerId)
  const demoLearner = DEMO_LEARNERS.find((item) => item.id === learnerId) || DEMO_LEARNERS[0]
  const learner = selectedMatchesRoute
    ? { name: selectedLearner.name, image: '/assets/girl-hero.png' }
    : demoLearner
  const [digits, setDigits] = useState(['', '', '', ''])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const inputs = useRef<Array<HTMLInputElement | null>>([])
  const navigate = useNavigate()

  const changeDigit = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, '').slice(-1)
    setDigits((current) => current.map((digit, digitIndex) => digitIndex === index ? value : digit))
    setError('')
    if (value && index < 3) inputs.current[index + 1]?.focus()
  }

  const handleKey = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) inputs.current[index - 1]?.focus()
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (digits.join('') !== DEMO_PARENT.pin) {
      setError('That demo PIN is not correct. Use 1234.')
      return
    }
    setNotice('Learner PIN authentication is not available in Phase 1B. No token or learner session was created.')
  }

  return (
    <AuthCard title={`Hi ${learner.name}! 👋`} subtitle="This screen preserves the future learner PIN design without granting access." hero={<div className="learner-pin-avatar"><img src={learner.image} alt={learner.name} /></div>} compact>
      <AuthFeedback><strong>Preview only.</strong> PIN values are not stored, verified by the backend, or exchanged for learner access.</AuthFeedback>
      <form className="learner-pin-form" onSubmit={submit}>
        <fieldset>
          <legend className="sr-only">Four-digit learning PIN</legend>
          <div className="learner-pin-fields">
            {digits.map((digit, index) => <input key={index} ref={(element) => { inputs.current[index] = element }} value={digit} onChange={(event) => changeDigit(index, event)} onKeyDown={(event) => handleKey(index, event)} inputMode="numeric" autoComplete="one-time-code" maxLength={1} aria-label={`PIN digit ${index + 1}`} aria-invalid={Boolean(error)} />)}
          </div>
        </fieldset>
        {error ? <AuthFeedback tone="error">{error}</AuthFeedback> : null}
        {notice ? <AuthFeedback tone="success">{notice}</AuthFeedback> : null}
        <button type="submit" className="parent-auth-button">Preview PIN Check <ArrowRightIcon size={18} /></button>
      </form>
      <button type="button" className="learner-pin-switch" onClick={() => navigate('/parent/select-learner')}>⇄ Switch Learner</button>
      <div className="learner-pin-kito"><img src="/assets/kito-sidebar.png" alt="Kito" /><p>Ready to learn?<br /><strong>Let’s go! 🚀</strong></p></div>
    </AuthCard>
  )
}
