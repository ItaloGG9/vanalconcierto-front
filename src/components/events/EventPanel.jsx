import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { X, Calendar, MapPin, ArrowLeftRight, Minus, Plus, CreditCard, Building2 } from 'lucide-react'
import { createMPBooking, createTransferBooking } from '../../services/api'
import PassengerForm from '../PassengerForm'  // ← NUEVO: Importar PassengerForm
import toast from 'react-hot-toast'
import './EventPanel.css'

export default function EventPanel({ event, onClose }) {
  const [qty, setQty] = useState(1)
  const [method, setMethod] = useState(null) // 'mercadopago' | 'transfer'
  const [step, setStep] = useState('info') // 'info' | 'form' | 'success'
  const [loading, setLoading] = useState(false)
  const [notif] = useState('email')
  const [transferResult, setTransferResult] = useState(null)

  // ← NUEVO: Estado para pasajeros
  const [passengers, setPassengers] = useState([])

  const [form, setForm] = useState({ name: '', email: '', phone: '' })

  const available = event.available_capacity
  const hasOffer = event.original_price && event.original_price > event.price
  const discount = hasOffer ? Math.round((1 - event.price / event.original_price) * 100) : null
  const total = Number(event.price) * qty

  // ← NUEVO: Handler para cuando cambian los pasajeros
  const handlePassengersChange = (passengersData) => {
    setPassengers(passengersData)
  }

  const handleSubmit = async () => {
    // ← NUEVO: Validar pasajeros en vez de form simple
    const allValid = passengers.every(p => 
      p.full_name && 
      p.email && 
      p.phone &&
      (p.trip_type === 'return_only' || p.pickup_point) &&
      (p.trip_type === 'outbound_only' || p.return_point)
    )
    
    if (!allValid) {
      toast.error('Por favor completa todos los campos de los pasajeros')
      return
    }

    setLoading(true)
    try {
      // ← NUEVO: Payload con sistema de pasajeros
      const payload = {
        event_id: event.id,
        passengers: passengers,  // ← Enviar array de pasajeros
        payment_method: method,
        notification_method: notif
      }

      if (method === 'mercadopago') {
        const res = await createMPBooking(payload)
        window.location.href = res.data.init_point
      } else {
        const res = await createTransferBooking(payload)
        setTransferResult(res.data)
        setStep('success')
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al procesar el pago')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="epanel-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="epanel">
        <button className="epanel__close" onClick={onClose} aria-label="Cerrar">
          <X size={20} />
        </button>

        {step === 'info' && (
          <>
            {/* Imagen */}
            <div className="epanel__img-wrap">
              {event.image_url
                ? <img src={event.image_url} alt={event.title} />
                : <div className="epanel__img-placeholder">🎵</div>
              }
              {hasOffer && (
                <div className="epanel__discount-badge">-{discount}% OFERTA</div>
              )}
            </div>

            {/* Contenido */}
            <div className="epanel__body">
              <h2 className="epanel__title">{event.title}</h2>

              <div className="epanel__meta">
                <div className="epanel__meta-item">
                  <Calendar size={15} />
                  {format(new Date(event.event_date), "EEEE d 'de' MMMM, yyyy — HH:mm", { locale: es })}
                </div>
                {event.is_round_trip && (
                  <div className="epanel__meta-item epanel__meta-item--accent">
                    <ArrowLeftRight size={15} />
                    Incluye ida y vuelta
                  </div>
                )}
              </div>

              {/* Precio */}
              <div className="epanel__price-block">
                {hasOffer && (
                  <span className="epanel__price-old">
                    ${Number(event.original_price).toLocaleString('es-CL')}
                  </span>
                )}
                <div className="epanel__price-main">
                  <span className="epanel__price-num">
                    ${Number(event.price).toLocaleString('es-CL')}
                  </span>
                  <span className="epanel__price-label">CLP por persona</span>
                </div>
              </div>

              {/* Selector cantidad */}
              <div className="epanel__qty">
                <span className="epanel__qty-label">Cantidad</span>
                <div className="epanel__qty-ctrl">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}>
                    <Minus size={14} />
                  </button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(q => Math.min(available, q + 1))} disabled={qty >= available}>
                    <Plus size={14} />
                  </button>
                </div>
                <span className="epanel__qty-total">
                  Total: <strong>${total.toLocaleString('es-CL')} CLP</strong>
                </span>
              </div>

              {/* Puntos de recogida */}
              {event.pickup_info && (
                <div className="epanel__pickup">
                  <div className="epanel__pickup-title">
                    <MapPin size={14} /> Puntos de recogida
                  </div>
                  <p className="epanel__pickup-text">{event.pickup_info}</p>
                </div>
              )}

              {/* Descripción */}
              {event.description && (
                <p className="epanel__desc">{event.description}</p>
              )}

              {/* Método de pago */}
              <div className="epanel__section-title">Método de pago</div>
              <div className="epanel__methods">
                <button
                  className={`epanel__method ${method === 'mercadopago' ? 'epanel__method--active' : ''}`}
                  onClick={() => setMethod('mercadopago')}
                >
                  <CreditCard size={18} />
                  <div>
                    <div className="epanel__method-name">Mercado Pago</div>
                    <div className="epanel__method-desc">Tarjeta, débito o saldo MP</div>
                  </div>
                </button>
                <button
                  className={`epanel__method ${method === 'transfer' ? 'epanel__method--active' : ''}`}
                  onClick={() => setMethod('transfer')}
                >
                  <Building2 size={18} />
                  <div>
                    <div className="epanel__method-name">Transferencia bancaria</div>
                    <div className="epanel__method-desc">Reserva por 24 horas</div>
                  </div>
                </button>
              </div>

              <button
                className="epanel__next-btn"
                disabled={!method}
                onClick={() => setStep('form')}
              >
                Continuar →
              </button>
            </div>
          </>
        )}

        {step === 'form' && (
          <div className="epanel__body">
            <button className="epanel__back" onClick={() => setStep('info')}>← Volver</button>
            <h2 className="epanel__title">Datos de pasajeros</h2>
            <p className="epanel__subdesc">
              {event.title} · {qty} {qty === 1 ? 'cupo' : 'cupos'} · ${total.toLocaleString('es-CL')} CLP
            </p>

            {/* ← NUEVO: Formulario de pasajeros */}
            <PassengerForm 
              quantity={qty}
              onPassengersChange={handlePassengersChange}
            />

            {/* ← NUEVO: Método de notificación movido aquí */}
            <div className="epanel__notif" style={{ marginTop: '24px' }}>
              <div className="epanel__section-title">¿Cómo quieres recibir tus tickets?</div>
              <div className="epanel__notif-opts">
                <button
                  className={`epanel__notif-opt ${notif === 'email' ? 'epanel__notif-opt--active' : ''}`}
                  onClick={() => setNotif('email')}
                >📧 Email</button>
              </div>
            </div>

            <button
              className="epanel__next-btn"
              onClick={handleSubmit}
              disabled={loading}
              style={{ marginTop: '24px' }}
            >
              {loading ? 'Procesando...' : method === 'mercadopago' ? 'Ir a pagar con Mercado Pago →' : 'Reservar con transferencia →'}
            </button>
          </div>
        )}

        {step === 'success' && transferResult && (
          <div className="epanel__body epanel__success">
            <div className="epanel__success-icon">⏳</div>
            <h2>¡Cupos reservados!</h2>
            <p>Tu reserva está pendiente de pago. Tienes <strong>24 horas</strong> para transferir.</p>

            <div className="epanel__bank-card">
              <div className="epanel__bank-title">Datos para transferir</div>
              <div className="epanel__bank-row">
                <span>Banco</span><strong>{transferResult.bank_info?.bank}</strong>
              </div>
              <div className="epanel__bank-row">
                <span>Titular</span><strong>{transferResult.bank_info?.name}</strong>
              </div>
              <div className="epanel__bank-row">
                <span>Cuenta</span><strong>{transferResult.bank_info?.account}</strong>
              </div>
              <div className="epanel__bank-row">
                <span>RUT</span><strong>{transferResult.bank_info?.rut}</strong>
              </div>
              <div className="epanel__bank-row">
                <span>Monto</span><strong>${total.toLocaleString('es-CL')} CLP</strong>
              </div>
            </div>

            <p className="epanel__success-hint">
              Recibirás tus tickets QR una vez confirmado el pago por el administrador.
            </p>
            <button className="epanel__next-btn" onClick={onClose}>Cerrar</button>
          </div>
        )}
      </div>
    </div>
  )
}