type Props = {
  value: number
  tone?: 'blue' | 'green' | 'purple' | 'orange'
  label?: string
}

export default function ProgressBar({ value, tone = 'green', label }: Props) {
  const safeValue = Math.max(0, Math.min(100, value))
  return (
    <div
      className={`learner-progress learner-progress--${tone}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeValue}
    >
      <span style={{ width: `${safeValue}%` }} />
    </div>
  )
}
