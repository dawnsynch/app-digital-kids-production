import { BIBLE_PROGRESS } from '../../data/bibleLearningContent'
import { MedalIcon } from '../icons/Icons'

/** The “My Bible Learning Progress” panel. */
export default function BibleProgressCard() {
  return (
    <section className="bible__progress">
      <div className="bible__progress-head">
        <h3 className="bible__progress-title">My Bible Learning Progress</h3>
        <button type="button" className="bible__progress-link">View All</button>
      </div>

      <div className="bible__progress-stats">
        <div className="bible__progress-stat">
          <span className="bible__progress-stat-value">{BIBLE_PROGRESS.lessonsCompleted}</span>
          <span className="bible__progress-stat-label">Lessons Completed</span>
        </div>
        <div className="bible__progress-stat">
          <span className="bible__progress-stat-value">{BIBLE_PROGRESS.memoryVerses}</span>
          <span className="bible__progress-stat-label">Memory Verses Learned</span>
        </div>
        <div className="bible__progress-stat">
          <span className="bible__progress-stat-value">{BIBLE_PROGRESS.reflectionsCompleted}</span>
          <span className="bible__progress-stat-label">Reflections Completed</span>
        </div>
        <div className="bible__progress-stat">
          <span className="bible__progress-stat-value">{BIBLE_PROGRESS.daysStreak}</span>
          <span className="bible__progress-stat-label">Days Streak</span>
        </div>
      </div>

      <div className="bible__progress-level">
        <div className="bible__progress-level-bar">
          <span style={{ width: `${(BIBLE_PROGRESS.xp / BIBLE_PROGRESS.xpMax) * 100}%` }} />
        </div>
        <div className="bible__progress-level-info">
          <p className="bible__progress-level-name">
            {BIBLE_PROGRESS.levelName} — Level {BIBLE_PROGRESS.level}
          </p>
          <p className="bible__progress-xp">
            {BIBLE_PROGRESS.xp} / {BIBLE_PROGRESS.xpMax} XP
          </p>
        </div>
        <span className="bible__progress-next">
          Next Level!
          <strong>{BIBLE_PROGRESS.nextLevel} Level {BIBLE_PROGRESS.nextLevelNumber}</strong>
        </span>
      </div>

      <button type="button" className="bible__progress-achievement">
        <span className="bible__progress-achievement-img" aria-hidden="true"><MedalIcon size={24} /></span>
        <span>
          <strong className="bible__progress-achievement-title">Recent Achievement</strong>
          <span className="bible__progress-achievement-name">{BIBLE_PROGRESS.achievement}</span>
          <small className="bible__progress-achievement-desc">
            {BIBLE_PROGRESS.achievementDescription}
          </small>
        </span>
      </button>
    </section>
  )
}
