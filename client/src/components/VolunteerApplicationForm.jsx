import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Icon from './Icon'

export default function VolunteerApplicationForm({
  opportunity,
  ngo,
  onClose,
  onSubmit,
}) {
  const { user } = useAuth()

  const [form, setForm] = useState({
    name: user?.name || '',
    age: '',
    email: user?.email || '',
    phone: '',
    address: '',
    emergencyName: '',
    emergencyPhone: '',
    skills: '',
    availability: [],
    agree: false,
  })
  const [errors, setErrors] = useState({})

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function toggleAvailability(slot) {
    setForm((f) => ({
      ...f,
      availability: f.availability.includes(slot)
        ? f.availability.filter((s) => s !== slot)
        : [...f.availability, slot],
    }))
    if (errors.availability)
      setErrors((e) => ({ ...e, availability: undefined }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.age || Number(form.age) < 15)
      e.age = 'Must be at least 15 years old'
    if (Number(form.age) > 100) e.age = 'Enter a valid age'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      e.email = 'Enter a valid email address'
    if (!form.phone.trim()) e.phone = 'Contact number is required'
    if (!form.address.trim()) e.address = 'Address is required'
    if (!form.emergencyName.trim())
      e.emergencyName = 'Emergency contact name required'
    if (!form.emergencyPhone.trim())
      e.emergencyPhone = 'Emergency contact number required'
    if (form.availability.length === 0)
      e.availability = 'Select at least one availability slot'
    if (!form.agree) e.agree = 'You must agree to the terms'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    onSubmit(form)
  }

  const SLOTS = [
    'Weekday mornings',
    'Weekday afternoons',
    'Weekday evenings',
    'Weekend mornings',
    'Weekend afternoons',
    'Weekend evenings',
  ]

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal application-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="application-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="application-eyebrow">
              Step 2 of 2 · Application
            </div>
            <h2 className="application-title">{opportunity.title}</h2>
            <div className="application-subtitle">
              {ngo?.name} · {opportunity.location} · {opportunity.date}
            </div>
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

        <form onSubmit={handleSubmit} className="application-form">
          {/* -------- Personal details -------- */}
          <div className="application-section">
            <div className="application-section-title">Your details</div>

            <div className="field">
              <label>Full name *</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Juan Dela Cruz"
              />
              {errors.name && <div className="field-error">{errors.name}</div>}
            </div>

            <div className="field-row">
              <div className="field">
                <label>Age *</label>
                <input
                  className="input"
                  type="number"
                  min="15"
                  max="100"
                  value={form.age}
                  onChange={(e) => update('age', e.target.value)}
                  placeholder="18"
                />
                {errors.age && <div className="field-error">{errors.age}</div>}
              </div>

              <div className="field">
                <label>Contact number *</label>
                <input
                  className="input"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  placeholder="+63 9XX XXX XXXX"
                />
                {errors.phone && (
                  <div className="field-error">{errors.phone}</div>
                )}
              </div>
            </div>

            <div className="field">
              <label>Email address *</label>
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="you@example.com"
              />
              {errors.email && <div className="field-error">{errors.email}</div>}
            </div>

            <div className="field">
              <label>Home address *</label>
              <input
                className="input"
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
                placeholder="Barangay, City"
              />
              {errors.address && (
                <div className="field-error">{errors.address}</div>
              )}
            </div>
          </div>

          {/* -------- Emergency contact -------- */}
          <div className="application-section">
            <div className="application-section-title">
              Emergency contact
            </div>
            <div className="field-row">
              <div className="field">
                <label>Name *</label>
                <input
                  className="input"
                  value={form.emergencyName}
                  onChange={(e) => update('emergencyName', e.target.value)}
                  placeholder="Maria Dela Cruz"
                />
                {errors.emergencyName && (
                  <div className="field-error">{errors.emergencyName}</div>
                )}
              </div>
              <div className="field">
                <label>Number *</label>
                <input
                  className="input"
                  value={form.emergencyPhone}
                  onChange={(e) => update('emergencyPhone', e.target.value)}
                  placeholder="+63 9XX XXX XXXX"
                />
                {errors.emergencyPhone && (
                  <div className="field-error">{errors.emergencyPhone}</div>
                )}
              </div>
            </div>
          </div>

          {/* -------- Availability -------- */}
          <div className="application-section">
            <div className="application-section-title">
              Availability & skills
            </div>

            <div className="field">
              <label>When are you available? *</label>
              <div className="availability-grid">
                {SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`availability-chip ${
                      form.availability.includes(slot) ? 'is-active' : ''
                    }`}
                    onClick={() => toggleAvailability(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              {errors.availability && (
                <div className="field-error">{errors.availability}</div>
              )}
            </div>

            <div className="field">
              <label>Skills you can contribute (optional)</label>
              <input
                className="input"
                value={form.skills}
                onChange={(e) => update('skills', e.target.value)}
                placeholder="e.g., teaching, first aid, photography"
              />
            </div>
          </div>

          {/* -------- Agreement -------- */}
          <div className="application-section">
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={form.agree}
                onChange={(e) => update('agree', e.target.checked)}
              />
              <span>
                I confirm the information provided is accurate and I agree to
                KAIA's volunteer code of conduct. This is a prototype demo —
                no real commitment is being made.
              </span>
            </label>
            {errors.agree && <div className="field-error">{errors.agree}</div>}
          </div>

          <div className="application-actions">
            <button
              type="button"
              className="btn btn-neutral"
              onClick={onClose}
            >
              Back
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ flex: 1 }}
            >
              Submit & get QR ID
              <Icon name="arrow-right" size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}