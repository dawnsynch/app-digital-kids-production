import { IMAGES } from '../../data/images'
import { ArrowRightIcon } from '../icons/Icons'
import { useUI } from '../ui/UIContext'

export default function KeepImproving() {
  const { notify } = useUI()

  return (
    <section className="improve">
      <h3 className="card-title">Keep Improving</h3>

      <img className="improve__robot" src={IMAGES.kitoImprove} alt="" />

      <p className="improve__text">
        You are doing very well in multiplication. Let&rsquo;s practice fractions today.
      </p>

      <button
        type="button"
        className="improve__btn"
        onClick={() => notify('Opening fraction practice…', 'success')}
      >
        Practice Fractions
        <ArrowRightIcon size={16} />
      </button>
    </section>
  )
}
