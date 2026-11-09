import { IMAGES } from '../../data/images'
import { useUI } from '../ui/UIContext'

export default function StreakCard() {
  const { notify } = useUI()

  return (
    <section className="streak">
      <div className="streak__head">
        <div>
          <div className="streak__count">7</div>
          <h3 className="streak__label">Day Streak!</h3>
          <p className="streak__sub">Amazing consistency!</p>
        </div>
        <img className="streak__flame" src={IMAGES.streakFlame} alt="" />
      </div>

      <div className="streak__foot">
        <img className="streak__robot" src={IMAGES.kitoStreak} alt="" />
        <button
          type="button"
          className="streak__bubble"
          onClick={() => notify('Great work! You are improving every day.', 'success')}
        >
          Great work! You&rsquo;re improving every day. Keep it up! 🚀
        </button>
      </div>
    </section>
  )
}
