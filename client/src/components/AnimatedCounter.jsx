import { useEffect, useRef, useState } from 'react'

export default function AnimatedCounter({
  value,
  duration = 900,
  prefix = '',
  suffix = '',
  decimals = 0,
}) {
  const [display, setDisplay] = useState(0)
  const startRef = useRef(null)
  const fromRef = useRef(0)

  useEffect(() => {
    fromRef.current = display
    startRef.current = null
    let raf

    function tick(t) {
      if (startRef.current === null) startRef.current = t
      const elapsed = t - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const next = fromRef.current + (value - fromRef.current) * eased
      setDisplay(next)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration])

  const formatted = display.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}