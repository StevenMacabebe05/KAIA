import { useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { toPng, toJpeg } from 'html-to-image'
import Icon from './Icon'

export default function VolunteerTicket({ volunteerId, opportunity, onClose }) {
  const ticketRef = useRef(null)
  const [downloading, setDownloading] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  if (!volunteerId || !opportunity) return null

  const qrValue = `${window.location.origin}/scan?code=${volunteerId.code}`

  async function download(format) {
    if (!ticketRef.current) return
    setDownloading(true)
    try {
      const node = ticketRef.current
      const options = {
        backgroundColor: '#ffffff',
        pixelRatio: 3,
        cacheBust: true,
        skipFonts: false,
      }
      const dataUrl =
        format === 'jpg'
          ? await toJpeg(node, { ...options, quality: 0.95 })
          : await toPng(node, options)

      const link = document.createElement('a')
      link.download = `kaia-volunteer-ticket-${volunteerId.code}.${format}`
      link.href = dataUrl
      link.click()

      setDownloaded(true)
      setTimeout(() => setDownloaded(false), 2000)
    } catch (err) {
      console.error(err)
      alert('Could not generate image. Try again or take a screenshot.')
    } finally {
      setDownloading(false)
    }
  }

  async function handleShare() {
    const text = `My KAIA volunteer ticket: ${volunteerId.code} for ${opportunity.title}`
    const url = window.location.origin + `/scan?code=${volunteerId.code}`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'KAIA Volunteer Ticket', text, url })
      } catch {
        // user cancelled
      }
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`)
      alert('Ticket link copied to clipboard')
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="ticket-modal-wrapper" onClick={(e) => e.stopPropagation()}>
        {/* ticket itself — this is what gets downloaded */}
        <div ref={ticketRef} className="volunteer-ticket">
          <div className="vt-header">
            <img
              src="/images/kaia-logo.png"
              alt="KAIA"
              style={{ height: 32, width: 'auto' }}
              crossOrigin="anonymous"
            />
            <div className="vt-badge">
              <Icon name="check-circle" size={12} color="#15803d" />
              <span>Confirmed</span>
            </div>
          </div>

          <div className="vt-label">VOLUNTEER ID</div>
          <div className="vt-code">{volunteerId.code}</div>

          <div className="vt-qr">
            <QRCodeSVG
              value={qrValue}
              size={196}
              bgColor="#ffffff"
              fgColor="#1e40d8"
              level="M"
              includeMargin={false}
            />
          </div>

          <div className="vt-divider" />

          <div className="vt-event">
            <div className="vt-event-label">Event</div>
            <div className="vt-event-title">{opportunity.title}</div>
            <div className="vt-event-meta">
              <span className="row" style={{ gap: 4 }}>
                <Icon name="map-pin" size={12} /> {opportunity.location}
              </span>
              <span className="row" style={{ gap: 4 }}>
                <Icon name="calendar" size={12} /> {opportunity.date}
              </span>
            </div>
          </div>

          <div className="vt-footer">
            <div className="vt-footer-line">
              Present this QR code at the event. The organizer will scan it to
              check you in.
            </div>
            <div className="vt-footer-brand">
              kaia.ph · For Causes That Matter
            </div>
          </div>
        </div>

        {/* actions (not downloaded) */}
        <div className="ticket-actions-bar">
          <div className="ticket-action-row">
            <button
              className="btn btn-neutral"
              onClick={() => download('png')}
              disabled={downloading}
            >
              <Icon name="plus" size={14} />
              {downloading ? 'Generating…' : downloaded ? 'Saved!' : 'PNG'}
            </button>
            <button
              className="btn btn-neutral"
              onClick={() => download('jpg')}
              disabled={downloading}
            >
              <Icon name="plus" size={14} /> JPG
            </button>
            <button className="btn btn-neutral" onClick={handleShare}>
              <Icon name="trending" size={14} /> Share
            </button>
          </div>
          <button
            className="btn btn-primary btn-block btn-lg"
            onClick={onClose}
            style={{ marginTop: 10 }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}