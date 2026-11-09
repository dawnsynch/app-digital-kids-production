import { BIBLE_PRACTICE } from '../../data/bibleLearningContent'
import { ArrowRightIcon } from '../icons/Icons'
import { useUI } from '../ui/UIContext'
import { IMAGES } from '../../data/images'

/** The “Put It Into Practice” card — Kindness. */
export default function BiblePracticeCard() {
  const { notify } = useUI()

  return (
    <section className="bible__practice">
      <h3 className="bible__practice-title">Put It Into Practice</h3>
      <h4 className="bible__practice-topic">{BIBLE_PRACTICE.title}</h4>
      <p className="bible__practice-sub">{BIBLE_PRACTICE.description}</p>

      <ul className="bible__practice-list">
        {BIBLE_PRACTICE.items.map((item, i) => (
          <li key={i}>
            <span className="bible__practice-bullet">✓</span>
            {item}
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="bible__practice-btn"
        onClick={() => notify('Marked kindness practice as complete', 'success')}
      >
        {BIBLE_PRACTICE.action}
        <ArrowRightIcon size={17} />
      </button>
      <img className="bible__practice-art" src={IMAGES.bibleKindness} alt="" />
    </section>
  )
}
