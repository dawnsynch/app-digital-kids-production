import { CODING_RECOMMENDED } from '../../data/codingTechnologyContent'
import { IMAGES } from '../../data/images'
import { ArrowRightIcon, ClockIcon, StarIcon } from '../icons/Icons'
import { useUI } from '../ui/UIContext'

/** The “Recommended for You” lesson card. */
export default function CodingRecommendationCard() {
  const { notify } = useUI()

  return (
    <section className="coding-recommended">
      <h3 className="coding-recommended__heading">Recommended for You</h3>

      <div className="coding-recommended__top">
        <img className="coding-recommended__robot" src={IMAGES.codingKitoRobot} alt="" />
        <p className="coding-recommended__text">{CODING_RECOMMENDED.body}</p>
      </div>

      <p className="coding-recommended__course">{CODING_RECOMMENDED.course}</p>
      <h4 className="coding-recommended__title">{CODING_RECOMMENDED.title}</h4>

      <p className="coding-recommended__meta">
        <span>
          <ClockIcon size={15} />
          {CODING_RECOMMENDED.duration}
        </span>
        <span aria-hidden="true">•</span>
        <span>{CODING_RECOMMENDED.level}</span>
        <span aria-hidden="true">•</span>
        <span className="coding-recommended__points">
          <StarIcon size={15} />
          {CODING_RECOMMENDED.points}
        </span>
      </p>

      <button
        type="button"
        className="coding-recommended__btn"
        onClick={() => notify(`Starting ${CODING_RECOMMENDED.title}`, 'success')}
      >
        Start Lesson
        <ArrowRightIcon size={18} />
      </button>
    </section>
  )
}
