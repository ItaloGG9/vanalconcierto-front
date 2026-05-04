// src/components/BookingPassengersManager.jsx - CREAR NUEVO

import { useState, useEffect } from 'react'
import { adminGetBookingPassengers, adminReassignPassenger } from '../services/api'
import toast from 'react-hot-toast'
import './BookingPassengersManager.css'

export default function BookingPassengersManager({ bookingId, eventId, vans }) {
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

  const handleReassign = async (passengerId, newVanId) => {
    try {
      await adminReassignPassenger(passengerId, newVanId || null)
      toast.success('✅ Pasajero reasignado')
      loadPassengers()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error reasignando')
    }
  }

  if (loading) {
    return <div className="bpm-loading">Cargando pasajeros...</div>
  }

  if (passengers.length === 0) {
    return (
      <div className="bpm-empty">
        ℹ️ Reserva del sistema antiguo (sin datos individuales)
      </div>
    )
  }

  return (
    <div className="booking-passengers-manager">
      <h4>👥 Pasajeros ({passengers.length})</h4>
      
      {vans.length === 0 && (
        <div className="bpm-warning">
          ⚠️ Este evento no tiene vans asignadas. 
          <a href="#vans">Ir a gestión de vans</a>
        </div>
      )}
      
      <table className="bpm-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Contacto</th>
            <th>Tipo Viaje</th>
            <th>Punto Recogida</th>
            <th>Punto Retorno</th>
            <th>Van Asignada</th>
          </tr>
        </thead>
        <tbody>
          {passengers.map((passenger, index) => (
            <tr key={passenger.id}>
              <td className="bpm-number">{index + 1}</td>
              
              <td>
                <strong>{passenger.full_name}</strong>
              </td>
              
              <td className="bpm-contact">
                <div>{passenger.email}</div>
                <div>{passenger.phone}</div>
              </td>
              
              <td>
                <span className={`bpm-trip-badge ${passenger.trip_type}`}>
                  {passenger.trip_type === 'round_trip' && '🔄'}
                  {passenger.trip_type === 'outbound_only' && '➡️'}
                  {passenger.trip_type === 'return_only' && '⬅️'}
                </span>
              </td>
              
              <td className="bpm-point">
                {passenger.pickup_point || '—'}
              </td>
              
              <td className="bpm-point">
                {passenger.return_point || '—'}
              </td>
              
              <td>
                <select
                  className="bpm-select"
                  value={passenger.assigned_van_id || ''}
                  onChange={(e) => handleReassign(passenger.id, e.target.value)}
                >
                  <option value="">Sin asignar</option>
                  {vans.map(van => (
                    <option key={van.id} value={van.id}>
                      🚐 {van.name}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}