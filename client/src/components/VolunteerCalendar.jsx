import { useMemo, useState } from 'react'
import Icon from './Icon'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function VolunteerCalendar({ events, onDayClick }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const eventsByDay = useMemo(() => {
    const map = {}
    events.forEach((e) => {
      const d = new Date(e.date)
      if (d.getFullYear() === year && d.getMonth() === month) {
        const key = d.getDate()
        if (!map[key]) map[key] = []
        map[key].push(e)
      }
    })
    return map
  }, [events, year, month])

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayDate =
    today.getFullYear() === year && today.getMonth() === month
      ? today.getDate()
      : null

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  function prevMonth() {
    if (month === 0) {
      setMonth(11)
      setYear((y) => y - 1)
    } else setMonth((m) => m - 1)
  }
  function nextMonth() {
    if (month === 11) {
      setMonth(0)
      setYear((y) => y + 1)
    } else setMonth((m) => m + 1)
  }

  return (
    <div className="vol-calendar">
      <div className="vol-calendar-header">
        <button
          className="vol-calendar-nav"
          onClick={prevMonth}
          type="button"
          aria-label="Previous month"
        >
          <span style={{ transform: 'rotate(180deg)', display: 'inline-block' }}>
            <Icon name="chevron-right" size={16} />
          </span>
        </button>
        <div className="vol-calendar-title">
          {MONTH_NAMES[month]} {year}
        </div>
        <button
          className="vol-calendar-nav"
          onClick={nextMonth}
          type="button"
          aria-label="Next month"
        >
          <Icon name="chevron-right" size={16} />
        </button>
      </div>

      <div className="vol-calendar-weekdays">
        {DAY_LABELS.map((d, i) => (
          <div key={i} className="vol-calendar-weekday">
            {d}
          </div>
        ))}
      </div>

      <div className="vol-calendar-grid">
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="vol-calendar-cell empty" />
          const hasEvents = !!eventsByDay[day]
          const isToday = day === todayDate
          return (
            <button
              key={i}
              className={`vol-calendar-cell ${
                hasEvents ? 'has-events' : ''
              } ${isToday ? 'is-today' : ''}`}
              onClick={() => hasEvents && onDayClick(eventsByDay[day])}
              type="button"
              disabled={!hasEvents}
            >
              <span className="vol-calendar-day">{day}</span>
              {hasEvents && (
                <span className="vol-calendar-dot">
                  {eventsByDay[day].length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="vol-calendar-legend">
        <span className="vol-calendar-legend-item">
          <span className="vol-calendar-legend-dot" /> Has events
        </span>
        <span className="vol-calendar-legend-item">
          <span className="vol-calendar-legend-dot today" /> Today
        </span>
      </div>
    </div>
  )
}