import { WEEK_DAYS } from '../../data/dashboard'

export default function WeeklyBarChart({ values }: { values: number[] }) {
  const maximum = Math.max(...values, 1)
  return (
    <div className="weekly-bars" aria-label="Weekly learning activity chart">
      {WEEK_DAYS.map((day, index) => (
        <div className="weekly-bars__item" key={day}>
          <span
            className="weekly-bars__bar"
            style={{ height: `${Math.max(10, (values[index] / maximum) * 100)}%` }}
            title={`${day}: ${values[index]} learning activities`}
          />
          <small>{day}</small>
        </div>
      ))}
    </div>
  )
}
