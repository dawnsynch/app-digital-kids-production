import { useState } from 'react'
import type { LearningPath } from '../../data/learningContent'
import { ArrowRightIcon } from '../icons/Icons'
import { useUI } from '../ui/UIContext'

export default function LearningPathCard({ path }: { path: LearningPath }) {
  const { notify } = useUI()
  const [started, setStarted] = useState(false)

  return (
    <article
      className="path-card"
      style={
        {
          '--path-accent': path.accent,
          '--path-title': path.titleColor,
          '--path-art-top': `${path.artTop}px`,
          '--path-art-h': `${path.artHeight}px`,
          '--path-card-h': `${path.cardHeight}px`,
        } as React.CSSProperties
      }
    >
      <div className="path-card__art">
        <img src={path.art} alt="" />
      </div>

      <div className="path-card__head">
        <span className="path-card__badge">
          <img src={path.badge} alt="" />
        </span>
        <div className="path-card__intro">
          <h3 className="path-card__title">
            {path.titleLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h3>
          <p className="path-card__desc">
            {path.descriptionLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
        </div>
      </div>

      <div className="path-card__foot">
        <div className="path-card__progress">
          <p className="path-card__pct">
            <span className="path-card__pct-value">{path.progress}%</span> complete
          </p>
          <div className="path-card__bar">
            <span style={{ width: `${path.progress}%` }} />
          </div>
        </div>

        <button
          type="button"
          className="path-card__btn"
          onClick={() => {
            setStarted(true)
            notify(
              started
                ? `Resuming ${path.titleLines.join(' ')}`
                : `${path.action === 'Continue' ? 'Continuing' : 'Exploring'} ${path.titleLines.join(' ')}`,
              'success',
            )
          }}
        >
          {started ? 'Started ✓' : path.action}
          <ArrowRightIcon size={17} />
        </button>
      </div>
    </article>
  )
}
