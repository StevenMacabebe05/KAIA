import { useState } from 'react'
import { OPPORTUNITIES } from '../data/opportunities'
import { NGOS } from '../data/ngos'
import { useActivity } from '../store/useActivity'
import { useAuth } from '../context/AuthContext'
import EmptyState from '../components/EmptyState'
import Icon from '../components/Icon'

export default function Volunteer() {
  const { user } = useAuth()
  const store = useActivity()
  const [tab, setTab] = useState('nearby')

  const all = [...OPPORTUNITIES, ...store.getExtraOpportunities()]
  const filtered = all.filter((o) => {
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
  const mySignups = user ? store.getSignups(user.id) : []
  const isSignedUp = (id) => mySignups.some((s) => s.opportunityId === id)

  function handleSignUp(opp) {
    if (!user) return
    const ok = store.signUpForOpportunity(user.id, opp.id)
    if (ok) alert('You are signed up! Check My KAIA to see it.')
    else alert('You already signed up for this.')
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Volunteer opportunities</h1>
        <p className="page-subtitle">
          Turn spare time into real, trackable impact.
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
        <EmptyState icon="inbox" title="No opportunities" message="Try another filter." />
      ) : (
        <div className="grid grid-2">
          {filtered.map((o) => {
            const ngo = getNgo(o.ngoId)
            const signed = isSignedUp(o.id)
            return (
              <article key={o.id} className="card card-hover">
                <img src={o.image} alt="" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 10, marginBottom: 16 }} />
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{o.title}</div>
                <div className="row text-muted" style={{ fontSize: 13, marginBottom: 12, gap: 14, flexWrap: 'wrap' }}>
                  <span className="row" style={{ gap: 5 }}>
                    <Icon name="users" size={14} /> {ngo?.name}
                  </span>
                  <span className="row" style={{ gap: 5 }}>
                    <Icon name="map-pin" size={14} /> {o.location}
                  </span>
                  <span className="row" style={{ gap: 5 }}>
                    <Icon name="calendar" size={14} /> {o.date}
                  </span>
                </div>
                <p style={{ fontSize: 14, margin: '0 0 18px', color: 'var(--ink-700)', lineHeight: 1.55 }}>{o.description}</p>
                <div className="row-between">
                  <span
                    className="pill"
                    style={{ background: 'var(--orange-100)', color: 'var(--orange-600)', cursor: 'default' }}
                  >
                    {o.needed - o.registered} needed
                  </span>
                  <button
                    className={`btn ${signed ? 'btn-ghost' : 'btn-primary'}`}
                    disabled={signed}
                    onClick={() => handleSignUp(o)}
                  >
                    {signed ? 'Registered' : 'Volunteer now'}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}