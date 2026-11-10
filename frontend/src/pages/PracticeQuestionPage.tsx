import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowRightIcon } from '../components/icons/Icons'
import { usePractice } from '../practice/PracticeContext'

export default function PracticeQuestionPage() {
  const { assessmentId } = useParams()
  const navigate = useNavigate()
  const { assessment, drafts, loading, error, loadAssessment, setDraft } = usePractice()
  const [index, setIndex] = useState(0)
  const numericId = Number(assessmentId)

  useEffect(() => {
    if (!Number.isInteger(numericId) || numericId < 1 || assessment?.assessment_id === numericId) return
    void loadAssessment(numericId).catch(() => undefined)
  }, [numericId, assessment?.assessment_id, loadAssessment])

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (Object.values(drafts).some((answer) => answer.trim())) event.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [drafts])

  if (!Number.isInteger(numericId) || numericId < 1) return <div className="practice-player__message" role="alert">This practice link is invalid.</div>
  if (loading && !assessment) return <div className="practice-player__message" role="status">Loading your questions…</div>
  if (error && (!assessment || assessment.assessment_id !== numericId)) return <div className="practice-player__message" role="alert"><p>{error}</p><button type="button" onClick={() => void loadAssessment(numericId)}>Try Again</button></div>
  if (!assessment || assessment.assessment_id !== numericId) return null
  const question = assessment.questions[index]
  if (!question) return <div className="practice-player__message" role="alert">This practice activity has no supported questions.</div>

  const leave = () => {
    if (Object.values(drafts).some((answer) => answer.trim()) && !window.confirm('Leave this practice? Your draft answers will be cleared when you sign out.')) return
    navigate('/learner/practice')
  }

  return <section className="practice-player" aria-labelledby="practice-question-title">
    <header className="practice-player__header"><div><p>{assessment.subject} · {assessment.strand}</p><h1 id="practice-question-title">Question {index + 1} of {assessment.questions.length}</h1></div><button type="button" className="practice-player__exit" onClick={leave}>Exit Practice</button></header>
    <div className="practice-player__progress" aria-label={`${index + 1} of ${assessment.questions.length} questions`}><span style={{ width: `${((index + 1) / assessment.questions.length) * 100}%` }} /></div>
    <article className="practice-player__card">
      <p className="practice-player__skill">{question.skill_tested} · {question.marks} {question.marks === 1 ? 'mark' : 'marks'}</p>
      {question.question_type === 'text' ? <>
        <h2>{question.question}</h2>
        <label htmlFor={`answer-${question.id}`}>Your draft answer</label>
        <textarea id={`answer-${question.id}`} value={drafts[question.id] || ''} onChange={(event) => setDraft(question.id, event.target.value)} placeholder="Type your answer here…" rows={7} />
        <p className="practice-player__draft-note">Draft only — answers are not submitted or marked in Phase 2A.</p>
      </> : <div className="practice-player__unsupported" role="alert">This question format is not supported yet. You can continue to the next question.</div>}
    </article>
    <nav className="practice-player__nav" aria-label="Question navigation">
      <button type="button" onClick={() => setIndex((value) => value - 1)} disabled={index === 0}>Previous</button>
      <span>{index + 1} / {assessment.questions.length}</span>
      <button type="button" onClick={() => setIndex((value) => value + 1)} disabled={index === assessment.questions.length - 1}>Next <ArrowRightIcon size={17} /></button>
    </nav>
  </section>
}
