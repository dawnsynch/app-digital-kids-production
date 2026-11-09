import { useNavigate } from 'react-router-dom'
import { ArrowRightIcon, BarChartIcon } from '../components/icons/Icons'
import LearnerPageHeader from '../components/learner/LearnerPageHeader'
import MetricCard from '../components/learner/MetricCard'
import ProgressBar from '../components/learner/ProgressBar'
import SectionHeading from '../components/learner/SectionHeading'
import WeeklyBarChart from '../components/learner/WeeklyBarChart'
import { useUI } from '../components/ui/UIContext'
import { PROGRESS_METRICS, RECENT_LEARNING, SUBJECT_PROGRESS } from '../data/learnerPages'
import { IMAGES } from '../data/images'

export default function ProgressPage() {
  const navigate = useNavigate()
  const { notify } = useUI()

  return (
    <div className="learner-page progress-page">
      <LearnerPageHeader
        icon={BarChartIcon}
        title="My Progress"
        subtitle="See what you’ve learned, celebrate your improvements, and discover what to practice next."
      />

      <section className="learner-panel progress-journey">
        <SectionHeading title="Your Learning Journey" subtitle="You’re making great progress this term. Keep going!" />
        <div className="progress-journey__body">
          <div className="learner-metrics learner-metrics--four">
            {PROGRESS_METRICS.map((metric) => <MetricCard key={metric.label} {...metric} />)}
          </div>
          <div className="term-progress">
            <div><strong>Term Progress</strong><b>68% complete</b></div>
            <ProgressBar value={68} label="Term progress" />
            <p><span aria-hidden="true">✓</span> Great progress! You&rsquo;ve completed more than half of your Term 2 learning goals.</p>
          </div>
        </div>
      </section>

      <div className="progress-week-grid">
        <section className="learner-panel weekly-progress">
          <SectionHeading title="Your Progress This Week" />
          <div className="weekly-progress__body">
            <WeeklyBarChart values={[3, 4, 4, 7, 5, 2, 4]} />
            <ul>
              <li><span aria-hidden="true">📖</span><strong>5</strong> Lessons completed</li>
              <li><span aria-hidden="true">📚</span><strong>64</strong> Questions answered</li>
              <li><span aria-hidden="true">🕘</span><strong>2h 20m</strong> Learning time</li>
            </ul>
          </div>
        </section>

        <section className="learner-panel streak-panel">
          <SectionHeading title="Learning Streak" />
          <div className="streak-panel__title"><span aria-hidden="true">🔥</span><strong>7 Days</strong><small>You&rsquo;ve learned every day for a full week!</small></div>
          <div className="streak-days">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => <span key={`${day}-${index}`}><b>{day}</b>✓</span>)}
          </div>
          <p>3 more days to reach your 10 Day Streak</p>
          <ProgressBar value={70} label="Ten day streak progress" />
        </section>
      </div>

      <section className="learner-section subjects-progress">
        <SectionHeading title="My Subjects" subtitle="See how you’re progressing across your school subjects." />
        <div className="subject-progress-grid">
          {SUBJECT_PROGRESS.map((subject) => (
            <article className="subject-progress-card" key={subject.title}>
              <div className="subject-progress-card__head">
                <span className={`learner-icon learner-icon--${subject.tone}`} aria-hidden="true">{subject.icon}</span>
                <strong>{subject.title}</strong>
                <em>{subject.status}</em>
              </div>
              <div className="subject-progress-card__progress"><ProgressBar value={subject.progress} label={`${subject.title} progress`} /><b>{subject.progress}%</b></div>
              <p>{subject.detail}</p>
              <small>Recent score: <strong>{subject.score}</strong></small>
              <button type="button" className={`learner-btn${subject.status === 'Needs Practice' ? '' : ' learner-btn--outline'}`} onClick={() => subject.status === 'Needs Practice' ? navigate('/practice') : notify(`${subject.title} progress details are shown in this preview.`)}>
                {subject.status === 'Needs Practice' ? 'Practice' : 'View Progress'} <ArrowRightIcon size={16} />
              </button>
            </article>
          ))}
        </div>
      </section>

      <div className="progress-insights-grid">
        <section className="learner-panel strengths-panel">
          <h3>✅ You&rsquo;re Doing Well</h3>
          <p>These are becoming some of your strongest skills.</p>
          {[['Multiplication', 90], ['Reading Comprehension', 86], ['Science Experiments', 82]].map(([label, value]) => (
            <div className="skill-progress-row" key={label as string}><span>✓</span><strong>{label}</strong><ProgressBar value={value as number} label={`${label} skill`} /><b>{value}%</b></div>
          ))}
        </section>

        <section className="learner-panel improve-panel">
          <h3>🎯 Keep Improving</h3>
          <div className="improve-panel__message"><img src={IMAGES.kitoImprove} alt="Kito" /><p>You&rsquo;re doing very well in multiplication. Let&rsquo;s spend a little more time on fractions.</p></div>
          <div className="skill-progress-row"><span>📖</span><strong>Fractions</strong><ProgressBar value={45} label="Fractions progress" /><b>45%</b></div>
          <button type="button" className="learner-btn" onClick={() => navigate('/practice')}>Practice Fractions <ArrowRightIcon size={16} /></button>
        </section>

        <section className="learner-panel recent-learning">
          <SectionHeading title="Recent Learning" action={<button type="button" className="learner-link" onClick={() => notify('Showing all recent learning in this preview.')}>View History <ArrowRightIcon size={15} /></button>} />
          <ul>
            {RECENT_LEARNING.map((item) => (
              <li key={item.title}><span className={`learner-icon learner-icon--${item.tone}`}>{item.icon}</span><strong>{item.title}</strong><em>{item.status}</em><small>{item.when}</small></li>
            ))}
          </ul>
        </section>
      </div>

      <section className="progress-next-strip">
        <div><span aria-hidden="true">🏅</span><p><strong>Latest Achievement</strong> Mathematics Star · Completed 5 practice sessions.</p></div>
        <div><img src={IMAGES.kitoImprove} alt="Kito" /><p><strong>What Should I Do Next?</strong> Fractions are improving. A short practice session today can help you get even stronger.</p></div>
        <button type="button" className="learner-btn" onClick={() => navigate('/practice')}>Practice Fractions <ArrowRightIcon size={16} /></button>
      </section>
    </div>
  )
}
