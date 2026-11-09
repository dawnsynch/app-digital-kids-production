import { useId, useState, type InputHTMLAttributes } from 'react'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  label: string
  icon: string
  error?: string
  hint?: string
  password?: boolean
}

export default function AuthField({ label, icon, error, hint, password = false, type, ...inputProps }: Props) {
  const id = useId()
  const [visible, setVisible] = useState(false)
  const descriptionId = error || hint ? `${id}-description` : undefined

  return (
    <div className={`parent-auth-field${error ? ' has-error' : ''}`}>
      <label className="parent-auth-field__label" htmlFor={id}>{label}</label>
      <div className="parent-auth-field__control">
        <span aria-hidden="true">{icon}</span>
        <input
          {...inputProps}
          id={id}
          type={password ? (visible ? 'text' : 'password') : type}
          aria-invalid={Boolean(error)}
          aria-describedby={descriptionId}
        />
        {password ? <button type="button" onClick={() => setVisible((value) => !value)} aria-label={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`}>{visible ? '🙈' : '👁️'}</button> : null}
      </div>
      {error ? <span className="parent-auth-field__error" id={descriptionId} role="alert">{error}</span> : hint ? <span className="parent-auth-field__hint" id={descriptionId}>{hint}</span> : null}
    </div>
  )
}
