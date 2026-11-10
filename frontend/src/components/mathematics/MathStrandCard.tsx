import type { MathStrand } from '../../data/mathematicsContent'
import { ArrowRightIcon, BookIcon, PencilIcon } from '../icons/Icons'
import { useUI } from '../ui/UIContext'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

type Props = {
  strand: MathStrand
}

/** A Mathematics strand tile: badge, progress, counts and a call to action. */
export default function MathStrandCard({ strand }: Props) {
  const { notify } = useUI()
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <article
      className="strand-card"
      style={{ '--strand-color': strand.color } as React.CSSProperties}
    >
      <div className="strand-card__art" aria-hidden="true">
        <img src={strand.illustration} alt="" />
      </div>

      <div className="strand-card__head">
        <img className="strand-card__badge" src={strand.badge} alt="" />

        <div className="strand-card__titlebar">
          <h3 className="strand-card__title">{strand.name}</h3>
          <div className="strand-card__bar">
            <span style={{ width: `${strand.progress}%` }} />
          </div>
        </div>

        <p className="strand-card__pct">
          <span className="strand-card__pct-value">{strand.progress}%</span>
          <span className="strand-card__pct-label">complete</span>
        </p>
      </div>

      <div className="strand-card__stats">
        <div className="strand-card__stat">
          <BookIcon className="strand-card__stat-icon" size={20} />
          <span className="strand-card__stat-value">{strand.lessons}</span>
          <span className="strand-card__stat-label">Lessons</span>
        </div>
        <div className="strand-card__stat">
          <PencilIcon className="strand-card__stat-icon" size={20} />
          <span className="strand-card__stat-value">{strand.questions}</span>
          <span className="strand-card__stat-label">Practice Questions</span>
        </div>
      </div>

      <button
        type="button"
        className="strand-card__btn"
        onClick={() => {
          notify(`Opening ${strand.name} practice…`, 'success')
          const prefix = user?.role === 'learner' ? '/learner' : ''
          navigate(`${prefix}/practice?subject=Mathematics&strand=${encodeURIComponent(strand.name)}`)
        }}
      >
        {strand.action}
        <ArrowRightIcon size={19} />
      </button>
    </article>
  )
}
