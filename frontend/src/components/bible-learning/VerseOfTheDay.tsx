import { IMAGES } from '../../data/images'

/** The “Verse of the Day” card. */
export default function VerseOfTheDay() {
  return (
    <section className="bible__verse">
      <div className="bible__verse-body">
        <div className="bible__verse-head">
          <span className="bible__verse-sun" aria-hidden="true">☀️</span>
          <h3 className="bible__verse-title">Verse of the Day</h3>
          <span className="bible__verse-today">Today</span>
        </div>

        <blockquote className="bible__verse-quote">
          <p>&ldquo;The Lord is my shepherd; I shall not want.&rdquo;</p>
          <p className="bible__verse-ref">Psalm 23:1</p>
        </blockquote>

        <div className="bible__verse-actions">
          <button type="button" className="bible__verse-btn">
            <span className="bible__verse-btn-icon">🔊</span>
            Read Aloud
          </button>
          <button type="button" className="bible__verse-btn bible__verse-btn--outline">
            <span className="bible__verse-btn-icon">🔖</span>
            Save Verse
          </button>
          <button type="button" className="bible__verse-btn bible__verse-btn--filled">
            <span className="bible__verse-btn-icon">✏️</span>
            Practice Verse
          </button>
        </div>
      </div>

      <div className="bible__verse-media" aria-hidden="true">
        <div
          className="bible__verse-art"
          style={{ backgroundImage: `url(${IMAGES.bibleVerseBook})` }}
        />
      </div>
    </section>
  )
}
