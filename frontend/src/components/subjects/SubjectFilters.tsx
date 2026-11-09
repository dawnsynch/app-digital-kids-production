import { CalendarIcon, ChevronDownIcon, GradeIcon } from '../icons/Icons'

type Props = {
  grade: string
  term: string
  gradeOptions: string[]
  termOptions: string[]
  onGradeChange: (value: string) => void
  onTermChange: (value: string) => void
}

/** Grade and term pickers shown at the top-right of the page. */
export default function SubjectFilters({
  grade,
  term,
  gradeOptions,
  termOptions,
  onGradeChange,
  onTermChange,
}: Props) {
  return (
    <div className="subject-filters">
      <div className="subject-filter">
        <GradeIcon className="subject-filter__icon" size={22} />
        <select
          className="subject-filter__select"
          value={grade}
          aria-label="Choose your grade"
          onChange={(event) => onGradeChange(event.target.value)}
        >
          {gradeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="subject-filter__chevron" size={17} />
      </div>

      <div className="subject-filter">
        <CalendarIcon className="subject-filter__icon" size={21} />
        <select
          className="subject-filter__select"
          value={term}
          aria-label="Choose your term"
          onChange={(event) => onTermChange(event.target.value)}
        >
          {termOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="subject-filter__chevron" size={17} />
      </div>
    </div>
  )
}
