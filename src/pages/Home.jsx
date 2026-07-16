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
    { icon: '📲', num: '03', title: 'Recibe tu ticket QR', desc: 'Te llega por email un ticket personalizado con QR.' },
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
            <div key={i} className={`how__step ${inView ? 'how__step--visible' : ''}`} style={{ animationDelay: `${i * 0.12}s` }}>
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
            <a href="https://wa.me/56954084889" target="_blank" rel="noreferrer" className="contact__btn contact__btn--wa">
              💬 WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

const GENRES = [
  { id: 'all',         label: '🎵 Todos' },
  { id: 'reggaeton',   label: '🔥 Reggaetón' },
  { id: 'rock',        label: '🎸 Rock' },
  { id: 'pop',         label: '🎤 Pop' },
  { id: 'electronica', label: '🎧 Electrónica' },
  { id: 'cumbia',      label: '🪗 Cumbia' },
  { id: 'hip-hop',     label: '🎙️ Hip-Hop' },
  { id: 'latin',       label: '💃 Latin' },
  { id: 'otro',        label: '🎼 Otro' },
]

export default function Home() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [activeGenre, setActiveGenre] = useState('all')
  const [search, setSearch] = useState('')
  const { ref: eventsRef, inView } = useInView({ triggerOnce: true, threshold: 0.05 })

  useEffect(() => {
    getEvents()
      .then(res => setEvents(res.data))
      .catch(() => toast.error('No se pudieron cargar los eventos'))
      .finally(() => setLoading(false))
  }, [])

  const filteredEvents = events
    .filter(e => activeGenre === 'all' || e.genre === activeGenre)
    .filter(e => !search || e.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))

  return (
    <main>
      <Hero />

      <section className="events-section" id="eventos" ref={eventsRef}>
        <div className="container">
          <div className={`events-section__header ${inView ? 'events-section__header--visible' : ''}`}>
            <span className="tag" style={{background:'rgba(245,197,24,0.1)', color:'var(--accent)', border:'1px solid rgba(245,197,24,0.2)'}}>
              Próximos viajes
            </span>
            <h2 className="events-section__title">Eventos disponibles</h2>
            <p className="events-section__sub">Todos los viajes incluyen ida y vuelta. Precio por persona.</p>
          </div>

          {/* Barra de búsqueda */}
          <div className="events-search">
            <span className="events-search__icon">🔍</span>
            <input
              type="text"
              className="events-search__input"
              placeholder="Buscar evento..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="events-search__clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>

          {/* Filtros de género */}
          <div className="events-genres">
            {GENRES.map(g => (
              <button
                key={g.id}
                className={`events-genre-btn ${activeGenre === g.id ? 'events-genre-btn--active' : ''}`}
                onClick={() => setActiveGenre(g.id)}
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="events-scroll-container">
              {[1,2,3,4].map(i => (
                <div key={i} className="ecard-skeleton">
                  <div className="skeleton" style={{aspectRatio:'16/9'}} />
                  <div style={{padding:'20px', display:'flex', flexDirection:'column', gap:'12px'}}>
                    <div className="skeleton" style={{height:'26px', width:'70%'}} />
                    <div className="skeleton" style={{height:'14px', width:'50%'}} />
                    <div className="skeleton" style={{height:'40px', marginTop:'8px'}} />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="events-empty">
              <span>🎵</span>
              <p>
                {search ? `No se encontraron eventos para "${search}"`
                  : activeGenre !== 'all' ? 'No hay eventos para este género'
                  : 'No hay eventos disponibles por ahora.'}
                <br />¡Vuelve pronto!
              </p>
            </div>
          ) : (
            /* Grid 4 columnas con scroll interno vertical */
            <div className="events-scroll-container">
              {filteredEvents.map((event, i) => (
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

      {selected && (
        <EventPanel event={selected} onClose={() => setSelected(null)} />
      )}
    </main>
  )
}