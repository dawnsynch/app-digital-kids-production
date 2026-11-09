import { FEATURES } from '../../data/dashboard'
import { useUI } from '../ui/UIContext'

export default function FeatureStrip() {
  const { notify } = useUI()

  return (
    <section className="features" aria-label="Platform highlights">
      {FEATURES.map((feature) => {
        const IconComponent = feature.icon
        return (
          <div className="features__item" key={feature.id}>
            <button
              type="button"
              className="features__button"
              onClick={() => notify(`${feature.title.join(' ')} — learn more`, 'success')}
            >
              <span className="features__icon" style={{ color: feature.color }}>
                <IconComponent size={32} />
              </span>
              <span className="features__text">
                {feature.title.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </span>
            </button>
          </div>
        )
      })}
    </section>
  )
}
