import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useUI } from '../ui/UIContext'
import FeatureStrip from './FeatureStrip'
import Header from './Header'
import MobileBottomNav from './MobileBottomNav'
import MobileTopBar from './MobileTopBar'
import Sidebar from './Sidebar'

/**
 * The shared application shell: sidebar, header, routed page content and the
 * platform-highlights footer. Only the routed outlet changes between pages.
 */
export default function AppLayout() {
  const { notify } = useUI()
  const location = useLocation()
  const navigate = useNavigate()
  const [navOpen, setNavOpen] = useState(false)

  const active = location.pathname.startsWith('/learn')
    ? 'learn'
    : location.pathname.startsWith('/practice')
      ? 'practice'
      : location.pathname.startsWith('/coding-technology')
        ? 'coding'
        : location.pathname.startsWith('/bible-learning')
          ? 'bible'
          : location.pathname.startsWith('/subjects')
            ? 'subjects'
            : location.pathname.startsWith('/achievements')
              ? 'achievements'
              : location.pathname.startsWith('/progress')
                ? 'progress'
                : location.pathname.startsWith('/profile')
                  ? 'profile'
                  : location.pathname.startsWith('/help')
                    ? 'help'
                    : location.pathname.startsWith('/settings')
                      ? 'settings'
            : 'home'

  useEffect(() => {
    document.body.classList.toggle('is-locked', navOpen)
    return () => document.body.classList.remove('is-locked')
  }, [navOpen])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  const select = (id: string, label: string) => {
    if (id === 'home') {
      navigate('/')
      return
    }
    if (id === 'learn') {
      navigate('/learn')
      return
    }
    if (id === 'practice') {
      navigate('/practice')
      return
    }
    if (id === 'subjects') {
      navigate('/subjects')
      return
    }
    if (id === 'coding') {
      navigate('/coding-technology')
      return
    }
    if (id === 'bible') {
      navigate('/bible-learning')
      return
    }
    if (id === 'achievements') {
      navigate('/achievements')
      return
    }
    if (id === 'progress') {
      navigate('/progress')
      return
    }
    if (id === 'profile') {
      navigate('/profile')
      return
    }
    if (id === 'help') {
      navigate('/help')
      return
    }
    if (id === 'settings') {
      navigate('/settings')
      return
    }
    notify(`${label} selected`)
  }

  return (
    <div className="app">
      <MobileTopBar onMenu={() => setNavOpen(true)} />

      <div className="app__body">
        <div
          className={`app__scrim${navOpen ? ' is-open' : ''}`}
          onClick={() => setNavOpen(false)}
          aria-hidden="true"
        />
        <Sidebar
          active={active}
          onSelect={select}
          open={navOpen}
          onClose={() => setNavOpen(false)}
        />

        <main className="app__content">
          <Header />
          <Outlet />
          <FeatureStrip />
        </main>
      </div>

      <MobileBottomNav active={active} onSelect={select} />
    </div>
  )
}
