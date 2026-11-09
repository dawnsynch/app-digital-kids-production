type Props = {
  icon: string
  value: string
  label: string
  tone?: 'blue' | 'purple' | 'orange' | 'green' | 'pink'
}

export default function MetricCard({ icon, value, label, tone = 'blue' }: Props) {
  return (
    <article className={`learner-metric learner-metric--${tone}`}>
      <span className="learner-metric__icon" aria-hidden="true">{icon}</span>
      <div>
        <strong className="learner-metric__value">{value}</strong>
        <span className="learner-metric__label">{label}</span>
      </div>
    </article>
  )
}
