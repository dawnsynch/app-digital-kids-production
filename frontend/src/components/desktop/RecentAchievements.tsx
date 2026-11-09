import { ACHIEVEMENTS } from '../../data/dashboard'
import { IMAGES } from '../../data/images'
import { useUI } from '../ui/UIContext'

export default function RecentAchievements() {
  const { notify } = useUI()

  return (
    <section className="achievements">
      <div className="achievements__head">
        <h3 className="card-title">Recent Achievements</h3>
        <button
          type="button"
          className="link-button"
          onClick={() => notify('Showing all 12 achievements')}
        >
          View All
        </button>
      </div>

      <div className="achievements__list">
        {ACHIEVEMENTS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="achievements__item"
            onClick={() => notify(`${item.label.join(' ')} unlocked!`, 'success')}
          >
            <img className="achievements__badge" src={IMAGES[item.imageKey]} alt="" />
            <span className="achievements__label">
              {item.label.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
