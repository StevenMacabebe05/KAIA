import Icon from './Icon'

const TESTIMONIALS = [
  {
    name: 'Andrea Cruz',
    role: 'College student · Quezon City',
    avatar: 'AC',
    color: '#1e40d8',
    quote:
      "I'd been wanting to volunteer for years but never knew where to start. KAIA showed me opportunities near me — I signed up in under 2 minutes.",
    tag: 'Volunteer since 2025',
  },
  {
    name: 'Miguel Reyes',
    role: 'Working professional · Makati',
    avatar: 'MR',
    color: '#f97316',
    quote:
      "I donate to 3 NGOs now, all through one app. The progress bars make it feel real — I know exactly where my money goes.",
    tag: 'Monthly donor',
  },
  {
    name: 'Sofia Tan',
    role: 'NGO coordinator · PAWS',
    avatar: 'ST',
    color: '#16a34a',
    quote:
      "Our volunteer sign-ups tripled in one month. The QR check-in system alone saved us hours of paperwork per event.",
    tag: 'Verified NGO partner',
  },
  {
    name: 'Jose Reyes',
    role: 'Community organizer · Pasig',
    avatar: 'JR',
    color: '#2563eb',
    quote:
      'The verification badge is why I trust this platform. I know every organization I see has been checked.',
    tag: 'Supporter since launch',
  },
]

export default function Testimonials() {
  return (
    <section className="testimonials-section">
      <div className="testimonials-header">
        <div className="testimonials-eyebrow">
          <Icon name="heart" size={12} /> Community
        </div>
        <h2 className="testimonials-title">
          What people are saying
        </h2>
        <p className="testimonials-subtitle">
          From volunteers to NGO partners — see how KAIA is being used.
        </p>
      </div>

      <div className="testimonials-grid">
        {TESTIMONIALS.map((t, i) => (
          <div key={i} className="testimonial-card">
            <div className="testimonial-quote-mark">"</div>
            <p className="testimonial-quote">{t.quote}</p>
            <div className="testimonial-footer">
              <div
                className="testimonial-avatar"
                style={{ background: t.color }}
              >
                {t.avatar}
              </div>
              <div className="testimonial-info">
                <div className="testimonial-name">{t.name}</div>
                <div className="testimonial-role">{t.role}</div>
              </div>
            </div>
            <div className="testimonial-tag">{t.tag}</div>
          </div>
        ))}
      </div>
    </section>
  )
}