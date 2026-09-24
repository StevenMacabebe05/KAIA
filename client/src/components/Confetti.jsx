import { useEffect, useState } from 'react'

const COLORS = ['#1e40d8', '#f97316', '#16a34a', '#fbbf24', '#2563eb']

export default function Confetti({ trigger }) {
  const [pieces, setPieces] = useState([])

  useEffect(() => {
    if (!trigger) return

    const next = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.4,
      duration: 2 + Math.random() * 1.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotate: Math.random() * 360,
      size: 6 + Math.random() * 8,
    }))

    setPieces(next)
    const timer = setTimeout(() => setPieces([]), 3600)
    return () => clearTimeout(timer)
  }, [trigger])

  if (pieces.length === 0) return null

  return (
    <div className="confetti-layer">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            background: p.color,
            width: p.size,
            height: p.size * 1.6,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  )
}