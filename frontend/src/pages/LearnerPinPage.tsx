import { useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRightIcon } from '../components/icons/Icons'
import AuthCard from '../components/parent-auth/AuthCard'
import AuthFeedback from '../components/parent-auth/AuthFeedback'
import { useUI } from '../components/ui/UIContext'
import { DEMO_LEARNERS, DEMO_PARENT } from '../data/parentAuth'

export default function LearnerPinPage() {
  const [searchParams] = useSearchParams()
  const learnerId = searchParams.get('learner') || 'amina'
  const learner = DEMO_LEARNERS.find((item) => item.id === learnerId) || DEMO_LEARNERS[0]
  const [digits, setDigits] = useState(['', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputs = useRef<Array<HTMLInputElement | null>>([])
  const navigate = useNavigate()
  const { notify } = useUI()

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
    setLoading(true)
    window.setTimeout(() => {
      notify(`Opening ${learner.name}’s learner dashboard preview. No session was created.`, 'success')
      navigate('/', { replace: true })
    }, 450)
  }

  return (
    <AuthCard title={`Hi ${learner.name}! 👋`} subtitle="Enter your Learning PIN to continue to your learning space." hero={<div className="learner-pin-avatar"><img src={learner.image} alt={learner.name} /></div>} compact>
      <AuthFeedback><strong>Fake demo PIN: 1234.</strong> It is checked only in memory and is never stored.</AuthFeedback>
      <form className="learner-pin-form" onSubmit={submit}>
        <fieldset>
          <legend className="sr-only">Four-digit learning PIN</legend>
          <div className="learner-pin-fields">
            {digits.map((digit, index) => <input key={index} ref={(element) => { inputs.current[index] = element }} value={digit} onChange={(event) => changeDigit(index, event)} onKeyDown={(event) => handleKey(index, event)} inputMode="numeric" autoComplete="one-time-code" maxLength={1} aria-label={`PIN digit ${index + 1}`} aria-invalid={Boolean(error)} />)}
          </div>
        </fieldset>
        {error ? <AuthFeedback tone="error">{error}</AuthFeedback> : null}
        <button type="submit" className="parent-auth-button" disabled={loading}>{loading ? 'Opening Preview…' : 'Continue'} <ArrowRightIcon size={18} /></button>
      </form>
      <button type="button" className="learner-pin-switch" onClick={() => navigate('/parent/select-learner')}>⇄ Switch Learner</button>
      <div className="learner-pin-kito"><img src="/assets/kito-sidebar.png" alt="Kito" /><p>Ready to learn?<br /><strong>Let’s go! 🚀</strong></p></div>
    </AuthCard>
  )
}
