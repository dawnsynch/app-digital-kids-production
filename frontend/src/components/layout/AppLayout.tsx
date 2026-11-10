import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useUI } from '../ui/UIContext'
import FeatureStrip from './FeatureStrip'
import Header from './Header'
import MobileBottomNav from './MobileBottomNav'
import MobileTopBar from './MobileTopBar'
import Sidebar from './Sidebar'
import { useAuth } from '../../auth/AuthContext'

/**
 * The shared application shell: sidebar, header, routed page content and the
 * platform-highlights footer. Only the routed outlet changes between pages.
 */
export default function AppLayout() {
  const { notify } = useUI()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const learnerPrefix = user?.role === 'learner' ? '/learner' : ''
  const [navOpen, setNavOpen] = useState(false)

  const activePath = location.pathname.replace(/^\/learner/, '') || '/'
  const active = activePath.startsWith('/learn')
    ? 'learn'
    : activePath.startsWith('/practice')
      ? 'practice'
      : activePath.startsWith('/coding-technology')
        ? 'coding'
        : activePath.startsWith('/bible-learning')
          ? 'bible'
          : activePath.startsWith('/subjects')
            ? 'subjects'
            : activePath.startsWith('/achievements')
              ? 'achievements'
              : activePath.startsWith('/progress')
                ? 'progress'
                : activePath.startsWith('/profile')
                  ? 'profile'
                  : activePath.startsWith('/help')
                    ? 'help'
                    : activePath.startsWith('/settings')
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
      navigate(user?.role === 'learner' ? '/learner/dashboard' : '/')
      return
    }
    if (id === 'learn') {
      navigate('/learn')
      return
    }
    if (id === 'practice') {
      navigate(`${learnerPrefix}/practice`)
      return
    }
    if (id === 'subjects') {
      navigate(`${learnerPrefix}/subjects`)
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
