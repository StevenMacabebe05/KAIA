import { useMemo, useState } from 'react'
import Icon from './Icon'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function computeInitialMonth(events) {
  const today = new Date()
  const todayKey = `${today.getFullYear()}-${today.getMonth()}`

  // does the current month have events?
  const hasCurrent = events.some((e) => {
    const d = new Date(e.date)
    return `${d.getFullYear()}-${d.getMonth()}` === todayKey
  })
  if (hasCurrent) {
    return { year: today.getFullYear(), month: today.getMonth() }
  }

  // find the next upcoming event month, or earliest past
  const todayMs = today.getTime()
  let nextMs = Infinity
  let nextMonth = null
  let earliestMs = Infinity
  let earliestMonth = null

  events.forEach((e) => {
    const d = new Date(e.date)
    const dMs = d.getTime()
    const y = d.getFullYear()
    const m = d.getMonth()
    if (dMs >= todayMs && dMs < nextMs) {
      nextMs = dMs
      nextMonth = { year: y, month: m }
    }
    if (dMs < earliestMs) {
      earliestMs = dMs
      earliestMonth = { year: y, month: m }
    }
  })

  return nextMonth || earliestMonth || { year: today.getFullYear(), month: today.getMonth() }
}

export default function VolunteerCalendar({ events, onDayClick }) {
  const today = new Date()

  const [view, setView] = useState(() => computeInitialMonth(events))
  const [selectedDay, setSelectedDay] = useState(null)

  const viewYear = view.year
  const viewMonth = view.month

  /* ---------- group events by year-month-day ---------- */
  const eventsByDate = useMemo(() => {
    const map = {}
    events.forEach((e) => {
      const d = new Date(e.date)
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      if (!map[key]) map[key] = []
      map[key].push(e)
    })
    return map
  }, [events])

  /* ---------- all months that have at least 1 event ---------- */
  const eventMonths = useMemo(() => {
    const set = new Map()
    events.forEach((e) => {
      const d = new Date(e.date)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      set.set(key, (set.get(key) || 0) + 1)
    })
    return set
  }, [events])

  /* ---------- computed for current month view ---------- */
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const todayDate =
    today.getFullYear() === viewYear && today.getMonth() === viewMonth
      ? today.getDate()
      : null

  const cells = useMemo(() => {
    const arr = []
    for (let i = 0; i < firstDay; i++) arr.push(null)
    for (let d = 1; d <= daysInMonth; d++) arr.push(d)
    return arr
  }, [firstDay, daysInMonth])

  const eventsThisMonth = useMemo(() => {
    let count = 0
    cells.forEach((d) => {
      if (!d) return
      const key = `${viewYear}-${viewMonth}-${d}`
      if (eventsByDate[key]) count += eventsByDate[key].length
    })
    return count
  }, [cells, eventsByDate, viewYear, viewMonth])

  /* ---------- navigation ---------- */
  function prevMonth() {
    setView((v) => {
      if (v.month === 0) return { year: v.year - 1, month: 11 }
      return { year: v.year, month: v.month - 1 }
    })
    setSelectedDay(null)
  }

  function nextMonth() {
    setView((v) => {
      if (v.month === 11) return { year: v.year + 1, month: 0 }
      return { year: v.year, month: v.month + 1 }
    })
    setSelectedDay(null)
  }

  function jumpToToday() {
    setView({ year: today.getFullYear(), month: today.getMonth() })
    setSelectedDay(null)
  }

  function jumpToNextEvent() {
    const todayMs = today.getTime()
    let best = null
    let bestMs = Infinity

    events.forEach((e) => {
      const d = new Date(e.date)
      if (d.getTime() >= todayMs && d.getTime() < bestMs) {
        bestMs = d.getTime()
        best = d
      }
    })

    // no future events — find earliest past
    if (!best) {
      bestMs = Infinity
      events.forEach((e) => {
        const d = new Date(e.date)
        if (d.getTime() < bestMs) {
          bestMs = d.getTime()
          best = d
        }
      })
    }

    if (best) {
      setView({ year: best.getFullYear(), month: best.getMonth() })
      setSelectedDay(best.getDate())
    }
  }

  const hasAnyEvents = eventMonths.size > 0

  return (
    <div className="vol-calendar">
      <div className="vol-calendar-header">
        <button
          className="vol-calendar-nav"
          onClick={prevMonth}
          type="button"
          aria-label="Previous month"
        >
          <span
            style={{ transform: 'rotate(180deg)', display: 'inline-block' }}
          >
            <Icon name="chevron-right" size={16} />
          </span>
        </button>

        <div className="vol-calendar-title-wrap">
          <div className="vol-calendar-title">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </div>
          <div className="vol-calendar-month-count">
            {eventsThisMonth > 0
              ? `${eventsThisMonth} ${
                  eventsThisMonth === 1 ? 'event' : 'events'
                } this month`
              : 'No events this month'}
          </div>
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

      <div className="vol-calendar-jumps">
        <button
          className="vol-calendar-jump"
          onClick={jumpToToday}
          type="button"
        >
          <Icon name="calendar" size={12} />
          Today
        </button>
        {hasAnyEvents && (
          <button
            className="vol-calendar-jump primary"
            onClick={jumpToNextEvent}
            type="button"
          >
            <Icon name="arrow-right" size={12} />
            Jump to next event
          </button>
        )}
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
          if (!day)
            return <div key={i} className="vol-calendar-cell empty" />

          const key = `${viewYear}-${viewMonth}-${day}`
          const dayEvents = eventsByDate[key] || []
          const hasEvents = dayEvents.length > 0
          const isToday = day === todayDate
          const isSelected = day === selectedDay

          return (
            <button
              key={i}
              className={`vol-calendar-cell ${
                hasEvents ? 'has-events' : ''
              } ${isToday ? 'is-today' : ''} ${
                isSelected ? 'is-selected' : ''
              }`}
              onClick={() => {
                setSelectedDay(day)
                if (hasEvents) onDayClick(dayEvents)
              }}
              type="button"
              disabled={!hasEvents}
            >
              <span className="vol-calendar-day">{day}</span>
              {hasEvents && (
                <span className="vol-calendar-dot">
                  {dayEvents.length}
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