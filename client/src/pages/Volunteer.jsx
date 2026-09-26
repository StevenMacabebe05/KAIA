import { useState } from 'react'
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

export default function Volunteer() {
  const { user } = useAuth()
  const store = useActivity()
  const toast = useToast()

  const [tab, setTab] = useState('nearby')
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

  const filtered = all.filter((o) => {
    if (getSignupStatus(o.id) === 'cancelled') return false
    if (tab === 'nearby') return o.location === 'Quezon City'
    if (tab === 'this-week') {
      const d = new Date(o.date)
      const now = new Date()
      const diff = (d - now) / (1000 * 60 * 60 * 24)
      return diff >= 0 && diff <= 7
    }
    return true
  })

  const getNgo = (id) => NGOS.find((n) => n.id === id)

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

    setConfettiKey(Date.now())
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
      toast.push('Signup cancelled — the NGO has been notified.', 'info')
    }
    setCancelling(null)
  }

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

      <div className="filters">
        {[
          { key: 'nearby', label: 'Nearby' },
          { key: 'this-week', label: 'This week' },
          { key: 'all', label: 'All' },
        ].map((t) => (
          <button
            key={t.key}
            className={`pill ${tab === t.key ? 'is-active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="inbox"
          title="No opportunities match"
          message="Try a different filter."
        />
      ) : (
        <div className="grid grid-2">
          {filtered.map((o) => {
            const ngo = getNgo(o.ngoId)
            const signed = isSignedUp(o.id)
            const window = getCancellationWindow(o.date)

            return (
              <article
                key={o.id}
                className="card card-hover"
                style={{ cursor: 'pointer' }}
                onClick={() => openDetail(o)}
              >
                <img
                  src={o.image}
                  alt=""
                  style={{
                    width: '100%',
                    height: 160,
                    objectFit: 'cover',
                    borderRadius: 10,
                    marginBottom: 16,
                  }}
                />

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
              </article>
            )
          })}
        </div>
      )}

      {detail && (
        <VolunteerDetailModal
          opportunity={detail}
          ngo={getNgo(detail.ngoId)}
          alreadySignedUp={isSignedUp(detail.id)}
          onClose={() => setDetail(null)}
          onApply={handleApplyFromDetail}
          onViewTicket={() => openTicket(detail)}
        />
      )}

      {applying && (
        <VolunteerApplicationForm
          opportunity={applying}
          ngo={getNgo(applying.ngoId)}
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