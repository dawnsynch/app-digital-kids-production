import { QUESTION_COUNTS } from '../../data/practiceContent'
import { StopwatchIcon } from '../icons/Icons'

type Props = {
  value: number
  onChange: (count: number) => void
}

/** Step 6 — how many questions the practice should contain. */
export default function QuestionCountPicker({ value, onChange }: Props) {
  return (
    <section className="practice-card">
      <div className="practice-card__head">
        <span className="practice-card__number">6</span>
        <h3 className="practice-card__title">Number of questions</h3>
      </div>

      <div className="questions__options" role="radiogroup" aria-label="Number of questions">
        {QUESTION_COUNTS.map((count) => {
          const isSelected = count === value
          return (
            <button
              key={count}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`questions__option${isSelected ? ' is-selected' : ''}`}
              onClick={() => onChange(count)}
            >
              <span className="questions__value">{count}</span>
              <span className="questions__label">Questions</span>
            </button>
          )
        })}
      </div>

      <div className="practice-panel">
        <StopwatchIcon className="practice-panel__icon" size={40} />
        <div>
          <p className="practice-panel__title">About {value} minutes</p>
          <p className="practice-panel__text">A short practice to strengthen your skills.</p>
        </div>
      </div>
    </section>
  )
}
