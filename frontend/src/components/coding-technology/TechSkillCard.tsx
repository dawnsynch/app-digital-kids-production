import type { TechSkill } from '../../data/codingTechnologyContent'
import { useUI } from '../ui/UIContext'

type Props = {
  skill: TechSkill
}

/** One “Explore Technology Skills” tile. */
export default function TechSkillCard({ skill }: Props) {
  const { notify } = useUI()
  const IconComponent = skill.icon

  return (
    <article className="tech-skill">
      <div className="tech-skill__head">
        <span className="tech-skill__icon" style={{ background: skill.accent }}>
          <IconComponent size={22} />
        </span>
        <div className="tech-skill__intro">
          <h3 className="tech-skill__title">{skill.title}</h3>
          <p className="tech-skill__description">{skill.description}</p>
        </div>
      </div>

      <img className="tech-skill__art" src={skill.image} alt="" />

      <div className="tech-skill__bar">
        <span style={{ width: `${skill.progress}%`, background: skill.barColor }} />
      </div>

      <p className="tech-skill__percent">{skill.progress}% complete</p>

      <p className="tech-skill__meta">
        {skill.count} <span aria-hidden="true">•</span> {skill.level}
      </p>

      <button
        type="button"
        className="tech-skill__btn"
        onClick={() => notify(`${skill.action} — ${skill.title}`, 'success')}
      >
        {skill.action}
      </button>
    </article>
  )
}
