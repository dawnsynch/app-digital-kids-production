import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRightIcon } from '../components/icons/Icons'
import AuthCard from '../components/parent-auth/AuthCard'
import AuthFeedback from '../components/parent-auth/AuthFeedback'
import AuthField from '../components/parent-auth/AuthField'
import { authenticationErrorMessage, useAuth } from '../auth/AuthContext'

type Errors = Partial<Record<'name' | 'email' | 'phone' | 'password' | 'confirm' | 'terms' | 'adult', string>>

export default function ParentRegisterPage() {
  const [values, setValues] = useState({ name: '', email: '', phone: '', password: '', confirm: '', terms: false, adult: false })
  const [errors, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState('')
  const navigate = useNavigate()
  const { register } = useAuth()

  const update = (key: keyof typeof values, value: string | boolean) => setValues((current) => ({ ...current, [key]: value }))

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const next: Errors = {}
    if (values.name.trim().length < 2) next.name = 'Enter at least 2 characters for the parent or guardian name.'
    if (!values.email.trim()) next.email = 'Enter an email address.'
    else if (!/^\S+@\S+\.\S+$/.test(values.email)) next.email = 'Enter a valid email address.'
    if (!values.phone.trim()) next.phone = 'Enter a mobile number.'
    else if (values.phone.replace(/\D/g, '').length < 9) next.phone = 'Enter at least 9 digits.'
    if (!values.password) next.password = 'Create a password.'
    else if (values.password.length < 8) next.password = 'Use at least 8 characters.'
    if (!values.confirm) next.confirm = 'Confirm the password.'
    else if (values.confirm !== values.password) next.confirm = 'Passwords do not match.'
    if (!values.terms) next.terms = 'Agree to the Terms of Use and Privacy Policy to continue.'
    if (!values.adult) next.adult = 'Confirm that you are an authorized adult.'
    setErrors(next)
    if (Object.keys(next).length) return

    setLoading(true)
    setFeedback('')
    try {
      await register({ full_name: values.name.trim(), email: values.email.trim().toLowerCase(), password: values.password })
      navigate('/parent/select-learner', { replace: true, state: { registrationSuccess: true } })
    } catch (error) {
      setFeedback(authenticationErrorMessage(error, 'We could not create the account. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard title="Create Your Parent Account" subtitle="Set up your account to create and manage your child’s learning experience.">
      <AuthFeedback>Your account is secured by the Digital Kids API. Access lasts until this page is refreshed or you sign out.</AuthFeedback>
      <form className="parent-auth-form" onSubmit={submit} noValidate>
        <AuthField label="Parent / Guardian Name" icon="♙" value={values.name} onChange={(event) => update('name', event.target.value)} error={errors.name} autoComplete="name" placeholder="Enter your full name" />
        <AuthField label="Email Address" icon="✉" value={values.email} onChange={(event) => update('email', event.target.value)} error={errors.email} autoComplete="email" inputMode="email" placeholder="you@example.com" />
        <AuthField label="Mobile Number" icon="☎" value={values.phone} onChange={(event) => update('phone', event.target.value)} error={errors.phone} autoComplete="tel" inputMode="tel" placeholder="+254 7XX XXX XXX" />
        <AuthField label="Password" icon="🔒" value={values.password} onChange={(event) => update('password', event.target.value)} error={errors.password} password autoComplete="new-password" placeholder="Create a password" hint="Use at least 8 characters." />
        <AuthField label="Confirm Password" icon="🔒" value={values.confirm} onChange={(event) => update('confirm', event.target.value)} error={errors.confirm} password autoComplete="new-password" placeholder="Confirm your password" />
        <label className="parent-auth-check"><input type="checkbox" checked={values.terms} onChange={(event) => update('terms', event.target.checked)} /> <span>I agree to the <button type="button">Terms of Use</button> and <button type="button">Privacy Policy</button>.</span></label>
        {errors.terms ? <span className="parent-auth-check-error" role="alert">{errors.terms}</span> : null}
        <label className="parent-auth-check"><input type="checkbox" checked={values.adult} onChange={(event) => update('adult', event.target.checked)} /> <span>I confirm that I am a parent, guardian, or authorized adult creating this account.</span></label>
        {errors.adult ? <span className="parent-auth-check-error" role="alert">{errors.adult}</span> : null}
        {feedback ? <AuthFeedback tone="error">{feedback}</AuthFeedback> : null}
        <button className="parent-auth-button" type="submit" disabled={loading}>{loading ? 'Creating Account…' : 'Create Parent Account'} <ArrowRightIcon size={18} /></button>
      </form>
      <p className="parent-auth-card__footer">Already have an account? <Link to="/parent/sign-in">Sign In</Link></p>
    </AuthCard>
  )
}
