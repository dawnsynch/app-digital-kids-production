import { useState } from 'react'
import { useUI } from '../components/ui/UIContext'
import { ArrowRightIcon, ShieldCheckIcon } from '../components/icons/Icons'
import { SETUP_FIELDS } from '../data/practiceContent'
import DifficultyPicker from '../components/practice/DifficultyPicker'
import KitoTipCard from '../components/practice/KitoTipCard'
import PracticeHeader from '../components/practice/PracticeHeader'
import QuestionCountPicker from '../components/practice/QuestionCountPicker'
import SetupFieldRow from '../components/practice/SetupFieldRow'
import StepIndicator from '../components/practice/StepIndicator'

export default function PracticePage() {
  const { notify } = useUI()

  const [step, setStep] = useState(0)
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(SETUP_FIELDS.map((field) => [field.id, field.defaultValue])),
  )
  const [difficulty, setDifficulty] = useState('medium')
  const [questions, setQuestions] = useState(10)

  const selectStep = (index: number) => {
    setStep(index)
    if (index > 0) {
      notify(
        index === 1
          ? 'Review comes once your quiz is set up.'
          : 'The practice quiz is not available in this demo yet.',
      )
    }
  }

  const startPractice = () => {
    const summary = [values.grade, values.term, values.subject, values.strand].join(' · ')
    notify(
      `Practice quizzes are not available in this demo yet — your setup is ready: ${summary}, ${questions} questions.`,
    )
  }

  return (
    <div className="practice">
      <PracticeHeader />

      <StepIndicator active={step} onSelect={selectStep} />

      <div className="practice__grid">
        <section className="practice__setup">
          {SETUP_FIELDS.map((field) => (
            <SetupFieldRow
              key={field.id}
              field={field}
              value={values[field.id]}
              onChange={(value) =>
                setValues((prev) => ({ ...prev, [field.id]: value }))
              }
            />
          ))}
        </section>

        <div className="practice__column">
          <DifficultyPicker value={difficulty} onChange={setDifficulty} />
          <QuestionCountPicker value={questions} onChange={setQuestions} />
        </div>
      </div>

      <div className="practice__actions">
        <KitoTipCard strand={values.strand} />

        <div className="practice__cta">
          <button type="button" className="practice__start" onClick={startPractice}>
            Start Practice
            <ArrowRightIcon size={19} />
          </button>
          <p className="practice__note">
            <ShieldCheckIcon size={17} />
            You can review before you begin.
          </p>
        </div>
      </div>
    </div>
  )
}
