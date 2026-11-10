import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError, apiClient } from '../api/client'
import type { ParentAssessmentListItem, Student } from '../api/types'
import { useAuth } from '../auth/AuthContext'

const STATUS_OPTIONS = ['', 'submitted', 'marking', 'marking_failed', 'needs_review', 'marked', 'released']

export default function ParentAssessmentsPage() {
  const [assessments, setAssessments] = useState<ParentAssessmentListItem[]>([])
  const [learners, setLearners] = useState<Student[]>([])
  const [studentFilter, setStudentFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setAssessments(await apiClient.parentAssessments({
        studentId: studentFilter ? Number(studentFilter) : undefined,
        status: statusFilter || undefined,
      }))
    } catch (caught) {
      setError(caught instanceof ApiError && caught.status === 401 ? 'Your parent session expired. Please sign in again.' : 'Assessments could not be loaded. Please retry.')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, studentFilter])

  useEffect(() => { void load() }, [load])
  useEffect(() => { void apiClient.listStudents().then(setLearners).catch(() => undefined) }, [])

  return <main className="parent-workflow" aria-labelledby="parent-assessments-title">
    <header className="parent-workflow__header"><div><p>Parent review workspace</p><h1 id="parent-assessments-title">Submitted Assessments</h1><span>Signed in as {user?.full_name}</span></div><div><button type="button" onClick={() => navigate('/parent/select-learner')}>Learners</button><button type="button" onClick={() => { logout(); navigate('/parent/sign-in') }}>Sign Out</button></div></header>
    <section className="parent-workflow__panel">
      <div className="parent-workflow__filters"><label htmlFor="assessment-learner-filter">Learner</label><select id="assessment-learner-filter" value={studentFilter} onChange={(event) => setStudentFilter(event.target.value)}><option value="">All learners</option>{learners.map((learner) => <option key={learner.id} value={learner.id}>{learner.name}</option>)}</select><label htmlFor="assessment-status-filter">Status</label><select id="assessment-status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>{STATUS_OPTIONS.map((status) => <option key={status || 'all'} value={status}>{status ? status.replace('_', ' ') : 'All submitted assessments'}</option>)}</select><button type="button" onClick={() => void load()} disabled={loading}>Refresh</button></div>
      {loading ? <p role="status">Loading submitted assessments…</p> : null}
      {error ? <div className="parent-workflow__error" role="alert"><span>{error}</span><button type="button" onClick={() => void load()}>Try Again</button></div> : null}
      {!loading && !error && assessments.length === 0 ? <div className="parent-workflow__empty"><span aria-hidden="true">📚</span><h2>No assessments found</h2><p>Submitted learner work will appear here for review.</p></div> : null}
      <div className="parent-assessment-list">{assessments.map((item) => <article key={item.assessment_id} className="parent-assessment-card"><div><span className={`assessment-status assessment-status--${item.status}`}>{item.status.replace('_', ' ')}</span><h2>{item.subject} · {item.strand}</h2><p>{item.learner_name} · Grade {item.grade} · Term {item.term}</p><small>{item.submitted_at ? `Submitted ${new Date(item.submitted_at).toLocaleString()}` : 'Submission pending'}</small></div><button type="button" onClick={() => navigate(`/parent/assessments/${item.assessment_id}`)}>Review Assessment</button></article>)}</div>
    </section>
  </main>
}
