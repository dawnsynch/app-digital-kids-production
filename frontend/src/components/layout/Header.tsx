import { useEffect, useRef, useState } from 'react'
import { NOTIFICATIONS } from '../../data/dashboard'
import { IMAGES } from '../../data/images'
import { BellIcon } from '../icons/Icons'
import { useUI } from '../ui/UIContext'

export default function TopBar() {
  const { notify } = useUI()
  const [open, setOpen] = useState(false)
  const bellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  return (
    <header className="topbar">
      <div className="topbar__greeting">
        <h1 className="topbar__title">
          Good afternoon, Amina! <span className="topbar__wave">👋</span>
        </h1>
        <p className="topbar__subtitle">Ready to learn something new today?</p>
      </div>

      <div className="topbar__stats">
        <div className="stat-chip stat-chip--grade">
          <img src={IMAGES.gradeCap} alt="" className="stat-chip__cap" />
          <span>Grade 6</span>
        </div>

        <span className="stat-divider" aria-hidden="true" />

        <div className="stat-chip stat-chip--plain">
          <span className="stat-chip__emoji">🔥</span>
          <span className="stat-chip__value">
            7<span className="stat-chip__label">Day Streak</span>
          </span>
        </div>

        <span className="stat-divider" aria-hidden="true" />

        <div className="stat-chip stat-chip--plain">
          <span className="stat-chip__emoji">⭐</span>
          <span className="stat-chip__value">
            820<span className="stat-chip__label">Stars</span>
          </span>
        </div>

        <div className="topbar__bell" ref={bellRef}>
          <button
            type="button"
            className="icon-button"
            aria-label="Notifications"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <BellIcon size={22} />
            <span className="icon-button__badge">3</span>
          </button>

          {open && (
            <div className="popover popover--notifications">
              <div className="popover__title">Notifications</div>
              <ul className="popover__list">
                {NOTIFICATIONS.map((item) => (
                  <li key={item.id} className="popover__item">
                    <span className="popover__item-title">{item.title}</span>
                    <span className="popover__item-body">{item.body}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="popover__action"
                onClick={() => {
                  setOpen(false)
                  notify('All notifications marked as read', 'success')
                }}
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          className="avatar"
          aria-label="Open Amina's profile"
          onClick={() => notify('Profile: Amina — Grade 6 learner')}
        >
          <img src={IMAGES.avatar} alt="Amina" />
        </button>
      </div>
    </header>
  )
}
