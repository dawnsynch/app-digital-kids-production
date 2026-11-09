import { Fragment } from 'react'
import { PRACTICE_STEPS } from '../../data/practiceContent'

type Props = {
  /** Index of the stage that is currently active. */
  active: number
  onSelect: (index: number) => void
}

/** Three-stage progress indicator shown under the page headline. */
export default function StepIndicator({ active, onSelect }: Props) {
  return (
    <ol className="practice__steps">
      {PRACTICE_STEPS.map((step, index) => {
        const isActive = index === active
        const isDone = index < active
        return (
          <Fragment key={step.id}>
            {index > 0 && <li className="practice__step-line" aria-hidden="true" />}
            <li className="practice__step">
              <button
                type="button"
                className={`practice__step-button${isActive ? ' is-active' : ''}${isDone ? ' is-done' : ''}`}
                onClick={() => onSelect(index)}
                aria-current={isActive ? 'step' : undefined}
              >
                <span className="practice__step-number">{index + 1}</span>
                <span className="practice__step-label">{step.label}</span>
              </button>
            </li>
          </Fragment>
        )
      })}
    </ol>
  )
}
