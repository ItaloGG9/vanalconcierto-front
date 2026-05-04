import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import {
  adminGetBookings, adminConfirmTransfer,
  adminCreateEvent, adminUpdateEvent, adminDeleteEvent, adminUploadEventImage,
  adminGetDrivers, adminCreateDriver, adminVerifyDriver, adminDeleteDriver,
  adminAssignDriver, adminUnassignDriver, adminGetEventDrivers, getEvents,
  adminGetVans, adminCreateVan, adminDeleteVan,
  adminGetEventVans, adminAssignVan, adminUnassignVan,
  adminGetBookingPassengers
} from '../services/api'
import toast from 'react-hot-toast'
import { LogOut, Plus, Check, X, Trash2, Users, UserPlus } from 'lucide-react'
import BookingPassengersManager from '../components/BookingPassengersManager'
import './AdminDashboard.css'

// ── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'bookings', label: '📦 Reservas' },
  { id: 'events',   label: '🎵 Eventos' },
  { id: 'vans',     label: '🚐 Vans' },
]

// ── Booking status badge ──────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    pending:   { label: 'Pendiente',  color: '#f5c518' },
    reserved:  { label: 'Reservado',  color: '#ff6b35' },
    confirmed: { label: 'Confirmado', color: '#22c55e' },
    rejected:  { label: 'Rechazado',  color: '#ef4444' },
    refunded:  { label: 'Reembolsado',color: '#8b5cf6' },
  }
  const s = map[status] || { label: status, color: '#9090a8' }
  return (
    <span className="status-badge" style={{ '--sc': s.color }}>
      {s.label}
    </span>
  )
}

// ── ASSIGN VAN MODAL ──────────────────────────────────────────────────────────
function AssignVanModal({ event, onClose, onAssigned }) {
  const [vans, setVans] = useState([])
  const [assignedVans, setAssignedVans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminGetVans(),
      adminGetEventVans(event.id)
    ]).then(([vansRes, assignedRes]) => {
      setVans(vansRes.data)
      setAssignedVans(assignedRes.data.map(v => v.id))
    }).catch(() => {
      toast.error('Error cargando vans')
    }).finally(() => {
      setLoading(false)
    })
  }, [event.id])

  const handleAssign = async (vanId) => {
    try {
      await adminAssignVan(event.id, vanId)
      setAssignedVans([...assignedVans, vanId])
      toast.success('Van asignada ✅')
      onAssigned()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Error asignando van')
    }
  }

  const handleUnassign = async (vanId) => {
    try {
      await adminUnassignVan(event.id, vanId)
      setAssignedVans(assignedVans.filter(id => id !== vanId))
      toast.success('Van desasignada')
      onAssigned()
    } catch (e) {
      toast.error('Error desasignando van')
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-header">
          <h3>Asignar vans al evento</h3>
          <p className="modal-subtitle">{event.title}</p>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-3)' }}>
              Cargando vans...
            </div>
          ) : vans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-3)' }}>
              No hay vans registradas. Créalas primero en la pestaña Vans.
            </div>
          ) : (
            <div className="drivers-assign-list">
              {vans.map(van => {
                const isAssigned = assignedVans.includes(van.id)
                return (
                  <div key={van.id} className="driver-assign-item">
                    <div className="driver-assign-avatar">
                      <span>🚐</span>
                    </div>
                    <div className="driver-assign-info">
                      <div className="adm-cell-main">{van.name}</div>
                      <div className="adm-cell-sub">
                        {van.license_plate && `📋 ${van.license_plate} · `}
                        {van.capacity} pasajeros
                        {van.current_driver_name && ` · 🧑‍✈️ ${van.current_driver_name}`}
                      </div>
                    </div>
                    <button
                      className={`adm-btn ${isAssigned ? 'adm-btn--danger' : 'adm-btn--success'}`}
                      onClick={() => isAssigned ? handleUnassign(van.id) : handleAssign(van.id)}
                    >
                      {isAssigned ? (
                        <><X size={14} /> Quitar</>
                      ) : (
                        <><Check size={14} /> Asignar</>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── BOOKINGS TAB ──────────────────────────────────────────────────────────────
function BookingsTab() {
  const [bookings, setBookings] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [expandedBookings, setExpandedBookings] = useState([])
  const [eventVans, setEventVans] = useState({})

  const load = () => {
    setLoading(true)
    adminGetBookings(filter !== 'all' ? { status: filter } : {})
      .then(r => setBookings(r.data))
      .catch(() => toast.error('Error cargando reservas'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [filter])

  const confirm = async (id, approved) => {
    try {
      await adminConfirmTransfer({ booking_id: id, approved })
      toast.success(approved ? 'Transferencia confirmada ✅' : 'Transferencia rechazada')
      load()
    } catch { toast.error('Error al procesar') }
  }

  const loadEventVans = async (eventId) => {
    if (eventVans[eventId]) return
    
    try {
      const res = await adminGetEventVans(eventId)
      setEventVans(prev => ({...prev, [eventId]: res.data}))
    } catch (err) {
      console.error('Error cargando vans:', err)
    }
  }

  const toggleExpandBooking = async (bookingId, eventId) => {
    const isExpanding = !expandedBookings.includes(bookingId)
    
    setExpandedBookings(prev => 
      prev.includes(bookingId) 
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    )
    
    if (isExpanding) {
      await loadEventVans(eventId)
    }
  }

  return (
    <div className="adm-tab">
      <div className="adm-tab__header">
        <h2>Reservas</h2>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="adm-select">
          <option value="all">Todas</option>
          <option value="pending">Pendientes</option>
          <option value="reserved">Reservadas (transferencia)</option>
          <option value="confirmed">Confirmadas</option>
          <option value="rejected">Rechazadas</option>
        </select>
      </div>

      {loading ? <div className="adm-loading">Cargando...</div> : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{width: '40px'}}></th>
                <th>Cliente</th>
                <th>Evento</th>
                <th>Cupos</th>
                <th>Total</th>
                <th>Método</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 && (
                <tr><td colSpan={8} style={{textAlign:'center', color:'var(--text-3)', padding:32}}>Sin resultados</td></tr>
              )}
              {bookings.map(b => (
                <>
                  <tr key={b.id}>
                    <td>
                      <button 
                        onClick={() => toggleExpandBooking(b.id, b.event_id)}
                        className="btn-expand"
                        title="Ver/asignar pasajeros"
                      >
                        {expandedBookings.includes(b.id) ? '▼' : '▶'}
                      </button>
                    </td>
                    <td>
                      <div className="adm-cell-main">{b.customer_name}</div>
                      <div className="adm-cell-sub">{b.customer_email}</div>
                    </td>
                    <td>{b.events?.title || '—'}</td>
                    <td>{b.quantity}</td>
                    <td>${Number(b.total_price).toLocaleString('es-CL')}</td>
                    <td>
                      <span className="adm-method">
                        {b.payment_method === 'mercadopago' ? '💳 MP' : '🏦 Transf.'}
                      </span>
                    </td>
                    <td><StatusBadge status={b.payment_status} /></td>
                    <td>
                      {(b.payment_status === 'reserved' || b.payment_status === 'pending') && (
                        <div className="adm-actions">
                          <button className="adm-btn adm-btn--success" onClick={() => confirm(b.id, true)} title="Confirmar">
                            <Check size={14} />
                          </button>
                          <button className="adm-btn adm-btn--danger" onClick={() => confirm(b.id, false)} title="Rechazar">
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                  
                  {expandedBookings.includes(b.id) && (
                    <tr className="expanded-row">
                      <td colSpan={8}>
                        <BookingPassengersManager 
                          bookingId={b.id}
                          eventId={b.event_id}
                          vans={eventVans[b.event_id] || []}
                        />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── EVENTS TAB ────────────────────────────────────────────────────────────────
function EventsTab() {
  const [events, setEvents] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    title: '', description: '', pickup_info: '', event_date: '',
    price: '', original_price: '', total_capacity: '', is_round_trip: true, is_active: true
  })
  const [imageFile, setImageFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [assigningEvent, setAssigningEvent] = useState(null)
  const [eventVans, setEventVans] = useState({})

  const load = () => {
    getEvents(false).then(r => {
      setEvents(r.data)
      r.data.forEach(event => {
        adminGetEventVans(event.id).then(res => {
          setEventVans(prev => ({
            ...prev,
            [event.id]: res.data
          }))
        }).catch(() => {})
      })
    }).catch(() => {})
  }

  useEffect(() => { load() }, [])

  const openNew = () => {
    setEditing(null)
    setForm({ title:'', description:'', pickup_info:'', event_date:'', price:'', original_price:'', total_capacity:'', is_round_trip:true, is_active:true })
    setShowForm(true)
  }

  const openEdit = (ev) => {
    setEditing(ev)
    setForm({
      title: ev.title,
      description: ev.description || '',
      pickup_info: ev.pickup_info || '',
      event_date: ev.event_date?.slice(0,16) || '',
      price: ev.price,
      original_price: ev.original_price || '',
      total_capacity: ev.total_capacity,
      is_round_trip: ev.is_round_trip,
      is_active: ev.is_active
    })
    setShowForm(true)
  }

  const save = async () => {
    if (!form.title || !form.price || !form.event_date || !form.total_capacity) {
      toast.error('Completa los campos obligatorios')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        total_capacity: parseInt(form.total_capacity),
        event_date: new Date(form.event_date).toISOString()
      }
      let eventId = editing?.id
      if (editing) {
        await adminUpdateEvent(editing.id, payload)
        toast.success('Evento actualizado')
      } else {
        const res = await adminCreateEvent(payload)
        eventId = res.data.id
        toast.success('Evento creado')
      }
      if (imageFile && eventId) {
        await adminUploadEventImage(eventId, imageFile)
        toast.success('Imagen subida')
      }
      setShowForm(false)
      load()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Error guardando evento')
    } finally { setSaving(false) }
  }

  const del = async (id) => {
    if (!confirm('¿Desactivar este evento?')) return
    await adminDeleteEvent(id)
    toast.success('Evento desactivado')
    load()
  }

  return (
    <div className="adm-tab">
      <div className="adm-tab__header">
        <h2>Eventos</h2>
        <button className="adm-btn adm-btn--primary" onClick={openNew}>
          <Plus size={14} /> Nuevo evento
        </button>
      </div>

      {showForm && (
        <div className="adm-form-card">
          <h3>{editing ? 'Editar evento' : 'Nuevo evento'}</h3>
          <div className="adm-form-grid">
            <div className="adm-field adm-field--full">
              <label>Título *</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Nombre del concierto" />
            </div>
            <div className="adm-field">
              <label>Fecha y hora *</label>
              <input type="datetime-local" value={form.event_date} onChange={e => setForm({...form, event_date: e.target.value})} />
            </div>
            <div className="adm-field">
              <label>Capacidad Total *</label>
              <input type="number" value={form.total_capacity} onChange={e => setForm({...form, total_capacity: e.target.value})} placeholder="34" />
            </div>
            <div className="adm-field">
              <label>Precio CLP *</label>
              <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="15000" />
            </div>
            <div className="adm-field">
              <label>Precio original</label>
              <input type="number" value={form.original_price} onChange={e => setForm({...form, original_price: e.target.value})} placeholder="20000" />
            </div>
            <div className="adm-field adm-field--full">
              <label>Puntos de recogida</label>
              <textarea rows={3} value={form.pickup_info} onChange={e => setForm({...form, pickup_info: e.target.value})} placeholder="Punto 1: Plaza Italia 08:00" />
            </div>
            <div className="adm-field adm-field--full">
              <label>Descripción</label>
              <textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div className="adm-field">
              <label>Imagen</label>
              <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
            </div>
            <div className="adm-field adm-field--check">
              <label>
                <input type="checkbox" checked={form.is_round_trip} onChange={e => setForm({...form, is_round_trip: e.target.checked})} />
                Incluye ida y vuelta
              </label>
              <label>
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} />
                Evento activo
              </label>
            </div>
          </div>
          <div className="adm-form-actions">
            <button className="adm-btn adm-btn--ghost" onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="adm-btn adm-btn--primary" onClick={save} disabled={saving}>
              {saving ? 'Guardando...' : (editing ? 'Actualizar' : 'Crear evento')}
            </button>
          </div>
        </div>
      )}

      <div className="adm-events-list">
        {events.map(ev => {
          const vans = eventVans[ev.id] || []
          const available = ev.available_capacity ?? 0
          return (
            <div key={ev.id} className="adm-event-row">
              <div className="adm-event-img">
                {ev.image_url ? <img src={ev.image_url} alt={ev.title} /> : <span>🎵</span>}
              </div>
              <div className="adm-event-info">
                <div className="adm-cell-main">{ev.title}</div>
                <div className="adm-cell-sub">
                  {new Date(ev.event_date).toLocaleDateString('es-CL')} · ${Number(ev.price).toLocaleString('es-CL')} CLP · {available} cupos disponibles
                </div>
                {vans.length > 0 && (
                  <div className="adm-event-drivers">
                    <Users size={12} />
                    {vans.map(v => v.name).join(', ')}
                  </div>
                )}
              </div>
              <div className="adm-event-status">
                {ev.is_active
                  ? <span className="status-badge" style={{'--sc':'#22c55e'}}>Activo</span>
                  : <span className="status-badge" style={{'--sc':'#9090a8'}}>Inactivo</span>
                }
              </div>
              <div className="adm-actions">
                <button 
                  className="adm-btn adm-btn--primary" 
                  onClick={() => setAssigningEvent(ev)}
                  title="Asignar vans"
                >
                  <UserPlus size={14} />
                </button>
                <button className="adm-btn adm-btn--ghost" onClick={() => openEdit(ev)}>Editar</button>
                <button className="adm-btn adm-btn--danger" onClick={() => del(ev.id)}><Trash2 size={14} /></button>
              </div>
            </div>
          )
        })}
      </div>

      {assigningEvent && (
        <AssignVanModal
          event={assigningEvent}
          onClose={() => setAssigningEvent(null)}
          onAssigned={() => load()}
        />
      )}
    </div>
  )
}

// ── VANS TAB ──────────────────────────────────────────────────────────────────
function VansTab() {
  const [vans, setVans] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ 
    name:'', license_plate:'', capacity:17, 
    owner_email:'', password:'', 
    current_driver_name:'', current_driver_phone:'' 
  })
  const [saving, setSaving] = useState(false)

  const load = () => adminGetVans().then(r => setVans(r.data)).catch(() => {})
  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form.name || !form.owner_email || !form.password) {
      toast.error('Completa los campos obligatorios')
      return
    }
    setSaving(true)
    try {
      await adminCreateVan(form)
      toast.success('Van creada exitosamente')
      setShowForm(false)
      setForm({ name:'', license_plate:'', capacity:17, owner_email:'', password:'', current_driver_name:'', current_driver_phone:'' })
      load()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Error creando van')
    } finally { setSaving(false) }
  }

  const remove = async (id) => {
    if (!confirm('¿Eliminar esta van?')) return
    try {
      await adminDeleteVan(id)
      toast.success('Van eliminada')
      load()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Error eliminando van')
    }
  }

  return (
    <div className="adm-tab">
      <div className="adm-tab__header">
        <h2>Vans</h2>
        <button className="adm-btn adm-btn--primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={14} /> Nueva van
        </button>
      </div>

      {showForm && (
        <div className="adm-form-card">
          <h3>Registrar van</h3>
          <div className="adm-form-grid">
            <div className="adm-field">
              <label>Nombre *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Van 1" />
            </div>
            <div className="adm-field">
              <label>Patente</label>
              <input value={form.license_plate} onChange={e => setForm({...form, license_plate: e.target.value})} placeholder="BBDD-12" />
            </div>
            <div className="adm-field">
              <label>Capacidad</label>
              <input type="number" value={form.capacity} onChange={e => setForm({...form, capacity: parseInt(e.target.value)})} />
            </div>
            <div className="adm-field">
              <label>Email (para login PWA) *</label>
              <input type="email" value={form.owner_email} onChange={e => setForm({...form, owner_email: e.target.value})} placeholder="van1@email.com" />
            </div>
            <div className="adm-field">
              <label>Contraseña *</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Mínimo 6 caracteres" />
            </div>
            <div className="adm-field">
              <label>Conductor actual</label>
              <input value={form.current_driver_name} onChange={e => setForm({...form, current_driver_name: e.target.value})} placeholder="Juan Pérez" />
            </div>
            <div className="adm-field">
              <label>Teléfono conductor</label>
              <input value={form.current_driver_phone} onChange={e => setForm({...form, current_driver_phone: e.target.value})} placeholder="+56912345678" />
            </div>
          </div>
          <div className="adm-form-actions">
            <button className="adm-btn adm-btn--ghost" onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="adm-btn adm-btn--primary" onClick={save} disabled={saving}>
              {saving ? 'Guardando...' : 'Crear van'}
            </button>
          </div>
        </div>
      )}

      <div className="adm-drivers-list">
        {vans.map(v => (
          <div key={v.id} className="adm-driver-row">
            <div className="adm-driver-avatar">
              <span>🚐</span>
            </div>
            <div className="adm-driver-info">
              <div className="adm-cell-main">{v.name}</div>
              <div className="adm-cell-sub">
                {v.license_plate && `📋 ${v.license_plate} · `}
                {v.capacity} pasajeros
                {v.current_driver_name && ` · 🧑‍✈️ ${v.current_driver_name}`}
              </div>
            </div>
            <div>
              {v.is_active
                ? <span className="status-badge" style={{'--sc':'#22c55e'}}>Activa</span>
                : <span className="status-badge" style={{'--sc':'#9090a8'}}>Inactiva</span>
              }
            </div>
            <div className="adm-actions">
              <button className="adm-btn adm-btn--danger" onClick={() => remove(v.id)}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('bookings')
  const { user, logout } = useAuthStore()

  return (
    <div className="adm">
      <aside className="adm-sidebar">
        <div className="adm-sidebar__logo">
          <span>🚐</span>
          <span>VanAlConcierto</span>
        </div>

        <nav className="adm-sidebar__nav">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`adm-sidebar__link ${activeTab === t.id ? 'adm-sidebar__link--active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="adm-sidebar__footer">
          <div className="adm-sidebar__user">
            <span className="adm-sidebar__user-name">{user?.full_name}</span>
            <span className="adm-sidebar__user-role">Admin</span>
          </div>
          <button className="adm-sidebar__logout" onClick={logout} title="Cerrar sesión">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <main className="adm-main">
        {activeTab === 'bookings' && <BookingsTab />}
        {activeTab === 'events'   && <EventsTab />}
        {activeTab === 'vans'     && <VansTab />}
      </main>
    </div>
  )
}