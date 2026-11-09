import { CODING_PROGRESS } from '../../data/codingTechnologyContent'
import { IMAGES } from '../../data/images'
import { BookIcon, ClockIcon, CodeIcon, StarIcon, TrophyIcon } from '../icons/Icons'
import { useUI } from '../ui/UIContext'

/** The “My Technology Progress” panel. */
export default function CodingProgressPanel() {
  const { notify } = useUI()

  const stats = [
    { id: 'lessons', icon: BookIcon, value: CODING_PROGRESS.lessonsCompleted, label: 'Lessons\nCompleted' },
    { id: 'challenges', icon: TrophyIcon, value: CODING_PROGRESS.challenges, label: 'Coding\nChallenges' },
    { id: 'time', icon: ClockIcon, value: CODING_PROGRESS.learningTime, label: 'Learning\nTime' },
    { id: 'stars', icon: StarIcon, value: CODING_PROGRESS.stars, label: 'Technology\nStars' },
  ]

  return (
    <section className="coding-progress">
      <div className="coding-progress__head">
        <h3 className="coding-progress__title">My Technology Progress</h3>
        <button
          type="button"
          className="coding-progress__link"
          onClick={() => notify('Showing all technology progress', 'success')}
        >
          View All
        </button>
      </div>

      <div className="coding-progress__stats">
        {stats.map((stat) => {
          const IconComponent = stat.icon
          return (
            <div className="coding-progress__stat" key={stat.id}>
              <IconComponent className="coding-progress__stat-icon" size={18} />
              <p className="coding-progress__stat-value">{stat.value}</p>
              <p className="coding-progress__stat-label">
                {stat.label.split('\n').map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </p>
            </div>
          )
        })}
      </div>

      <div className="coding-progress__level">
        <span className="coding-progress__level-icon">
          <CodeIcon size={20} />
        </span>
        <div className="coding-progress__level-body">
          <p className="coding-progress__level-name">
            {CODING_PROGRESS.levelName} — Level {CODING_PROGRESS.level}
          </p>
          <div className="coding-progress__level-bar">
            <span style={{ width: `${(CODING_PROGRESS.xp / CODING_PROGRESS.xpMax) * 100}%` }} />
          </div>
          <p className="coding-progress__xp">
            {CODING_PROGRESS.xp} / {CODING_PROGRESS.xpMax} XP
          </p>
        </div>
        <span className="coding-progress__next">
          Next Level!
          <strong>
            {CODING_PROGRESS.nextLevel} Level {CODING_PROGRESS.nextLevelNumber}
          </strong>
        </span>
      </div>

      <button
        type="button"
        className="coding-progress__achievement"
        onClick={() => notify(`${CODING_PROGRESS.achievement} — ${CODING_PROGRESS.achievementDescription}`, 'success')}
      >
        <img src={IMAGES.codingAchievementMedal} alt="" />
        <span>
          <strong>Recent Achievement</strong>
          <em>{CODING_PROGRESS.achievement}</em>
          <small>{CODING_PROGRESS.achievementDescription}</small>
        </span>
      </button>
    </section>
  )
}
