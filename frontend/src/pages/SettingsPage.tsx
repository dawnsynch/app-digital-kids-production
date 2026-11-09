import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRightIcon, GearIcon } from '../components/icons/Icons'
import LearnerPageHeader from '../components/learner/LearnerPageHeader'
import SectionHeading from '../components/learner/SectionHeading'
import SettingToggle from '../components/learner/SettingToggle'
import { useUI } from '../components/ui/UIContext'
import { DEFAULT_LEARNER_SETTINGS, type LearnerSettingKey } from '../data/learnerPages'

export default function SettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_LEARNER_SETTINGS)
  const [textSize, setTextSize] = useState<'normal' | 'large'>('normal')
  const [language, setLanguage] = useState('English')
  const [volume, setVolume] = useState(68)
  const [changed, setChanged] = useState(false)
  const navigate = useNavigate()
  const { notify } = useUI()

  const updateSetting = (key: LearnerSettingKey, value: boolean) => {
    setSettings((current) => ({ ...current, [key]: value }))
    setChanged(true)
  }

  const sessionNotice = () => {
    setChanged(true)
    notify('Preference updated for this browser session only.', 'success')
  }

  return (
    <div className={`learner-page settings-page${settings.highContrast ? ' settings-page--contrast' : ''}${textSize === 'large' ? ' settings-page--large' : ''}`}>
      <LearnerPageHeader icon={GearIcon} title="Settings" subtitle="Manage your learning, display and accessibility preferences." />

      <div className={`settings-notice${changed ? ' is-changed' : ''}`} role="status">
        <span aria-hidden="true">✓</span>
        <div><strong>{changed ? 'Preferences updated for this session' : 'Session-only settings preview'}</strong><small>These controls are not connected to an account or saved after you leave.</small></div>
      </div>

      <div className="settings-grid">
        <section className="learner-panel settings-group">
          <SectionHeading title="🎓 Learning Preferences" />
          <SettingToggle label="Read Lessons Aloud" description="Listen to questions and lessons read out loud." icon="🔊" checked={settings.readAloud} onChange={(value) => updateSetting('readAloud', value)} />
          <SettingToggle label="Show Hints" description="Get helpful hints when a question is tricky." icon="💡" checked={settings.showHints} onChange={(value) => updateSetting('showHints', value)} />
          <SettingToggle label="Kito Suggestions" description="Get learning tips and next steps from Kito." icon="🤖" checked={settings.kitoSuggestions} onChange={(value) => updateSetting('kitoSuggestions', value)} />
          <SettingToggle label="Celebration Animations" description="See fun celebrations when you make progress." icon="🎉" checked={settings.celebrations} onChange={(value) => updateSetting('celebrations', value)} />
        </section>

        <section className="learner-panel settings-group">
          <SectionHeading title="♿ Make Learning Comfortable" />
          <div className="setting-row">
            <span className="setting-row__icon">Aa</span><div className="setting-row__copy"><strong>Text Size</strong><span>Choose a comfortable reading size.</span></div>
            <div className="setting-segment"><button type="button" className={textSize === 'normal' ? 'is-active' : ''} onClick={() => { setTextSize('normal'); sessionNotice() }}>Normal</button><button type="button" className={textSize === 'large' ? 'is-active' : ''} onClick={() => { setTextSize('large'); sessionNotice() }}>Large</button></div>
          </div>
          <SettingToggle label="High Contrast" description="Use clearer, stronger colors." icon="◐" checked={settings.highContrast} onChange={(value) => updateSetting('highContrast', value)} />
          <SettingToggle label="Reduced Motion" description="Use simpler, calmer animations." icon="🏃" checked={settings.reducedMotion} onChange={(value) => updateSetting('reducedMotion', value)} />
          <SettingToggle label="Focus Mode" description="Reduce distractions to help you concentrate." icon="◎" checked={settings.focusMode} onChange={(value) => updateSetting('focusMode', value)} />
        </section>

        <section className="learner-panel settings-group settings-language">
          <SectionHeading title="🌐 Language" />
          <label><span><strong>Language</strong><small>Choose the language you want to learn in.</small></span><select value={language} onChange={(event) => { setLanguage(event.target.value); sessionNotice() }}><option>English</option><option>Kiswahili</option></select></label>
          <p>ℹ️ More languages may be added later.</p>
        </section>

        <section className="learner-panel settings-group">
          <SectionHeading title="🔔 Reminders" />
          <SettingToggle label="Learning Reminder" description="Get a friendly reminder to keep learning." icon="📅" checked={settings.learningReminder} onChange={(value) => updateSetting('learningReminder', value)} />
          <SettingToggle label="Streak Reminder" description="A reminder to keep your learning streak going." icon="🔥" checked={settings.streakReminder} onChange={(value) => updateSetting('streakReminder', value)} />
          <SettingToggle label="New Activities" description="Be notified when new lessons or activities are ready." icon="✨" checked={settings.newActivities} onChange={(value) => updateSetting('newActivities', value)} />
        </section>

        <section className="learner-panel settings-group settings-sound">
          <SectionHeading title="🔊 Sound" />
          <SettingToggle label="Learning Sounds" description="Hear sounds for buttons, answers and feedback." icon="🔊" checked={settings.learningSounds} onChange={(value) => updateSetting('learningSounds', value)} />
          <SettingToggle label="Celebration Sounds" description="Hear fun sounds when you reach a goal." icon="🏆" checked={settings.celebrationSounds} onChange={(value) => updateSetting('celebrationSounds', value)} />
          <label className="volume-row"><span>🔊 <strong>Volume</strong></span><input type="range" min="0" max="100" value={volume} aria-label="Learning sound volume" onChange={(event) => { setVolume(Number(event.target.value)); setChanged(true) }} /><b>{volume}%</b></label>
        </section>

        <section className="parent-settings-card">
          <SectionHeading title="🛡️ Parent Managed" subtitle="Some settings are managed by your parent or guardian to keep your account safe." />
          <div className="parent-settings-card__grid">
            {['Account Information', 'Permissions', 'Learner PIN', 'Password', 'Privacy', 'Device access'].map((item) => <button type="button" key={item} onClick={() => notify(`${item} requires a connected parent account.`)}>{item}<ArrowRightIcon size={14} /></button>)}
          </div>
          <button type="button" className="learner-btn learner-btn--outline" onClick={() => notify('Account information requires a connected parent account.')}>View Account Information <ArrowRightIcon size={16} /></button>
        </section>

        <section className="learner-panel settings-group settings-account">
          <SectionHeading title="👤 Account" />
          <button type="button" onClick={() => navigate('/profile')}><span>👤</span><div><strong>My Profile</strong><small>View and update your profile.</small></div><ArrowRightIcon size={16} /></button>
          <button type="button" onClick={() => navigate('/help')}><span>❔</span><div><strong>Help</strong><small>Get answers and support.</small></div><ArrowRightIcon size={16} /></button>
          <button type="button" onClick={() => notify('Learner switching requires a connected parent account.')}><span>👥</span><div><strong>Switch Learner</strong><small>Switch to another learner on this device.</small></div><ArrowRightIcon size={16} /></button>
          <button type="button" onClick={() => notify('Sign out is unavailable because this preview has no authentication.')}><span>↪</span><div><strong>Sign Out</strong><small>No authenticated session is active.</small></div><ArrowRightIcon size={16} /></button>
        </section>
      </div>
    </div>
  )
}
