import { useState } from 'react'
import { CHART_SERIES, WEEK_DAYS } from '../../data/dashboard'

/** Geometry taken from the mockup so the chart renders pixel-identically. */
const PLOT = { left: 31, baseline: 88, unit: 88 / 120, groupWidth: 37.7, width: 282 }

const BARS: { day: number; series: 'lessons' | 'questions' | 'minutes'; value: number; dx: number }[] = [
  { day: 0, series: 'lessons', value: 45, dx: 0 },
  { day: 0, series: 'questions', value: 20, dx: 9 },
  { day: 1, series: 'lessons', value: 70, dx: 0 },
  { day: 1, series: 'questions', value: 22, dx: 10 },
  { day: 2, series: 'lessons', value: 72, dx: 0 },
  { day: 2, series: 'questions', value: 40, dx: 10 },
  { day: 3, series: 'lessons', value: 100, dx: 0 },
  { day: 3, series: 'questions', value: 35, dx: 9 },
  { day: 4, series: 'minutes', value: 115, dx: 0 },
  { day: 4, series: 'questions', value: 48, dx: 9 },
  { day: 5, series: 'minutes', value: 110, dx: 0 },
  { day: 5, series: 'questions', value: 22, dx: 9 },
  { day: 6, series: 'lessons', value: 65, dx: 0 },
  { day: 6, series: 'questions', value: 24, dx: 9 },
]

const SERIES_COLOR = {
  lessons: '#1d4ed8',
  questions: '#4ade80',
  minutes: '#8b5cf6',
} as const

export default function ProgressChart() {
  const [hover, setHover] = useState<{ day: number; series: string; value: number } | null>(null)

  const gridValues = [0, 30, 60, 90, 120]

  return (
    <section className="chart-card">
      <h3 className="card-title">Your Progress This Week</h3>

      <div className="chart-card__legend">
        {CHART_SERIES.map((series) => (
          <span key={series.key} className="chart-card__legend-item">
            <span className="chart-card__dot" style={{ background: series.color }} />
            {series.label}
          </span>
        ))}
      </div>

      <div className="chart-card__plot">
        <div className="chart-card__axis">
          {[...gridValues].reverse().map((value) => (
            <span key={value} className="chart-card__axis-label" style={{ bottom: value * PLOT.unit }}>
              {value}
            </span>
          ))}
        </div>

        <svg className="chart-card__svg" viewBox="0 0 282 98" preserveAspectRatio="none" aria-hidden="true">
          {gridValues.map((value) => (
            <line
              key={value}
              x1={0}
              x2={282}
              y1={PLOT.baseline - value * PLOT.unit}
              y2={PLOT.baseline - value * PLOT.unit}
              stroke="#eceef6"
              strokeWidth={1}
            />
          ))}
          {BARS.map((bar) => {
            const x = PLOT.left + bar.day * PLOT.groupWidth + bar.dx
            const h = bar.value * PLOT.unit
            const y = PLOT.baseline - h
            const isHovered =
              hover?.day === bar.day && hover?.series === bar.series
            return (
              <rect
                key={`${bar.day}-${bar.series}`}
                x={x}
                y={y}
                width={7.5}
                height={h}
                rx={1.6}
                fill={SERIES_COLOR[bar.series]}
                opacity={hover && !isHovered ? 0.45 : 1}
                className="chart-card__bar"
              />
            )
          })}
          <line
            x1={0}
            x2={282}
            y1={PLOT.baseline}
            y2={PLOT.baseline}
            stroke="#e3e6f0"
            strokeWidth={1}
          />
        </svg>

        <div className="chart-card__bars">
          {WEEK_DAYS.map((day, index) => (
            <span
              key={day}
              className="chart-card__day"
              style={{ left: `${((PLOT.left + index * PLOT.groupWidth + 3.75) / PLOT.width) * 100}%` }}
            >
              {day}
            </span>
          ))}
        </div>

        <div className="chart-card__hit">
          {WEEK_DAYS.map((day, index) => (
            <span
              key={day}
              className="chart-card__hit-col"
              style={{
                left: `${((PLOT.left - 3 + index * PLOT.groupWidth) / PLOT.width) * 100}%`,
                width: `${(PLOT.groupWidth / PLOT.width) * 100}%`,
              }}
              onMouseEnter={() =>
                setHover({
                  day: index,
                  series: 'lessons',
                  value: CHART_SERIES[0].values[index],
                })
              }
              onMouseLeave={() => setHover(null)}
            />
          ))}
        </div>

        {hover && (
          <div
            className="chart-card__tip"
            style={{ left: `${((PLOT.left + hover.day * PLOT.groupWidth + 2) / PLOT.width) * 100}%` }}
          >
            {WEEK_DAYS[hover.day]}: {hover.value} lessons
          </div>
        )}
      </div>
    </section>
  )
}
