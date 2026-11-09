import { CODING_CHALLENGE } from '../../data/codingTechnologyContent'
import { IMAGES } from '../../data/images'
import { ClockIcon, StarIcon, TargetIcon } from '../icons/Icons'
import { useUI } from '../ui/UIContext'

/** The “Try a Coding Challenge” teaser. */
export default function CodingChallengeCard() {
  const { notify } = useUI()

  return (
    <section className="coding-challenge">
      <div className="coding-challenge__head">
        <span className="coding-challenge__target">
          <TargetIcon size={20} />
        </span>
        <h3 className="coding-challenge__heading">Try a Coding Challenge</h3>
      </div>

      <h4 className="coding-challenge__title">{CODING_CHALLENGE.title}</h4>
      <p className="coding-challenge__text">{CODING_CHALLENGE.description}</p>

      <div className="coding-challenge__foot">
        <img className="coding-challenge__board" src={IMAGES.codingChallengeBoard} alt="" />

        <ul className="coding-challenge__legend">
          <li>
            <span className="coding-challenge__level">1</span>
            {CODING_CHALLENGE.level}
          </li>
          <li>
            <ClockIcon size={15} />
            {CODING_CHALLENGE.duration}
          </li>
          <li>
            <StarIcon size={15} />
            {CODING_CHALLENGE.points}
          </li>
        </ul>
      </div>

      <button
        type="button"
        className="coding-challenge__btn"
        onClick={() => notify(`Starting challenge: ${CODING_CHALLENGE.title}`, 'success')}
      >
        Start Challenge
      </button>
    </section>
  )
}
