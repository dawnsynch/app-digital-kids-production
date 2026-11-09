import { useState } from 'react'
import { NAV_ITEMS } from '../../data/dashboard'
import { IMAGES } from '../../data/images'
import { CloseIcon } from '../icons/Icons'
import { useUI } from '../ui/UIContext'
import { ChatIcon, SearchIcon } from './SidebarIcons'

type Props = {
  active: string
  onSelect: (id: string, label: string) => void
  open: boolean
  onClose: () => void
}

const KITO_REPLIES = [
  'Hi Amina! Want to practise fractions for 10 minutes?',
  'You did great on multiplication today — 3 days in a row!',
  'I found 2 new science videos for your lesson plan.',
]

export default function Sidebar({ active, onSelect, open, onClose }: Props) {
  const { notify } = useUI()
  const [chatOpen, setChatOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [reply, setReply] = useState(KITO_REPLIES[0])

  const main = NAV_ITEMS.filter((item) => item.group === 'main')
  const utility = NAV_ITEMS.filter((item) => item.group === 'utility')

  const renderLink = (item: (typeof NAV_ITEMS)[number]) => {
    const IconComponent = item.icon
    return (
      <button
        key={item.id}
        type="button"
        className={`sidebar__link${active === item.id ? ' is-active' : ''}`}
        onClick={() => {
          onSelect(item.id, item.label)
          onClose()
        }}
        aria-current={active === item.id ? 'page' : undefined}
      >
        <IconComponent className="sidebar__link-icon" size={19} />
        <span className="sidebar__link-text">{item.label}</span>
      </button>
    )
  }

  const send = () => {
    const text = message.trim()
    if (!text) return
    setReply(KITO_REPLIES[Math.floor(Math.random() * KITO_REPLIES.length)])
    setMessage('')
    notify('Kito replied to your message', 'success')
  }

  return (
    <aside className={`sidebar${open ? ' is-open' : ''}`} aria-label="Main navigation">
      <div className="sidebar__inner">
        <div className="sidebar__brand">
          <img className="sidebar__logo" src={IMAGES.brandLogo} alt="" />
          <div className="sidebar__brand-text">
            <div className="sidebar__brand-name">Digital Kids</div>
            <div className="sidebar__brand-sub">Learning Assistant</div>
          </div>
          <button
            type="button"
            className="sidebar__close"
            aria-label="Close navigation"
            onClick={onClose}
          >
            <CloseIcon size={20} />
          </button>
        </div>

        <nav className="sidebar__nav">{main.map(renderLink)}</nav>

        <div className="sidebar__divider" />

        <nav className="sidebar__nav">{utility.map(renderLink)}</nav>

        <div className="sidebar__spacer" />

        <div className={`kito-card${chatOpen ? ' is-chat' : ''}`}>
          {chatOpen && (
            <div className="kito-chat" role="dialog" aria-label="Kito chat">
              <div className="kito-chat__bubble">
                <img src={IMAGES.kitoImprove} alt="" />
                <p>{reply}</p>
              </div>
              <form
                className="kito-chat__form"
                onSubmit={(event) => {
                  event.preventDefault()
                  send()
                }}
              >
                <input
                  className="kito-chat__input"
                  value={message}
                  placeholder="Ask Kito anything…"
                  onChange={(event) => setMessage(event.target.value)}
                  aria-label="Message Kito"
                />
                <button type="submit" className="kito-chat__send" aria-label="Send message">
                  <ChatIcon size={14} />
                </button>
              </form>
            </div>
          )}

          <img className="kito-card__robot" src={IMAGES.kitoSidebar} alt="" />
          <div className="kito-card__text">
            <div className="kito-card__title">Hi! I&rsquo;m Kito</div>
            <p>Your AI learning companion.</p>
            <p>How can I help you today?</p>
          </div>
          <button
            type="button"
            className="kito-card__button"
            onClick={() => {
              setChatOpen((v) => !v)
              notify(chatOpen ? 'Chat closed' : 'Kito is ready to help!', 'success')
            }}
            aria-expanded={chatOpen}
          >
            {chatOpen ? <ChatIcon size={16} /> : <SearchIcon size={16} />}
            Chat with Kito
          </button>
        </div>
      </div>
    </aside>
  )
}
