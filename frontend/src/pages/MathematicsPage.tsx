import { useNavigate } from 'react-router-dom'
import { CalendarIcon } from '../components/icons/Icons'
import { IMAGES } from '../data/images'
import { MATH_OVERVIEW, MATH_RECOMMENDED_STRAND, MATH_STRANDS } from '../data/mathematicsContent'
import { useUI } from '../components/ui/UIContext'
import MathProgressRing from '../components/mathematics/MathProgressRing'
import MathStrandCard from '../components/mathematics/MathStrandCard'
import { useAuth } from '../auth/AuthContext'

export default function MathematicsPage() {
  const { notify } = useUI()
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="math">
      <header className="math__header">
        <div className="math__identity">
          <img className="math__badge" src={IMAGES.subjectBadgeMathematics} alt="" />
          <div>
            <h1 className="math__title">Mathematics</h1>
            <p className="math__subtitle">Keep building your maths skills step by step.</p>
          </div>
        </div>

        <div className="math__stats">
          <div className="math-stat">
            <MathProgressRing value={MATH_OVERVIEW.progress} />
            <div className="math-stat__text">
              <p className="math-stat__title">Overall Progress</p>
              <p className="math-stat__sub">
                <span className="math-stat__value">{MATH_OVERVIEW.progress}%</span> complete
              </p>
            </div>
          </div>

          <div className="math-stat">
            <span className="math-stat__icon">
              <CalendarIcon size={26} />
            </span>
            <div className="math-stat__text">
              <p className="math-stat__title">{MATH_OVERVIEW.term}</p>
              <p className="math-stat__sub">{MATH_OVERVIEW.termLabel}</p>
            </div>
          </div>

          <div className="math-stat">
            <span className="math-stat__icon math-stat__icon--emoji">🔥</span>
            <div className="math-stat__text">
              <p className="math-stat__title">{MATH_OVERVIEW.streak}</p>
              <p className="math-stat__sub">Day Streak</p>
            </div>
          </div>
        </div>
      </header>

      <section className="math__strands">
        <h2 className="math__section-title">Strands</h2>
        <p className="math__section-sub">
          Master each strand to become a confident problem solver.
        </p>

        <div className="math__grid">
          {MATH_STRANDS.map((strand) => (
            <MathStrandCard key={strand.id} strand={strand} />
          ))}
        </div>
      </section>

      <section className="math__recommend">
        <img className="math__recommend-robot" src={IMAGES.mathKitoRecommend} alt="" />
        <div className="math__recommend-text">
          <p className="math__recommend-title">
            Kito recommends practicing {MATH_RECOMMENDED_STRAND} today! 🎯
          </p>
          <p className="math__recommend-sub">
            Strengthen your fraction skills and watch your confidence grow.
          </p>
        </div>
        <button
          type="button"
          className="math__recommend-btn"
          onClick={() => {
            notify(`Opening ${MATH_RECOMMENDED_STRAND} practice…`, 'success')
            const prefix = user?.role === 'learner' ? '/learner' : ''
            navigate(`${prefix}/practice?subject=Mathematics&strand=${encodeURIComponent(MATH_RECOMMENDED_STRAND)}`)
          }}
        >
          Practice {MATH_RECOMMENDED_STRAND}
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 12h15" />
            <path d="m13 6 6 6-6 6" />
          </svg>
        </button>
      </section>
    </div>
  )
}
