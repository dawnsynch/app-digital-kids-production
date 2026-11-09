import { IMAGES } from '../../data/images'
import { BookIcon } from '../icons/Icons'

/** Top banner for the Bible Learning page. */
export default function BibleHeroSection() {
  return (
    <header className="bible__hero">
      <span className="bible__hero-badge" aria-hidden="true"><BookIcon size={30} /></span>
      <div className="bible__hero-intro">
        <h1 className="bible__hero-title">Bible Learning</h1>
        <p className="bible__hero-subtitle">
          Learn Bible stories, discover God&rsquo;s Word, and grow through meaningful life lessons.
        </p>
      </div>
      <img className="bible__hero-art" src={IMAGES.bibleHero} alt="" />
    </header>
  )
}
