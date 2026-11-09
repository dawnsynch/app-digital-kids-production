import type { ReactNode } from 'react'

type Props = {
  title: string
  subtitle?: string
  action?: ReactNode
}

export default function SectionHeading({ title, subtitle, action }: Props) {
  return (
    <div className="learner-section-head">
      <div>
        <h2 className="learner-section-head__title">{title}</h2>
        {subtitle ? <p className="learner-section-head__subtitle">{subtitle}</p> : null}
      </div>
      {action ? <div className="learner-section-head__action">{action}</div> : null}
    </div>
  )
}
