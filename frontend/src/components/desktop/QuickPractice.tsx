import { useState } from 'react'
import { PRACTICE_TILES } from '../../data/dashboard'
import { ChevronRightIcon } from '../icons/Icons'
import { useUI } from '../ui/UIContext'

export default function QuickPractice() {
  const { notify } = useUI()
  const [active, setActive] = useState<string | null>(null)

  return (
    <section className="quick">
      <h3 className="quick__title">Quick Practice</h3>

      <div className="quick__grid">
        {PRACTICE_TILES.map((tile) => {
          const IconComponent = tile.icon
          return (
            <button
              key={tile.id}
              type="button"
              className={`quick__tile${active === tile.id ? ' is-active' : ''}`}
              onClick={() => {
                setActive(tile.id)
                notify(`Quick practice: ${tile.label}`, 'success')
              }}
            >
              <span className="quick__icon" style={{ background: tile.bg, color: tile.color }}>
                <IconComponent size={22} />
              </span>
              <span className="quick__label">{tile.label}</span>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        className="quick__more"
        onClick={() => notify('Opening the full subject list…')}
      >
        View More Subjects
        <ChevronRightIcon size={15} />
      </button>
    </section>
  )
}
