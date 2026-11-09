import { Outlet } from 'react-router-dom'
import { IMAGES } from '../../data/images'

export default function ParentAuthLayout() {
  return (
    <main className="parent-auth-shell">
      <div className="parent-auth-shell__glow parent-auth-shell__glow--one" />
      <div className="parent-auth-shell__glow parent-auth-shell__glow--two" />
      <header className="parent-auth-brand" aria-label="Digital Kids Learning Assistant">
        <img src={IMAGES.brandLogo} alt="" />
        <div><strong>Digital Kids</strong><span>Learning Assistant</span></div>
      </header>
      <div className="parent-auth-preview" role="note">Secure parent-managed access</div>
      <Outlet />
    </main>
  )
}
