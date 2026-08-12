import { useState, useEffect, useRef } from 'react'
import './PassengerForm.css'

// Puntos hardcodeados — evita llamada al API en loop
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

export default function PassengerForm({ quantity, onPassengersChange }) {
  const [passengers, setPassengers] = useState(() =>
    Array.from({ length: quantity }, () => ({
      full_name: '', email: '', phone: '',
      trip_type: 'round_trip', pickup_point: '', return_point: ''
    }))
  )

  // Ajustar cantidad si cambia quantity sin recargar puntos
  useEffect(() => {
    setPassengers(prev => {
      if (prev.length === quantity) return prev
      if (prev.length < quantity) {
        return [...prev, ...Array.from({ length: quantity - prev.length }, () => ({
          full_name: '', email: '', phone: '',
          trip_type: 'round_trip', pickup_point: '', return_point: ''
        }))]
      }
      return prev.slice(0, quantity)
    })
  }, [quantity])

  const updatePassenger = (index, field, value) => {
    setPassengers(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      if (field === 'trip_type') {
        if (value === 'return_only')   updated[index].pickup_point = ''
        if (value === 'outbound_only') updated[index].return_point = ''
      }
      // Notificar al padre con los datos actualizados
      onPassengersChange(updated)
      return updated
    })
  }

  return (
    <div className="passenger-forms">
      <h3 className="passenger-forms__title">
        Información de pasajeros ({quantity} {quantity === 1 ? 'ticket' : 'tickets'})
      </h3>

      {passengers.map((passenger, index) => (
        <div key={index} className="passenger-card">
          <div className="passenger-card__header">
            <span className="passenger-card__number">Pasajero #{index + 1}</span>
          </div>

          <div className="passenger-field">
            <label>Nombre completo *</label>
            <input type="text" value={passenger.full_name}
              onChange={e => updatePassenger(index, 'full_name', e.target.value)}
              placeholder="Juan Pérez" />
          </div>

          <div className="passenger-field">
            <label>Correo electrónico *</label>
            <input type="email" value={passenger.email}
              onChange={e => updatePassenger(index, 'email', e.target.value)}
              placeholder="juan@ejemplo.com" />
          </div>

          <div className="passenger-field">
            <label>Teléfono (WhatsApp) *</label>
            <input type="tel" value={passenger.phone}
              onChange={e => updatePassenger(index, 'phone', e.target.value)}
              placeholder="+56912345678" />
          </div>

          <div className="passenger-field">
            <label>Tipo de viaje *</label>
            <div className="trip-type-options">
              {[
                { value: 'round_trip',    label: '🔄 Ida y vuelta' },
                { value: 'outbound_only', label: '➡️ Solo ida' },
                { value: 'return_only',   label: '⬅️ Solo vuelta' },
              ].map(opt => (
                <label key={opt.value} className="trip-type-option">
                  <input type="radio" name={`trip_type_${index}`} value={opt.value}
                    checked={passenger.trip_type === opt.value}
                    onChange={e => updatePassenger(index, 'trip_type', e.target.value)} />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {passenger.trip_type !== 'return_only' && (
            <div className="passenger-field">
              <label>Punto de recogida *</label>
              <select value={passenger.pickup_point}
                onChange={e => updatePassenger(index, 'pickup_point', e.target.value)}>
                <option value="">Selecciona un punto</option>
                {PICKUP_POINTS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          )}

          {passenger.trip_type !== 'outbound_only' && (
            <div className="passenger-field">
              <label>Punto de retorno *</label>
              <select value={passenger.return_point}
                onChange={e => updatePassenger(index, 'return_point', e.target.value)}>
                <option value="">Selecciona un punto</option>
                {PICKUP_POINTS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}