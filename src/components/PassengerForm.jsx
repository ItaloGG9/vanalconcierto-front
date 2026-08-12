import { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react'
import './PassengerForm.css'

const PICKUP_POINTS = [
  { value: 'Peñablanca – Líder, Manuel Montt',                label: 'Peñablanca – Líder, Manuel Montt' },
  { value: 'Villa Alemana – Paradero 7 (frente a la Copec)', label: 'Villa Alemana – Paradero 7 (frente a la Copec)' },
  { value: 'Belloto – Paradero Ex La Polar',                  label: 'Belloto – Paradero Ex La Polar' },
  { value: 'Quilpué – Paradero 26',                           label: 'Quilpué – Paradero 26' },
  { value: 'Viña del Mar – Plaza México, Paradero 1 Norte',   label: 'Viña del Mar – Plaza México, Paradero 1 Norte' },
  { value: 'Valparaíso – Costado PUCV, Av. Argentina',        label: 'Valparaíso – Costado PUCV, Av. Argentina' },
  { value: 'Placilla – Pasarela Ruta 68',                     label: 'Placilla – Pasarela Ruta 68' },
  { value: 'Casablanca – Ruta 68',                            label: 'Casablanca – Ruta 68' },
  { value: 'Curacaví – Ruta 68',                              label: 'Curacaví – Ruta 68' },
]

function PassengerCard({ passenger, index, tripType, onChange }) {
  const showPickup = tripType !== 'return_only'
  const showReturn = tripType !== 'outbound_only'

  return (
    <div className="passenger-card">
      <div className="passenger-card__header">
        <span className="passenger-card__number">Pasajero #{index + 1}</span>
      </div>

      <div className="passenger-field">
        <label>Nombre completo *</label>
        <input type="text" value={passenger.full_name}
          onChange={e => onChange(index, 'full_name', e.target.value)}
          placeholder="Juan Pérez" />
      </div>

      <div className="passenger-field">
        <label>Correo electrónico *</label>
        <input type="email" value={passenger.email}
          onChange={e => onChange(index, 'email', e.target.value)}
          placeholder="juan@ejemplo.com" />
      </div>

      <div className="passenger-field">
        <label>Teléfono (WhatsApp) *</label>
        <input type="tel" value={passenger.phone}
          onChange={e => onChange(index, 'phone', e.target.value)}
          placeholder="+56912345678" />
      </div>

      {showPickup && (
        <div className="passenger-field">
          <label>Punto de recogida *</label>
          <select value={passenger.pickup_point}
            onChange={e => onChange(index, 'pickup_point', e.target.value)}>
            <option value="">Selecciona un punto</option>
            {PICKUP_POINTS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      )}

      {showReturn && (
        <div className="passenger-field">
          <label>Punto de retorno *</label>
          <select value={passenger.return_point}
            onChange={e => onChange(index, 'return_point', e.target.value)}>
            <option value="">Selecciona un punto</option>
            {PICKUP_POINTS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}

// Usamos forwardRef + useImperativeHandle para que el padre lea los datos al hacer submit
// sin necesidad de callbacks que causen re-renders
const PassengerForm = forwardRef(function PassengerForm({ quantity, tripType = 'round_trip' }, ref) {
  const [passengers, setPassengers] = useState(() =>
    Array.from({ length: quantity }, () => ({
      full_name: '', email: '', phone: '',
      trip_type: tripType, pickup_point: '', return_point: ''
    }))
  )

  // Exponer método getPassengers al padre via ref
  useImperativeHandle(ref, () => ({
    getPassengers: () => passengers.map(p => ({ ...p, trip_type: tripType })),
    isValid: () => passengers.every(p =>
      p.full_name && p.email && p.phone &&
      (tripType === 'return_only'   || p.pickup_point) &&
      (tripType === 'outbound_only' || p.return_point)
    )
  }), [passengers, tripType])

  // Ajustar cantidad
  useEffect(() => {
    setPassengers(prev => {
      if (prev.length === quantity) return prev
      if (prev.length < quantity) {
        return [...prev, ...Array.from({ length: quantity - prev.length }, () => ({
          full_name: '', email: '', phone: '',
          trip_type: tripType, pickup_point: '', return_point: ''
        }))]
      }
      return prev.slice(0, quantity)
    })
  }, [quantity])

  const handleChange = useCallback((index, field, value) => {
    setPassengers(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }, [])

  return (
    <div className="passenger-forms">
      <h3 className="passenger-forms__title">
        Información de pasajeros ({quantity} {quantity === 1 ? 'ticket' : 'tickets'})
      </h3>
      {passengers.map((passenger, index) => (
        <PassengerCard
          key={index}
          passenger={passenger}
          index={index}
          tripType={tripType}
          onChange={handleChange}
        />
      ))}
    </div>
  )
})

export default PassengerForm