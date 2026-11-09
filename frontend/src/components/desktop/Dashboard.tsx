import { useState } from 'react'
import { LEARNING_CARDS } from '../../data/dashboard'
import type { LearningCard as LearningCardData } from '../../data/dashboard'
import { useUI } from '../ui/UIContext'
import ContinueLearning from './ContinueLearning'
import KeepImproving from './KeepImproving'
import LearningCard from './LearningCard'
import ProgressChart from './ProgressChart'
import QuickPractice from './QuickPractice'
import RecentAchievements from './RecentAchievements'
import StreakCard from './StreakCard'

const EXTRA_CARDS: LearningCardData[] = [
  {
    id: 'literacy',
    title: ['Literacy', 'Practice'],
    meta: '0/10 Questions',
    progress: 0.18,
    progressColor: '#ec4899',
    icon: LEARNING_CARDS[0].icon,
    iconBg: '#ec4899',
    iconColor: '#ffffff',
    imageKey: 'lessonMathematics',
    action: 'Start',
    actionColor: '#ec4899',
  },
  {
    id: 'geography',
    title: ['Geography', 'Lesson'],
    meta: '0/1 Lesson',
    progress: 0.15,
    progressColor: '#06b6d4',
    icon: LEARNING_CARDS[1].icon,
    iconBg: '#06b6d4',
    iconColor: '#ffffff',
    imageKey: 'lessonScience',
    action: 'Start',
    actionColor: '#06b6d4',
  },
]

export default function Dashboard() {
  const { notify } = useUI()
  const [showAll, setShowAll] = useState(false)

  const cards = showAll ? [...LEARNING_CARDS, ...EXTRA_CARDS] : LEARNING_CARDS

  return (
    <>
      <div className="dash__hero-row">
        <ContinueLearning />
        <StreakCard />
      </div>

      <div className="dash__learning-row">
        <section className="today">
          <div className="today__head">
            <h2 className="section-title">Today&rsquo;s Learning</h2>
            <button
              type="button"
              className="link-button"
              onClick={() => {
                setShowAll((v) => !v)
                notify(showAll ? 'Showing today’s four activities' : 'Showing all activities')
              }}
            >
              {showAll ? 'Show Less' : 'View All'}
            </button>
          </div>

          <div className={`today__grid${showAll ? ' today__grid--expanded' : ''}`}>
            {cards.map((card) => (
              <LearningCard key={card.id} card={card} />
            ))}
          </div>
        </section>

        <QuickPractice />
      </div>

      <div className="dash__bottom-row">
        <ProgressChart />
        <KeepImproving />
        <RecentAchievements />
      </div>
    </>
  )
}
