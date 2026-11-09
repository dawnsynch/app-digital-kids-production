import { useState } from 'react'
import { useUI } from '../components/ui/UIContext'
import LearningPathCard from '../components/learning/LearningPathCard'
import RecommendedCard from '../components/learning/RecommendedCard'
import {
  LEARNING_PATHS,
  RECOMMENDED,
  RECOMMENDED_EXTRA,
} from '../data/learningContent'
import { SparklesIcon } from '../components/icons/Icons'

export default function LearnPage() {
  const { notify } = useUI()
  const [showAll, setShowAll] = useState(false)

  const recommended = showAll ? [...RECOMMENDED, ...RECOMMENDED_EXTRA] : RECOMMENDED

  return (
    <div className="learn">
      <header className="learn__intro">
        <span className="learn__sparkle">
          <SparklesIcon size={26} />
        </span>
        <div className="learn__intro-text">
          <h2 className="learn__title">What Would You Like to Learn?</h2>
          <p className="learn__subtitle">
            Choose a learning path and continue your learning journey.
          </p>
        </div>
      </header>

      <section className="learn__paths" aria-label="Learning paths">
        {LEARNING_PATHS.map((path) => (
          <LearningPathCard key={path.id} path={path} />
        ))}
      </section>

      <section className="learn__recommended" aria-label="Recommended for you">
        <div className="learn__section-head">
          <h3 className="learn__section-title">Recommended for You</h3>
          <button
            type="button"
            className="link-button"
            onClick={() => {
              setShowAll((v) => !v)
              notify(
                showAll ? 'Showing your top recommendations' : 'Showing all recommendations',
              )
            }}
          >
            {showAll ? 'Show Less' : 'View All'}
          </button>
        </div>

        <div className="learn__rec-grid">
          {recommended.map((item) => (
            <RecommendedCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  )
}
