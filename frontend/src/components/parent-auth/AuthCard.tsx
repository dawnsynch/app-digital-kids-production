import type { ReactNode } from 'react'

type Props = {
  title: string
  subtitle: string
  icon?: ReactNode
  hero?: ReactNode
  children: ReactNode
  compact?: boolean
}

export default function AuthCard({ title, subtitle, icon, hero, children, compact = false }: Props) {
  return (
    <section className={`parent-auth-card${compact ? ' parent-auth-card--compact' : ''}`}>
      {icon ? <span className="parent-auth-card__icon" aria-hidden="true">{icon}</span> : null}
      {hero}
      <h1>{title}</h1>
      <p className="parent-auth-card__subtitle">{subtitle}</p>
      {children}
    </section>
  )
}
