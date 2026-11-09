import { BIBLE_RECOMMENDED } from '../../data/bibleLearningContent'
import { IMAGES } from '../../data/images'
import { ArrowRightIcon } from '../icons/Icons'

/** The “Recommended for You” card — Esther’s Courage. */
export default function BibleRecommendedCard() {
  return (
    <section className="bible__recommended">
      <img className="bible__recommended-robot" src={IMAGES.kitoSidebar} alt="" />
      <div className="bible__recommended-text">
        <p className="bible__recommended-title">
          You&rsquo;re doing well. Let&rsquo;s learn how Esther showed courage too.
        </p>
        <p className="bible__recommended-course">{BIBLE_RECOMMENDED.title}</p>
        <h4 className="bible__recommended-title">{BIBLE_RECOMMENDED.title}</h4>

        <p className="bible__recommended-meta">
          <span className="bible__recommended-clock">🕒</span>
          {BIBLE_RECOMMENDED.duration} <span aria-hidden="true">•</span>
          <span>{BIBLE_RECOMMENDED.level}</span>
          <span aria-hidden="true">•</span>
          <span className="bible__recommended-points">⭐ {BIBLE_RECOMMENDED.points}</span>
        </p>

        <button type="button" className="bible__recommended-btn">
          {BIBLE_RECOMMENDED.action}
          <ArrowRightIcon size={17} />
        </button>
      </div>
      <img className="bible__recommended-art" src={IMAGES.bibleEsther} alt="" />
    </section>
  )
}
