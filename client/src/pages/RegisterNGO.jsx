import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CATEGORIES } from '../data/categories'
import { useAuth } from '../context/AuthContext'
import Icon from '../components/Icon'

export default function RegisterNGO() {
  const { updateUser } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '', description: '', type: 'Non-profit',
    address: '', contact: '', categories: [],
  })

  function toggleCategory(c) {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(c)
        ? f.categories.filter((x) => x !== c)
        : [...f.categories, c],
    }))
  }

  function handleSubmit() {
    updateUser({ role: 'ngo_rep', ngoId: 'ngo-1', isDemo: true })
    setStep(4)
  }

  if (step === 4) {
    return (
      <div className="container" style={{ maxWidth: 560 }}>
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--blue-50)', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
            <Icon name="check" size={28} color="var(--blue-700)" />
          </div>
          <h1 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 800 }}>Application submitted</h1>
          <p className="text-muted" style={{ marginBottom: 24 }}>
            Your NGO registration is pending admin review. In production, you'd receive
            a verified badge after approval.
          </p>
          <div className="auth-hint" style={{ textAlign: 'left' }}>
            <strong>Demo note:</strong> this prototype links you to Bahay Kalinga
            Foundation so you can explore the NGO dashboard.
          </div>
          <button
            className="btn btn-primary btn-lg btn-block"
            onClick={() => navigate('/dashboard')}
          >
            Go to NGO Dashboard
            <Icon name="arrow-right" size={16} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ maxWidth: 640 }}>
      <div className="page-header">
        <h1 className="page-title">Register an NGO</h1>
        <p className="page-subtitle">Step {step} of 3</p>
      </div>

      <div className="card" style={{ padding: 32 }}>
        {step === 1 && (
          <>
            <div className="field">
              <label>Organization name</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="field">
              <label>Description</label>
              <textarea className="input" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="field">
              <label>Organization type</label>
              <input className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
            </div>
            <div className="field">
              <label>Address</label>
              <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="field">
              <label>Contact email</label>
              <input className="input" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
            </div>
            <div className="field">
              <label>Cause categories</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`pill ${form.categories.includes(c) ? 'is-active' : ''}`}
                    onClick={() => toggleCategory(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <button
              className="btn btn-primary btn-block btn-lg"
              onClick={() => setStep(2)}
              disabled={!form.name || form.categories.length === 0}
            >
              Continue
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="field">
              <label>Upload registration documents</label>
              <input type="file" className="input" />
              <p className="text-muted" style={{ marginTop: 6, fontSize: 12 }}>
                File uploads are simulated in this prototype.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setStep(1)}>Back</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setStep(3)}>Continue</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <p style={{ fontSize: 14, marginBottom: 16 }}>
              Review your submission and click Submit.
            </p>
            <div className="card" style={{ background: 'var(--blue-50)', border: '1px solid var(--blue-100)' }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{form.name}</div>
              <div className="text-muted" style={{ fontSize: 13 }}>{form.categories.join(' · ')}</div>
              <div className="text-muted" style={{ fontSize: 13, marginTop: 6 }}>{form.address}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setStep(2)}>Back</button>
              <button className="btn btn-accent" style={{ flex: 1 }} onClick={handleSubmit}>Submit</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}