import { useState } from 'react'
import VerificationExplainer from './VerificationExplainer'

export default function VerifiedBadge({ verified }) {
  const [open, setOpen] = useState(false)

  if (!verified) {
    return <span className="badge badge-unverified">Not yet verified</span>
  }

  return (
    <>
      <button
        type="button"
        className="badge badge-verified badge-clickable"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen(true)
        }}
        title="What does this mean?"
      >
        ✓ Verified
      </button>
      {open && <VerificationExplainer onClose={() => setOpen(false)} />}
    </>
  )
}