// src/components/PassengersAssignment.jsx - CREAR NUEVO

import { useState, useEffect } from 'react'
import { 
  adminGetEventPassengers, 
  adminGetEventVans, 
  adminReassignPassenger,
  adminAutoAssignPassengers 
} from '../services/api'
import toast from 'react-hot-toast'
import './PassengersAssignment.css'

export default function PassengersAssignment({ eventId, eventTitle }) {
  const [passengers, setPassengers] = useState([])
  const [vans, setVans] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all') // 'all' | 'assigned' | 'unassigned'

  useEffect(() => {
    if (eventId) {
      loadData()
    }
  }, [eventId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [passengersRes, vansRes] = await Promise.all([
        adminGetEventPassengers(eventId),
        adminGetEventVans(eventId)
      ])
      setPassengers(passengersRes.data)
      setVans(vansRes.data)
    } catch (err) {
      toast.error('Error cargando datos')
    } finally {
      setLoading(false)
    }
  }

  const handleReassign = async (passengerId, newVanId) => {
    try {
      await adminReassignPassenger(passengerId, newVanId || null)
      toast.success('Pasajero reasignado')
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error reasignando')
    }
  }

  const handleAutoAssign = async () => {
    if (!confirm('¿Auto-asignar todos los pasajeros sin van?')) return
    
    try {
      const res = await adminAutoAssignPassengers(eventId)
      toast.success(`✅ ${res.data.assigned} pasajeros asignados`)
      loadData()
    } catch (err) {
      toast.error('Error en auto-asignación')
    }
  }

  const filteredPassengers = passengers.filter(p => {
    if (filter === 'assigned') return p.assigned_van_id !== null
    if (filter === 'unassigned') return p.assigned_van_id === null
    return true
  })

  const unassignedCount = passengers.filter(p => !p.assigned_van_id).length
  
  const getVanOccupancy = (vanId) => {
    return passengers.filter(p => p.assigned_van_id === vanId).length
  }

  return (
    <div className="passengers-assignment">
      <div className="pa-header">
        <div>
          <h2>Asignación de Pasajeros</h2>
          <p className="pa-subtitle">{eventTitle}</p>
        </div>
        
        {unassignedCount > 0 && (
          <button className="btn-primary" onClick={handleAutoAssign}>
            🤖 Auto-asignar {unassignedCount} sin van
          </button>
        )}
      </div>

      {/* Resumen de vans */}
      <div className="pa-vans-summary">
        {vans.length === 0 ? (
          <div className="pa-empty">
            ⚠️ No hay vans asignadas a este evento
          </div>
        ) : (
          vans.map(van => {
            const occupancy = getVanOccupancy(van.id)
            const percentage = Math.round((occupancy / van.capacity) * 100)
            
            return (
              <div key={van.id} className="pa-van-card">
                <div className="pa-van-name">🚐 {van.name}</div>
                <div className="pa-van-capacity">
                  {occupancy}/{van.capacity}
                  <div className="pa-van-bar">
                    <div 
                      className="pa-van-bar-fill" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Filtros */}
      <div className="pa-filters">
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          Todos ({passengers.length})
        </button>
        <button 
          className={filter === 'assigned' ? 'active' : ''}
          onClick={() => setFilter('assigned')}
        >
          ✅ Asignados ({passengers.length - unassignedCount})
        </button>
        <button 
          className={filter === 'unassigned' ? 'active' : ''}
          onClick={() => setFilter('unassigned')}
        >
          ⚠️ Sin asignar ({unassignedCount})
        </button>
      </div>

      {/* Tabla de pasajeros */}
      <div className="pa-table-container">
        {loading ? (
          <p>Cargando...</p>
        ) : filteredPassengers.length === 0 ? (
          <p className="pa-empty">No hay pasajeros con este filtro</p>
        ) : (
          <table className="pa-table">
            <thead>
              <tr>
                <th>Pasajero</th>
                <th>Teléfono</th>
                <th>Tipo Viaje</th>
                <th>Punto Recogida</th>
                <th>Van Asignada</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredPassengers.map(passenger => (
                <tr key={passenger.id}>
                  <td>
                    <strong>{passenger.full_name}</strong>
                    <br />
                    <small>{passenger.email}</small>
                  </td>
                  <td>{passenger.phone}</td>
                  <td>
                    <span className={`trip-badge ${passenger.trip_type}`}>
                      {passenger.trip_type === 'round_trip' && '🔄 Ida y vuelta'}
                      {passenger.trip_type === 'outbound_only' && '➡️ Solo ida'}
                      {passenger.trip_type === 'return_only' && '⬅️ Solo vuelta'}
                    </span>
                  </td>
                  <td className="pa-point">
                    {passenger.pickup_point || '—'}
                  </td>
                  <td>
                    {passenger.vans ? (
                      <span className="van-badge">
                        🚐 {passenger.vans.name}
                        {passenger.manually_assigned && ' 🔧'}
                      </span>
                    ) : (
                      <span className="van-badge unassigned">Sin asignar</span>
                    )}
                  </td>
                  <td>
                    <select
                      className="pa-select"
                      value={passenger.assigned_van_id || ''}
                      onChange={(e) => handleReassign(passenger.id, e.target.value)}
                    >
                      <option value="">Sin asignar</option>
                      {vans.map(van => (
                        <option key={van.id} value={van.id}>
                          {van.name} ({getVanOccupancy(van.id)}/{van.capacity})
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}s