import { useNavigate } from 'react-router-dom'
import { ArrowRightIcon, ShieldCheckIcon } from '../components/icons/Icons'

export default function ParentGetStartedPage() {
  const navigate = useNavigate()

  return (
    <section className="parent-welcome">
      <div className="parent-welcome__copy">
        <p className="parent-welcome__kicker">Learn. Practice. Grow.</p>
        <h1>Learning made personal, safe and fun.</h1>
        <p>Help your child learn, practise and grow with a digital learning companion built for their learning journey.</p>
        <ul>
          <li><span>✓</span>CBC-aligned learning</li>
          <li><span>✓</span>Parent-managed access</li>
          <li><span>✓</span>Safe learning environment</li>
        </ul>
        <div className="parent-welcome__actions">
          <button type="button" className="parent-auth-button" onClick={() => navigate('/parent/register')}>Get Started <ArrowRightIcon size={18} /></button>
          <p>Already have an account? <button type="button" onClick={() => navigate('/parent/sign-in')}>Sign In</button></p>
        </div>
      </div>
      <div className="parent-welcome__visual">
        <img src="/assets/parent-auth/family-learning-v2.png" alt="A parent and child learning together with Kito" />
        <div className="parent-welcome__safety"><ShieldCheckIcon size={20} /> Parent-guided learning preview</div>
      </div>
    </section>
  )
}
