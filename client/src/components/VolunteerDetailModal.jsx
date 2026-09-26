import { useAuth } from '../context/AuthContext'
import Icon from './Icon'

export default function VolunteerDetailModal({
  opportunity,
  ngo,
  alreadySignedUp,
  onClose,
  onApply,
  onViewTicket,
}) {
  const { user } = useAuth()

  if (!opportunity) return null

  const slotsLeft = opportunity.needed - opportunity.registered

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal volunteer-detail-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ---------- HEADER with image ---------- */}
        <div className="vd-hero">
          <img src={opportunity.image} alt="" className="vd-hero-image" />
          <button
            className="vd-close"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            <Icon name="x" size={16} color="white" />
          </button>
          <div className="vd-hero-overlay">
            <span className="vd-slots-badge">
              {slotsLeft} {slotsLeft === 1 ? 'slot' : 'slots'} left
            </span>
          </div>
        </div>

        <div className="vd-body">
          {/* ---------- TITLE ---------- */}
          <h2 className="vd-title">{opportunity.title}</h2>
          <div className="vd-ngo">
            {ngo?.logo && (
              <img src={ngo.logo} alt="" className="vd-ngo-logo" />
            )}
            <div>
              <div className="vd-ngo-name">{ngo?.name}</div>
              <div className="vd-ngo-meta">Verified organization</div>
            </div>
          </div>

          {/* ---------- QUICK FACTS grid ---------- */}
          <div className="vd-facts">
            <div className="vd-fact">
              <div className="vd-fact-icon">
                <Icon name="calendar" size={16} />
              </div>
              <div>
                <div className="vd-fact-label">Date</div>
                <div className="vd-fact-value">{opportunity.date}</div>
              </div>
            </div>
            <div className="vd-fact">
              <div className="vd-fact-icon">
                <Icon name="bell" size={16} />
              </div>
              <div>
                <div className="vd-fact-label">Time</div>
                <div className="vd-fact-value">
                  {opportunity.time || '9:00 AM – 12:00 PM'}
                </div>
              </div>
            </div>
            <div className="vd-fact">
              <div className="vd-fact-icon">
                <Icon name="map-pin" size={16} />
              </div>
              <div>
                <div className="vd-fact-label">Location</div>
                <div className="vd-fact-value">{opportunity.location}</div>
              </div>
            </div>
            <div className="vd-fact">
              <div className="vd-fact-icon">
                <Icon name="users" size={16} />
              </div>
              <div>
                <div className="vd-fact-label">Commitment</div>
                <div className="vd-fact-value">
                  {opportunity.commitment || 'Flexible'}
                </div>
              </div>
            </div>
          </div>

          {/* ---------- ADDRESS ---------- */}
          {opportunity.address && (
            <div className="vd-address">
              <Icon name="map-pin" size={14} color="var(--ink-500)" />
              <span>{opportunity.address}</span>
            </div>
          )}

          {/* ---------- ABOUT ---------- */}
          <div className="vd-section">
            <div className="vd-section-title">About this opportunity</div>
            <p className="vd-text">{opportunity.description}</p>
          </div>

          {/* ---------- WHAT YOU'LL DO ---------- */}
          {opportunity.whatYouWillDo?.length > 0 && (
            <div className="vd-section">
              <div className="vd-section-title">What you'll do</div>
              <ul className="vd-list">
                {opportunity.whatYouWillDo.map((item, i) => (
                  <li key={i}>
                    <span className="vd-check">
                      <Icon name="check" size={11} color="var(--blue-700)" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ---------- REQUIREMENTS ---------- */}
          {opportunity.requirements?.length > 0 && (
            <div className="vd-section">
              <div className="vd-section-title">Requirements</div>
              <ul className="vd-list">
                {opportunity.requirements.map((item, i) => (
                  <li key={i}>
                    <span className="vd-bullet" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ---------- SKILLS ---------- */}
          {opportunity.skills?.length > 0 && (
            <div className="vd-section">
              <div className="vd-section-title">Skills that help</div>
              <div className="vd-chips">
                {opportunity.skills.map((s) => (
                  <span key={s} className="pill" style={{ cursor: 'default' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ---------- FOOTER CTA ---------- */}
        <div className="vd-footer">
          {!user ? (
            <div className="vd-login-hint">
              Log in to apply for this opportunity.
            </div>
          ) : alreadySignedUp ? (
            <>
              <div className="vd-confirmed-note">
                <Icon name="check-circle" size={16} color="#15803d" />
                <span>You're already signed up for this event.</span>
              </div>
              <button
                className="btn btn-primary btn-lg btn-block"
                onClick={onViewTicket}
              >
                <Icon name="book" size={16} /> View my QR ticket
              </button>
            </>
          ) : (
            <>
              <div className="vd-footer-note">
                You'll fill out a short application next.
              </div>
              <button
                className="btn btn-accent btn-lg btn-block"
                onClick={onApply}
                disabled={slotsLeft <= 0}
              >
                {slotsLeft <= 0 ? (
                  'Fully booked'
                ) : (
                  <>
                    <Icon name="heart" size={16} /> I'm interested
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}