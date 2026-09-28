import Icon from './Icon'

export default function VerificationExplainer({ onClose }) {
  const checks = [
    {
      title: 'Legal registration',
      body: 'The organization is registered with the SEC or DSWD and can operate legally in the Philippines.',
    },
    {
      title: 'Authenticated representatives',
      body: 'Authorized staff have verified their identity and their link to the organization.',
    },
    {
      title: 'Financial transparency',
      body: 'The NGO has submitted audited financial statements or filed annual reports.',
    },
    {
      title: 'Program legitimacy',
      body: 'The organization demonstrates active, on-the-ground work aligned with their stated mission.',
    },
    {
      title: 'Ongoing monitoring',
      body: 'Verification is reviewed periodically. Lapses in compliance remove the badge.',
    },
  ]

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal verification-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="verification-header">
          <div className="verification-icon">
            <Icon name="shield" size={24} color="white" />
          </div>
          <div>
            <h2 className="verification-title">What "Verified" means</h2>
            <p className="verification-subtitle">
              Every verified NGO has passed these checks.
            </p>
          </div>
          <button
            className="btn btn-neutral btn-sm"
            onClick={onClose}
            style={{ padding: '6px 10px' }}
            type="button"
          >
            <Icon name="x" size={14} />
          </button>
        </div>

        <div className="verification-list">
          {checks.map((c, i) => (
            <div key={i} className="verification-item">
              <div className="verification-check">
                <Icon name="check" size={12} color="white" />
              </div>
              <div>
                <div className="verification-item-title">{c.title}</div>
                <div className="verification-item-body">{c.body}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="verification-footer">
          <div className="verification-footer-note">
            <Icon name="shield" size={14} color="var(--blue-700)" />
            <span>
              This is a demo badge. In production, checks would be verified
              against real regulatory records.
            </span>
          </div>
          <button
            className="btn btn-primary btn-block"
            onClick={onClose}
            type="button"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}