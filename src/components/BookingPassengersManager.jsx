import { useState, useEffect } from 'react'
import { adminGetBookingPassengers, adminReassignPassenger, adminGetEventVans } from '../services/api'
import toast from 'react-hot-toast'
import { Edit2, Save, X } from 'lucide-react'
import './BookingPassengersManager.css'


const PICKUP_POINTS_LIST = [
  'Peñablanca – Líder, Manuel Montt',
  'Villa Alemana – Paradero 7 (frente a la Copec)',
  'Belloto – Paradero Ex La Polar',
  'Quilpué – Paradero 26',
  'Viña del Mar – Plaza México, Paradero 1 Norte',
  'Valparaíso – Costado PUCV, Av. Argentina',
  'Placilla – Pasarela Ruta 68',
  'Casablanca – Ruta 68',
  'Curacaví – Ruta 68',
]

const TRIP_TYPE_LABELS = {
  round_trip:    'Ida y vuelta',
  outbound_only: 'Solo ida',
  return_only:   'Solo vuelta',
}

export default function BookingPassengersManager({ bookingId, eventId, vans: vansProp }) {
  const [passengers, setPassengers] = useState([])
  const [vans, setVans] = useState(vansProp || [])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    loadPassengers()
    if (!vansProp || vansProp.length === 0) loadVans()
  }, [bookingId, eventId])

  useEffect(() => {
    if (vansProp && vansProp.length > 0) setVans(vansProp)
  }, [vansProp])

  const loadPassengers = async () => {
    setLoading(true)
    try {
      const res = await adminGetBookingPassengers(bookingId)
      setPassengers(res.data || [])
    } catch { setPassengers([]) }
    finally { setLoading(false) }
  }

  const loadVans = async () => {
    if (!eventId) return
    try {
      const res = await adminGetEventVans(eventId)
      setVans(res.data)
    } catch {}
  }

  // ← Actualiza visualmente sin recargar todo
  const handleReassign = async (passengerId, newVanId) => {
    const vanIdToSet = newVanId || null
    try {
      await adminReassignPassenger(passengerId, vanIdToSet)
      toast.success(vanIdToSet ? 'Van asignada ✅' : 'Van removida')
      // Actualizar localmente: assigned_van_id + vans objeto
      setPassengers(prev => prev.map(p => {
        if (p.id !== passengerId) return p
        const vanObj = vanIdToSet ? vans.find(v => v.id === vanIdToSet) : null
        return {
          ...p,
          assigned_van_id: vanIdToSet,
          vans: vanObj ? { id: vanObj.id, name: vanObj.name } : null
        }
      }))
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error reasignando')
    }
  }

  // ← Edición inline de datos del pasajero
  const startEdit = (p) => {
    setEditingId(p.id)
    setEditForm({
      full_name: p.full_name || '',
      email: p.email || '',
      phone: p.phone || '',
      trip_type: p.trip_type || 'round_trip',
      pickup_point: p.pickup_point || '',
      return_point: p.return_point || '',
    })
  }

  const saveEdit = async (passengerId) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth-token')
      const apiUrl = import.meta.env.VITE_API_URL || ''
      const res = await fetch(`${apiUrl}/bookings/passengers/${passengerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      })
      if (!res.ok) throw new Error()
      toast.success('Pasajero actualizado ✅')
      // Actualizar localmente sin recargar
      setPassengers(prev => prev.map(p =>
        p.id === passengerId ? { ...p, ...editForm } : p
      ))
      setEditingId(null)
    } catch { toast.error('Error al guardar') }
  }

  if (loading) return <div className="bpm-loading">Cargando pasajeros...</div>
  if (!passengers.length) return <div className="bpm-empty">ℹ️ Sin datos individuales de pasajeros</div>

  return (
    <div className="bpm">
      <div className="bpm__header">
        <span className="bpm__title">👥 Pasajeros ({passengers.length})</span>
      </div>

      <div className="bpm__list">
        {passengers.map((p, i) => (
          <div key={p.id}>
            {/* ── Vista normal ── */}
            {editingId !== p.id && (
              <div className="bpm__row">
                <div className="bpm__num">{i + 1}</div>

                <div className="bpm__col bpm__col--name">
                  <div className="bpm__label">Pasajero</div>
                  <div className="bpm__name">{p.full_name}</div>
                  {p.email && <div className="bpm__sub">{p.email}</div>}
                  {p.phone && <div className="bpm__sub">{p.phone}</div>}
                </div>

                <div className="bpm__col">
                  <div className="bpm__label">Viaje</div>
                  <span className="bpm__trip">{TRIP_TYPE_LABELS[p.trip_type] || '—'}</span>
                </div>

                <div className="bpm__col">
                  <div className="bpm__label">Recogida</div>
                  <div className="bpm__point">{p.pickup_point || '—'}</div>
                </div>

                <div className="bpm__col">
                  <div className="bpm__label">Retorno</div>
                  <div className="bpm__point">{p.return_point || '—'}</div>
                </div>

                <div className="bpm__col bpm__col--edit">
                  <button
                    className="adm-btn adm-btn--ghost bpm__edit-btn"
                    onClick={() => startEdit(p)}
                    title="Editar pasajero"
                  >
                    <Edit2 size={13} /> Editar
                  </button>
                </div>
              </div>
            )}

            {/* ── Modo edición ── */}
            {editingId === p.id && (
              <div className="bpm__edit-row">
                <div className="bpm__edit-header">
                  <span className="bpm__num">{i + 1}</span>
                  <span style={{fontSize:'13px', fontWeight:'600', color:'var(--text)'}}>Editando: {p.full_name}</span>
                  <button className="adm-btn adm-btn--ghost" onClick={() => setEditingId(null)} style={{marginLeft:'auto', padding:'4px 8px', fontSize:'12px'}}>
                    <X size={13} /> Cancelar
                  </button>
                </div>
                <div className="bpm__edit-grid">
                  <div className="adm-field">
                    <label>Nombre</label>
                    <input value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})} />
                  </div>
                  <div className="adm-field">
                    <label>Email</label>
                    <input value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                  </div>
                  <div className="adm-field">
                    <label>Teléfono</label>
                    <input value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                  </div>
                  <div className="adm-field">
                    <label>Tipo de viaje</label>
                    <select value={editForm.trip_type} onChange={e => setEditForm({...editForm, trip_type: e.target.value})}>
                      <option value="round_trip">Ida y vuelta</option>
                      <option value="outbound_only">Solo ida</option>
                      <option value="return_only">Solo vuelta</option>
                    </select>
                  </div>
                  <div className="adm-field">
                    <label>Punto de recogida</label>
                    <select value={editForm.pickup_point} onChange={e => setEditForm({...editForm, pickup_point: e.target.value})}>
                      <option value="">Seleccionar...</option>
                      {PICKUP_POINTS_LIST.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="adm-field">
                    <label>Punto de retorno</label>
                    <select value={editForm.return_point} onChange={e => setEditForm({...editForm, return_point: e.target.value})}>
                      <option value="">Seleccionar...</option>
                      {PICKUP_POINTS_LIST.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{display:'flex', justifyContent:'flex-end', marginTop:'12px'}}>
                  <button className="adm-btn adm-btn--primary" onClick={() => saveEdit(p.id)} style={{fontSize:'13px'}}>
                    <Save size={13} /> Guardar cambios
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}