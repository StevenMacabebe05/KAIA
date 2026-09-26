import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useActivity } from '../store/useActivity'
import { OPPORTUNITIES } from '../data/opportunities'
import { NGOS } from '../data/ngos'
import Confetti from '../components/Confetti'
import Icon from '../components/Icon'

export default function ScanCheckIn() {
  const { user } = useAuth()
  const store = useActivity()

  const scannerInstanceRef = useRef(null)

  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [confettiKey, setConfettiKey] = useState(0)
  const [manualCode, setManualCode] = useState('')

  useEffect(() => {
    return () => {
      if (scannerInstanceRef.current) {
        scannerInstanceRef.current.clear().catch(() => {})
      }
    }
  }, [])

  async function startScanner() {
    setError('')
    setResult(null)

    try {
      const { Html5Qrcode } = await import('html5-qrcode')

      const scanner = new Html5Qrcode('kaia-qr-reader')
      scannerInstanceRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 240, height: 240 },
        },
        (decodedText) => {
          handleScan(decodedText)
          scanner.stop().catch(() => {})
          setScanning(false)
        },
        () => {
          /* per-frame error — silent */
        }
      )
      setScanning(true)
    } catch {
      setError(
        'Could not start the camera. Make sure you allowed camera access in your browser.'
      )
      setScanning(false)
    }
  }

  function stopScanner() {
    if (scannerInstanceRef.current) {
      scannerInstanceRef.current.stop().catch(() => {})
      scannerInstanceRef.current.clear().catch(() => {})
      scannerInstanceRef.current = null
    }
    setScanning(false)
  }

  function handleScan(text) {
    let code = text
    try {
      const url = new URL(text)
      code = url.searchParams.get('code') || text
    } catch {
      /* not a URL, assume raw code */
    }
    checkInCode(code)
  }

  function checkInCode(code) {
    const volunteerId = store.getVolunteerIdByCode(code.trim().toUpperCase())
    if (!volunteerId) {
      setError('QR code not recognized. It may belong to another event.')
      setResult(null)
      return
    }

    const opportunity = [
      ...OPPORTUNITIES,
      ...store.getExtraOpportunities(),
    ].find((o) => o.id === volunteerId.opportunityId)

    if (!opportunity) {
      setError('This volunteer ID is not linked to an active event.')
      return
    }

    if (user.role === 'ngo_rep' && user.ngoId !== opportunity.ngoId) {
      setError('This volunteer is registered for a different NGO event.')
      return
    }

    const res = store.checkIn(code, user.ngoId)
    if (!res.ok) {
      if (res.reason === 'already_checked_in') {
        setError('This volunteer is already checked in.')
      } else {
        setError('Could not check in — code not found.')
      }
      return
    }

    const ngo = NGOS.find((n) => n.id === opportunity.ngoId)

    store.addNotification(volunteerId.userId, {
      type: 'signup',
      title: 'Checked in!',
      body: `You attended "${opportunity.title}" on ${opportunity.date}.`,
      link: '/my-kaia',
    })

    setConfettiKey(Date.now())
    setResult({
      code,
      opportunity,
      ngo,
      volunteerId,
      checkedInAt: res.checkin.checkedInAt,
    })
    setError('')
  }

  function handleManualSubmit(e) {
    e.preventDefault()
    if (!manualCode.trim()) return
    checkInCode(manualCode.trim().toUpperCase())
    setManualCode('')
  }

  if (!user || user.role !== 'ngo_rep') {
    return (
      <div className="container">
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <Icon name="shield" size={32} color="var(--ink-300)" />
          <h2 style={{ marginTop: 12 }}>NGO Representatives only</h2>
          <p className="text-muted">
            You must be logged in as an NGO rep to scan volunteer QR codes.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <Confetti trigger={confettiKey} />

      <div className="page-header">
        <h1 className="page-title">Scan volunteer check-in</h1>
        <p className="page-subtitle">
          Point the camera at a volunteer's QR ID. Attendance is recorded
          automatically.
        </p>
      </div>

      <div
        className="grid"
        style={{ gridTemplateColumns: '1.2fr 1fr', gap: 24 }}
      >
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">Camera scanner</h3>
              <p className="chart-subtitle">
                {scanning ? 'Scanning…' : 'Camera off'}
              </p>
            </div>
            {scanning ? (
              <button className="btn btn-neutral btn-sm" onClick={stopScanner}>
                Stop
              </button>
            ) : (
              <button
                className="btn btn-primary btn-sm"
                onClick={startScanner}
              >
                <Icon name="search" size={14} /> Start camera
              </button>
            )}
          </div>

          <div id="kaia-qr-reader" className="qr-reader" />

          {error && (
            <div className="scan-error">
              <Icon name="shield" size={14} /> {error}
            </div>
          )}

          <div className="manual-entry">
            <label>Or enter the code manually</label>
            <form
              onSubmit={handleManualSubmit}
              style={{ display: 'flex', gap: 8 }}
            >
              <input
                className="input"
                placeholder="KAIA-VOL-XXXXXXXX"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!manualCode.trim()}
              >
                Check in
              </button>
            </form>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-title">Last check-in</h3>
          </div>

          {!result ? (
            <div className="text-muted" style={{ fontSize: 13 }}>
              Scan a volunteer's QR code to see their details here.
            </div>
          ) : (
            <div>
              <div className="scan-result-icon">
                <Icon name="check-circle" size={36} color="#16a34a" />
              </div>

              <div
                style={{
                  fontWeight: 800,
                  fontSize: 20,
                  textAlign: 'center',
                  marginBottom: 4,
                }}
              >
                Checked in
              </div>
              <div
                className="text-muted text-center"
                style={{ fontSize: 13, marginBottom: 20 }}
              >
                {new Date(result.checkedInAt).toLocaleTimeString()}
              </div>

              <div className="receipt-row">
                <span>Volunteer ID</span>
                <strong className="receipt-ref">{result.code}</strong>
              </div>
              <div className="receipt-row">
                <span>Event</span>
                <strong>{result.opportunity.title}</strong>
              </div>
              <div className="receipt-row">
                <span>NGO</span>
                <strong>{result.ngo?.name}</strong>
              </div>
              <div className="receipt-row">
                <span>Location</span>
                <strong>{result.opportunity.location}</strong>
              </div>

              <Link
                to="/dashboard"
                className="btn btn-primary btn-block"
                style={{ marginTop: 20 }}
              >
                View attendance
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}