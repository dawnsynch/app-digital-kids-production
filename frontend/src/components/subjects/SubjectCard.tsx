import { useNavigate } from 'react-router-dom'
import type { Subject } from '../../data/subjects'
import { ArrowRightIcon, BookIcon } from '../icons/Icons'
import { useUI } from '../ui/UIContext'
import { useAuth } from '../../auth/AuthContext'

type Props = {
  subject: Subject
}

/** A single subject tile: badge, illustration, progress and a practice action. */
export default function SubjectCard({ subject }: Props) {
  const { notify } = useUI()
  const navigate = useNavigate()
  const { user } = useAuth()
  const prefix = user?.role === 'learner' ? '/learner' : ''

  const name = subject.nameLines.join(' ')

  /** Subjects with a detail page open it; the rest report their progress. */
  const openSubject = () => {
    if (subject.detailPath) {
      navigate(`${prefix}${subject.detailPath}`)
      return
    }
    notify(`${name}: ${subject.progress}% complete · ${subject.lessons} lessons`)
  }

  const startPractice = () => {
    notify(`Opening ${name} practice…`, 'success')
    navigate(`${prefix}/practice?subject=${encodeURIComponent(name)}`)
  }

  return (
    <article
      className="subject-card"
      style={{ '--subject-color': subject.color } as React.CSSProperties}
    >
      <header className="subject-card__head">
        <button
          type="button"
          className="subject-card__badge"
          onClick={openSubject}
          aria-label={`Open ${name}`}
        >
          <img src={subject.badge} alt="" />
        </button>
        <h3 className="subject-card__name">
          <button type="button" onClick={openSubject}>
            {subject.nameLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </button>
        </h3>
      </header>

      <button
        type="button"
        className="subject-card__art"
        onClick={openSubject}
        aria-label={`${name} — ${subject.progress}% complete, ${subject.lessons} lessons`}
      >
        <img src={subject.illustration} alt="" />
      </button>

      <p className="subject-card__progress">
        <span className="subject-card__percent">{subject.progress}%</span> complete
      </p>

      <div className="subject-card__bar">
        <span style={{ width: `${subject.progress}%` }} />
      </div>

      <p className="subject-card__lessons">
        <BookIcon size={17} />
        {subject.lessons} lessons
      </p>

      <button type="button" className="subject-card__btn" onClick={startPractice}>
        Practice
        <ArrowRightIcon size={18} />
      </button>
    </article>
  )
}
