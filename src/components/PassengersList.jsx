// src/components/PassengersList.jsx - CREAR NUEVO

import { useState, useEffect } from 'react'
import { adminGetBookingPassengers } from '../services/api'
import './PassengersList.css'

export default function PassengersList({ bookingId }) {
  const [passengers, setPassengers] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadPassengers()
  }, [bookingId])

  const loadPassengers = async () => {
    try {
      setLoading(true)
      const res = await adminGetBookingPassengers(bookingId)
      setPassengers(res.data)
    } catch (err) {
      console.error('Error cargando pasajeros:', err)
      setPassengers([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="passengers-loading">Cargando pasajeros...</div>
  }

  if (passengers.length === 0) {
    return (
      <div className="passengers-empty">
        ℹ️ Esta reserva fue creada con el sistema antiguo (sin datos individuales de pasajeros)
      </div>
    )
  }

  return (
    <div className="passengers-list">
      <h4>👥 Pasajeros de esta reserva ({passengers.length})</h4>
      
      <div className="passengers-grid">
        {passengers.map((passenger, index) => (
          <div key={passenger.id} className="passenger-card">
            <div className="passenger-header">
              <span className="passenger-number">Pasajero #{index + 1}</span>
              {passenger.vans && (
                <span className="passenger-van">🚐 {passenger.vans.name}</span>
              )}
            </div>
            
            <div className="passenger-info">
              <div className="info-row">
                <span className="info-label">Nombre:</span>
                <strong>{passenger.full_name}</strong>
              </div>
              
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span>{passenger.email}</span>
              </div>
              
              <div className="info-row">
                <span className="info-label">Teléfono:</span>
                <span>{passenger.phone}</span>
              </div>
              
              <div className="info-row">
                <span className="info-label">Tipo de viaje:</span>
                <span className={`trip-badge ${passenger.trip_type}`}>
                  {passenger.trip_type === 'round_trip' && '🔄 Ida y vuelta'}
                  {passenger.trip_type === 'outbound_only' && '➡️ Solo ida'}
                  {passenger.trip_type === 'return_only' && '⬅️ Solo vuelta'}
                </span>
              </div>
              
              {passenger.pickup_point && (
                <div className="info-row">
                  <span className="info-label">Punto de recogida:</span>
                  <span className="info-value">{passenger.pickup_point}</span>
                </div>
              )}
              
              {passenger.return_point && (
                <div className="info-row">
                  <span className="info-label">Punto de retorno:</span>
                  <span className="info-value">{passenger.return_point}</span>
                </div>
              )}
              
              {passenger.tickets && (
                <div className="info-row">
                  <span className="info-label">QR Code:</span>
                  <code className="qr-code">{passenger.tickets.qr_code}</code>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}