import { useState } from 'react'
import { useUI } from '../components/ui/UIContext'
import SubjectCard from '../components/subjects/SubjectCard'
import SubjectFilters from '../components/subjects/SubjectFilters'
import { SparklesIcon } from '../components/icons/Icons'
import { KitoChatIcon } from '../components/icons/Icons'
import { GRADE_OPTIONS, SUBJECTS, TERM_OPTIONS } from '../data/subjects'
import { IMAGES } from '../data/images'

export default function ChooseSubjectsPage() {
  const { notify } = useUI()
  const [grade, setGrade] = useState('Grade 6')
  const [term, setTerm] = useState('Term 2')

  return (
    <div className="subjects">
      <header className="subjects__header">
        <div className="subjects__heading">
          <span className="subjects__sparkle">
            <SparklesIcon size={26} />
          </span>
          <div>
            <h2 className="subjects__title">Choose a Subject</h2>
            <p className="subjects__context">
              {grade} <span aria-hidden="true">•</span> {term}
            </p>
          </div>
        </div>

        <SubjectFilters
          grade={grade}
          term={term}
          gradeOptions={GRADE_OPTIONS}
          termOptions={TERM_OPTIONS}
          onGradeChange={setGrade}
          onTermChange={setTerm}
        />
      </header>

      <div className="subjects__grid">
        {SUBJECTS.map((subject) => (
          <SubjectCard key={subject.id} subject={subject} />
        ))}
      </div>

      <section className="subjects__help">
        <img className="subjects__help-robot" src={IMAGES.subjectKitoHelper} alt="" />
        <div className="subjects__help-text">
          <h3 className="subjects__help-title">Need help choosing?</h3>
          <p className="subjects__help-body">
            I can recommend subjects based on your interests and progress.
          </p>
        </div>
        <button
          type="button"
          className="subjects__help-btn"
          onClick={() => notify('Kito is ready to recommend a subject for you!', 'success')}
        >
          <KitoChatIcon size={20} />
          Ask Kito for Help
        </button>
      </section>
    </div>
  )
}
