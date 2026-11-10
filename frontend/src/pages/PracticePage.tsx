import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { ArrowRightIcon, CalendarIcon, GradeIcon, MathGridIcon, PieIcon, ShieldCheckIcon } from '../components/icons/Icons'
import DifficultyPicker from '../components/practice/DifficultyPicker'
import KitoTipCard from '../components/practice/KitoTipCard'
import PracticeHeader from '../components/practice/PracticeHeader'
import QuestionCountPicker from '../components/practice/QuestionCountPicker'
import SetupFieldRow from '../components/practice/SetupFieldRow'
import StepIndicator from '../components/practice/StepIndicator'
import { useUI } from '../components/ui/UIContext'
import { SETUP_FIELDS, type SetupField } from '../data/practiceContent'
import { usePractice } from '../practice/PracticeContext'
import { apiClient } from '../api/client'
import type { LearnerAssessmentListItem } from '../api/types'

export default function PracticePage() {
  const { notify } = useUI()
  const { user } = useAuth()
  const learnerMode = user?.role === 'learner'
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { options, loading, error, loadOptions, generate } = usePractice()
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(SETUP_FIELDS.map((field) => [field.id, field.defaultValue])))
  const [difficulty, setDifficulty] = useState('medium')
  const [questions, setQuestions] = useState(10)
  const [recent, setRecent] = useState<LearnerAssessmentListItem[]>([])

  useEffect(() => {
    if (!learnerMode || options) return
    void loadOptions().catch(() => undefined)
  }, [learnerMode, options, loadOptions])

  useEffect(() => {
    if (!learnerMode) return
    let active = true
    void apiClient.learnerAssessments().then((items) => { if (active) setRecent(items) }).catch(() => undefined)
    return () => { active = false }
  }, [learnerMode])

  useEffect(() => {
    if (!options) return
    const requestedSubject = searchParams.get('subject')
    const subject = options.subjects.some((item) => item.name === requestedSubject) ? requestedSubject! : options.subjects[0]?.name || ''
    const subjectOptions = options.subjects.find((item) => item.name === subject)?.strands || []
    const requestedStrand = searchParams.get('strand')
    const strand = subjectOptions.includes(requestedStrand || '') ? requestedStrand! : subjectOptions[0] || ''
    setValues({ grade: `Grade ${options.grade}`, term: `Term ${options.terms[0]}`, subject, strand })
    setQuestions(options.question_counts.includes(10) ? 10 : options.question_counts[0])
  }, [options, searchParams])

  const fields = useMemo<SetupField[]>(() => {
    if (!options) return SETUP_FIELDS
    const selectedSubject = options.subjects.find((item) => item.name === values.subject) || options.subjects[0]
    return [
      { id: 'grade', step: 1, label: 'Your verified grade', icon: GradeIcon, defaultValue: `Grade ${options.grade}`, options: [`Grade ${options.grade}`] },
      { id: 'term', step: 2, label: 'Choose your term', icon: CalendarIcon, defaultValue: `Term ${options.terms[0]}`, options: options.terms.map((item) => `Term ${item}`) },
      { id: 'subject', step: 3, label: 'Choose your subject', icon: MathGridIcon, defaultValue: options.subjects[0]?.name || '', options: options.subjects.map((item) => item.name) },
      { id: 'strand', step: 4, label: 'Choose your strand', icon: PieIcon, defaultValue: selectedSubject?.strands[0] || '', options: selectedSubject?.strands || [] },
    ]
  }, [options, values.subject])

  const updateValue = (fieldId: string, value: string) => {
    setValues((current) => {
      if (fieldId !== 'subject' || !options) return { ...current, [fieldId]: value }
      const strand = options.subjects.find((item) => item.name === value)?.strands[0] || ''
      return { ...current, subject: value, strand }
    })
  }

  const selectStep = (index: number) => {
    if (learnerMode) return
    setStep(index)
    if (index > 0) notify(index === 1 ? 'Review comes once your quiz is set up.' : 'The practice quiz is not available in this preview.')
  }

  const startPractice = async () => {
    if (!learnerMode || !options) {
      const summary = [values.grade, values.term, values.subject, values.strand].join(' · ')
      notify(`Sign in as a learner to begin — your preview setup is ready: ${summary}, ${questions} questions.`)
      return
    }
    const term = Number(values.term.replace('Term ', '')) as 1 | 2 | 3
    if (!values.subject || !values.strand || !options.question_counts.includes(questions)) {
      notify('Choose a valid subject, strand and question count.')
      return
    }
    try {
      const assessment = await generate({ term, subject: values.subject, strand: values.strand, difficulty: difficulty === 'easy' ? 'Easy' : difficulty === 'challenge' ? 'Hard' : 'Medium', question_count: questions })
      setStep(2)
      navigate(`/learner/practice/${assessment.assessment_id}`)
    } catch {
      // Safe error copy is rendered from the practice context.
    }
  }

  return <div className="practice">
    <PracticeHeader />
    {learnerMode && options && <div className="practice__learner-context" role="status"><strong>{options.learner_name}</strong> · Grade {options.grade} verified learner practice</div>}
    <StepIndicator active={step} onSelect={selectStep} />
    {error && <div className="practice__error" role="alert">{error}</div>}
    <div className="practice__grid" aria-busy={loading}>
      <section className="practice__setup">{fields.map((field) => <SetupFieldRow key={field.id} field={field} value={values[field.id] || field.defaultValue} onChange={(value) => updateValue(field.id, value)} />)}</section>
      <div className="practice__column"><DifficultyPicker value={difficulty} onChange={setDifficulty} /><QuestionCountPicker value={questions} onChange={setQuestions} options={options?.question_counts} /></div>
    </div>
    <div className="practice__actions"><KitoTipCard strand={values.strand} /><div className="practice__cta">
      <button type="button" className="practice__start" onClick={() => void startPractice()} disabled={loading || (learnerMode && !options)}>{loading ? 'Preparing Questions…' : 'Start Practice'}{!loading && <ArrowRightIcon size={19} />}</button>
      <p className="practice__note"><ShieldCheckIcon size={17} />Questions are private to your learner session.</p>
    </div></div>
    {learnerMode && recent.length > 0 ? <section className="practice-recent" aria-labelledby="recent-practice-title"><h2 id="recent-practice-title">Recent Practice</h2><div>{recent.map((item) => <button type="button" key={item.assessment_id} onClick={() => navigate(`/learner/practice/${item.assessment_id}`)}><span><strong>{item.subject}</strong> · {item.strand}</span><em className={`assessment-status assessment-status--${item.status}`}>{item.status.replace('_', ' ')}</em></button>)}</div></section> : null}
  </div>
}
