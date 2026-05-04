// src/components/PassengerForm.jsx

import { useState, useEffect } from 'react'
import { getPickupPoints } from '../services/api'
import './PassengerForm.css'

export default function PassengerForm({ quantity, onPassengersChange }) {
  const [passengers, setPassengers] = useState([])
  const [pickupPoints, setPickupPoints] = useState([])
  const [returnPoints, setReturnPoints] = useState([])

  useEffect(() => {
    // Inicializar pasajeros según cantidad
    const initialPassengers = Array.from({ length: quantity }, (_, i) => ({
      full_name: '',
      email: '',
      phone: '',
      trip_type: 'round_trip',
      pickup_point: '',
      return_point: ''
    }))
    setPassengers(initialPassengers)

    // Cargar puntos de recogida
    getPickupPoints().then(res => {
      setPickupPoints(res.data.pickup_points)
      setReturnPoints(res.data.return_points)
    }).catch(err => console.error('Error cargando puntos:', err))
  }, [quantity])

  useEffect(() => {
    // Notificar cambios al componente padre
    onPassengersChange(passengers)
  }, [passengers])

  const updatePassenger = (index, field, value) => {
    const updated = [...passengers]
    updated[index] = { ...updated[index], [field]: value }
    
    // Limpiar campos según tipo de viaje
    if (field === 'trip_type') {
      if (value === 'return_only') {
        updated[index].pickup_point = ''
      }
      if (value === 'outbound_only') {
        updated[index].return_point = ''
      }
    }
    
    setPassengers(updated)
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

          {/* Nombre */}
          <div className="passenger-field">
            <label>Nombre completo *</label>
            <input
              type="text"
              value={passenger.full_name}
              onChange={(e) => updatePassenger(index, 'full_name', e.target.value)}
              placeholder="Juan Pérez"
              required
            />
          </div>

          {/* Email */}
          <div className="passenger-field">
            <label>Correo electrónico *</label>
            <input
              type="email"
              value={passenger.email}
              onChange={(e) => updatePassenger(index, 'email', e.target.value)}
              placeholder="juan@ejemplo.com"
              required
            />
          </div>

          {/* Teléfono */}
          <div className="passenger-field">
            <label>Teléfono (WhatsApp) *</label>
            <input
              type="tel"
              value={passenger.phone}
              onChange={(e) => updatePassenger(index, 'phone', e.target.value)}
              placeholder="+56912345678"
              required
            />
          </div>

          {/* Tipo de viaje */}
          <div className="passenger-field">
            <label>Tipo de viaje *</label>
            <div className="trip-type-options">
              <label className="trip-type-option">
                <input
                  type="radio"
                  name={`trip_type_${index}`}
                  value="round_trip"
                  checked={passenger.trip_type === 'round_trip'}
                  onChange={(e) => updatePassenger(index, 'trip_type', e.target.value)}
                />
                <span>🔄 Ida y vuelta</span>
              </label>
              <label className="trip-type-option">
                <input
                  type="radio"
                  name={`trip_type_${index}`}
                  value="outbound_only"
                  checked={passenger.trip_type === 'outbound_only'}
                  onChange={(e) => updatePassenger(index, 'trip_type', e.target.value)}
                />
                <span>➡️ Solo ida</span>
              </label>
              <label className="trip-type-option">
                <input
                  type="radio"
                  name={`trip_type_${index}`}
                  value="return_only"
                  checked={passenger.trip_type === 'return_only'}
                  onChange={(e) => updatePassenger(index, 'trip_type', e.target.value)}
                />
                <span>⬅️ Solo vuelta</span>
              </label>
            </div>
          </div>

          {/* Punto de recogida (si no es solo vuelta) */}
          {passenger.trip_type !== 'return_only' && (
            <div className="passenger-field">
              <label>Punto de recogida *</label>
              <select
                value={passenger.pickup_point}
                onChange={(e) => updatePassenger(index, 'pickup_point', e.target.value)}
                required
              >
                <option value="">Selecciona un punto</option>
                {pickupPoints.map((point, i) => (
                  <option key={i} value={point.value}>
                    {point.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Punto de retorno (si no es solo ida) */}
          {passenger.trip_type !== 'outbound_only' && (
            <div className="passenger-field">
              <label>Punto de retorno *</label>
              <select
                value={passenger.return_point}
                onChange={(e) => updatePassenger(index, 'return_point', e.target.value)}
                required
              >
                <option value="">Selecciona un punto</option>
                {returnPoints.map((point, i) => (
                  <option key={i} value={point.value}>
                    {point.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}