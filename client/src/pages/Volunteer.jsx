import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { OPPORTUNITIES } from '../data/opportunities'
import { NGOS } from '../data/ngos'
import { useActivity } from '../store/useActivity'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { getCancellationWindow } from '../utils/cancellation'
import EmptyState from '../components/EmptyState'
import Confetti from '../components/Confetti'
import VolunteerTicket from '../components/VolunteerTicket'
import VolunteerApplicationForm from '../components/VolunteerApplicationForm'
import VolunteerDetailModal from '../components/VolunteerDetailModal'
import CancelVolunteerModal from '../components/CancelVolunteerModal'
import Icon from '../components/Icon'

const SORT_OPTIONS = [
  { key: 'soonest', label: 'Soonest' },
  { key: 'latest', label: 'Latest' },
  { key: 'slots', label: 'Most slots needed' },
  { key: 'title', label: 'Alphabetical' },
]

export default function Volunteer() {
  const { user } = useAuth()
  const store = useActivity()
  const toast = useToast()

  const [tab, setTab] = useState('nearby')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('soonest')
  const [view, setView] = useState('grid')
  const [sortOpen, setSortOpen] = useState(false)
  const [confettiKey, setConfettiKey] = useState(0)
  const [ticket, setTicket] = useState(null)
  const [detail, setDetail] = useState(null)
  const [applying, setApplying] = useState(null)
  const [cancelling, setCancelling] = useState(null)

  const all = [...OPPORTUNITIES, ...store.getExtraOpportunities()]

  const getSignupStatus = (opportunityId) => {
    if (!user) return 'none'
    const signup = store.getSignup(user.id, opportunityId)
    if (!signup) return 'none'
    return signup.status
  }

  const isSignedUp = (opportunityId) => {
    const s = getSignupStatus(opportunityId)
    return s === 'registered' || s === 'attended' || s === 'completed'
  }

  const isCancelled = (opportunityId) =>
    getSignupStatus(opportunityId) === 'cancelled'

  const filtered = useMemo(() => {
    let list = [...all]

    if (tab === 'nearby') {
      list = list.filter((o) => o.location === 'Quezon City')
    } else if (tab === 'this-week') {
      list = list.filter((o) => {
        const d = new Date(o.date)
        const now = new Date()
        const diff = (d - now) / (1000 * 60 * 60 * 24)
        return diff >= 0 && diff <= 7
      })
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((o) => {
        const ngo = NGOS.find((n) => n.id === o.ngoId)
        return (
          o.title.toLowerCase().includes(q) ||
          o.description.toLowerCase().includes(q) ||
          o.location.toLowerCase().includes(q) ||
          (ngo && ngo.name.toLowerCase().includes(q))
        )
      })
    }

    const sorters = {
      soonest: (a, b) => new Date(a.date) - new Date(b.date),
      latest: (a, b) => new Date(b.date) - new Date(a.date),
      slots: (a, b) => b.needed - b.registered - (a.needed - a.registered),
      title: (a, b) => a.title.localeCompare(b.title),
    }

    return list.sort(sorters[sort] || sorters.soonest)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all.length, tab, search, sort])

  const myUpcoming = useMemo(() => {
    if (!user) return []
    const signups = store.getSignups(user.id)
    return signups
      .filter((s) => s.status !== 'cancelled')
      .map((s) => {
        const opp = all.find((o) => o.id === s.opportunityId)
        return opp ? { ...s, opportunity: opp } : null
      })
      .filter(Boolean)
      .sort(
        (a, b) =>
          new Date(a.opportunity.date) - new Date(b.opportunity.date)
      )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, store])

  const categoryStats = useMemo(() => {
    const groups = {}
    all.forEach((o) => {
      const slots = o.needed - o.registered
      if (slots <= 0) return
      const ngo = NGOS.find((n) => n.id === o.ngoId)
      const category = ngo?.categories?.[0] || 'General'
      if (!groups[category]) groups[category] = { count: 0, slots: 0 }
      groups[category].count += 1
      groups[category].slots += slots
    })
    return Object.entries(groups)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.slots - a.slots)
      .slice(0, 5)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all.length])

  const spotlightNgo = useMemo(() => {
    const ngoSlots = {}
    all.forEach((o) => {
      const slots = o.needed - o.registered
      if (slots <= 0) return
      if (!ngoSlots[o.ngoId]) ngoSlots[o.ngoId] = { slots: 0, events: 0 }
      ngoSlots[o.ngoId].slots += slots
      ngoSlots[o.ngoId].events += 1
    })
    const best = Object.entries(ngoSlots).sort(
      (a, b) => b[1].slots - a[1].slots
    )[0]
    if (!best) return null
    const ngo = NGOS.find((n) => n.id === best[0])
    return ngo
      ? { ...ngo, openSlots: best[1].slots, events: best[1].events }
      : null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all.length])

  function openDetail(opp) {
    setDetail(opp)
  }

  function openTicket(opp) {
    const vid = store.getVolunteerId(user.id, opp.id)
    if (vid) {
      setDetail(null)
      setTicket({ volunteerId: vid, opportunity: opp })
    } else {
      toast.push('No active ticket found. Please apply again.', 'info')
    }
  }

  function handleApplyFromDetail() {
    const opp = detail
    setDetail(null)
    setApplying(opp)
  }

  function handleApplicationSubmit(formData) {
    const opp = applying
    const result = store.signUpForOpportunity(user.id, opp.id, {
      ...formData,
      hours: 0,
    })

    if (!result) {
      openTicket(opp)
      setApplying(null)
      return
    }

    const { volunteerId } = result

    store.addNotification(user.id, {
      type: 'signup',
      title: 'Volunteer ID issued',
      body: `Application confirmed for "${opp.title}". Show your QR code at the event.`,
      link: '/my-kaia',
    })

    setConfettiKey((k) => k + 1)
    setTicket({ volunteerId, opportunity: opp })
    setApplying(null)
    toast.push('Application submitted — you are confirmed!', 'success')
  }

  function handleCancelConfirm(reason) {
    const opp = cancelling
    const res = store.cancelVolunteer(user.id, opp.id, reason)
    if (res.ok) {
      store.addNotification(user.id, {
        type: 'signup',
        title: 'Volunteer signup cancelled',
        body: `You cancelled "${opp.title}". Reason: ${reason}`,
        link: '/volunteer',
      })
      toast.push('Signup cancelled. You can re-apply anytime.', 'info')
    }
    setCancelling(null)
  }

  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.key === sort)?.label || 'Soonest'

  return (
    <div className="container">
      <Confetti trigger={confettiKey} />

      <div className="page-header">
        <h1 className="page-title">Volunteer opportunities</h1>
        <p className="page-subtitle">
          Browse events, review the details, then apply for your QR volunteer
          ID.
        </p>
      </div>

      <div className="donate-toolbar">
        <div className="search">
          <span className="search-icon">
            <Icon name="search" size={16} />
          </span>
          <input
            placeholder="Search events, NGOs, or locations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="sort-dropdown">
          <button
            className="sort-trigger"
            onClick={() => setSortOpen((o) => !o)}
            type="button"
          >
            <span className="sort-label">Sort:</span>
            <span className="sort-value">{activeSortLabel}</span>
            <Icon name="chevron-down" size={14} />
          </button>

          {sortOpen && (
            <>
              <div
                className="sort-backdrop"
                onClick={() => setSortOpen(false)}
              />
              <div className="sort-menu">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    className={`sort-option ${
                      sort === opt.key ? 'active' : ''
                    }`}
                    onClick={() => {
                      setSort(opt.key)
                      setSortOpen(false)
                    }}
                    type="button"
                  >
                    {opt.label}
                    {sort === opt.key && (
                      <Icon
                        name="check"
                        size={14}
                        color="var(--blue-700)"
                      />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="view-toggle">
          <button
            className={`view-btn ${view === 'grid' ? 'active' : ''}`}
            onClick={() => setView('grid')}
            title="Grid view"
            type="button"
          >
            <Icon name="grid" size={16} />
          </button>
          <button
            className={`view-btn ${view === 'list' ? 'active' : ''}`}
            onClick={() => setView('list')}
            title="List view"
            type="button"
          >
            <Icon name="list" size={16} />
          </button>
        </div>
      </div>

      <div className="filters">
        {[
          { key: 'nearby', label: 'Nearby' },
          { key: 'this-week', label: 'This week' },
          { key: 'all', label: 'All locations' },
        ].map((t) => (
          <button
            key={t.key}
            className={`pill ${tab === t.key ? 'is-active' : ''}`}
            onClick={() => setTab(t.key)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="donate-results">
        <span>
          {filtered.length}{' '}
          {filtered.length === 1 ? 'opportunity' : 'opportunities'} found
        </span>
        {(search || tab !== 'nearby') && (
          <button
            className="donate-clear"
            onClick={() => {
              setSearch('')
              setTab('nearby')
            }}
            type="button"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="volunteer-layout">
        <div className="volunteer-main">
          {filtered.length === 0 ? (
            <EmptyState
              icon="search"
              title="No opportunities match"
              message="Try a different search or filter."
            />
          ) : (
            <div
              className={view === 'grid' ? 'grid grid-2' : 'volunteer-list'}
            >
              {filtered.map((o) => {
                const ngo = NGOS.find((n) => n.id === o.ngoId)
                const signed = isSignedUp(o.id)
                const cancelled = isCancelled(o.id)
                const window = getCancellationWindow(o.date)

                return (
                  <article
                    key={o.id}
                    className={`card card-hover volunteer-card ${
                      view === 'list' ? 'volunteer-card-list' : ''
                    }`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => openDetail(o)}
                  >
                    <img
                      src={o.image}
                      alt=""
                      className="volunteer-card-image"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = `https://placehold.co/800x400/eff4ff/1e40d8?text=${encodeURIComponent(
                          o.title
                        )}`
                      }}
                    />

                    <div className="volunteer-card-body">
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 16,
                          marginBottom: 6,
                        }}
                      >
                        {o.title}
                      </div>

                      <div
                        className="row text-muted"
                        style={{
                          fontSize: 13,
                          marginBottom: 12,
                          gap: 14,
                          flexWrap: 'wrap',
                        }}
                      >
                        <span className="row" style={{ gap: 5 }}>
                          <Icon name="users" size={14} />
                          {ngo?.name}
                        </span>
                        <span className="row" style={{ gap: 5 }}>
                          <Icon name="map-pin" size={14} />
                          {o.location}
                        </span>
                        <span className="row" style={{ gap: 5 }}>
                          <Icon name="calendar" size={14} />
                          {o.date}
                        </span>
                      </div>

                      <p
                        style={{
                          fontSize: 14,
                          margin: '0 0 18px',
                          color: 'var(--ink-700)',
                          lineHeight: 1.55,
                        }}
                      >
                        {o.description}
                      </p>

                      {cancelled && (
                        <div className="previous-cancel-note">
                          <Icon name="x" size={12} color="var(--red-600)" />
                          <span>
                            You cancelled this signup. Re-apply below to join
                            again.
                          </span>
                        </div>
                      )}

                      <div
                        className="row-between"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span
                          className="pill"
                          style={{
                            background: 'var(--orange-100)',
                            color: 'var(--orange-600)',
                            cursor: 'default',
                          }}
                        >
                          {o.needed - o.registered} needed
                        </span>

                        {signed ? (
                          <div className="row" style={{ gap: 6 }}>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => openTicket(o)}
                            >
                              <Icon name="book" size={13} />
                              QR ID
                            </button>
                            <button
                              type="button"
                              className="btn btn-neutral btn-sm"
                              disabled={!window.allowed}
                              title={window.message}
                              onClick={() => setCancelling(o)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : cancelled ? (
                          <button
                            type="button"
                            className="btn btn-accent"
                            onClick={() => openDetail(o)}
                          >
                            Re-apply
                            <Icon name="arrow-right" size={14} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => openDetail(o)}
                          >
                            View details
                            <Icon name="arrow-right" size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>

        {/* ---------- SIDEBAR ---------- */}
        <aside className="volunteer-sidebar">
          {/* 1. YOUR UPCOMING EVENTS */}
        <div className="sidebar-card">
          <div className="sidebar-card-header sidebar-card-header-blue">
            <h3 className="sidebar-card-title">Your upcoming events</h3>
            {myUpcoming.length > 0 && (
              <Link to="/my-kaia" className="sidebar-card-link sidebar-card-link-white">
                View all
              </Link>
            )}
          </div>
            {myUpcoming.length === 0 ? (
              <div className="sidebar-empty">
                {user
                  ? "You haven't signed up yet. Browse events to find one."
                  : 'Log in to track your volunteer signups.'}
              </div>
            ) : (
              <div className="upcoming-events">
                {myUpcoming.slice(0, 3).map((s) => (
                  <div key={s.createdAt} className="upcoming-event">
                    <div className="upcoming-event-date">
                      <div className="upcoming-event-day">
                        {new Date(s.opportunity.date).getDate()}
                      </div>
                      <div className="upcoming-event-month">
                        {new Date(s.opportunity.date).toLocaleDateString(
                          'en-US',
                          { month: 'short' }
                        )}
                      </div>
                    </div>
                    <div className="upcoming-event-info">
                      <div className="upcoming-event-title">
                        {s.opportunity.title}
                      </div>
                      <div className="upcoming-event-meta">
                        {s.opportunity.time} · {s.opportunity.location}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. NEEDS VOLUNTEERS — solid blue with numbers */}
          <div className="needs-volunteers-card">
            <div className="needs-volunteers-header needs-volunteers-header-orange">
              <h3 className="needs-volunteers-title">Needs volunteers</h3>
              <span className="needs-volunteers-subtitle">This month</span>
            </div>
            <div className="needs-volunteers-list">
              {categoryStats.length === 0 ? (
                <div className="needs-volunteers-empty">
                  All categories are fully staffed.
                </div>
              ) : (
                categoryStats.map((c) => (
                  <button
                    key={c.name}
                    className="needs-volunteers-row"
                    onClick={() => setTab('all')}
                    type="button"
                  >
                    <span className="needs-volunteers-name">{c.name}</span>
                    <span className="needs-volunteers-number">
                      {c.slots}
                      <span className="needs-volunteers-unit">open</span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* 3. NGO SPOTLIGHT */}
          {spotlightNgo && (
            <div className="sidebar-card">
              <div className="sidebar-card-header">
                <h3 className="sidebar-card-title">Needs you most</h3>
              </div>
              <Link to={`/ngo/${spotlightNgo.id}`} className="featured-ngo">
                <div className="featured-ngo-cover">
                  <img src={spotlightNgo.cover} alt="" />
                  <div className="featured-ngo-overlay" />
                </div>
                <div className="featured-ngo-body">
                  <img
                    src={spotlightNgo.logo}
                    alt=""
                    className="featured-ngo-logo"
                  />
                  <div className="featured-ngo-name">
                    {spotlightNgo.name}
                    {spotlightNgo.verified && (
                      <span className="featured-ngo-verified">
                        <Icon name="check" size={10} />
                      </span>
                    )}
                  </div>
                  <div className="featured-ngo-tagline">
                    {spotlightNgo.tagline}
                  </div>
                  <div className="featured-ngo-stats">
                    <Icon name="hand" size={12} />
                    {spotlightNgo.openSlots} open slots across{' '}
                    {spotlightNgo.events}{' '}
                    {spotlightNgo.events === 1 ? 'event' : 'events'}
                  </div>
                </div>
              </Link>
            </div>
          )}
        </aside>
      </div>

      {detail && (
        <VolunteerDetailModal
          opportunity={detail}
          ngo={NGOS.find((n) => n.id === detail.ngoId)}
          alreadySignedUp={isSignedUp(detail.id)}
          onClose={() => setDetail(null)}
          onApply={handleApplyFromDetail}
          onViewTicket={() => openTicket(detail)}
        />
      )}

      {applying && (
        <VolunteerApplicationForm
          opportunity={applying}
          ngo={NGOS.find((n) => n.id === applying.ngoId)}
          onClose={() => {
            setApplying(null)
            setDetail(applying)
          }}
          onSubmit={handleApplicationSubmit}
        />
      )}

      {ticket && (
        <VolunteerTicket
          volunteerId={ticket.volunteerId}
          opportunity={ticket.opportunity}
          onClose={() => setTicket(null)}
        />
      )}

      {cancelling && (
        <CancelVolunteerModal
          opportunity={cancelling}
          onClose={() => setCancelling(null)}
          onConfirm={handleCancelConfirm}
        />
      )}
    </div>
  )
}