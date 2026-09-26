import { useState } from 'react'
import { CANCELLATION_REASONS } from '../utils/cancellation'
import Icon from './Icon'

export default function CancelVolunteerModal({
  opportunity,
  onClose,
  onConfirm,
}) {
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [step, setStep] = useState('form') // 'form' | 'confirmed'

  function handleSubmit(e) {
    e.preventDefault()
    if (!reason) return
    const fullReason = notes.trim() ? `${reason} — ${notes.trim()}` : reason
    onConfirm(fullReason)
    setStep('confirmed')
  }

  if (step === 'confirmed') {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'var(--ink-100)',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Icon name="check" size={28} color="var(--ink-700)" />
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 20 }}>
              Registration cancelled
            </h2>
            <p className="text-muted" style={{ marginBottom: 20, fontSize: 13 }}>
              Your spot has been released. The NGO has been notified.
            </p>
            <button
              className="btn btn-primary btn-block"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 480 }}
      >
        <div className="cancel-header">
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: '#fee2e2',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <Icon name="x" size={20} color="var(--red-600)" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 18 }}>
              Cancel your volunteer signup?
            </h2>
            <p
              className="text-muted"
              style={{ margin: '4px 0 0', fontSize: 13 }}
            >
              {opportunity.title}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Why are you cancelling? *</label>
            <div className="reason-grid">
              {CANCELLATION_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`availability-chip ${
                    reason === r ? 'is-active' : ''
                  }`}
                  onClick={() => setReason(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Additional notes (optional)</label>
            <textarea
              className="input"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything else the organizer should know?"
            />
          </div>

          <div
            style={{
              padding: 12,
              background: 'var(--orange-50)',
              borderRadius: 10,
              fontSize: 12,
              color: 'var(--orange-600)',
              fontWeight: 600,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
            }}
          >
            <Icon name="shield" size={14} color="var(--orange-600)" />
            <span>
              Your QR ticket will be revoked. You can apply again for a future
              event.
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn btn-neutral"
              style={{ flex: 1 }}
              onClick={onClose}
            >
              Keep my spot
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1, background: 'var(--red-600)' }}
              disabled={!reason}
            >
              Cancel signup
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}