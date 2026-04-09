import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, MapPin, ArrowLeftRight, Users } from 'lucide-react'
import './EventCard.css'

export default function EventCard({ event, onClick }) {
  const available = event.available_stock ?? (event.stock - event.stock_reserved)
  const hasOffer = event.original_price && event.original_price > event.price
  const discount = hasOffer
    ? Math.round((1 - event.price / event.original_price) * 100)
    : null

  const isLow = available > 0 && available <= 5
  const isSoldOut = available <= 0

  return (
    <article
      className={`ecard ${isSoldOut ? 'ecard--soldout' : ''}`}
      onClick={() => !isSoldOut && onClick(event)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && !isSoldOut && onClick(event)}
    >
      {/* Imagen */}
      <div className="ecard__img-wrap">
        {event.image_url
          ? <img src={event.image_url} alt={event.title} className="ecard__img" loading="lazy" />
          : <div className="ecard__img-placeholder">🎵</div>
        }

        {/* Badges */}
        <div className="ecard__badges">
          {hasOffer && !isSoldOut && (
            <span className="ecard__badge ecard__badge--offer">-{discount}%</span>
          )}
          {event.is_round_trip && (
            <span className="ecard__badge ecard__badge--trip">
              <ArrowLeftRight size={10} /> I/V
            </span>
          )}
          {isSoldOut && (
            <span className="ecard__badge ecard__badge--sold">Agotado</span>
          )}
          {isLow && !isSoldOut && (
            <span className="ecard__badge ecard__badge--low">¡Últimos!</span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="ecard__body">
        <h3 className="ecard__title">{event.title}</h3>

        <div className="ecard__meta">
          <span className="ecard__meta-item">
            <Calendar size={13} />
            {format(new Date(event.event_date), "d MMM yyyy", { locale: es })}
          </span>
          {event.pickup_info && (
            <span className="ecard__meta-item">
              <MapPin size={13} />
              {event.pickup_info.split('\n')[0].substring(0, 30)}...
            </span>
          )}
        </div>

        <div className="ecard__footer">
          <div className="ecard__price-wrap">
            {hasOffer && (
              <span className="ecard__price-original">
                ${Number(event.original_price).toLocaleString('es-CL')}
              </span>
            )}
            <span className="ecard__price">
              ${Number(event.price).toLocaleString('es-CL')}
              <span className="ecard__price-currency"> CLP</span>
            </span>
          </div>

          <div className="ecard__stock">
            <Users size={12} />
            {isSoldOut ? 'Sin cupos' : `${available} cupos`}
          </div>
        </div>

        <button className={`ecard__cta ${isSoldOut ? 'ecard__cta--disabled' : ''}`} disabled={isSoldOut}>
          {isSoldOut ? 'Sin disponibilidad' : 'Ver y comprar →'}
        </button>
      </div>
    </article>
  )
}
