import { useUI } from '../ui/UIContext'
import { IMAGES } from '../../data/images'
import { ArrowRightIcon } from '../icons/Icons'
import { BookIcon } from '../icons/Icons'

/** The “Continue Bible Learning” card — David and Goliath. */
export default function ContinueBibleCard() {
  const { notify } = useUI()

  return (
    <section className="bible__continue">
      <div className="bible__continue-body">
        <div className="bible__continue-head">
          <span className="bible__continue-badge" aria-hidden="true"><BookIcon size={19} /></span>
          <div>
            <h3 className="bible__continue-title">David and Goliath</h3>
            <p className="bible__continue-desc">Courage and trusting God</p>
          </div>
        </div>

        <div className="bible__continue-progress">
          <span className="bible__continue-pct">
            <span className="bible__continue-pct-value">60%</span> complete
          </span>
        </div>
        <div className="bible__continue-bar">
          <span style={{ width: '60%' }} />
        </div>

        <div className="bible__continue-meta">
          <span>
            <span className="bible__continue-meta-icon">🕒</span>
            About 8 minutes
          </span>
          <span aria-hidden="true">•</span>
          <span>
            <span className="bible__continue-meta-icon">⭐</span>
            +20 Learning Points
          </span>
          <span className="bible__continue-lesson">
            Lesson 4 of 7
          </span>
        </div>

        <button
          type="button"
          className="bible__continue-btn"
          onClick={() => notify('Opening David and Goliath — lesson 4 of 7', 'success')}
        >
          Continue Lesson
          <ArrowRightIcon size={17} />
        </button>
      </div>

      <div className="bible__continue-media" aria-hidden="true">
        <div
          className="bible__continue-art"
          style={{ backgroundImage: `url(${IMAGES.bibleDavidGoliath})` }}
        />
      </div>
    </section>
  )
}
