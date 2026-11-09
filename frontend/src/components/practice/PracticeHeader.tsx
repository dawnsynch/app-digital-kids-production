import { IMAGES } from '../../data/images'

/** Page intro: app icon, headline, sub-headline and the hero illustration. */
export default function PracticeHeader() {
  return (
    <header className="practice__header">
      <img className="practice__icon" src={IMAGES.practicePageIcon} alt="" />

      <div className="practice__intro">
        <h2 className="practice__title">Let&rsquo;s Practice</h2>
        <p className="practice__subtitle">Set up your quiz in a few easy steps.</p>
      </div>

      <img className="practice__hero" src={IMAGES.practiceHero} alt="" />
    </header>
  )
}
