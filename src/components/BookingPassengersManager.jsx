// src/components/BookingPassengersManager.jsx

import { useState, useEffect } from 'react'
import { adminGetBookingPassengers, adminReassignPassenger, adminGetEventVans } from '../services/api'
import toast from 'react-hot-toast'
import './BookingPassengersManager.css'

const TRIP_TYPE_LABELS = {
  round_trip:    'Ida y vuelta',
  outbound_only: 'Solo ida',
  return_only:   'Solo vuelta',
}

export default function BookingPassengersManager({ bookingId, eventId, vans: vansProp }) {
  const [passengers, setPassengers] = useState([])
  const [vans, setVans] = useState(vansProp || [])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadPassengers()
    // Si no nos pasaron vans, las cargamos nosotros
    if (!vansProp || vansProp.length === 0) {
      loadVans()
    }
  }, [bookingId, eventId])

  useEffect(() => {
    if (vansProp && vansProp.length > 0) setVans(vansProp)
  }, [vansProp])

  const loadPassengers = async () => {
    try {
      setLoading(true)
      const res = await adminGetBookingPassengers(bookingId)
      setPassengers(res.data)
    } catch (err) {
      setPassengers([])
    } finally {
      setLoading(false)
    }
  }

  const loadVans = async () => {
    if (!eventId) return
    try {
      const res = await adminGetEventVans(eventId)
      setVans(res.data)
    } catch {}
  }

  const handleReassign = async (passengerId, newVanId) => {
    try {
      await adminReassignPassenger(passengerId, newVanId || null)
      toast.success('Van asignada ✅')
      loadPassengers()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error reasignando')
    }
  }

  if (loading) return <div className="bpm-loading">Cargando pasajeros...</div>

  if (passengers.length === 0) return (
    <div className="bpm-empty">ℹ️ Sin datos individuales de pasajeros</div>
  )

  return (
    <div className="bpm">
      <div className="bpm__header">
        <span className="bpm__title">👥 Pasajeros ({passengers.length})</span>
        {vans.length === 0 && (
          <span className="bpm__warning">⚠️ Sin vans asignadas al evento</span>
        )}
      </div>

      <div className="bpm__list">
        {passengers.map((p, i) => (
          <div key={p.id} className="bpm__row">
            {/* Número */}
            <div className="bpm__num">{i + 1}</div>

            {/* Nombre + contacto */}
            <div className="bpm__col bpm__col--name">
              <div className="bpm__name">{p.full_name}</div>
              {p.email && <div className="bpm__sub">{p.email}</div>}
              {p.phone && <div className="bpm__sub">{p.phone}</div>}
            </div>

            {/* Tipo de viaje */}
            <div className="bpm__col">
              <div className="bpm__label">Viaje</div>
              <span className="bpm__trip">{TRIP_TYPE_LABELS[p.trip_type] || '—'}</span>
            </div>

            {/* Recogida */}
            <div className="bpm__col">
              <div className="bpm__label">Recogida</div>
              <div className="bpm__point">{p.pickup_point || '—'}</div>
            </div>

            {/* Retorno */}
            <div className="bpm__col">
              <div className="bpm__label">Retorno</div>
              <div className="bpm__point">{p.return_point || '—'}</div>
            </div>

            {/* Van — único campo editable */}
            <div className="bpm__col bpm__col--van">
              <div className="bpm__label">Van</div>
              <select
                className="bpm__select"
                value={p.assigned_van_id || ''}
                onChange={(e) => handleReassign(p.id, e.target.value)}
              >
                <option value="">Sin asignar</option>
                {vans.map(van => (
                  <option key={van.id} value={van.id}>🚐 {van.name}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}