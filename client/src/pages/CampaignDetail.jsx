import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { CAMPAIGNS } from '../data/campaigns'
import { NGOS } from '../data/ngos'
import { useActivity } from '../store/useActivity'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import ProgressBar from '../components/ProgressBar'
import StatusTag from '../components/StatusTag'
import EmptyState from '../components/EmptyState'
import Confetti from '../components/Confetti'
import AnimatedCounter from '../components/AnimatedCounter'
import SavedButton from '../components/SavedButton'
import VerifiedBadge from '../components/VerifiedBadge'
import Icon from '../components/Icon'

const PRESETS = [100, 500, 1000, 2500]

export default function CampaignDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const store = useActivity()
  const navigate = useNavigate()
  const toast = useToast()

  const [showModal, setShowModal] = useState(false)
  const [custom, setCustom] = useState('')
  const [justReceipt, setJustReceipt] = useState(null)
  const [confettiKey, setConfettiKey] = useState(0)

  const extra = store.getExtraCampaigns().find((c) => c.id === id)
  const campaign = CAMPAIGNS.find((c) => c.id === id) ?? extra

  if (!campaign) {
    return (
      <div className="container">
        <EmptyState icon="inbox" title="Campaign not found" />
      </div>
    )
  }

  const ngo = NGOS.find((n) => n.id === campaign.ngoId)
  const myDonations = user
    ? store.getDonations(user.id).filter((d) => d.campaignId === id)
    : []
  const myExtra = myDonations.reduce((s, d) => s + d.amount, 0)
  const liveRaised = campaign.raised + myExtra
  const liveDonors = campaign.donorCount + myDonations.length
  const goalPct = Math.min(100, Math.round((liveRaised / campaign.goal) * 100))

  const breakdown = campaign.howItWillBeUsed || []
  const breakdownTotal = breakdown.reduce((s, b) => s + b.amount, 0)

  function handleDonate(amount) {
    if (!user) {
      navigate('/login')
      return
    }
    const receipt = store.donate(user.id, campaign.id, amount)
    store.addNotification(user.id, {
      type: 'donation',
      title: `You donated ₱${amount.toLocaleString()}`,
      body: `to "${campaign.title}" — thank you!`,
      link: `/receipt/${receipt.id}`,
    })
    setJustReceipt(receipt)
    setConfettiKey(Date.now())
    setCustom('')
    toast.push(`Thank you! You donated ₱${amount.toLocaleString()}`, 'success')
  }

  function closeModal() {
    setShowModal(false)
    setJustReceipt(null)
  }

  return (
    <div className="container">
      <Confetti trigger={confettiKey} />

      {/* back link */}
      <Link
        to="/donate"
        className="row"
        style={{
          gap: 6,
          marginBottom: 16,
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--ink-500)',
        }}
      >
        <span style={{ transform: 'rotate(180deg)' }}>
          <Icon name="chevron-right" size={14} />
        </span>
        Back to campaigns
      </Link>

      {/* ---------- HERO IMAGE ---------- */}
      <div className="campaign-hero">
        <img src={campaign.image} alt="" className="campaign-hero-img" />
        <div className="campaign-hero-overlay">
          <div className="campaign-hero-top">
            <StatusTag status={campaign.status} />
          </div>
          <div className="campaign-hero-bottom">
            <h1 className="campaign-hero-title">{campaign.title}</h1>
            <Link
              to={`/ngo/${ngo?.id}`}
              className="campaign-hero-ngo"
            >
              {ngo?.logo && (
                <img src={ngo.logo} alt="" />
              )}
              <span>by {ngo?.name}</span>
              <VerifiedBadge verified={ngo?.verified} />
            </Link>
          </div>
        </div>
      </div>

      {/* ---------- MAIN GRID ---------- */}
      <div
        className="grid"
        style={{ gridTemplateColumns: '2fr 1fr', gap: 24, marginTop: 28 }}
      >
        {/* LEFT */}
        <div>
          {/* quick facts */}
          <div className="campaign-facts">
            <div className="campaign-fact">
              <div className="campaign-fact-icon">
                <Icon name="map-pin" size={16} />
              </div>
              <div>
                <div className="campaign-fact-label">Where it goes</div>
                <div className="campaign-fact-value">
                  {campaign.location || 'Philippines'}
                </div>
              </div>
            </div>
            <div className="campaign-fact">
              <div className="campaign-fact-icon">
                <Icon name="users" size={16} />
              </div>
              <div>
                <div className="campaign-fact-label">Who it helps</div>
                <div className="campaign-fact-value">
                  {campaign.beneficiaries || 'Beneficiaries'}
                </div>
              </div>
            </div>
            <div className="campaign-fact">
              <div className="campaign-fact-icon">
                <Icon name="calendar" size={16} />
              </div>
              <div>
                <div className="campaign-fact-label">Deadline</div>
                <div className="campaign-fact-value">{campaign.deadline}</div>
              </div>
            </div>
            <div className="campaign-fact">
              <div className="campaign-fact-icon">
                <Icon name="trending" size={16} />
              </div>
              <div>
                <div className="campaign-fact-label">Category</div>
                <div className="campaign-fact-value">{campaign.category}</div>
              </div>
            </div>
          </div>

          {/* about */}
          <div className="chart-card" style={{ marginBottom: 20 }}>
            <div className="chart-card-header">
              <h3 className="chart-title">About this campaign</h3>
            </div>
            <p className="campaign-body-text">{campaign.description}</p>
          </div>

          {/* how it will be used */}
          {breakdown.length > 0 && (
            <div className="chart-card" style={{ marginBottom: 20 }}>
              <div className="chart-card-header">
                <div>
                  <h3 className="chart-title">How your donation is used</h3>
                  <p className="chart-subtitle">
                    Full breakdown of the ₱{breakdownTotal.toLocaleString()}{' '}
                    target
                  </p>
                </div>
              </div>

              <div className="breakdown-list">
                {breakdown.map((b) => {
                  const pct = (b.amount / breakdownTotal) * 100
                  return (
                    <div key={b.label} className="breakdown-item">
                      <div className="breakdown-row">
                        <span className="breakdown-label">{b.label}</span>
                        <span className="breakdown-amount">
                          ₱{b.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="breakdown-track">
                        <div
                          className="breakdown-fill"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="breakdown-pct">
                        {Math.round(pct)}% of total
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* impact examples */}
          {campaign.impactExamples?.length > 0 && (
            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <h3 className="chart-title">Your impact</h3>
                  <p className="chart-subtitle">
                    What your donation achieves
                  </p>
                </div>
              </div>
              <div className="impact-grid">
                {campaign.impactExamples.map((imp) => (
                  <div key={imp.amount} className="impact-card">
                    <div className="impact-amount">
                      ₱{imp.amount.toLocaleString()}
                    </div>
                    <div className="impact-desc">{imp.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT sidebar */}
        <aside>
          <div className="card" style={{ position: 'sticky', top: 88 }}>
            <div className="campaign-sidebar-header">
              <div>
                <div className="campaign-sidebar-label">Progress</div>
                <div className="campaign-sidebar-raised">
                  ₱{liveRaised.toLocaleString()}
                </div>
                <div className="campaign-sidebar-goal">
                  of ₱{campaign.goal.toLocaleString()} goal
                </div>
              </div>
              <div className="campaign-sidebar-pct">{goalPct}%</div>
            </div>

            <ProgressBar value={liveRaised} goal={campaign.goal} />

            <div
              className="row-between"
              style={{
                marginTop: 14,
                fontSize: 13,
                color: 'var(--ink-500)',
              }}
            >
              <span className="row" style={{ gap: 6 }}>
                <Icon name="users" size={14} />
                {liveDonors} supporters
              </span>
              <span className="row" style={{ gap: 6 }}>
                <Icon name="calendar" size={14} />
                {campaign.daysLeft} days left
              </span>
            </div>

            <button
              className="btn btn-accent btn-block btn-lg"
              onClick={() => setShowModal(true)}
              style={{ marginTop: 20 }}
            >
              <Icon name="heart" size={16} /> Donate to this campaign
            </button>

            <div style={{ marginTop: 10 }}>
              <SavedButton campaignId={campaign.id} variant="text" />
            </div>

            <p
              className="text-muted text-center"
              style={{ marginTop: 12, fontSize: 12 }}
            >
              Demo only — no real payment is processed.
            </p>
          </div>
        </aside>
      </div>

      {/* ---------- DONATE MODAL ---------- */}
      {showModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {justReceipt ? (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: 'var(--orange-50)',
                    display: 'grid',
                    placeItems: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <Icon name="heart" size={32} color="var(--orange-500)" />
                </div>
                <h2 style={{ margin: '0 0 8px', fontSize: 22 }}>
                  Thank you!
                </h2>
                <p className="text-muted" style={{ marginBottom: 20 }}>
                  Your gift of
                </p>
                <div
                  style={{
                    fontSize: 40,
                    fontWeight: 800,
                    color: 'var(--blue-700)',
                    letterSpacing: '-0.03em',
                    marginBottom: 20,
                  }}
                >
                  <AnimatedCounter value={justReceipt.amount} prefix="₱" />
                </div>
                <p
                  className="text-muted"
                  style={{ marginBottom: 24, fontSize: 13 }}
                >
                  goes directly to <strong>{campaign.title}</strong>
                </p>

                <div className="donation-impact">
                  <div className="donation-impact-row">
                    <span>Your total gifts to this cause</span>
                    <strong>₱{myExtra.toLocaleString()}</strong>
                  </div>
                  <div className="donation-impact-row">
                    <span>New campaign progress</span>
                    <strong>{goalPct}%</strong>
                  </div>
                </div>

                <Link
                  to={`/receipt/${justReceipt.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <button
                    className="btn btn-primary btn-block btn-lg"
                    style={{ marginTop: 20 }}
                  >
                    View receipt
                  </button>
                </Link>
                <button
                  className="btn btn-neutral btn-block"
                  style={{ marginTop: 8 }}
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h2 style={{ marginTop: 0, marginBottom: 4 }}>
                  Make a donation
                </h2>
                <p
                  className="text-muted"
                  style={{ marginBottom: 20, fontSize: 13 }}
                >
                  Choose an amount. No real payment is processed.
                </p>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 8,
                    marginBottom: 16,
                  }}
                >
                  {PRESETS.map((amt) => (
                    <button
                      key={amt}
                      className="amount-chip"
                      onClick={() => handleDonate(amt)}
                    >
                      ₱{amt.toLocaleString()}
                    </button>
                  ))}
                </div>

                <div className="field">
                  <label>Or enter a custom amount</label>
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
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}