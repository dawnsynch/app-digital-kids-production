import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MetricCard from '../components/learner/MetricCard'
import ProgressBar from '../components/learner/ProgressBar'
import SectionHeading from '../components/learner/SectionHeading'
import { ArrowRightIcon } from '../components/icons/Icons'
import { useUI } from '../components/ui/UIContext'
import { ACHIEVEMENT_CATEGORIES, ACHIEVEMENT_METRICS, FEATURED_BADGES } from '../data/learnerPages'
import { IMAGES } from '../data/images'

export default function AchievementsPage() {
  const [showAllBadges, setShowAllBadges] = useState(false)
  const { notify } = useUI()
  const navigate = useNavigate()
  const visibleBadges = showAllBadges ? FEATURED_BADGES : FEATURED_BADGES.slice(0, 4)

  return (
    <div className="learner-page achievements-page">
      <section className="achievement-hero">
        <span className="achievement-hero__icon" aria-hidden="true">🏆</span>
        <div className="achievement-hero__copy">
          <h2>Achievements</h2>
          <p>Celebrate your learning milestones, track your growth, and unlock new rewards as you keep learning.</p>
        </div>
        <img src={IMAGES.avatar} alt="Amina celebrating her achievements" />
      </section>

      <section className="learner-panel achievement-journey">
        <SectionHeading title="Your Achievement Journey" />
        <div className="achievement-journey__body">
          <div className="learner-metrics learner-metrics--five">
            {ACHIEVEMENT_METRICS.map((metric) => <MetricCard key={metric.label} {...metric} />)}
          </div>
          <div className="achievement-level">
            <span className="achievement-level__badge" aria-hidden="true">⭐</span>
            <div className="achievement-level__copy">
              <strong>Learning Explorer — Level 4</strong>
              <div className="achievement-level__meta"><span>Next Level: Rising Scholar</span><b>78% complete</b></div>
              <ProgressBar value={78} label="Level four completion" />
            </div>
          </div>
        </div>
      </section>

      <section className="learner-section">
        <SectionHeading
          title="Featured Badges"
          subtitle="Your recently earned achievements."
          action={<button className="learner-link" type="button" onClick={() => setShowAllBadges((value) => !value)}>{showAllBadges ? 'Show Featured' : 'View All Badges'} <ArrowRightIcon size={16} /></button>}
        />
        <div className="badge-grid">
          {visibleBadges.map((badge) => (
            <button
              type="button"
              className={`achievement-badge achievement-badge--${badge.tone}`}
              key={badge.id}
              onClick={() => notify(`${badge.title}: ${badge.description}`, 'success')}
            >
              <span className="achievement-badge__icon" aria-hidden="true">{badge.icon}</span>
              <strong>{badge.title}</strong>
              <span>{badge.description}</span>
              <small>✓ Earned {badge.earned}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="learner-section">
        <SectionHeading title="Achievement Categories" subtitle="Explore your achievements by learning area." />
        <div className="achievement-categories">
          {ACHIEVEMENT_CATEGORIES.map((category) => (
            <button
              type="button"
              className={`achievement-category achievement-category--${category.tone}`}
              key={category.title}
              onClick={() => notify(`${category.title}: ${category.earned} of ${category.total} earned`)}
            >
              <span aria-hidden="true">{category.icon}</span>
              <strong>{category.title}</strong>
              <small>{category.earned} of {category.total} earned</small>
              <ProgressBar value={(category.earned / category.total) * 100} tone="green" label={`${category.title} badge progress`} />
            </button>
          ))}
        </div>
      </section>

      <div className="learner-bottom-grid">
        <section className="learner-panel almost-card">
          <h3>🎯 Almost There!</h3>
          <p>You&rsquo;re close to unlocking new achievements.</p>
          <div className="almost-card__goal">
            <span aria-hidden="true">🏆</span>
            <div><strong>Fraction Master</strong><small>Complete 2 more fractions practice sessions.</small></div>
            <b>80%</b>
          </div>
          <ProgressBar value={80} label="Fraction Master progress" />
          <button type="button" className="learner-btn learner-btn--outline" onClick={() => navigate('/practice')}>Practice Fractions <ArrowRightIcon size={17} /></button>
        </section>

        <section className="learner-panel milestones-card">
          <h3>📅 Recent Milestones</h3>
          <ul>
            <li><span>Today</span><strong>Earned Quick Thinker</strong></li>
            <li><span>Yesterday</span><strong>Reached 7 Day Streak</strong></li>
            <li><span>2 days ago</span><strong>Earned Verse Keeper</strong></li>
          </ul>
          <button type="button" className="learner-link" onClick={() => notify('This is the complete milestone history shown in this preview.')}>View Full History <ArrowRightIcon size={16} /></button>
        </section>

        <section className="learner-panel achievement-next">
          <h3>⭐ Recommended Next Achievement</h3>
          <div className="achievement-next__kito">
            <img src={IMAGES.kitoImprove} alt="Kito" />
            <p>You&rsquo;re doing very well in Coding &amp; Technology. Complete one more lesson to unlock Coding Builder!</p>
          </div>
          <strong>Coding Builder</strong>
          <small>Finish 1 more coding lesson · +30 Points · 1 New Badge</small>
          <button type="button" className="learner-btn" onClick={() => navigate('/coding-technology')}>Continue Lesson <ArrowRightIcon size={17} /></button>
        </section>
      </div>
    </div>
  )
}
