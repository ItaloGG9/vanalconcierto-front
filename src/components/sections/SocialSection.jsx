// src/components/sections/SocialSection.jsx
import { useInView } from 'react-intersection-observer'
import './SocialSection.css'

const REVIEWS = [
  {
    name: 'Bayron Díaz',
    avatar: 'BD',
    rating: 5,
    date: 'hace un mes',
    text: 'Maravilloso servicio! Full claridad con todo. Y el chófer Carlos un 10, nos dejó y esperó en la misma puerta del concierto. Recomendadísimo ✨',
    event: 'Google Local Guide'
  },
  {
    name: 'Cecilia Roman Araya',
    avatar: 'CR',
    rating: 5,
    date: 'hace 3 semanas',
    text: 'He viajado a distintos conciertos con Van al Concierto y siempre destacan. Los chóferes muy amables, se detienen en un baño antes y después, música para dormir de regreso y nos dejan lo más cercano a nuestros destinos. 10/10',
    event: 'Varios conciertos'
  },
  {
    name: 'Belen Rojas',
    avatar: 'BR',
    rating: 5,
    date: 'hace 2 meses',
    text: 'Excelente servicio, el chófer Gabriel atento en todo momento, puntual y amable. La Van en excelente estado, bien equipada con TV para ver videos y hasta con cargador para el celular! Recomendados siempre!',
    event: 'Concierto'
  },
  {
    name: 'Berenice Vallejo',
    avatar: 'BV',
    rating: 5,
    date: 'hace un mes',
    text: 'Excelente la gestión y la comunicación con ellos, el chófer muy atento y muy seguro para ir al concierto. Lo recomiendo 100%!!',
    event: 'Concierto'
  },
  {
    name: 'Marjorie Cathalinat',
    avatar: 'MC',
    rating: 5,
    date: 'hace 2 meses',
    text: 'Excelente servicio de esta empresa, amabilidad desde el primer momento, la elección de sus conductores y vehículos excelente, puntualidad, conducción segura. Si quieres ir tranquilo a ver a tu artista favorito esta es tu Van.',
    event: 'Concierto'
  },
  {
    name: 'Paula Rojas',
    avatar: 'PR',
    rating: 5,
    date: 'hace 2 meses',
    text: 'Muy buena experiencia!! La Van es súper cómoda, tuve buen viaje, horarios puntuales y te dejan justo en el recinto. Definitivamente volveré a usar sus servicios en el futuro.',
    event: 'Concierto'
  },
  {
    name: 'Tamara Reinoso Leiva',
    avatar: 'TR',
    rating: 5,
    date: 'hace 2 meses',
    text: 'Me encantó el servicio. Muy contenta con el conductor, la puntualidad y la buena onda. 100% recomendable.',
    event: 'Concierto'
  },
  {
    name: 'Siberiano 21',
    avatar: 'S2',
    rating: 5,
    date: 'hace 2 meses',
    text: 'Hace poco fuimos a un concierto en Movistar Stgo. con esta empresa y la experiencia fué buenísima. Vehículo cómodo y limpio. El conductor Humberto fué muy simpático y cordial. 100% recomendable.',
    event: 'Movistar Arena Santiago'
  },
]

function Stars({ count }) {
  return (
    <div className="review__stars">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ color: i < count ? '#fbbc04' : '#ccc' }}>★</span>
      ))}
    </div>
  )
}

export default function SocialSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section className="social-section" id="resenas" ref={ref}>
      <div className="container">

        {/* ── RESEÑAS ─────────────────────────────────────────────────── */}
        <div className={`social-section__header ${inView ? 'social-section__header--visible' : ''}`}>
          <span className="tag" style={{background:'rgba(251,188,4,0.1)', color:'#fbbc04', border:'1px solid rgba(251,188,4,0.2)'}}>
            ⭐ Reseñas
          </span>
          <h2 className="social-section__title">Lo que dicen nuestros pasajeros</h2>
          <p className="social-section__sub">Más de 500 viajes realizados con 5 estrellas en Google</p>
        </div>

        <div className={`reviews-grid ${inView ? 'reviews-grid--visible' : ''}`}>
          {REVIEWS.map((r, i) => (
            <div
              key={i}
              className="review-card"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="review__top">
                <div className="review__avatar">{r.avatar}</div>
                <div className="review__meta">
                  <div className="review__name">{r.name}</div>
                  <div className="review__date">{r.date}</div>
                </div>
                <div className="review__google">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
              </div>
              <Stars count={r.rating} />
              <p className="review__text">"{r.text}"</p>
              <div className="review__event">🎵 {r.event}</div>
            </div>
          ))}
        </div>

        <div className="reviews-cta">
          <a
            href="https://www.google.com/maps/place/Van+al+Concierto/@-33.1847395,-71.5406625,58212m/data=!3m2!1e3!4b1!4m6!3m5!1s0x2c3711226627bb87:0x9eeb31219ea9d7a!8m2!3d-33.1851354!4d-71.3758556!16s%2Fg%2F11yg_82n70"
            target="_blank"
            rel="noreferrer"
            className="reviews-cta__btn"
          >
            Ver todas las reseñas en Google Maps →
          </a>
        </div>

        {/* ── INSTAGRAM ───────────────────────────────────────────────── */}
        <div className={`instagram-block ${inView ? 'instagram-block--visible' : ''}`}>
          <div className="instagram-block__left">
            <div className="instagram-block__icon">📸</div>
            <div>
              <h3 className="instagram-block__title">Síguenos en Instagram</h3>
              <p className="instagram-block__sub">Fotos de los viajes, sorteos y novedades de próximos eventos</p>
              <a
                href="https://www.instagram.com/vanalconcierto_transporte?igsh=MXJrdW5neTlhaW42YQ=="
                target="_blank"
                rel="noreferrer"
                className="instagram-block__btn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
                @vanalconcierto_transporte
              </a>
            </div>
          </div>
          <div className="instagram-block__preview">
            <div className="ig-preview-grid">
              {['🎸','🚐','🎤','🎵','🎶','🎪'].map((emoji, i) => (
                <a
                  key={i}
                  href="https://www.instagram.com/vanalconcierto_transporte?igsh=MXJrdW5neTlhaW42YQ=="
                  target="_blank"
                  rel="noreferrer"
                  className="ig-preview-item"
                >
                  <span>{emoji}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}