import { useState, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { getEvents } from '../services/api'
import Hero from '../components/layout/Hero'
import EventCard from '../components/events/EventCard'
import EventPanel from '../components/events/EventPanel'
import toast from 'react-hot-toast'
import './Home.css'

function HowItWorks() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })
  const steps = [
    { icon: '🎫', num: '01', title: 'Elige tu concierto', desc: 'Explora los eventos disponibles y elige el que más te guste.' },
    { icon: '💳', num: '02', title: 'Reserva tu cupo', desc: 'Paga con Mercado Pago o transferencia bancaria de forma segura.' },
    { icon: '📲', num: '03', title: 'Recibe tu ticket QR', desc: 'Te llega por email o WhatsApp un ticket personalizado con QR.' },
    { icon: '🚐', num: '04', title: '¡Sube a la van!', desc: 'El chofer escanea tu QR y partes al concierto sin complicaciones.' },
  ]

  return (
    <section className="how" id="como-funciona" ref={ref}>
      <div className="container">
        <div className={`how__header ${inView ? 'how__header--visible' : ''}`}>
          <span className="tag" style={{background:'rgba(245,197,24,0.1)', color:'var(--accent)', border:'1px solid rgba(245,197,24,0.2)'}}>
            Proceso simple
          </span>
          <h2 className="how__title">¿Cómo funciona?</h2>
        </div>

        <div className="how__steps">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`how__step ${inView ? 'how__step--visible' : ''}`}
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <div className="how__step-num">{s.num}</div>
              <div className="how__step-icon">{s.icon}</div>
              <h3 className="how__step-title">{s.title}</h3>
              <p className="how__step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ContactSection() {
  return (
    <section className="contact" id="contacto">
      <div className="container">
        <div className="contact__inner">
          <div className="contact__text">
            <h2 className="contact__title">¿Tienes preguntas?</h2>
            <p>Escríbenos y te respondemos a la brevedad.</p>
          </div>
          <div className="contact__links">
            <a
              href="https://wa.me/56948459805"
              target="_blank"
              rel="noreferrer"
              className="contact__btn contact__btn--wa"
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const { ref: eventsRef, inView } = useInView({ triggerOnce: true, threshold: 0.05 })

  useEffect(() => {
    getEvents()
      .then(res => setEvents(res.data))
      .catch(() => toast.error('No se pudieron cargar los eventos'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main>
      <Hero />

      {/* Sección eventos */}
      <section className="events-section" id="eventos" ref={eventsRef}>
        <div className="container">
          <div className={`events-section__header ${inView ? 'events-section__header--visible' : ''}`}>
            <span className="tag" style={{background:'rgba(245,197,24,0.1)', color:'var(--accent)', border:'1px solid rgba(245,197,24,0.2)'}}>
              Próximos viajes
            </span>
            <h2 className="events-section__title">Eventos disponibles</h2>
            <p className="events-section__sub">Todos los viajes incluyen ida y vuelta. Precio por persona.</p>
          </div>

          {loading ? (
            <div className="events-grid">
              {[1,2,3].map(i => (
                <div key={i} className="ecard-skeleton">
                  <div className="skeleton" style={{aspectRatio:'16/9'}} />
                  <div style={{padding:'20px', display:'flex', flexDirection:'column', gap:'12px'}}>
                    <div className="skeleton" style={{height:'26px', width:'70%'}} />
                    <div className="skeleton" style={{height:'14px', width:'50%'}} />
                    <div className="skeleton" style={{height:'14px', width:'40%'}} />
                    <div className="skeleton" style={{height:'40px', marginTop:'8px'}} />
                  </div>
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="events-empty">
              <span>🎵</span>
              <p>No hay eventos disponibles por ahora.<br />¡Vuelve pronto!</p>
            </div>
          ) : (
            <div className="events-grid">
              {events.map((event, i) => (
                <div
                  key={event.id}
                  className={`events-grid__item ${inView ? 'events-grid__item--visible' : ''}`}
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <EventCard event={event} onClick={setSelected} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <HowItWorks />
      <ContactSection />

      {/* Panel lateral */}
      {selected && (
        <EventPanel event={selected} onClose={() => setSelected(null)} />
      )}
    </main>
  )
}
