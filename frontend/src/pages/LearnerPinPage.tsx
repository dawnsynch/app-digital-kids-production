import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import type { LearnerHandoff } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { ArrowRightIcon } from '../components/icons/Icons'
import AuthCard from '../components/parent-auth/AuthCard'
import AuthFeedback from '../components/parent-auth/AuthFeedback'

export default function LearnerPinPage() {
  const location = useLocation()
  const handoff = (location.state as { handoff?: LearnerHandoff } | null)?.handoff
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const inputs = useRef<Array<HTMLInputElement | null>>([])
  const navigate = useNavigate()
  const { redeemLearner } = useAuth()

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = window.setInterval(() => setCooldown((current) => Math.max(0, current - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [cooldown])

  if (!handoff) {
    return (
      <AuthCard title="Learner authorization required" subtitle="A parent must authorize a learner before PIN sign-in can begin." icon="🔐" compact>
        <AuthFeedback tone="error">This handoff is missing or expired. Ask a parent to sign in and select the learner again.</AuthFeedback>
        <button type="button" className="parent-auth-button" onClick={() => navigate('/parent/sign-in', { replace: true })}>Parent Sign In</button>
      </AuthCard>
    )
  }

  const changeDigit = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, '').slice(-1)
    setDigits((current) => current.map((digit, digitIndex) => digitIndex === index ? value : digit))
    setError('')
    if (value && index < 5) inputs.current[index + 1]?.focus()
  }

  const handleKey = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) inputs.current[index - 1]?.focus()
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (submitting || cooldown > 0) return
    const pin = digits.join('')
    if (pin.length !== 6) {
      setError('Enter all six PIN digits.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await redeemLearner(handoff.challenge, pin)
      navigate('/learner/dashboard', { replace: true })
    } catch (requestError) {
      setDigits(['', '', '', '', '', ''])
      inputs.current[0]?.focus()
      if (requestError instanceof ApiError && requestError.status === 429) {
        const seconds = requestError.retryAfterSeconds || 60
        setCooldown(seconds)
        setError(`Too many attempts. Try again in about ${seconds} seconds.`)
      } else if (requestError instanceof ApiError && /expired|handoff/i.test(requestError.message)) {
        setError('This learner handoff has expired. Ask a parent to authorize access again.')
      } else {
        setError('The PIN could not be verified. Check it and try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthCard title={`Hi ${handoff.learner.name}! 👋`} subtitle="Enter the learner PIN authorized by your parent." hero={<div className="learner-pin-avatar"><img src="/assets/girl-hero.png" alt={handoff.learner.name} /></div>} compact>
      <AuthFeedback><strong>Secure learner sign-in.</strong> This one-time handoff expires shortly and cannot be reused.</AuthFeedback>
      <form className="learner-pin-form" onSubmit={(event) => void submit(event)}>
        <fieldset>
          <legend className="sr-only">Six-digit learner PIN</legend>
          <div className="learner-pin-fields">
            {digits.map((digit, index) => <input key={index} ref={(element) => { inputs.current[index] = element }} value={digit} onChange={(event) => changeDigit(index, event)} onKeyDown={(event) => handleKey(index, event)} inputMode="numeric" autoComplete="one-time-code" maxLength={1} aria-label={`PIN digit ${index + 1}`} aria-invalid={Boolean(error)} />)}
          </div>
        </fieldset>
        {error ? <AuthFeedback tone="error">{error}</AuthFeedback> : null}
        <button type="submit" className="parent-auth-button" disabled={submitting || cooldown > 0}>{submitting ? 'Verifying PIN…' : cooldown > 0 ? 'Temporarily Locked' : <>Start Learning <ArrowRightIcon size={18} /></>}</button>
      </form>
      <button type="button" className="learner-pin-switch" onClick={() => navigate('/parent/sign-in', { replace: true })}>⇄ Parent Sign In / Switch Learner</button>
      <div className="learner-pin-kito"><img src="/assets/kito-sidebar.png" alt="Kito" /><p>Ready to learn?<br /><strong>Let’s go! 🚀</strong></p></div>
    </AuthCard>
  )
}
