import type { ComponentType, SVGProps } from 'react'

type IconType = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>

type Props = {
  icon: IconType
  title: string
  subtitle: string
  tone?: 'blue' | 'purple' | 'orange' | 'green'
}

export default function LearnerPageHeader({ icon: Icon, title, subtitle, tone = 'blue' }: Props) {
  return (
    <header className="learner-page-head">
      <span className={`learner-page-head__icon learner-page-head__icon--${tone}`} aria-hidden="true">
        <Icon size={28} />
      </span>
      <div>
        <h1 className="learner-page-head__title">{title}</h1>
        <p className="learner-page-head__subtitle">{subtitle}</p>
      </div>
    </header>
  )
}
