type Props = {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  icon?: string
}

export default function SettingToggle({ label, description, checked, onChange, icon }: Props) {
  return (
    <div className="setting-row">
      {icon ? <span className="setting-row__icon" aria-hidden="true">{icon}</span> : null}
      <div className="setting-row__copy">
        <strong>{label}</strong>
        {description ? <span>{description}</span> : null}
      </div>
      <button
        type="button"
        className={`setting-switch${checked ? ' is-on' : ''}`}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
      >
        <span />
      </button>
    </div>
  )
}
