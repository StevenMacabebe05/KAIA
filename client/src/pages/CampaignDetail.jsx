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

/* ---------- payment logo component ---------- */
function PaymentLogo({ src, alt }) {
  return (
    <img
      src={src}
      alt={alt}
      className="payment-logo-img"
      onError={(e) => {
        e.target.style.display = 'none'
      }}
    />
  )
}

const PAYMENT_METHODS = [
  {
    id: 'gcash',
    name: 'GCash',
    tagline: 'Pay with your GCash wallet',
    logoSrc: '/images/payments/gcash.png',
    bg: '#e6f4fb',
    border: '#0072BC',
  },
  {
    id: 'maya',
    name: 'Maya',
    tagline: 'Pay with your Maya wallet',
    logoSrc: '/images/payments/maya.png',
    bg: '#e6f9ec',
    border: '#0FCE4C',
  },
  {
    id: 'bpi',
    name: 'BPI Online',
    tagline: 'Bank of the Philippine Islands',
    logoSrc: '/images/payments/bpi.png',
    bg: '#fdeaea',
    border: '#B3121B',
  },
  {
    id: 'bdo',
    name: 'BDO Online',
    tagline: 'Banco de Oro',
    logoSrc: '/images/payments/bdo.png',
    bg: '#e6ecf9',
    border: '#0033A0',
  },
  {
    id: 'metrobank',
    name: 'Metrobank',
    tagline: 'Metropolitan Bank',
    logoSrc: '/images/payments/metrobank.png',
    bg: '#e6edf5',
    border: '#003DA5',
  },
]

export default function CampaignDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const store = useActivity()
  const navigate = useNavigate()
  const toast = useToast()

  /* modal flow: null | 'amount' | 'method' | 'processing' | 'done' */
  const [stage, setStage] = useState(null)
  const [amount, setAmount] = useState(0)
  const [custom, setCustom] = useState('')
  const [selectedMethod, setSelectedMethod] = useState(null)
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

  function openModal() {
    if (!user) {
      navigate('/login')
      return
    }
    setStage('amount')
    setAmount(0)
    setCustom('')
    setSelectedMethod(null)
    setJustReceipt(null)
  }

  function closeModal() {
    setStage(null)
    setAmount(0)
    setCustom('')
    setSelectedMethod(null)
    setJustReceipt(null)
  }

  function chooseAmount(value) {
    setAmount(value)
    setStage('method')
  }

  function confirmMethod() {
    if (!selectedMethod) return
    setStage('processing')

    // fake 2-second processing
    setTimeout(() => {
      const receipt = store.donate(user.id, campaign.id, amount)
      store.addNotification(user.id, {
        type: 'donation',
        title: `You donated ₱${amount.toLocaleString()}`,
        body: `via ${selectedMethod.name} — thank you!`,
        link: `/receipt/${receipt.id}`,
      })
      setJustReceipt(receipt)
      setStage('done')
      setConfettiKey((k) => k + 1)
      toast.push(
        `Payment confirmed via ${selectedMethod.name}`,
        'success'
      )
    }, 2000)
  }

  return (
    <div className="container">
      <Confetti trigger={confettiKey} />

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

      {/* ---------- HERO ---------- */}
      <div className="campaign-hero">
        <img src={campaign.image} alt="" className="campaign-hero-img" />
        <div className="campaign-hero-overlay">
          <div className="campaign-hero-top">
            <StatusTag status={campaign.status} />
          </div>
          <div className="campaign-hero-bottom">
            <h1 className="campaign-hero-title">{campaign.title}</h1>
            <Link to={`/ngo/${ngo?.id}`} className="campaign-hero-ngo">
              {ngo?.logo && <img src={ngo.logo} alt="" />}
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
        <div>
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

          <div className="chart-card" style={{ marginBottom: 20 }}>
            <div className="chart-card-header">
              <h3 className="chart-title">About this campaign</h3>
            </div>
            <p className="campaign-body-text">{campaign.description}</p>
          </div>

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
              onClick={openModal}
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
      {stage && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div
            className="modal donate-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* STEP 1 — AMOUNT */}
            {stage === 'amount' && (
              <>
                <div className="donate-modal-header">
                  <h2 className="donate-modal-title">
                    Make a donation
                  </h2>
                  <p className="donate-modal-subtitle">
                    Choose an amount. Demo only — no real charge.
                  </p>
                </div>

                <div className="amount-grid">
                  {PRESETS.map((amt) => (
                    <button
                      key={amt}
                      className="amount-chip"
                      onClick={() => chooseAmount(amt)}
                      type="button"
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
                  onClick={() => chooseAmount(Number(custom))}
                  type="button"
                >
                  Continue with ₱{custom || 0}
                  <Icon name="arrow-right" size={16} />
                </button>
                <button
                  className="btn btn-neutral btn-block"
                  style={{ marginTop: 8 }}
                  onClick={closeModal}
                  type="button"
                >
                  Cancel
                </button>
              </>
            )}

            {/* STEP 2 — PAYMENT METHOD */}
            {stage === 'method' && (
              <>
                <div className="donate-modal-header">
                  <button
                    className="donate-modal-back"
                    onClick={() => setStage('amount')}
                    type="button"
                  >
                    <span
                      style={{
                        transform: 'rotate(180deg)',
                        display: 'inline-block',
                      }}
                    >
                      <Icon name="chevron-right" size={16} />
                    </span>
                    Back
                  </button>
                  <div className="donate-modal-amount-badge">
                    Donating <strong>₱{amount.toLocaleString()}</strong>
                  </div>
                  <h2 className="donate-modal-title">
                    Choose payment method
                  </h2>
                  <p className="donate-modal-subtitle">
                    All methods are simulated for this demo.
                  </p>
                </div>

                <div className="payment-list">
                  {PAYMENT_METHODS.map((m) => {
                    const active = selectedMethod?.id === m.id
                    return (
                      <button
                        key={m.id}
                        type="button"
                        className={`payment-method ${
                          active ? 'active' : ''
                        }`}
                        onClick={() => setSelectedMethod(m)}
                      >
                        <div
                          className="payment-logo-wrap"
                          style={{
                            background: m.bg,
                            borderColor: active ? m.border : 'transparent',
                          }}
                        >
                          <PaymentLogo src={m.logoSrc} alt={m.name} />
                        </div>
                        <div className="payment-info">
                          <div className="payment-name">{m.name}</div>
                          <div className="payment-tagline">
                            {m.tagline}
                          </div>
                        </div>
                        <div
                          className="payment-radio"
                          style={{
                            borderColor: active
                              ? 'var(--blue-700)'
                              : 'var(--ink-300)',
                          }}
                        >
                          {active && <span className="payment-radio-dot" />}
                        </div>
                      </button>
                    )
                  })}
                </div>

                <button
                  className="btn btn-accent btn-block btn-lg"
                  disabled={!selectedMethod}
                  onClick={confirmMethod}
                  type="button"
                  style={{ marginTop: 20 }}
                >
                  Pay ₱{amount.toLocaleString()}
                  {selectedMethod && ` via ${selectedMethod.name}`}
                </button>
                <button
                  className="btn btn-neutral btn-block"
                  style={{ marginTop: 8 }}
                  onClick={closeModal}
                  type="button"
                >
                  Cancel
                </button>
              </>
            )}

            {/* STEP 3 — PROCESSING */}
            {stage === 'processing' && (
              <div className="donate-processing">
                <div className="donate-processing-spinner" />
                <h2 className="donate-processing-title">
                  Processing payment
                </h2>
                <p className="donate-processing-text">
                  Connecting to {selectedMethod?.name}…
                </p>
                <div className="donate-processing-amount">
                  ₱{amount.toLocaleString()}
                </div>
                <p className="donate-processing-note">
                  Please don't close this window. This is a demo — no real
                  charge will occur.
                </p>
              </div>
            )}

            {/* STEP 4 — DONE */}
            {stage === 'done' && justReceipt && (
              <div className="donate-done">
                <div className="donate-done-icon">
                  <Icon name="check-circle" size={40} color="#16a34a" />
                </div>
                <h2 className="donate-done-title">Payment successful!</h2>
                <p className="donate-done-subtitle">
                  Thank you for your donation
                </p>
                <div className="donate-done-amount">
                  <AnimatedCounter
                    value={justReceipt.amount}
                    prefix="₱"
                  />
                </div>
                <div className="donate-done-method">
                  via {selectedMethod?.name}
                </div>

                <div className="donation-impact" style={{ marginTop: 20 }}>
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
                    type="button"
                  >
                    View receipt
                  </button>
                </Link>
                <button
                  className="btn btn-neutral btn-block"
                  style={{ marginTop: 8 }}
                  onClick={closeModal}
                  type="button"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}