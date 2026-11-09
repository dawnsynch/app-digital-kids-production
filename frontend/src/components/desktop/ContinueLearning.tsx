import { useState } from 'react'
import { ArrowRightIcon, MathIcon } from '../icons/Icons'
import { IMAGES } from '../../data/images'
import { useUI } from '../ui/UIContext'

export default function ContinueLearning() {
  const { notify } = useUI()
  const [value, setValue] = useState(51)

  return (
    <section className="hero">
      <div className="hero__card">
        <div className="hero__body">
          <h2 className="hero__eyebrow">Continue Learning</h2>
          <p className="hero__subject">
            <span className="hero__subject-icon">
              <MathIcon size={15} />
            </span>
            MATHEMATICS
          </p>
          <h3 className="hero__title">Fractions and Decimals</h3>
          <div className="hero__bar">
            <span className="hero__bar-fill" style={{ width: `${value}%` }} />
          </div>
          <p className="hero__pct">65% complete</p>
          <button
            type="button"
            className="hero__btn"
            onClick={() => {
              setValue((v) => Math.min(100, v + 5))
              notify('Resuming Fractions and Decimals…', 'success')
            }}
          >
            <span>
              Continue
              <span className="hero__btn-word"> Learning</span>
            </span>
            <ArrowRightIcon size={17} />
          </button>
        </div>
        <img className="hero__art" src={IMAGES.continueLearning} alt="" />
      </div>
    </section>
  )
}
