import { useState } from 'react'
import type { LearningCard as LearningCardData } from '../../data/dashboard'
import { IMAGES } from '../../data/images'
import { useUI } from '../ui/UIContext'

export default function LearningCard({ card }: { card: LearningCardData }) {
  const { notify } = useUI()
  const [started, setStarted] = useState(false)
  const IconComponent = card.icon

  return (
    <article className="learn-card">
      <span
        className="learn-card__icon"
        style={{ background: card.iconBg, color: card.iconColor }}
        aria-hidden="true"
      >
        <IconComponent size={19} />
      </span>

      <h4 className="learn-card__title">
        {card.title.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </h4>

      <div className="learn-card__art">
        <img src={IMAGES[card.imageKey]} alt="" />
      </div>

      <p className="learn-card__meta">{card.meta}</p>

      <div className="learn-card__bar">
        <span style={{ width: `${card.progress * 100}%`, background: card.progressColor }} />
      </div>

      <button
        type="button"
        className="learn-card__btn"
        style={{ background: card.actionColor }}
        onClick={() => {
          setStarted(true)
          notify(`${started ? 'Resuming' : 'Starting'} ${card.title.join(' ')} — ${card.meta}`, 'success')
        }}
      >
        {started ? 'Started ✓' : card.action}
      </button>
    </article>
  )
}
