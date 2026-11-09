import type { RecommendedItem } from '../../data/learningContent'
import { useUI } from '../ui/UIContext'

export default function RecommendedCard({ item }: { item: RecommendedItem }) {
  const { notify } = useUI()

  return (
    <article className="rec-card">
      <span className="rec-card__badge">
        <img src={item.badge} alt="" />
      </span>

      <div className="rec-card__body">
        <p className="rec-card__eyebrow">{item.eyebrow}</p>
        <h4 className="rec-card__title">{item.title}</h4>

        <div className="rec-card__meta">
          <button
            type="button"
            className="rec-card__link"
            style={{ color: item.linkColor }}
            onClick={() => notify(`${item.linkLabel}: ${item.title}`, 'success')}
          >
            {item.linkLabel}
          </button>

          <div className="rec-card__progress">
            <div className="rec-card__bar">
              <span style={{ width: `${item.progress}%`, background: item.barColor }} />
            </div>
            <span className="rec-card__percent">{item.percent}%</span>
          </div>
        </div>
      </div>

      <div className="rec-card__art">
        <img src={item.art} alt="" />
      </div>
    </article>
  )
}
