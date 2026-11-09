import type { BibleStory } from '../../data/bibleLearningContent'

const SKILL_SYMBOLS: Record<string, string> = {
  'bible-stories': '📖',
  'memory-verses': '🔖',
  'christian-character': '♥',
  'life-lessons': '💡',
  'prayer-reflection': '🙏',
  'people-of-bible': '👥',
}

/** One skill tile in the Explore Bible Learning grid. */
export default function BibleSkillCard({ skill }: { skill: BibleStory }) {
  return (
    <article className="bible__skill">
      <div className="bible__skill-head">
        <span
          className="bible__skill-badge"
          style={{ background: skill.color }}
          aria-hidden="true"
        >
          {SKILL_SYMBOLS[skill.id] ?? '📖'}
        </span>
        <div className="bible__skill-intro">
          <h3 className="bible__skill-title">{skill.nameLines[0]}</h3>
          {skill.description && (
            <p className="bible__skill-desc">{skill.description}</p>
          )}
        </div>
      </div>

      <div className="bible__skill-media" aria-hidden="true">
        <div
          className="bible__skill-art"
          style={{ backgroundImage: `url(${skill.illustration})` }}
        />
      </div>

      <div className="bible__skill-bar">
        <span style={{ width: `${skill.progress}%` }} />
      </div>
      <p className="bible__skill-pct">{skill.progress}% complete</p>

      <p className="bible__skill-meta">
        {skill.count} <span aria-hidden="true">•</span> {skill.level}
      </p>

      <button type="button" className="bible__skill-btn">
        {skill.action}
      </button>
    </article>
  )
}
