import { MOBILE_BOTTOM_NAV } from '../../data/dashboard'

export default function MobileBottomNav({
  active,
  onSelect,
}: {
  active: string
  onSelect: (id: string, label: string) => void
}) {
  return (
    <nav className="bottomnav" aria-label="Primary">
      {MOBILE_BOTTOM_NAV.map((item) => {
        const IconComponent = item.icon
        return (
          <button
            key={item.id}
            type="button"
            className={`bottomnav__item${active === item.id ? ' is-active' : ''}`}
            onClick={() => onSelect(item.id, item.label)}
            aria-current={active === item.id ? 'page' : undefined}
          >
            <IconComponent size={20} />
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
