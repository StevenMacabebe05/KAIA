export default function VerifiedBadge({ verified }) {
  return verified ? (
    <span className="badge badge-verified">✓ Verified</span>
  ) : (
    <span className="badge badge-unverified">Not yet verified</span>
  )
}