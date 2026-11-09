import { CODING_CONTINUE } from '../../data/codingTechnologyContent'
import { IMAGES } from '../../data/images'
import { ArrowRightIcon, CodeIcon } from '../icons/Icons'
import { useUI } from '../ui/UIContext'

/** The dark “Continue Learning” panel. */
export default function CodingContinueCard() {
  const { notify } = useUI()

  return (
    <section className="coding-continue">
      <div className="coding-continue__body">
        <h2 className="coding-continue__heading">Continue Learning</h2>

        <div className="coding-continue__lesson">
          <span className="coding-continue__badge">
            <CodeIcon size={18} />
          </span>
          <div>
            <p className="coding-continue__course">{CODING_CONTINUE.course}</p>
            <h3 className="coding-continue__title">{CODING_CONTINUE.lesson}</h3>
          </div>
        </div>

        <div className="coding-continue__bar">
          <span style={{ width: `${CODING_CONTINUE.progress}%` }} />
        </div>

        <div className="coding-continue__meta">
          <span>{CODING_CONTINUE.progress}% complete</span>
          <span>
            Lesson {CODING_CONTINUE.lessonNumber} of {CODING_CONTINUE.totalLessons}
          </span>
        </div>

        <p className="coding-continue__description">{CODING_CONTINUE.description}</p>

        <button
          type="button"
          className="coding-continue__btn"
          onClick={() =>
            notify(`Resuming ${CODING_CONTINUE.lesson} — lesson ${CODING_CONTINUE.lessonNumber}`, 'success')
          }
        >
          Continue Lesson
          <ArrowRightIcon size={18} />
        </button>
      </div>

      <div className="coding-continue__visual" aria-hidden="true">
        <img className="coding-continue__editor" src={IMAGES.codingCodeEditor} alt="" />
        <img className="coding-continue__art" src={IMAGES.codingContinueArt} alt="" />
      </div>
    </section>
  )
}
