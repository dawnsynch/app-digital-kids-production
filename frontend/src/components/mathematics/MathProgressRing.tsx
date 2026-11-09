type Props = {
  /** Completion percentage (0–100). */
  value: number
  size?: number
}

/** Circular progress ring used by the “Overall Progress” summary card. */
export default function MathProgressRing({ value, size = 52 }: Props) {
  const stroke = 5.5
  const radius = 22
  const circumference = 2 * Math.PI * radius
  const dash = (value / 100) * circumference

  return (
    <div className="math-ring" style={{ width: size, height: size }}>
      <svg viewBox="0 0 50 50" aria-hidden="true" focusable="false">
        <circle
          className="math-ring__track"
          cx="25"
          cy="25"
          r={radius}
          fill="none"
          strokeWidth={stroke}
        />
        <circle
          className="math-ring__value"
          cx="25"
          cy="25"
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          transform="rotate(-90 25 25)"
        />
      </svg>
      <span className="math-ring__label">{value}%</span>
    </div>
  )
}
