import { useEffect, useState } from 'react'
import Icon from './Icon'

export default function HeroCarousel({ slides = [], interval = 5000 }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || slides.length <= 1) return
    const timer = setTimeout(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, interval)
    return () => clearTimeout(timer)
  }, [index, paused, slides.length, interval])

  function go(n) {
    setIndex((n + slides.length) % slides.length)
  }

  if (!slides.length) return null

  return (
    <div
      className="hero-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`hero-slide ${i === index ? 'active' : ''}`}
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <div className="hero-slide-overlay" />
        </div>
      ))}

      {/* dots */}
      <div className="hero-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`hero-dot ${i === index ? 'active' : ''}`}
            onClick={() => setIndex(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* arrows */}
      {slides.length > 1 && (
        <>
          <button
            className="hero-arrow hero-arrow-left"
            onClick={() => go(index - 1)}
            aria-label="Previous"
          >
            <span style={{ transform: 'rotate(180deg)', display: 'inline-block' }}>
              <Icon name="chevron-right" size={20} color="white" />
            </span>
          </button>
          <button
            className="hero-arrow hero-arrow-right"
            onClick={() => go(index + 1)}
            aria-label="Next"
          >
            <Icon name="chevron-right" size={20} color="white" />
          </button>
        </>
      )}
    </div>
  )
}