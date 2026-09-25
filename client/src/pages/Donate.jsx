import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CAMPAIGNS } from '../data/campaigns'
import { NGOS } from '../data/ngos'
import { useActivity } from '../store/useActivity'
import StatusTag from '../components/StatusTag'
import ProgressBar from '../components/ProgressBar'
import SavedButton from '../components/SavedButton'
import Icon from '../components/Icon'

export default function Donate() {
  const store = useActivity()
  const [filter, setFilter] = useState('all')

  const all = [...CAMPAIGNS, ...store.getExtraCampaigns()]
  const filtered = all.filter((c) => {
    if (filter === 'all') return true
    if (filter === 'urgent') return c.status === 'urgent'
    if (filter === 'active') return c.status === 'active'
    return true
  })
  const getNgo = (id) => NGOS.find((n) => n.id === id)

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Donation campaigns</h1>
        <p className="page-subtitle">
          Transparent fundraising with visible progress. Every peso counts.
        </p>
      </div>

      <div className="filters">
        {[
          { key: 'all', label: 'All causes' },
          { key: 'urgent', label: 'Urgent' },
          { key: 'active', label: 'Active' },
        ].map((f) => (
          <button
            key={f.key}
            className={`pill ${filter === f.key ? 'is-active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-3">
        {filtered.map((c) => {
          const ngo = getNgo(c.ngoId)
          return (
            <div
              key={c.id}
              className="card card-hover"
              style={{ padding: 0, overflow: 'hidden' }}
            >
              <Link
                to={`/campaign/${c.id}`}
                style={{ color: 'inherit', display: 'block' }}
              >
                <img
                  src={c.image}
                  alt=""
                  style={{ width: '100%', height: 160, objectFit: 'cover' }}
                />
                <div style={{ padding: 18 }}>
                  <div
                    className="row-between"
                    style={{
                      marginBottom: 6,
                      alignItems: 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 15,
                        flex: 1,
                        lineHeight: 1.35,
                      }}
                    >
                      {c.title}
                    </div>
                    <StatusTag status={c.status} />
                  </div>
                  <div
                    className="text-muted"
                    style={{ fontSize: 12, marginBottom: 14 }}
                  >
                    by {ngo?.name}
                  </div>
                  <ProgressBar value={c.raised} goal={c.goal} />
                  <div
                    className="row-between"
                    style={{
                      marginTop: 14,
                      fontSize: 12,
                      color: 'var(--ink-500)',
                    }}
                  >
                    <span className="row" style={{ gap: 5 }}>
                      <Icon name="users" size={13} /> {c.donorCount} supporters
                    </span>
                    <span className="row" style={{ gap: 5 }}>
                      <Icon name="calendar" size={13} /> {c.daysLeft} days left
                    </span>
                  </div>
                </div>
              </Link>

              <div
                style={{
                  padding: '0 18px 18px',
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                <SavedButton campaignId={c.id} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}