import { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useActivity } from '../store/useActivity'
import { useAuth } from '../context/AuthContext'
import { CAMPAIGNS } from '../data/campaigns'
import { NGOS } from '../data/ngos'
import Icon from '../components/Icon'
import EmptyState from '../components/EmptyState'

export default function Receipt() {
  const { id } = useParams()
  const { user } = useAuth()
  const store = useActivity()
  const navigate = useNavigate()

  const receipt = store.getReceipt(id)

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  if (!receipt) {
    return (
      <div className="container">
        <EmptyState
          icon="inbox"
          title="Receipt not found"
          message="This receipt may have been cleared."
          action={
            <Link
              to="/donate"
              style={{ marginTop: 16, display: 'inline-block' }}
            >
              <button className="btn btn-primary">Browse campaigns</button>
            </Link>
          }
        />
      </div>
    )
  }

  const campaign = CAMPAIGNS.find((c) => c.id === receipt.campaignId)
  const ngo = NGOS.find((n) => n.id === campaign?.ngoId)

  function handlePrint() {
    window.print()
  }

  function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      navigator
        .share({
          title: 'My KAIA donation receipt',
          text: `I donated ₱${receipt.amount.toLocaleString()} to ${campaign?.title}`,
          url,
        })
        .catch(() => {})
    } else {
      navigator.clipboard.writeText(url)
      alert('Receipt link copied to clipboard')
    }
  }

  return (
    <div className="container" style={{ maxWidth: 640 }}>
      <div className="receipt">
        <div className="receipt-header">
          <img
            src="/images/kaia-logo.png"
            alt="KAIA"
            style={{ height: 44, width: 'auto' }}
          />
          <div className="receipt-badge">
            <Icon name="check-circle" size={14} color="#16a34a" />
            <span>Donation Confirmed</span>
          </div>
        </div>

        <div className="receipt-amount">
          <div className="receipt-amount-label">You donated</div>
          <div className="receipt-amount-value">
            ₱{receipt.amount.toLocaleString()}
          </div>
        </div>

        <div className="receipt-row">
          <span>Campaign</span>
          <strong>{campaign?.title || 'Campaign'}</strong>
        </div>
        <div className="receipt-row">
          <span>Organization</span>
          <strong>{ngo?.name || 'NGO'}</strong>
        </div>
        <div className="receipt-row">
          <span>Donor</span>
          <strong>{user?.name || 'Supporter'}</strong>
        </div>
        <div className="receipt-row">
          <span>Date</span>
          <strong>
            {new Date(receipt.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </strong>
        </div>
        <div className="receipt-row">
          <span>Reference</span>
          <strong className="receipt-ref">{receipt.ref}</strong>
        </div>

        <div className="receipt-note">
          <Icon name="shield" size={14} color="var(--blue-700)" />
          <span>
            This is a demo receipt. No real payment was processed.
          </span>
        </div>

        <div className="receipt-actions">
          <button className="btn btn-ghost" onClick={handlePrint}>
            Print
          </button>
          <button className="btn btn-ghost" onClick={handleShare}>
            Share
          </button>
          <Link to="/my-kaia" style={{ flex: 1 }}>
            <button className="btn btn-primary btn-block">
              View my impact
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}