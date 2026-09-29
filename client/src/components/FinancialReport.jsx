import { getFinancialsForNgo } from '../data/financials'
import Icon from './Icon'

export default function FinancialReport({ ngoId }) {
  const data = getFinancialsForNgo(ngoId)

  if (!data) {
    return (
      <div className="chart-card">
        <div className="chart-card-header">
          <h3 className="chart-title">Financial transparency</h3>
        </div>
        <p className="text-muted" style={{ fontSize: 13 }}>
          This organization has not yet published their financial breakdown.
          Verification is in progress.
        </p>
      </div>
    )
  }

  const maxRaised = Math.max(...data.years.map((y) => y.raised))

  return (
    <div className="financial-report">
      {/* header */}
      <div className="chart-card" style={{ marginBottom: 20 }}>
        <div className="chart-card-header">
          <div>
            <h3 className="chart-title">Where your money goes</h3>
            <p className="chart-subtitle">
              {data.year} fiscal year · Total ₱
              {data.totalRaised.toLocaleString()}
            </p>
          </div>
          {data.audited && (
            <span className="chart-badge">
              <Icon name="shield" size={11} />
              Audited by {data.auditor.split(' ')[0]}
            </span>
          )}
        </div>

        {/* breakdown bars */}
        <div className="fin-breakdown">
          {data.breakdown.map((b) => (
            <div key={b.label} className="fin-breakdown-item">
              <div className="fin-breakdown-header">
                <div className="fin-breakdown-label-wrap">
                  <span
                    className="fin-breakdown-dot"
                    style={{ background: b.color }}
                  />
                  <span className="fin-breakdown-label">{b.label}</span>
                </div>
                <span className="fin-breakdown-pct">{b.pct}%</span>
              </div>
              <div className="fin-breakdown-track">
                <div
                  className="fin-breakdown-fill"
                  style={{ width: `${b.pct}%`, background: b.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* yearly comparison */}
      <div className="chart-card" style={{ marginBottom: 20 }}>
        <div className="chart-card-header">
          <div>
            <h3 className="chart-title">Growth over time</h3>
            <p className="chart-subtitle">
              Total funds raised per year
            </p>
          </div>
        </div>

        <div className="fin-years">
          {data.years.map((y) => (
            <div key={y.year} className="fin-year">
              <div className="fin-year-value">
                ₱{(y.raised / 1000).toFixed(0)}k
              </div>
              <div className="fin-year-bar-wrap">
                <div
                  className="fin-year-bar"
                  style={{ height: `${(y.raised / maxRaised) * 100}%` }}
                />
              </div>
              <div className="fin-year-label">{y.year}</div>
            </div>
          ))}
        </div>
      </div>

      {/* trust panel */}
      <div className="chart-card">
        <div className="chart-card-header">
          <h3 className="chart-title">Trust & accountability</h3>
        </div>
        <div className="fin-trust-list">
          <div className="fin-trust-item">
            <div className="fin-trust-icon">
              <Icon name="check" size={14} color="white" />
            </div>
            <div>
              <div className="fin-trust-title">
                Independently audited
              </div>
              <div className="fin-trust-body">
                Reviewed by {data.auditor} for fiscal year {data.year}.
              </div>
            </div>
          </div>
          <div className="fin-trust-item">
            <div className="fin-trust-icon">
              <Icon name="check" size={14} color="white" />
            </div>
            <div>
              <div className="fin-trust-title">
                78%+ goes to programs
              </div>
              <div className="fin-trust-body">
                Well above the 65% minimum recommended for nonprofits.
              </div>
            </div>
          </div>
          <div className="fin-trust-item">
            <div className="fin-trust-icon">
              <Icon name="check" size={14} color="white" />
            </div>
            <div>
              <div className="fin-trust-title">
                Public financial statements
              </div>
              <div className="fin-trust-body">
                Annual reports available on request. Last updated{' '}
                {data.lastUpdate}.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}