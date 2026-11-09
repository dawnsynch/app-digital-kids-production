import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRightIcon, HelpIcon } from '../components/icons/Icons'
import LearnerPageHeader from '../components/learner/LearnerPageHeader'
import Modal from '../components/learner/Modal'
import SectionHeading from '../components/learner/SectionHeading'
import { useUI } from '../components/ui/UIContext'
import { HELP_FAQS, HELP_TOPICS } from '../data/learnerPages'
import { IMAGES } from '../data/images'

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState(0)
  const [activeTopic, setActiveTopic] = useState('lessons')
  const [chatOpen, setChatOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [reply, setReply] = useState('Hi Amina! Ask me about lessons, practice questions, or how to use Digital Kids.')
  const navigate = useNavigate()
  const { notify } = useUI()

  const sendMessage = () => {
    const text = message.trim()
    if (!text) return
    setReply(`I can help with “${text}”. This preview uses local guidance, so no message was sent outside the app.`)
    setMessage('')
  }

  return (
    <div className="learner-page help-page">
      <LearnerPageHeader icon={HelpIcon} title="Help" subtitle="Find answers, get learning help, or ask Kito." />

      <section className="help-hero">
        <img src={IMAGES.kitoSidebar} alt="Kito the learning assistant" />
        <div>
          <h2>Hi Amina, how can I help?</h2>
          <p>Ask me about lessons, practice questions or how to use Digital Kids.</p>
          <div className="help-hero__actions">
            <button type="button" className="learner-btn" onClick={() => setChatOpen(true)}>Ask Kito <ArrowRightIcon size={17} /></button>
            <button type="button" className="learner-btn learner-btn--outline" onClick={() => document.querySelector('.help-topics')?.scrollIntoView({ behavior: 'smooth' })}>▦ Browse Help Topics</button>
          </div>
        </div>
      </section>

      <section className="learner-section help-topics">
        <SectionHeading title="What Do You Need Help With?" />
        <div className="help-topic-grid">
          {HELP_TOPICS.map((topic) => (
            <button type="button" className={`help-topic help-topic--${topic.tone}${activeTopic === topic.id ? ' is-active' : ''}`} key={topic.id} aria-pressed={activeTopic === topic.id} onClick={() => { setActiveTopic(topic.id); notify(`${topic.title} help selected.`) }}>
              <span aria-hidden="true">{topic.icon}</span><div><strong>{topic.title}</strong><small>{topic.description}</small></div><b>›</b>
            </button>
          ))}
        </div>
      </section>

      <div className="help-content-grid">
        <section className="learner-panel faq-panel">
          <SectionHeading title="💬 Popular Questions" />
          <div className="faq-list">
            {HELP_FAQS.map((faq, index) => (
              <div className={`faq-item${openFaq === index ? ' is-open' : ''}`} key={faq.question}>
                <button type="button" aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? -1 : index)}><span>▣</span><strong>{faq.question}</strong><b>{openFaq === index ? '⌃' : '⌄'}</b></button>
                {openFaq === index ? <p>{faq.answer}</p> : null}
              </div>
            ))}
          </div>
        </section>

        <div className="help-side-stack">
          <section className="learner-panel still-help">
            <SectionHeading title="🛟 Still Need Help?" subtitle="If something isn’t working, tell us what happened." />
            <div className="still-help__actions">
              <button type="button" onClick={() => notify('Problem reporting needs a connected support service.')}>⚠️<strong>Report a Problem</strong></button>
              <button type="button" onClick={() => notify('Ask your parent or guardian for help with this issue.')}>🛡️<strong>Ask My Parent</strong></button>
              <button type="button" onClick={() => notify('Support contact is unavailable in this local preview.')}>🎧<strong>Contact Support</strong></button>
            </div>
          </section>

          <section className="safety-help">
            <span aria-hidden="true">🛡️</span>
            <div><h3>Something doesn’t feel right?</h3><p>Tell your parent or guardian if you see something that makes you uncomfortable.</p><button type="button" className="learner-btn learner-btn--outline" onClick={() => navigate('/settings')}>View Safety Help <ArrowRightIcon size={16} /></button></div>
          </section>
        </div>
      </div>

      {chatOpen ? (
        <Modal title="Ask Kito" onClose={() => setChatOpen(false)}>
          <div className="help-chat">
            <div className="help-chat__reply"><img src={IMAGES.kitoImprove} alt="Kito" /><p>{reply}</p></div>
            <form onSubmit={(event) => { event.preventDefault(); sendMessage() }}>
              <label htmlFor="kito-help-message">Your question</label>
              <textarea id="kito-help-message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask about a lesson or practice question…" />
              <p>Preview only — your question stays in this browser session.</p>
              <button type="submit" className="learner-btn">Send to Kito</button>
            </form>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
