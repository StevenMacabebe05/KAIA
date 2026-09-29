import { getImpactForNgo } from '../data/impactReports'
import Icon from './Icon'

export default function ImpactTab({ ngoId, ngoName }) {
  const data = getImpactForNgo(ngoId)

  if (!data) {
    return (
      <div className="chart-card">
        <div className="chart-card-header">
          <h3 className="chart-title">Impact report</h3>
        </div>
        <p className="text-muted" style={{ fontSize: 13 }}>
          {ngoName} hasn't published their impact report yet. Check back soon
          or reach out through the Message button above.
        </p>
      </div>
    )
  }

  const maxMeals = Math.max(...data.history.map((h) => h.meals), 1)

  return (
    <div className="impact-tab">
      {/* hero stat panel */}
      <div className="impact-hero">
        <div className="impact-hero-eyebrow">
          <Icon name="trending" size={12} />
          Since {data.since}
        </div>
        <h2 className="impact-hero-title">{data.tagline}</h2>

        <div className="impact-hero-stats">
          {data.thisYear.meals > 0 && (
            <div className="impact-hero-stat">
              <div className="impact-hero-value">
                {data.thisYear.meals.toLocaleString()}
              </div>
              <div className="impact-hero-label">Meals served</div>
            </div>
          )}
          <div className="impact-hero-stat">
            <div className="impact-hero-value">
              {data.thisYear.kits.toLocaleString()}
            </div>
            <div className="impact-hero-label">Kits distributed</div>
          </div>
          <div className="impact-hero-stat">
            <div className="impact-hero-value">
              {data.thisYear.volunteers.toLocaleString()}
            </div>
            <div className="impact-hero-label">Volunteers</div>
          </div>
          <div className="impact-hero-stat">
            <div className="impact-hero-value">
              {data.thisYear.hours.toLocaleString()}
            </div>
            <div className="impact-hero-label">Hours logged</div>
          </div>
        </div>
      </div>

      {/* monthly bars */}
      <div className="chart-card" style={{ marginBottom: 20 }}>
        <div className="chart-card-header">
          <div>
            <h3 className="chart-title">Monthly impact</h3>
            <p className="chart-subtitle">
              {data.thisYear.meals > 0
                ? 'Meals served and kits distributed over the last 6 months'
                : 'Kits distributed over the last 6 months'}
            </p>
          </div>
        </div>

        <div className="impact-bars">
          {data.history.map((h) => (
            <div key={h.month} className="impact-bar-col">
              <div className="impact-bar-value">
                {h.meals > 0 ? h.meals.toLocaleString() : h.kits}
              </div>
              <div className="impact-bar-wrap">
                <div
                  className="impact-bar"
                  style={{
                    height: `${
                      ((h.meals > 0 ? h.meals : h.kits) / maxMeals) * 100
                    }%`,
                  }}
                />
              </div>
              <div className="impact-bar-month">{h.month}</div>
            </div>
          ))}
        </div>
      </div>

      {/* milestones timeline */}
      <div className="chart-card">
        <div className="chart-card-header">
          <div>
            <h3 className="chart-title">Milestones</h3>
            <p className="chart-subtitle">Recent moments from the field</p>
          </div>
        </div>

        <div className="impact-timeline">
          {data.milestones.map((m, i) => (
            <div key={i} className="impact-milestone">
              <div className="impact-milestone-dot-wrap">
                <span className="impact-milestone-dot" />
                {i < data.milestones.length - 1 && (
                  <span className="impact-milestone-line" />
                )}
              </div>
              <div className="impact-milestone-content">
                {m.image && (
                  <img
                    src={m.image}
                    alt=""
                    className="impact-milestone-image"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                )}
                <div className="impact-milestone-date">
                  {new Date(m.date).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
                <div className="impact-milestone-title">{m.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}