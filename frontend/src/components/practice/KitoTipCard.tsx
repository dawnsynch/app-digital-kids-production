import { IMAGES } from '../../data/images'
import { kitoTip } from '../../data/practiceContent'

/** Kito’s tip, with a pie-chart fraction used as a visual anchor. */
export default function KitoTipCard({ strand }: { strand: string }) {
  return (
    <section className="practice-tip">
      <img className="practice-tip__robot" src={IMAGES.practiceKitoTip} alt="" />

      <div className="practice-tip__body">
        <p className="practice-tip__title">
          <span className="practice-tip__bulb" aria-hidden="true">
            💡
          </span>
          Kito&rsquo;s Tip
        </p>
        <p className="practice-tip__text">{kitoTip(strand)}</p>
      </div>

      <div className="practice-tip__figure" aria-hidden="true">
        <img src={IMAGES.practicePieChart} alt="" />
        <span className="practice-tip__fraction">
          <span className="practice-tip__numerator">3</span>
          <span className="practice-tip__fraction-bar" />
          <span className="practice-tip__denominator">4</span>
        </span>
      </div>
    </section>
  )
}
