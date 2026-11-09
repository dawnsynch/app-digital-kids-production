import { IMAGES } from '../../data/images'
import { CodeIcon } from '../icons/Icons'

/** The light “Coding & Technology” page banner. */
export default function CodingHeroBanner() {
  return (
    <section className="coding-hero">
      <span className="coding-hero__icon">
        <CodeIcon size={30} />
      </span>

      <div className="coding-hero__intro">
        <h1 className="coding-hero__title">Coding &amp; Technology</h1>
        <p className="coding-hero__subtitle">
          Build digital skills, learn how computers work, and start creating with code.
        </p>
      </div>

      <img className="coding-hero__art" src={IMAGES.codingHero} alt="" />
    </section>
  )
}
