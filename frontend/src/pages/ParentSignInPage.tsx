import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRightIcon, ShieldCheckIcon } from '../components/icons/Icons'
import AuthCard from '../components/parent-auth/AuthCard'
import AuthFeedback from '../components/parent-auth/AuthFeedback'
import AuthField from '../components/parent-auth/AuthField'
import { authenticationErrorMessage, useAuth } from '../auth/AuthContext'

export default function ParentSignInPage() {
  const location = useLocation()
  const state = location.state as { email?: string; from?: string; sessionRequired?: boolean; signedOut?: boolean; learnerSignedOut?: boolean } | null
  const [identity, setIdentity] = useState(state?.email || '')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ identity?: string; password?: string; form?: string }>({})
  const [feedback, setFeedback] = useState(state?.sessionRequired
    ? 'Sign in with a parent account to continue.'
    : state?.learnerSignedOut
      ? 'The learner session was signed out securely. A parent must authorize the next learner session.'
      : state?.signedOut ? 'You have signed out successfully.' : '')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login, logout } = useAuth()

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const next: typeof errors = {}
    if (!identity.trim()) next.identity = 'Enter an email address.'
    else if (!/^\S+@\S+\.\S+$/.test(identity)) next.identity = 'Enter a valid email address.'
    if (!password) next.password = 'Enter a password.'
    setErrors(next)
    if (Object.keys(next).length) return
    setLoading(true)
    setFeedback('')
    try {
      const user = await login({ email: identity.trim().toLowerCase(), password })
      if (user.role !== 'parent') {
        logout()
        setErrors({ form: 'This sign-in is for parent and guardian accounts only.' })
        return
      }
      navigate(state?.from || '/parent/select-learner', { replace: true })
    } catch (error) {
      setErrors({ form: authenticationErrorMessage(error, 'We could not sign you in. Please try again.') })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard title="Welcome Back" subtitle="Sign in to manage your learners and continue their learning journey." icon={<img src="/assets/logo-robot.png" alt="" />} compact>
      {feedback ? <AuthFeedback tone="success">{feedback}</AuthFeedback> : null}
      <AuthFeedback>Use the email and password for your parent account. Your access token stays in memory and is cleared on refresh or sign out.</AuthFeedback>
      <form className="parent-auth-form" onSubmit={submit} noValidate>
        <AuthField label="Email Address" icon="✉" value={identity} onChange={(event) => setIdentity(event.target.value)} error={errors.identity} autoComplete="email" inputMode="email" placeholder="you@example.com" />
        <AuthField label="Password" icon="🔒" value={password} onChange={(event) => setPassword(event.target.value)} error={errors.password} password autoComplete="current-password" placeholder="Enter your password" />
        {errors.form ? <AuthFeedback tone="error">{errors.form}</AuthFeedback> : null}
        <div className="parent-auth-form__between">
          <span />
          <button type="button" onClick={() => setFeedback('Password recovery is not available in Phase 1A. Contact platform support for help.')}>Forgot Password?</button>
        </div>
        <button className="parent-auth-button" type="submit" disabled={loading}>{loading ? 'Signing In…' : 'Sign In'} <ArrowRightIcon size={18} /></button>
      </form>
      <p className="parent-auth-card__footer">New to Digital Kids? <Link to="/parent/register">Create Parent Account</Link></p>
      <div className="parent-auth-secure"><ShieldCheckIcon size={28} /><div><strong>Secure parent-managed access</strong><span>You are in control of your child’s learning.</span></div></div>
    </AuthCard>
  )
}
