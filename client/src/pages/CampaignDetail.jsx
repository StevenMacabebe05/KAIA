import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CAMPAIGNS } from '../data/campaigns'
import { NGOS } from '../data/ngos'
import { useActivity } from '../store/useActivity'
import { useAuth } from '../context/AuthContext'
import ProgressBar from '../components/ProgressBar'
import StatusTag from '../components/StatusTag'
import EmptyState from '../components/EmptyState'
import Icon from '../components/Icon'

const PRESETS = [100, 500, 1000]

export default function CampaignDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const store = useActivity()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [custom, setCustom] = useState('')

  const extra = store.getExtraCampaigns().find((c) => c.id === id)
  const campaign = CAMPAIGNS.find((c) => c.id === id) ?? extra
  if (!campaign) return <div className="container"><EmptyState icon="inbox" title="Campaign not found" /></div>

  const ngo = NGOS.find((n) => n.id === campaign.ngoId)
  const myDonations = user ? store.getDonations(user.id).filter((d) => d.campaignId === id) : []
  const myExtra = myDonations.reduce((s, d) => s + d.amount, 0)
  const liveRaised = campaign.raised + myExtra
  const liveDonors = campaign.donorCount + myDonations.length

  function handleDonate(amount) {
    if (!user) {
      navigate('/login')
      return
    }
    store.donate(user.id, campaign.id, amount)
    setShowModal(false)
    setCustom('')
  }

  return (
    <div className="container">
      <Link to="/donate" className="row" style={{ gap: 6, marginBottom: 16, fontSize: 13, fontWeight: 600 }}>
        <Icon name="chevron-right" size={14} color="currentColor" />
        <span style={{ transform: 'rotate(180deg)' }}>Back to campaigns</span>
      </Link>

      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <img src={campaign.image} alt="" style={{ width: '100%', height: 320, objectFit: 'cover' }} />
            <div style={{ padding: 28 }}>
              <div className="row-between" style={{ marginBottom: 8, alignItems: 'flex-start', gap: 16 }}>
                <h1 style={{ fontSize: 28, margin: 0, fontWeight: 800, letterSpacing: '-0.02em', flex: 1 }}>
                  {campaign.title}
                </h1>
                <StatusTag status={campaign.status} />
              </div>
              <Link to={`/ngo/${ngo?.id}`} className="text-muted" style={{ fontSize: 13, fontWeight: 600 }}>
                by {ngo?.name}
              </Link>

              <div className="divider" />

              <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink-700)', margin: 0 }}>
                {campaign.description}
              </p>
            </div>
          </div>
        </div>

        <aside>
          <div className="card" style={{ position: 'sticky', top: 88 }}>
            <ProgressBar value={liveRaised} goal={campaign.goal} />
            <div className="row-between" style={{ marginTop: 14, fontSize: 13, color: 'var(--ink-500)' }}>
              <span className="row" style={{ gap: 6 }}>
                <Icon name="users" size={14} /> {liveDonors} supporters
              </span>
              <span className="row" style={{ gap: 6 }}>
                <Icon name="calendar" size={14} /> {campaign.daysLeft} days left
              </span>
            </div>

            <button
              className="btn btn-accent btn-block btn-lg"
              onClick={() => setShowModal(true)}
              style={{ marginTop: 20 }}
            >
              <Icon name="heart" size={16} /> Donate to this campaign
            </button>
            <p className="text-muted text-center" style={{ marginTop: 12, fontSize: 12 }}>
              Demo only — no real payment is processed.
            </p>

            <div className="divider" />

            <div style={{ fontSize: 13, color: 'var(--ink-700)' }}>
              <div className="row-between" style={{ marginBottom: 8 }}>
                <span>Category</span>
                <strong>{campaign.category}</strong>
              </div>
              <div className="row-between">
                <span>Deadline</span>
                <strong>{campaign.deadline}</strong>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, marginBottom: 4 }}>Make a donation</h2>
            <p className="text-muted" style={{ marginBottom: 20, fontSize: 13 }}>
              Choose an amount. No real payment is processed.
            </p>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {PRESETS.map((amt) => (
                <button
                  key={amt}
                  className="pill"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => handleDonate(amt)}
                >
                  ₱{amt}
                </button>
              ))}
            </div>

            <div className="field">
              <label>Custom amount</label>
              <input
                type="number"
                className="input"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="Enter amount"
                min="1"
              />
            </div>

            <button
              className="btn btn-accent btn-block btn-lg"
              disabled={!custom || Number(custom) <= 0}
              onClick={() => handleDonate(Number(custom))}
            >
              Donate ₱{custom || 0}
            </button>
            <button
              className="btn btn-neutral btn-block"
              style={{ marginTop: 8 }}
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}