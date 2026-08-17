import { useState, useRef } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { X, Calendar, MapPin, Minus, Plus, Copy, Check, ExternalLink } from 'lucide-react'
import { createTransferBooking, createMPBooking } from '../../services/api'
import PassengerForm from '../PassengerForm'
import toast from 'react-hot-toast'
import './EventPanel.css'

const BANK_ACCOUNTS = [
  { bank: 'Mercado Pago', icon: '💳', type: 'Cuenta Vista',     account: '1050518507',     rut: '10.268.196-7', name: 'Edith Francesca Constenla Azúa', email: 'fconsten@gmail.com' },
  { bank: 'Tenpo',        icon: '📱', type: 'Cuenta Vista',     account: '111110268196',   rut: '10.268.196-7', name: 'Edith Francesca Constenla Azúa', email: 'fconsten@gmail.com' },
  { bank: 'Santander',    icon: '🏦', type: 'Cuenta Corriente', account: '000071837424',   rut: '10.268.196-7', name: 'Edith Francesca Constenla Azúa', email: 'fconsten@gmail.com' },
  { bank: 'Falabella',    icon: '🏦', type: 'Cuenta Corriente', account: '1-999-689476-6', rut: '10.268.196-7', name: 'Edith Francesca Constenla Azúa', email: 'fconsten@gmail.com' },
  { bank: 'Banco Estado', icon: '🏛️', type: 'Cuenta RUT',      account: '10.268.196-7',   rut: '10.268.196-7', name: 'Edith Francesca Constenla Azúa', email: 'fconsten@gmail.com', note: 'Si tienes problemas al transferir, intenta con otra cuenta.' },
]

const TRIP_OPTIONS = [
  { id: 'round_trip',    label: 'Ida y vuelta', icon: '🔄' },
  { id: 'outbound_only', label: 'Solo ida',     icon: '➡️' },
  { id: 'return_only',   label: 'Solo vuelta',  icon: '⬅️' },
]

export default function EventPanel({ event, onClose }) {
  const [qty, setQty]             = useState(1)
  const [tripType, setTripType]   = useState('round_trip')
  const [paymentPlan, setPaymentPlan] = useState('100%')
  const [payMethod, setPayMethod] = useState(null)   // 'transfer' | 'mercadopago'
  const [step, setStep]           = useState('info')
  const [loading, setLoading]     = useState(false)
  const [transferResult, setTransferResult] = useState(null)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [selectedBank, setSelectedBank] = useState(0)
  const passengerFormRef = useRef(null)

  const isOneWay  = tripType === 'outbound_only' || tripType === 'return_only'
  const unitPrice = isOneWay && event.price_one_way ? Number(event.price_one_way) : Number(event.price)
  const total     = unitPrice * qty
  const toPay     = paymentPlan === '50%' ? Math.round(total * 0.5) : total
  const pending   = total - toPay

  const available = event.available_capacity
  const hasOffer  = event.original_price && event.original_price > event.price
  const discount  = hasOffer ? Math.round((1 - event.price / event.original_price) * 100) : null

  const copyBank = (acc, index) => {
    const text = `Banco: ${acc.bank}\nTipo: ${acc.type}\nCuenta: ${acc.account}\nRUT: ${acc.rut}\nNombre: ${acc.name}\nEmail: ${acc.email}\nMonto a pagar: $${toPay.toLocaleString('es-CL')} CLP`
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleSubmit = async () => {
    if (!passengerFormRef.current?.isValid()) {
      toast.error('Completa todos los campos de los pasajeros')
      return
    }
    const passengers = passengerFormRef.current.getPassengers()
    setLoading(true)

    try {
      // ── Mercado Pago: crear preferencia por el monto exacto (50% o 100%) ──
      if (payMethod === 'mercadopago') {
        const payload = {
          event_id: event.id,
          passengers,
          payment_method: 'mercadopago',
          payment_plan: paymentPlan,
          trip_type: tripType,
          toPay,          // monto real a cobrar ahora
          notification_method: 'email'
        }
        const res = await createMPBooking(payload)
        // Redirigir a checkout de MP
        window.location.href = res.data.init_point
        return
      }

      // ── Transferencia ─────────────────────────────────────────────────────
      const payload = {
        event_id: event.id,
        passengers,
        payment_method: 'transfer',
        payment_plan: paymentPlan,
        trip_type: tripType,
        notification_method: 'email'
      }
      const res = await createTransferBooking(payload)
      setTransferResult(res.data)
      setStep('success')

    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al procesar')
    } finally {
      setLoading(false)
    }
  }

  // ── PASO 1: INFO ──────────────────────────────────────────────────────────
  // FIX scroll: los componentes del paso 1 son elementos normales, no componentes
  // definidos dentro del render (lo que causaba el scroll al re-montar)
  const renderInfo = () => (
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
        </div>

        <div className="epanel__section-title">Tipo de viaje</div>
        <div className="epanel__trip-options">
          {TRIP_OPTIONS.map(opt => {
            if ((opt.id === 'outbound_only' || opt.id === 'return_only') && !event.price_one_way) return null
            return (
              <button
                key={opt.id}
                type="button"
                className={`epanel__trip-btn ${tripType === opt.id ? 'epanel__trip-btn--active' : ''}`}
                onClick={(e) => { e.preventDefault(); setTripType(opt.id); if (opt.id !== 'round_trip') setPaymentPlan('100%') }}
              >
                <span className="epanel__trip-icon">{opt.icon}</span>
                <span className="epanel__trip-label">{opt.label}</span>
                <span className="epanel__trip-price">
                  ${(opt.id === 'round_trip'
                    ? Number(event.price)
                    : Number(event.price_one_way || event.price)
                  ).toLocaleString('es-CL')}
                </span>
              </button>
            )
          })}
        </div>

        <div className="epanel__qty">
          <span className="epanel__qty-label">Cantidad</span>
          <div className="epanel__qty-ctrl">
            <button type="button" onClick={(e) => { e.preventDefault(); setQty(q => Math.max(1, q - 1)) }} disabled={qty <= 1}><Minus size={14} /></button>
            <span>{qty}</span>
            <button type="button" onClick={(e) => { e.preventDefault(); setQty(q => Math.min(available, q + 1)) }} disabled={qty >= available}><Plus size={14} /></button>
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

        <div className="epanel__section-title">¿Cómo quieres pagar?</div>
        <div className="epanel__payment-plans">
          <button
            type="button"
            className={`epanel__plan-btn ${paymentPlan === '100%' ? 'epanel__plan-btn--active' : ''}`}
            onClick={(e) => { e.preventDefault(); setPaymentPlan('100%') }}
          >
            <div className="epanel__plan-title">💯 Pago total</div>
            <div className="epanel__plan-amount">${total.toLocaleString('es-CL')} CLP</div>
            <div className="epanel__plan-desc">Pagas todo ahora</div>
          </button>
          {/* Solo mostrar pago en 2 partes para ida y vuelta */}
          {tripType === 'round_trip' && (
            <button
              type="button"
              className={`epanel__plan-btn ${paymentPlan === '50%' ? 'epanel__plan-btn--active' : ''}`}
              onClick={(e) => { e.preventDefault(); setPaymentPlan('50%') }}
            >
              <div className="epanel__plan-title">✌️ Pago en 2 partes</div>
              <div className="epanel__plan-amount">${Math.round(total * 0.5).toLocaleString('es-CL')} CLP ahora</div>
              <div className="epanel__plan-desc">El resto durante el viaje</div>
            </button>
          )}
        </div>

        <div className="epanel__section-title">Forma de pago</div>
        <div className="epanel__methods">
          <button
            type="button"
            className={`epanel__method ${payMethod === 'transfer' ? 'epanel__method--active' : ''}`}
            onClick={(e) => { e.preventDefault(); setPayMethod('transfer') }}
          >
            <span style={{fontSize:'20px'}}>🏦</span>
            <div>
              <div className="epanel__method-name">Transferencia bancaria</div>
              <div className="epanel__method-desc">Múltiples bancos disponibles</div>
            </div>
          </button>
          <button
            type="button"
            className={`epanel__method ${payMethod === 'mercadopago' ? 'epanel__method--active' : ''}`}
            onClick={(e) => { e.preventDefault(); setPayMethod('mercadopago') }}
          >
            <span style={{fontSize:'20px'}}>💳</span>
            <div>
              <div className="epanel__method-name">Mercado Pago</div>
              <div className="epanel__method-desc">Tarjeta, débito o saldo MP</div>
            </div>
          </button>
        </div>

        <button
          type="button"
          className="epanel__next-btn"
          disabled={!payMethod}
          onClick={(e) => { e.preventDefault(); setStep('form') }}
        >
          Continuar →
        </button>
      </div>
    </>
  )

  // ── PASO 2: FORM ──────────────────────────────────────────────────────────
  const renderForm = () => (
    <div className="epanel__body">
      <button type="button" className="epanel__back" onClick={() => setStep('info')}>← Volver</button>
      <h2 className="epanel__title">Datos de pasajeros</h2>
      <p className="epanel__subdesc">
        {event.title} · {qty} {qty === 1 ? 'cupo' : 'cupos'} · {
          tripType === 'round_trip' ? 'Ida y vuelta' : tripType === 'outbound_only' ? 'Solo ida' : 'Solo vuelta'
        }
      </p>

      <div className="epanel__pay-summary">
        <div className="epanel__pay-row">
          <span>Total</span>
          <strong>${total.toLocaleString('es-CL')} CLP</strong>
        </div>
        <div className="epanel__pay-row epanel__pay-row--highlight">
          <span>Pagas ahora ({paymentPlan})</span>
          <strong>${toPay.toLocaleString('es-CL')} CLP</strong>
        </div>
        {paymentPlan === '50%' && (
          <div className="epanel__pay-row epanel__pay-row--pending">
            <span>Resto durante el viaje</span>
            <strong>${pending.toLocaleString('es-CL')} CLP</strong>
          </div>
        )}
      </div>

      <PassengerForm ref={passengerFormRef} quantity={qty} tripType={tripType} />

      <button
        type="button"
        className="epanel__next-btn"
        onClick={handleSubmit}
        disabled={loading}
        style={{ marginTop: '24px' }}
      >
        {loading ? 'Procesando...' : payMethod === 'mercadopago' ? `Ir a pagar $${toPay.toLocaleString('es-CL')} con MP →` : 'Confirmar reserva →'}
      </button>
    </div>
  )

  // ── PASO 3: ÉXITO ─────────────────────────────────────────────────────────
  const renderSuccess = () => (
    <div className="epanel__body epanel__success">
      <div className="epanel__success-icon">⏳</div>
      <h2>¡Reserva confirmada!</h2>
      <p>Tienes entre <strong>24 a 48 horas</strong> para que revisen tu pago de <strong>${toPay.toLocaleString('es-CL')} CLP</strong>. Una vez confirmado recibirás tus tickets QR.</p>

      {payMethod === 'transfer' && (
        <>
          <div className="epanel__section-title" style={{marginTop:'20px'}}>Elige tu banco</div>
          <div className="epanel__bank-tabs">
            {BANK_ACCOUNTS.map((acc, i) => (
              <button key={i} type="button"
                className={`epanel__bank-tab ${selectedBank === i ? 'epanel__bank-tab--active' : ''}`}
                onClick={() => setSelectedBank(i)}
              >
                {acc.icon} {acc.bank}
              </button>
            ))}
          </div>
          <div className="epanel__bank-card">
            <div className="epanel__bank-card-header">
              <div>
                <div className="epanel__bank-card-name">{BANK_ACCOUNTS[selectedBank].bank}</div>
                <div className="epanel__bank-card-type">{BANK_ACCOUNTS[selectedBank].type}</div>
              </div>
              <button type="button"
                className={`epanel__copy-btn ${copiedIndex === selectedBank ? 'epanel__copy-btn--done' : ''}`}
                onClick={() => copyBank(BANK_ACCOUNTS[selectedBank], selectedBank)}
              >
                {copiedIndex === selectedBank ? <><Check size={13}/> Copiado</> : <><Copy size={13}/> Copiar</>}
              </button>
            </div>
            <div className="epanel__bank-rows">
              <div className="epanel__bank-row"><span>Nombre</span><strong>{BANK_ACCOUNTS[selectedBank].name}</strong></div>
              <div className="epanel__bank-row"><span>RUT</span><strong>{BANK_ACCOUNTS[selectedBank].rut}</strong></div>
              <div className="epanel__bank-row"><span>Tipo</span><strong>{BANK_ACCOUNTS[selectedBank].type}</strong></div>
              <div className="epanel__bank-row"><span>N° Cuenta</span><strong>{BANK_ACCOUNTS[selectedBank].account}</strong></div>
              <div className="epanel__bank-row"><span>Email</span><strong>{BANK_ACCOUNTS[selectedBank].email}</strong></div>
              <div className="epanel__bank-row epanel__bank-row--amount">
                <span>Monto a transferir</span>
                <strong>${toPay.toLocaleString('es-CL')} CLP</strong>
              </div>
            </div>
            {BANK_ACCOUNTS[selectedBank].note && (
              <div className="epanel__bank-note">⚠️ {BANK_ACCOUNTS[selectedBank].note}</div>
            )}
          </div>
        </>
      )}

      <a href="https://wa.me/56954084889" target="_blank" rel="noreferrer" className="epanel__wa-btn">
        💬 Enviar comprobante por WhatsApp
      </a>

      <p className="epanel__success-hint">
        {paymentPlan === '50%'
          ? 'El resto lo pagas directamente al conductor durante el viaje.'
          : 'Recibirás tus tickets QR una vez confirmado el pago.'
        }
      </p>

      <button type="button" className="epanel__next-btn" onClick={onClose}>Cerrar</button>
    </div>
  )

  return (
    <div className="epanel-overlay">
      <div className="epanel">
        <button type="button" className="epanel__close" onClick={onClose} aria-label="Cerrar"><X size={20} /></button>
        {step === 'info'    && renderInfo()}
        {step === 'form'    && renderForm()}
        {step === 'success' && renderSuccess()}
      </div>
    </div>
  )
}