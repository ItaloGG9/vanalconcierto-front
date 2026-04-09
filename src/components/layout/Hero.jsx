import { useEffect, useRef } from 'react'
import { ArrowDown } from 'lucide-react'
import './Hero.css'

export default function Hero() {
  const titleRef = useRef(null)

  useEffect(() => {
    const el = titleRef.current
    if (!el) return
    el.style.opacity = '0'
    el.style.transform = 'translateY(40px)'
    setTimeout(() => {
      el.style.transition = 'opacity 0.9s ease, transform 0.9s ease'
      el.style.opacity = '1'
      el.style.transform = 'translateY(0)'
    }, 100)
  }, [])

  return (
    <section className="hero">
      {/* Fondo con ruido y gradiente */}
      <div className="hero__bg">
        <div className="hero__gradient" />
        <div className="hero__noise" />
        <div className="hero__grid" />
      </div>

      {/* Partículas decorativas */}
      <div className="hero__orb hero__orb--1" />
      <div className="hero__orb hero__orb--2" />

      <div className="container hero__content" ref={titleRef}>
        <div className="hero__tag tag">🎵 Transporte a conciertos</div>

        <h1 className="hero__title">
          TU VAN<br />
          AL <span className="hero__title-accent">CONCIERTO</span><br />
          MÁS CERCANO
        </h1>

        <p className="hero__subtitle">
          Viaja cómodo, llega a tiempo y vuelve sin preocupaciones.<br />
          Ida y vuelta desde tu ciudad.
        </p>

        <div className="hero__actions">
          <a href="#eventos" className="hero__btn hero__btn--primary">
            Ver próximos eventos
          </a>
          <a href="#como-funciona" className="hero__btn hero__btn--ghost">
            ¿Cómo funciona?
          </a>
        </div>

        <div className="hero__stats">
          <div className="hero__stat">
            <span className="hero__stat-num">500+</span>
            <span className="hero__stat-label">Pasajeros</span>
          </div>
          <div className="hero__stat-divider" />
          <div className="hero__stat">
            <span className="hero__stat-num">50+</span>
            <span className="hero__stat-label">Conciertos</span>
          </div>
          <div className="hero__stat-divider" />
          <div className="hero__stat">
            <span className="hero__stat-num">100%</span>
            <span className="hero__stat-label">Seguro</span>
          </div>
        </div>
      </div>

      <a href="#eventos" className="hero__scroll-hint" aria-label="Scroll">
        <ArrowDown size={18} />
      </a>
    </section>
  )
}
