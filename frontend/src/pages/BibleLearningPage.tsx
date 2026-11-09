import {
  BIBLE_STRANDS,
} from '../data/bibleLearningContent'
import BibleHeroSection from '../components/bible-learning/BibleHeroSection'
import ContinueBibleCard from '../components/bible-learning/ContinueBibleCard'
import VerseOfTheDay from '../components/bible-learning/VerseOfTheDay'
import BibleSkillCard from '../components/bible-learning/BibleSkillCard'
import BibleRecommendedCard from '../components/bible-learning/BibleRecommendedCard'
import BiblePracticeCard from '../components/bible-learning/BiblePracticeCard'
import BibleProgressCard from '../components/bible-learning/BibleProgressCard'

export default function BibleLearningPage() {
  return (
    <div className="bible">
      <BibleHeroSection />

      <ContinueBibleCard />

      <VerseOfTheDay />

      <section className="bible__explore">
        <div className="bible__section-head">
          <h2 className="bible__section-title">Explore Bible Learning</h2>
          <p className="bible__section-sub">
            Choose a topic and continue growing in God&rsquo;s Word.
          </p>
          <button type="button" className="bible__section-link">View All</button>
        </div>

        <div className="bible__skills-grid">
          {BIBLE_STRANDS.map((skill) => (
            <BibleSkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      </section>

      <div className="bible__bottom">
        <BibleRecommendedCard />
        <BiblePracticeCard />
        <BibleProgressCard />
      </div>
    </div>
  )
}
