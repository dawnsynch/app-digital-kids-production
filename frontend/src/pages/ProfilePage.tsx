import { useState, type Dispatch, type SetStateAction } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRightIcon, PencilIcon, UserIcon } from '../components/icons/Icons'
import LearnerPageHeader from '../components/learner/LearnerPageHeader'
import Modal from '../components/learner/Modal'
import ProgressBar from '../components/learner/ProgressBar'
import SectionHeading from '../components/learner/SectionHeading'
import SettingToggle from '../components/learner/SettingToggle'
import { useUI } from '../components/ui/UIContext'
import { FAVORITE_SUBJECTS, LEARNING_INTERESTS, PROFILE_GOALS } from '../data/learnerPages'
import { IMAGES } from '../data/images'

const AVATARS = [IMAGES.avatar, IMAGES.lessonScience, IMAGES.lessonCoding]

export default function ProfilePage() {
  const [name, setName] = useState('Amina')
  const [draftName, setDraftName] = useState(name)
  const [avatar, setAvatar] = useState<string>(IMAGES.avatar)
  const [modal, setModal] = useState<'profile' | 'avatar' | null>(null)
  const [favorites, setFavorites] = useState(() => new Set(FAVORITE_SUBJECTS.map((item) => item.id)))
  const [interests, setInterests] = useState(() => new Set(LEARNING_INTERESTS))
  const [readAloud, setReadAloud] = useState(true)
  const [highContrast, setHighContrast] = useState(false)
  const [textSize, setTextSize] = useState<'normal' | 'larger'>('normal')
  const navigate = useNavigate()
  const { notify } = useUI()

  const toggleSetValue = (setter: Dispatch<SetStateAction<Set<string>>>, value: string) => {
    setter((current) => {
      const next = new Set(current)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  return (
    <div className={`learner-page profile-page${highContrast ? ' profile-page--contrast' : ''}${textSize === 'larger' ? ' profile-page--larger' : ''}`}>
      <LearnerPageHeader icon={UserIcon} title="My Profile" subtitle="Manage your learning profile, interests, goals, and preferences." />

      <section className="learner-panel profile-identity">
        <div className="profile-identity__person">
          <div className="profile-avatar"><img src={avatar} alt={name} /><span><PencilIcon size={16} /></span></div>
          <div>
            <h2>{name}</h2>
            <p>Grade 6 Learner</p>
            <strong>⭐ Learning Explorer — Level 4</strong>
            <small>🎓 Grade 6 <i /> 📅 Term 2 <i /> 📚 CBC Learning <i /> Member since January 2026</small>
          </div>
        </div>
        <div className="profile-identity__actions">
          <div className="profile-stat-grid">
            <span><b>⭐ 820</b><small>Stars</small></span>
            <span><b>🔥 7 Day</b><small>Streak</small></span>
            <span><b>🏅 18</b><small>Achievements</small></span>
          </div>
          <div className="profile-action-row">
            <button type="button" className="learner-btn" onClick={() => { setDraftName(name); setModal('profile') }}><PencilIcon size={16} /> Edit Profile</button>
            <button type="button" className="learner-btn learner-btn--outline" onClick={() => setModal('avatar')}>🖼️ Change Avatar</button>
          </div>
        </div>
      </section>

      <div className="profile-two-column">
        <section className="learner-panel profile-journey">
          <SectionHeading title="My Learning Journey" action={<button className="learner-link" type="button" onClick={() => navigate('/progress')}>View My Progress <ArrowRightIcon size={15} /></button>} />
          <div className="profile-mini-grid">
            {[['🎓', 'Grade 6', 'Current Grade'], ['📚', 'Term 2', 'Current Term'], ['⭐', 'Level 4', 'Learning Explorer'], ['🔥', '7 Days', 'Learning Streak']].map(([icon, value, label]) => (
              <div key={label}><span>{icon}</span><strong>{value}</strong><small>{label}</small></div>
            ))}
          </div>
        </section>

        <section className="learner-panel favorite-subjects">
          <SectionHeading title="My Favorite Subjects" subtitle="Choose the subjects you enjoy learning most." />
          <div className="favorite-grid">
            {FAVORITE_SUBJECTS.map((subject) => {
              const selected = favorites.has(subject.id)
              return <button type="button" className={`favorite-subject favorite-subject--${subject.tone}${selected ? ' is-selected' : ''}`} key={subject.id} aria-pressed={selected} onClick={() => toggleSetValue(setFavorites, subject.id)}><span>{subject.icon}</span><strong>{subject.label}</strong>{selected ? <b>✓</b> : null}</button>
            })}
          </div>
        </section>

        <section className="learner-panel profile-goals">
          <SectionHeading title="My Learning Goals" subtitle="My learning targets for this week." />
          {PROFILE_GOALS.map((goal) => (
            <div className="profile-goal" key={goal.id}>
              <span className={`learner-icon learner-icon--${goal.tone}`}>{goal.icon}</span>
              <div><strong>{goal.title}</strong><small>{goal.detail}</small><ProgressBar value={(goal.done / goal.total) * 100} label={`${goal.title} progress`} /></div>
              <b>{goal.done === goal.total ? 'Completed ✓' : `${goal.done} of ${goal.total}`}</b>
            </div>
          ))}
        </section>

        <section className="learner-panel profile-interests">
          <SectionHeading title="What I Want to Learn" subtitle="My learning interests and goals." />
          <div className="interest-grid">
            {LEARNING_INTERESTS.map((interest) => <button type="button" key={interest} className={interests.has(interest) ? 'is-selected' : ''} aria-pressed={interests.has(interest)} onClick={() => toggleSetValue(setInterests, interest)}>{interests.has(interest) ? '✓' : '+'} {interest}</button>)}
          </div>
          <p className="profile-kito-note"><img src={IMAGES.brandLogo} alt="" /> Your interests help Kito recommend lessons for you.</p>
        </section>
      </div>

      <div className="profile-bottom-grid">
        <section className="learner-panel learning-style">
          <SectionHeading title="How I Like to Learn" subtitle="Choose what works best for you." />
          <div className="learning-style__grid">
            {[['🖼️', 'Visual', 'Pictures & diagrams'], ['✅', 'Practice', 'Answering questions'], ['▶️', 'Videos', 'Short learning videos'], ['🔀', 'Step-by-Step', 'Explained clearly']].map(([icon, title, detail]) => <button type="button" className="is-selected" key={title} onClick={() => notify(`${title} learning preference updated for this session.`, 'success')}><span>{icon}</span><strong>{title}</strong><small>{detail}</small><b>✓</b></button>)}
          </div>
        </section>

        <section className="learner-panel profile-comfort">
          <SectionHeading title="Make Learning Comfortable" />
          <div className="text-size-control"><strong>Text Size</strong><button type="button" className={textSize === 'normal' ? 'is-active' : ''} onClick={() => setTextSize('normal')}>Normal</button><button type="button" className={textSize === 'larger' ? 'is-active' : ''} onClick={() => setTextSize('larger')}>Larger</button></div>
          <SettingToggle label="Read Aloud" description="Read questions and lessons aloud" icon="🔊" checked={readAloud} onChange={setReadAloud} />
          <SettingToggle label="High Contrast" description="Increase text and button contrast" icon="◐" checked={highContrast} onChange={setHighContrast} />
        </section>

        <section className="parent-managed-card">
          <h3>🛡️ Parent Managed</h3>
          <p>Some account and safety settings are managed by your parent or guardian.</p>
          <button type="button" className="learner-btn learner-btn--outline" onClick={() => notify('Account information requires a connected parent account.')}>
            View Account Information <ArrowRightIcon size={16} />
          </button>
        </section>
      </div>

      {modal === 'profile' ? (
        <Modal title="Edit Profile" onClose={() => setModal(null)}>
          <form className="learner-form" onSubmit={(event) => { event.preventDefault(); setName(draftName.trim() || 'Amina'); setModal(null); notify('Profile updated for this session only.', 'success') }}>
            <label>Display name<input value={draftName} onChange={(event) => setDraftName(event.target.value)} maxLength={30} /></label>
            <label>Grade<select defaultValue="Grade 6"><option>Grade 5</option><option>Grade 6</option></select></label>
            <p>Preview only — changes are not saved to an account.</p>
            <button type="submit" className="learner-btn">Update Preview</button>
          </form>
        </Modal>
      ) : null}

      {modal === 'avatar' ? (
        <Modal title="Choose an Avatar" onClose={() => setModal(null)}>
          <div className="avatar-choices">
            {AVATARS.map((source) => <button type="button" key={source} className={avatar === source ? 'is-selected' : ''} onClick={() => { setAvatar(source); setModal(null); notify('Avatar updated for this session only.', 'success') }}><img src={source} alt="Avatar option" /></button>)}
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
