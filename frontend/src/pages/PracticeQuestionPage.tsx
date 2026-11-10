import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { ArrowRightIcon } from '../components/icons/Icons'
import { usePractice } from '../practice/PracticeContext'

export default function PracticeQuestionPage() {
  const { assessmentId } = useParams()
  const navigate = useNavigate()
  const { logoutLearner } = useAuth()
  const {
    assessment, receipt, feedback, drafts, loading, error,
    loadAssessment, submitAssessment, loadFeedback, setDraft,
  } = usePractice()
  const [index, setIndex] = useState(0)
  const [reviewing, setReviewing] = useState(false)
  const numericId = Number(assessmentId)

  useEffect(() => {
    if (!Number.isInteger(numericId) || numericId < 1 || assessment?.assessment_id === numericId) return
    void loadAssessment(numericId).catch(() => undefined)
  }, [numericId, assessment?.assessment_id, loadAssessment])

  useEffect(() => {
    if (assessment?.assessment_id === numericId && assessment.status === 'released' && !feedback) {
      void loadFeedback(numericId).catch(() => undefined)
    }
  }, [assessment?.assessment_id, assessment?.status, feedback, loadFeedback, numericId])

  const answeredCount = useMemo(
    () => assessment?.questions.filter((question) => (drafts[question.id] || '').trim()).length || 0,
    [assessment?.questions, drafts],
  )

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (assessment?.status === 'ready' && Object.values(drafts).some((answer) => answer.trim())) event.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [assessment?.status, drafts])

  if (!Number.isInteger(numericId) || numericId < 1) return <div className="practice-player__message" role="alert">This practice link is invalid.</div>
  if (loading && !assessment) return <div className="practice-player__message" role="status">Loading your questions…</div>
  if (error && (!assessment || assessment.assessment_id !== numericId)) return <div className="practice-player__message" role="alert"><p>{error}</p><button type="button" onClick={() => void loadAssessment(numericId)}>Try Again</button></div>
  if (!assessment || assessment.assessment_id !== numericId) return null

  const submitted = assessment.status !== 'ready'
  const question = assessment.questions[index]
  const unanswered = assessment.questions.length - answeredCount

  const leave = () => {
    if (!submitted && answeredCount > 0 && !window.confirm('Leave this practice? Draft answers are kept only in this active learner session.')) return
    navigate('/learner/practice')
  }

  const submit = async () => {
    const warning = unanswered ? `You have ${unanswered} unanswered question${unanswered === 1 ? '' : 's'}. ` : ''
    if (!window.confirm(`${warning}Submit final answers? They cannot be changed after submission.`)) return
    try {
      await submitAssessment(numericId)
      setReviewing(false)
    } catch {
      // The context renders safe retry copy.
    }
  }

  const parentSignIn = async () => {
    await logoutLearner()
    navigate('/parent/sign-in', { replace: true, state: { sessionRequired: true } })
  }

  if (assessment.status === 'released' && feedback) {
    return <section className="practice-player practice-feedback" aria-labelledby="released-feedback-title">
      <header className="practice-player__header"><div><p>{feedback.subject} · {feedback.strand}</p><h1 id="released-feedback-title">Released Feedback</h1></div><button type="button" className="practice-player__exit" onClick={() => navigate('/learner/dashboard')}>Dashboard</button></header>
      <article className="practice-player__card practice-feedback__summary">
        <p className="practice-player__skill">Reviewed and released by your parent</p>
        <h2>{feedback.result.percentage}% · {feedback.result.score} of {feedback.result.total_marks} marks</h2>
        <p>{feedback.result.overall_feedback}</p>
        <div className="practice-feedback__columns"><div><h3>Strengths</h3><ul>{feedback.result.strengths.map((item) => <li key={item}>{item}</li>)}</ul></div><div><h3>Try next</h3><ul>{feedback.result.recommendations.map((item) => <li key={item}>{item}</li>)}</ul></div></div>
      </article>
      <div className="practice-review__list">{feedback.result.marked_questions.map((item, itemIndex) => <article key={item.question_id} className="practice-review__item"><strong>Question {itemIndex + 1}</strong><h3>{item.question}</h3><p><b>Your answer:</b> {item.student_answer || 'Not answered'}</p><p><b>Expected:</b> {item.expected_answer}</p><p><b>Feedback:</b> {item.feedback}</p><span>{item.marks_awarded} / {item.total_marks} marks</span></article>)}</div>
    </section>
  }

  if (submitted) {
    return <section className="practice-player practice-receipt" aria-labelledby="submission-receipt-title">
      <header className="practice-player__header"><div><p>{assessment.subject} · {assessment.strand}</p><h1 id="submission-receipt-title">Answers Submitted</h1></div><span className="assessment-status">{assessment.status.replace('_', ' ')}</span></header>
      <article className="practice-player__card">
        <p className="practice-receipt__check" aria-hidden="true">✓</p>
        <h2>Your final answers are locked safely.</h2>
        <p>{receipt?.message || 'A parent can review and mark this assessment. Scores stay hidden until the result is reviewed and released.'}</p>
        {receipt ? <p><strong>{receipt.answered_count}</strong> answered · <strong>{receipt.unanswered_count}</strong> unanswered · Submission version {receipt.submission_version}</p> : null}
        <div className="practice-receipt__actions"><button type="button" onClick={() => setReviewing(true)}>View Submitted Answers</button><button type="button" onClick={() => void parentSignIn()}>Parent Sign In to Review</button></div>
      </article>
      {reviewing ? <div className="practice-review__list">{assessment.questions.map((item, itemIndex) => <article key={item.id} className="practice-review__item"><strong>Question {itemIndex + 1}</strong><h3>{item.question}</h3><p>{drafts[item.id] || 'Not answered'}</p></article>)}</div> : null}
    </section>
  }

  if (reviewing) {
    return <section className="practice-player practice-review" aria-labelledby="review-answers-title">
      <header className="practice-player__header"><div><p>{assessment.subject} · {assessment.strand}</p><h1 id="review-answers-title">Review Your Answers</h1></div><button type="button" className="practice-player__exit" onClick={() => setReviewing(false)}>Back to Questions</button></header>
      {unanswered > 0 ? <div className="practice__error" role="alert">{unanswered} question{unanswered === 1 ? ' is' : 's are'} unanswered. You may submit, but unanswered questions will be locked as blank.</div> : null}
      <div className="practice-review__list">{assessment.questions.map((item, itemIndex) => <article key={item.id} className="practice-review__item"><strong>Question {itemIndex + 1}</strong><h3>{item.question}</h3><p>{drafts[item.id] || 'Not answered'}</p><button type="button" onClick={() => { setIndex(itemIndex); setReviewing(false) }}>Edit Answer</button></article>)}</div>
      {error ? <div className="practice__error" role="alert">{error}</div> : null}
      <div className="practice-review__submit"><p>Submitting creates a final, immutable answer snapshot.</p><button type="button" className="practice__start" disabled={loading} onClick={() => void submit()}>{loading ? 'Submitting…' : 'Submit Final Answers'} <ArrowRightIcon size={17} /></button></div>
    </section>
  }

  if (!question) return <div className="practice-player__message" role="alert">This practice activity has no supported questions.</div>

  return <section className="practice-player" aria-labelledby="practice-question-title">
    <header className="practice-player__header"><div><p>{assessment.subject} · {assessment.strand}</p><h1 id="practice-question-title">Question {index + 1} of {assessment.questions.length}</h1></div><button type="button" className="practice-player__exit" onClick={leave}>Exit Practice</button></header>
    <div className="practice-player__progress" aria-label={`${index + 1} of ${assessment.questions.length} questions`}><span style={{ width: `${((index + 1) / assessment.questions.length) * 100}%` }} /></div>
    <div className="practice-player__dots" aria-label={`${answeredCount} questions answered`}>{assessment.questions.map((item, itemIndex) => <button key={item.id} type="button" className={(drafts[item.id] || '').trim() ? 'is-complete' : ''} aria-label={`Question ${itemIndex + 1}${(drafts[item.id] || '').trim() ? ', answered' : ', unanswered'}`} onClick={() => setIndex(itemIndex)}>{itemIndex + 1}</button>)}</div>
    <article className="practice-player__card">
      <p className="practice-player__skill">{question.skill_tested} · {question.marks} {question.marks === 1 ? 'mark' : 'marks'}</p>
      {question.question_type === 'text' ? <><h2>{question.question}</h2><label htmlFor={`answer-${question.id}`}>Your draft answer</label><textarea id={`answer-${question.id}`} value={drafts[question.id] || ''} onChange={(event) => setDraft(question.id, event.target.value)} placeholder="Type your answer here…" rows={7} /><p className="practice-player__draft-note">Draft answer — answers are not submitted or marked until you review and submit them.</p></> : <div className="practice-player__unsupported" role="alert">This question format is not supported yet. You can continue to the next question.</div>}
    </article>
    <nav className="practice-player__nav" aria-label="Question navigation"><button type="button" onClick={() => setIndex((value) => value - 1)} disabled={index === 0}>Previous</button><span>{answeredCount} / {assessment.questions.length} answered</span>{index === assessment.questions.length - 1 ? <button type="button" onClick={() => setReviewing(true)}>Review Answers <ArrowRightIcon size={17} /></button> : <button type="button" onClick={() => setIndex((value) => value + 1)}>Next <ArrowRightIcon size={17} /></button>}</nav>
  </section>
}
