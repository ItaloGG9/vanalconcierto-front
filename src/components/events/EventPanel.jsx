import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { X, Calendar, MapPin, ArrowLeftRight, Minus, Plus, CreditCard, Building2, Copy, Check } from 'lucide-react'
import { createMPBooking, createTransferBooking } from '../../services/api'
import PassengerForm from '../PassengerForm'
import toast from 'react-hot-toast'
import './EventPanel.css'

const BANK_ACCOUNTS = [
  {
    bank: 'Mercado Pago',
    icon: '💳',
    type: 'Cuenta Vista',
    account: '1050518507',
    rut: '10.268.196-7',
    name: 'Edith Francesca Constenla Azúa',
    email: 'fconsten@gmail.com',
  },
  {
    bank: 'Tenpo',
    icon: '📱',
    type: 'Cuenta Vista',
    account: '111110268196',
    rut: '10.268.196-7',
    name: 'Edith Francesca Constenla Azúa',
    email: 'fconsten@gmail.com',
  },
  {
    bank: 'Banco Santander',
    icon: '🏦',
    type: 'Cuenta Corriente',
    account: '000071837424',
    rut: '10.268.196-7',
    name: 'Edith Francesca Constenla Azúa',
    email: 'fconsten@gmail.com',
  },
  {
    bank: 'Banco Falabella',
    icon: '🏦',
    type: 'Cuenta Corriente',
    account: '1-999-689476-6',
    rut: '10.268.196-7',
    name: 'Edith Francesca Constenla Azúa',
    email: 'fconsten@gmail.com',
  },
  {
    bank: 'Banco Estado',
    icon: '🏛️',
    type: 'Cuenta RUT',
    account: '10.268.196-7',
    rut: '10.268.196',
    name: 'Edith Francesca Constenla Azúa',
    email: 'fconsten@gmail.com',
    note: 'Si tienes problemas al transferir, intenta con otra cuenta.',
  },
]

export default function EventPanel({ event, onClose }) {
  const [qty, setQty] = useState(1)
  const [method, setMethod] = useState(null)
  const [step, setStep] = useState('info')
  const [loading, setLoading] = useState(false)
  const [notif] = useState('email')
  const [transferResult, setTransferResult] = useState(null)
  const [passengers, setPassengers] = useState([])
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [selectedBank, setSelectedBank] = useState(0)

  const available = event.available_capacity
  const hasOffer = event.original_price && event.original_price > event.price
  const discount = hasOffer ? Math.round((1 - event.price / event.original_price) * 100) : null
  const total = Number(event.price) * qty

  const handlePassengersChange = (passengersData) => {
    setPassengers(passengersData)
  }

  const copyBank = (acc, index, includeAmount = false) => {
    const text = `Banco: ${acc.bank}
Tipo: ${acc.type}
Cuenta: ${acc.account}
RUT: ${acc.rut}
Nombre: ${acc.name}
Email: ${acc.email}${includeAmount ? `\nMonto: $${total.toLocaleString('es-CL')} CLP` : ''}`
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleSubmit = async () => {
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
      const payload = {
        event_id: event.id,
        passengers,
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

        {/* ── PASO 1: INFO ─────────────────────────────────────────────────── */}
        {step === 'info' && (
          <>
            <div className="epanel__img-wrap">
              {event.image_url
                ? <img src={event.image_url} alt={event.title} />
                : <div className="epanel__img-placeholder">🎵</div>
              }
              {hasOffer && <div className="epanel__discount-badge">-{discount}% OFERTA</div>}
            </div>

            <div className="epanel__body">
              <h2 className="epanel__title">{event.title}</h2>

              <div className="epanel__meta">
                <div className="epanel__meta-item">
                  <Calendar size={15} />
                  {format(new Date(event.event_date), "EEEE d 'de' MMMM, yyyy — HH:mm", { locale: es })}
                </div>
                {event.is_round_trip && (
                  <div className="epanel__meta-item epanel__meta-item--accent">
                    <ArrowLeftRight size={15} /> Incluye ida y vuelta
                  </div>
                )}
              </div>

              <div className="epanel__price-block">
                {hasOffer && <span className="epanel__price-old">${Number(event.original_price).toLocaleString('es-CL')}</span>}
                <div className="epanel__price-main">
                  <span className="epanel__price-num">${Number(event.price).toLocaleString('es-CL')}</span>
                  <span className="epanel__price-label">CLP por persona</span>
                </div>
              </div>

              <div className="epanel__qty">
                <span className="epanel__qty-label">Cantidad</span>
                <div className="epanel__qty-ctrl">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}><Minus size={14} /></button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(q => Math.min(available, q + 1))} disabled={qty >= available}><Plus size={14} /></button>
                </div>
                <span className="epanel__qty-total">Total: <strong>${total.toLocaleString('es-CL')} CLP</strong></span>
              </div>

              {event.pickup_info && (
                <div className="epanel__pickup">
                  <div className="epanel__pickup-title"><MapPin size={14} /> Puntos de recogida</div>
                  <p className="epanel__pickup-text">{event.pickup_info}</p>
                </div>
              )}

              {event.description && <p className="epanel__desc">{event.description}</p>}

              <div className="epanel__section-title">Método de pago</div>
              <div className="epanel__methods">
                <button className={`epanel__method ${method === 'mercadopago' ? 'epanel__method--active' : ''}`} onClick={() => setMethod('mercadopago')}>
                  <CreditCard size={18} />
                  <div>
                    <div className="epanel__method-name">Mercado Pago</div>
                    <div className="epanel__method-desc">Tarjeta, débito o saldo MP</div>
                  </div>
                </button>
                <button className={`epanel__method ${method === 'transfer' ? 'epanel__method--active' : ''}`} onClick={() => setMethod('transfer')}>
                  <Building2 size={18} />
                  <div>
                    <div className="epanel__method-name">Transferencia bancaria</div>
                    <div className="epanel__method-desc">Reserva por 24 horas</div>
                  </div>
                </button>
              </div>

              <button className="epanel__next-btn" disabled={!method} onClick={() => setStep('form')}>
                Continuar →
              </button>
            </div>
          </>
        )}

        {/* ── PASO 2: FORM ─────────────────────────────────────────────────── */}
        {step === 'form' && (
          <div className="epanel__body">
            <button className="epanel__back" onClick={() => setStep('info')}>← Volver</button>
            <h2 className="epanel__title">Datos de pasajeros</h2>
            <p className="epanel__subdesc">
              {event.title} · {qty} {qty === 1 ? 'cupo' : 'cupos'} · ${total.toLocaleString('es-CL')} CLP
            </p>

            <PassengerForm quantity={qty} onPassengersChange={handlePassengersChange} />

            <div className="epanel__notif" style={{ marginTop: '24px' }}>
              <div className="epanel__section-title">¿Cómo quieres recibir tus tickets?</div>
              <div className="epanel__notif-opts">
                <button className={`epanel__notif-opt ${notif === 'email' ? 'epanel__notif-opt--active' : ''}`}>
                  📧 Email
                </button>
              </div>
            </div>

            <button className="epanel__next-btn" onClick={handleSubmit} disabled={loading} style={{ marginTop: '24px' }}>
              {loading ? 'Procesando...' : method === 'mercadopago' ? 'Ir a pagar con Mercado Pago →' : 'Reservar con transferencia →'}
            </button>
          </div>
        )}

        {/* ── PASO 3: ÉXITO TRANSFERENCIA ──────────────────────────────────── */}
        {step === 'success' && transferResult && (
          <div className="epanel__body epanel__success">
            <div className="epanel__success-icon">⏳</div>
            <h2>¡Cupos reservados!</h2>
            <p>Tienes <strong>24 horas</strong> para transferir <strong>${total.toLocaleString('es-CL')} CLP</strong> y enviar el comprobante.</p>

            {/* Selector de banco */}
            <div className="epanel__section-title" style={{marginTop: '20px'}}>Elige tu banco para transferir</div>
            <div className="epanel__bank-tabs">
              {BANK_ACCOUNTS.map((acc, i) => (
                <button
                  key={i}
                  className={`epanel__bank-tab ${selectedBank === i ? 'epanel__bank-tab--active' : ''}`}
                  onClick={() => setSelectedBank(i)}
                >
                  {acc.icon} {acc.bank}
                </button>
              ))}
            </div>

            {/* Datos del banco seleccionado */}
            <div className="epanel__bank-card">
              <div className="epanel__bank-card-header">
                <div>
                  <div className="epanel__bank-card-name">{BANK_ACCOUNTS[selectedBank].bank}</div>
                  <div className="epanel__bank-card-type">{BANK_ACCOUNTS[selectedBank].type}</div>
                </div>
                <button
                  className={`epanel__copy-btn ${copiedIndex === selectedBank ? 'epanel__copy-btn--done' : ''}`}
                  onClick={() => copyBank(BANK_ACCOUNTS[selectedBank], selectedBank, true)}
                >
                  {copiedIndex === selectedBank
                    ? <><Check size={13} /> Copiado</>
                    : <><Copy size={13} /> Copiar todo</>
                  }
                </button>
              </div>

              <div className="epanel__bank-rows">
                <div className="epanel__bank-row">
                  <span>Nombre</span><strong>{BANK_ACCOUNTS[selectedBank].name}</strong>
                </div>
                <div className="epanel__bank-row">
                  <span>RUT</span><strong>{BANK_ACCOUNTS[selectedBank].rut}</strong>
                </div>
                <div className="epanel__bank-row">
                  <span>Tipo</span><strong>{BANK_ACCOUNTS[selectedBank].type}</strong>
                </div>
                <div className="epanel__bank-row">
                  <span>N° Cuenta</span><strong>{BANK_ACCOUNTS[selectedBank].account}</strong>
                </div>
                <div className="epanel__bank-row">
                  <span>Email</span><strong>{BANK_ACCOUNTS[selectedBank].email}</strong>
                </div>
                <div className="epanel__bank-row epanel__bank-row--amount">
                  <span>Monto</span><strong>${total.toLocaleString('es-CL')} CLP</strong>
                </div>
              </div>

              {BANK_ACCOUNTS[selectedBank].note && (
                <div className="epanel__bank-note">⚠️ {BANK_ACCOUNTS[selectedBank].note}</div>
              )}
            </div>

            <a
              href="https://wa.me/56954084889"
              target="_blank"
              rel="noreferrer"
              className="epanel__wa-btn"
            >
              💬 Enviar comprobante por WhatsApp
            </a>

            <p className="epanel__success-hint">
              Recibirás tus tickets QR una vez confirmado el pago.
            </p>

            <button className="epanel__next-btn" onClick={onClose}>Cerrar</button>
          </div>
        )}
      </div>
    </div>
  )
}