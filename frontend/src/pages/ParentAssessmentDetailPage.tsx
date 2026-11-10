import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError, apiClient } from '../api/client'
import type { ParentAssessmentDetail } from '../api/types'

function actionId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '')}`
}

export default function ParentAssessmentDetailPage() {
  const { assessmentId } = useParams()
  const numericId = Number(assessmentId)
  const navigate = useNavigate()
  const [assessment, setAssessment] = useState<ParentAssessmentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!Number.isInteger(numericId) || numericId < 1) return
    setLoading(true)
    setError('')
    try { setAssessment(await apiClient.parentAssessment(numericId)) }
    catch (caught) { setError(caught instanceof ApiError && caught.status === 404 ? 'This assessment is not available to your parent account.' : 'Assessment details could not be loaded.') }
    finally { setLoading(false) }
  }, [numericId])

  useEffect(() => { void load() }, [load])
  const answerMap = useMemo(() => new Map(assessment?.answers.map((item) => [item.question_id, item.answer]) || []), [assessment?.answers])

  const act = async (operation: () => Promise<unknown>) => {
    setActing(true)
    setError('')
    try { await operation(); await load() }
    catch (caught) { setError(caught instanceof ApiError ? caught.message : 'The action could not be completed. Please retry.') }
    finally { setActing(false) }
  }

  if (!Number.isInteger(numericId) || numericId < 1) return <main className="parent-workflow"><div role="alert">This assessment link is invalid.</div></main>
  if (loading && !assessment) return <main className="parent-workflow"><p role="status">Loading assessment review…</p></main>
  if (error && !assessment) return <main className="parent-workflow"><div className="parent-workflow__error" role="alert">{error}<button type="button" onClick={() => void load()}>Try Again</button></div></main>
  if (!assessment) return null

  return <main className="parent-workflow parent-review" aria-labelledby="parent-review-title">
    <header className="parent-workflow__header"><div><p>{assessment.learner_name} · Grade {assessment.grade}</p><h1 id="parent-review-title">{assessment.subject} · {assessment.strand}</h1><span>Submitted learner answers are read-only.</span></div><div><span className={`assessment-status assessment-status--${assessment.status}`}>{assessment.status.replace('_', ' ')}</span><button type="button" onClick={() => navigate('/parent/assessments')}>Back to Assessments</button></div></header>
    {error ? <div className="parent-workflow__error" role="alert">{error}</div> : null}
    <section className="parent-workflow__panel">
      <div className="parent-review__questions">{assessment.questions.map((question, index) => {
        const marked = assessment.result?.marked_questions.find((item) => item.question_id === question.id)
        return <article key={question.id} className="parent-review__question"><span>Question {index + 1} · {question.marks} marks</span><h2>{question.question}</h2><div className="parent-review__answer"><strong>Learner answer</strong><p>{answerMap.get(question.id) || 'Not answered'}</p></div><details><summary>Parent marking guide</summary><p><strong>Expected:</strong> {question.expected_answer}</p><p>{question.marking_guide}</p></details>{marked ? <div className="parent-review__feedback"><strong>{marked.marks_awarded} / {marked.total_marks} marks</strong><p>{marked.feedback}</p></div> : null}</article>
      })}</div>
      {assessment.result ? <section className="parent-review__result" aria-labelledby="marking-result-title"><div className="parent-review__ai-warning">AI-assisted marking requires parent judgment. Check every answer before release.</div><h2 id="marking-result-title">Marking Result</h2><strong>{assessment.result.percentage}% · {assessment.result.score} / {assessment.result.total_marks}</strong><p>{assessment.result.overall_feedback}</p></section> : null}
      <div className="parent-review__actions">
        {['submitted', 'marking_failed'].includes(assessment.status) ? <button type="button" disabled={acting} onClick={() => void act(() => apiClient.markParentAssessment(numericId, actionId('marking')))}>{acting ? 'Marking…' : assessment.status === 'marking_failed' ? 'Retry AI Marking' : 'Start AI Marking'}</button> : null}
        {assessment.status === 'needs_review' ? <button type="button" disabled={acting} onClick={() => void act(() => apiClient.reviewParentAssessment(numericId, actionId('review')))}>Confirm Parent Review</button> : null}
        {assessment.status === 'marked' ? <button type="button" disabled={acting} onClick={() => { if (window.confirm('Release this reviewed result to the learner?')) void act(() => apiClient.releaseParentAssessment(numericId, actionId('release'))) }}>Release to Learner</button> : null}
        {assessment.status === 'released' ? <p className="parent-review__released">✓ Results released to this learner.</p> : null}
      </div>
    </section>
    <section className="parent-workflow__panel parent-audit"><h2>Assessment History</h2><ol>{assessment.audit_events.map((event) => <li key={`${event.event_type}-${event.created_at}`}><strong>{event.event_type.replace(/_/g, ' ')}</strong><span>{event.previous_status || 'new'} → {event.new_status}</span><time>{new Date(event.created_at).toLocaleString()}</time></li>)}</ol></section>
  </main>
}
