import { DIFFICULTIES } from '../../data/practiceContent'

type Props = {
  value: string
  onChange: (id: string) => void
}

/** Step 5 — pick how hard the practice should be. */
export default function DifficultyPicker({ value, onChange }: Props) {
  return (
    <section className="practice-card">
      <div className="practice-card__head">
        <span className="practice-card__number">5</span>
        <h3 className="practice-card__title">Choose your difficulty</h3>
      </div>

      <div className="difficulty__options" role="radiogroup" aria-label="Choose your difficulty">
        {DIFFICULTIES.map((difficulty) => {
          const isSelected = difficulty.id === value
          return (
            <button
              key={difficulty.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`difficulty__option${isSelected ? ' is-selected' : ''}`}
              style={
                {
                  '--option-color': difficulty.color,
                  '--option-accent': difficulty.accent,
                  '--option-bg': difficulty.background,
                } as React.CSSProperties
              }
              onClick={() => onChange(difficulty.id)}
            >
              <img className="difficulty__image" src={difficulty.image} alt="" />
              <span className="difficulty__label">{difficulty.label}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
