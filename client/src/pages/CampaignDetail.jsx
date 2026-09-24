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
  const [justDonated, setJustDonated] = useState(null)
  const [confettiKey, setConfettiKey] = useState(0)

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
    setJustDonated(amount)
    setConfettiKey(Date.now())
    setCustom('')
    toast.push(`Thank you! You donated ₱${amount.toLocaleString()}`, 'success')
  }

  function closeModal() {
    setShowModal(false)
    setJustDonated(null)
  }

  return (
    <div className="container">
      <Confetti trigger={confettiKey} />

      <Link
        to="/donate"
        className="row"
        style={{ gap: 6, marginBottom: 16, fontSize: 13, fontWeight: 600, color: 'var(--ink-500)' }}
      >
        <span style={{ transform: 'rotate(180deg)' }}>
          <Icon name="chevron-right" size={14} />
        </span>
        Back to campaigns
      </Link>

      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <img
              src={campaign.image}
              alt=""
              style={{ width: '100%', height: 320, objectFit: 'cover' }}
            />
            <div style={{ padding: 28 }}>
              <div className="row-between" style={{ marginBottom: 8, alignItems: 'flex-start', gap: 16 }}>
                <h1
                  style={{
                    fontSize: 28,
                    margin: 0,
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    flex: 1,
                  }}
                >
                  {campaign.title}
                </h1>
                <StatusTag status={campaign.status} />
              </div>
              <Link
                to={`/ngo/${ngo?.id}`}
                className="text-muted"
                style={{ fontSize: 13, fontWeight: 600 }}
              >
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
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {justDonated ? (
              /* ---------- thank-you state ---------- */
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
                  <AnimatedCounter value={justDonated} prefix="₱" />
                </div>
                <p className="text-muted" style={{ marginBottom: 24, fontSize: 13 }}>
                  goes directly to <strong>{campaign.title}</strong>
                </p>

                <div className="donation-impact">
                  <div className="donation-impact-row">
                    <span>Your total gifts to this cause</span>
                    <strong>₱{(myExtra + justDonated).toLocaleString()}</strong>
                  </div>
                  <div className="donation-impact-row">
                    <span>New campaign progress</span>
                    <strong>
                      {Math.round(((liveRaised + justDonated) / campaign.goal) * 100)}%
                    </strong>
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-block btn-lg"
                  onClick={closeModal}
                  style={{ marginTop: 20 }}
                >
                  Done
                </button>
              </div>
            ) : (
              /* ---------- amount picker ---------- */
              <>
                <h2 style={{ marginTop: 0, marginBottom: 4 }}>Make a donation</h2>
                <p className="text-muted" style={{ marginBottom: 20, fontSize: 13 }}>
                  Choose an amount. No real payment is processed.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
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