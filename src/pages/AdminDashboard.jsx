import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import {
  adminGetBookings, adminConfirmTransfer,
  adminCreateEvent, adminUpdateEvent, adminDeleteEvent, adminUploadEventImage,
  adminGetDrivers, adminCreateDriver, adminVerifyDriver, adminDeleteDriver,
  adminAssignDriver, adminUnassignDriver, adminGetEventDrivers, getEvents,
  adminGetVans, adminCreateVan, adminDeleteVan,
  adminGetEventVans, adminAssignVan, adminUnassignVan,
  adminGetBookingPassengers, adminResendTickets, adminGetStats
} from '../services/api'
import toast from 'react-hot-toast'
import { LogOut, Plus, Check, X, Trash2, Users, UserPlus, Menu, Send, BarChart2, TrendingUp, Ticket } from 'lucide-react'
import BookingPassengersManager from '../components/BookingPassengersManager'
import './AdminDashboard.css'

const TABS = [
  { id: 'bookings', label: '📦 Reservas' },
  { id: 'events',   label: '🎵 Eventos' },
  { id: 'vans',     label: '🚐 Vans' },
  { id: 'stats',    label: '📊 Estadísticas' },
]

// Orden visual: Reservas → Eventos → Vans → Estadísticas ✅

const GENRES = [
  { id: 'otro',        label: '🎼 Otro' },
  { id: 'reggaeton',   label: '🔥 Reggaetón' },
  { id: 'rock',        label: '🎸 Rock' },
  { id: 'pop',         label: '🎤 Pop' },
  { id: 'electronica', label: '🎧 Electrónica' },
  { id: 'cumbia',      label: '🪗 Cumbia' },
  { id: 'hip-hop',     label: '🎙️ Hip-Hop' },
  { id: 'latin',       label: '💃 Latin' },
]

function StatusBadge({ status }) {
  const map = {
    pending:   { label: 'Pendiente',   color: '#f5c518' },
    reserved:  { label: 'Reservado',   color: '#ff6b35' },
    confirmed: { label: 'Confirmado',  color: '#22c55e' },
    rejected:  { label: 'Rechazado',   color: '#ef4444' },
    refunded:  { label: 'Reembolsado', color: '#8b5cf6' },
  }
  const s = map[status] || { label: status, color: '#9090a8' }
  return <span className="status-badge" style={{ '--sc': s.color }}>{s.label}</span>
}

function EventFormModal({ editing, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: editing?.title || '',
    description: editing?.description || '',
    pickup_info: editing?.pickup_info || '',
    event_date: editing?.event_date?.slice(0,16) || '',
    price: editing?.price || '',
    original_price: editing?.original_price || '',
    total_capacity: editing?.total_capacity || '',
    is_round_trip: editing?.is_round_trip ?? true,
    is_active: editing?.is_active ?? true,
    genre: editing?.genre || 'otro',
  })
  const [imageFile, setImageFile] = useState(null)
  const [saving, setSaving] = useState(false)

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
        event_date: new Date(form.event_date).toISOString(),
        genre: form.genre
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
      onSaved()
      onClose()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Error guardando evento')
    } finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card modal-card--wide">
        <div className="modal-header">
          <h3>{editing ? `Editar: ${editing.title}` : 'Nuevo evento'}</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">
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
            <div className="adm-field">
              <label>Género Musical</label>
              <select value={form.genre} onChange={e => setForm({...form, genre: e.target.value})}>
                {GENRES.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
              </select>
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
        </div>
        <div className="modal-footer">
          <button className="adm-btn adm-btn--ghost" onClick={onClose}>Cancelar</button>
          <button className="adm-btn adm-btn--primary" onClick={save} disabled={saving}>
            {saving ? 'Guardando...' : (editing ? 'Actualizar' : 'Crear evento')}
          </button>
        </div>
      </div>
    </div>
  )
}

function AssignVanModal({ event, onClose, onAssigned }) {
  const [vans, setVans] = useState([])
  const [assignedVans, setAssignedVans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([adminGetVans(), adminGetEventVans(event.id)])
      .then(([vansRes, assignedRes]) => {
        setVans(vansRes.data)
        setAssignedVans(assignedRes.data.map(v => v.id))
      })
      .catch(() => toast.error('Error cargando vans'))
      .finally(() => setLoading(false))
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
      const res = await adminUnassignVan(event.id, vanId)
      setAssignedVans(assignedVans.filter(id => id !== vanId))
      toast.success('Van desasignada')
      if (res.data?.warning) toast.error(res.data.warning, { duration: 6000 })
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
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-3)' }}>Cargando vans...</div>
          ) : vans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-3)' }}>No hay vans registradas.</div>
          ) : (
            <div className="drivers-assign-list">
              {vans.map(van => {
                const isAssigned = assignedVans.includes(van.id)
                return (
                  <div key={van.id} className="driver-assign-item">
                    <div className="driver-assign-avatar"><span>🚐</span></div>
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
                      {isAssigned ? <><X size={14} /> Quitar</> : <><Check size={14} /> Asignar</>}
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

function BookingCard({ booking, eventName, onExpand, expanded, onConfirm, onReject, onResend }) {
  return (
    <div className="adm-booking-card">
      <div className="adm-booking-card-header">
        <div style={{ flex: 1 }}>
          <div className="adm-cell-main">{booking.customer_name}</div>
          <div className="adm-cell-sub">{booking.customer_email}</div>
        </div>
        <StatusBadge status={booking.payment_status} />
      </div>
      <div className="adm-booking-card-row">
        <span className="adm-booking-card-label">Evento</span>
        <span className="adm-booking-card-value">{eventName}</span>
      </div>
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <span className="adm-booking-card-label">Cupos</span>
          <div className="adm-booking-card-value">{booking.quantity}</div>
        </div>
        <div style={{ flex: 1 }}>
          <span className="adm-booking-card-label">Total</span>
          <div className="adm-booking-card-value">${Number(booking.total_price).toLocaleString('es-CL')}</div>
        </div>
      </div>
      <div className="adm-booking-card-row">
        <span className="adm-booking-card-label">Método</span>
        <span className="adm-method">
          {booking.payment_method === 'mercadopago' ? '💳 Mercado Pago' : '🏦 Transferencia'}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <button className="adm-btn adm-btn--ghost" onClick={() => onExpand()} style={{ flex: 1 }}>
          {expanded ? '▼ Ocultar' : '▶ Pasajeros'}
        </button>
        {booking.payment_status === 'confirmed' && (
          <button className="adm-btn adm-btn--ghost" onClick={() => onResend()} title="Reenviar tickets">
            <Send size={14} />
          </button>
        )}
        {(booking.payment_status === 'reserved' || booking.payment_status === 'pending') && (
          <>
            <button className="adm-btn adm-btn--success" onClick={() => onConfirm()} title="Confirmar"><Check size={14} /></button>
            <button className="adm-btn adm-btn--danger" onClick={() => onReject()} title="Rechazar"><X size={14} /></button>
          </>
        )}
      </div>
      {expanded && (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)', background: 'var(--bg-2)', padding: '12px', borderRadius: '8px' }}>
          <BookingPassengersManager bookingId={booking.id} eventId={booking.event_id} vans={[]} />
        </div>
      )}
    </div>
  )
}

function BookingsTab() {
  const [bookings, setBookings] = useState([])
  const [events, setEvents] = useState([])
  const [filter, setFilter] = useState('all')
  const [selectedEventId, setSelectedEventId] = useState(null)
  const [showEventDropdown, setShowEventDropdown] = useState(false)
  const [loading, setLoading] = useState(true)
  const [expandedBookings, setExpandedBookings] = useState([])
  const [eventVans, setEventVans] = useState({})
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const load = () => {
    setLoading(true)
    adminGetBookings(filter !== 'all' ? { status: filter } : {})
      .then(r => setBookings(r.data))
      .catch(() => toast.error('Error cargando reservas'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    getEvents(false).then(r => setEvents(r.data)).catch(() => {})
  }, [])

  useEffect(load, [filter])

  const confirm = async (id, approved) => {
    try {
      await adminConfirmTransfer({ booking_id: id, approved })
      toast.success(approved ? 'Transferencia confirmada ✅' : 'Transferencia rechazada')
      load()
    } catch { toast.error('Error al procesar') }
  }

  // ← MEJORA 2: Reenviar tickets
  const resend = async (id) => {
    try {
      await adminResendTickets(id)
      toast.success('Tickets reenviados ✅')
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Error reenviando tickets')
    }
  }

  const loadEventVans = async (eventId) => {
    if (eventVans[eventId]) return
    try {
      const res = await adminGetEventVans(eventId)
      setEventVans(prev => ({...prev, [eventId]: res.data}))
    } catch {}
  }

  const toggleExpandBooking = async (bookingId, eventId) => {
    const isExpanding = !expandedBookings.includes(bookingId)
    setExpandedBookings(prev => prev.includes(bookingId) ? prev.filter(id => id !== bookingId) : [...prev, bookingId])
    if (isExpanding) await loadEventVans(eventId)
  }

  const bookingsFiltrados = selectedEventId ? bookings.filter(b => b.event_id === selectedEventId) : bookings
  const getNombreEvento = (eventId) => events.find(e => e.id === eventId)?.title || 'Evento desconocido'
  const eventoSeleccionado = selectedEventId ? events.find(e => e.id === selectedEventId)?.title : 'Todos los eventos'

  return (
    <div className="adm-tab">
      <div className="adm-tab__header">
        <h2>Reservas</h2>
        <div className="adm-filters-container">
          <div style={{position: 'relative', width: isMobile ? '100%' : '200px'}}>
            <button className="adm-select" onClick={() => setShowEventDropdown(!showEventDropdown)} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}}>
              <span>{eventoSeleccionado}</span>
              <span style={{transform: showEventDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s'}}>▼</span>
            </button>
            {showEventDropdown && (
              <div style={{position:'absolute',top:'100%',left:0,right:0,zIndex:100,marginTop:'4px',background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',boxShadow:'0 4px 12px rgba(0,0,0,0.15)',maxHeight:'300px',overflowY:'auto'}}>
                <div onClick={() => { setSelectedEventId(null); setShowEventDropdown(false) }} style={{padding:'10px 16px',cursor:'pointer',borderBottom:'1px solid var(--border)',background:selectedEventId===null?'rgba(245,197,24,0.1)':'transparent',color:selectedEventId===null?'var(--accent)':'var(--text)',fontWeight:selectedEventId===null?'600':'400'}}>
                  📋 Todos ({bookings.length})
                </div>
                {events.map(evento => {
                  const num = bookings.filter(b => b.event_id === evento.id).length
                  return (
                    <div key={evento.id} onClick={() => { setSelectedEventId(evento.id); setShowEventDropdown(false) }} style={{padding:'10px 16px',cursor:'pointer',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center',background:selectedEventId===evento.id?'rgba(245,197,24,0.1)':'transparent',color:selectedEventId===evento.id?'var(--accent)':'var(--text)',fontWeight:selectedEventId===evento.id?'600':'400'}}>
                      <span>{evento.title}</span>
                      <span style={{fontSize:'12px',background:'var(--bg-2)',padding:'2px 6px',borderRadius:'3px'}}>{num}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          {selectedEventId && (
            <button className="adm-btn adm-btn--ghost" onClick={() => setSelectedEventId(null)} style={{padding:'6px 10px'}}>✕ Limpiar</button>
          )}
          <select value={filter} onChange={e => setFilter(e.target.value)} className="adm-select" style={{width: isMobile ? '100%' : 'auto'}}>
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="reserved">Reservadas</option>
            <option value="confirmed">Confirmadas</option>
            <option value="rejected">Rechazadas</option>
          </select>
        </div>
      </div>

      {selectedEventId && (
        <div style={{fontSize:'13px',color:'var(--text-3)',padding:'8px 0',borderBottom:'1px solid var(--border)',marginBottom:'12px'}}>
          Mostrando {bookingsFiltrados.length} de {bookings.length} reservas
        </div>
      )}

      {loading ? <div className="adm-loading">Cargando...</div> : (
        <>
          {!isMobile && (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th style={{width:'40px'}}></th>
                    <th>Cliente</th><th>Evento</th><th>Cupos</th><th>Total</th><th>Método</th><th>Estado</th><th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingsFiltrados.length === 0 && (
                    <tr><td colSpan={8} style={{textAlign:'center',color:'var(--text-3)',padding:32}}>
                      {selectedEventId ? 'No hay reservas para este evento' : 'Sin resultados'}
                    </td></tr>
                  )}
                  {bookingsFiltrados.map(b => (
                    <>
                      <tr key={b.id}>
                        <td><button onClick={() => toggleExpandBooking(b.id, b.event_id)} className="btn-expand">{expandedBookings.includes(b.id) ? '▼' : '▶'}</button></td>
                        <td><div className="adm-cell-main">{b.customer_name}</div><div className="adm-cell-sub">{b.customer_email}</div></td>
                        <td>{getNombreEvento(b.event_id)}</td>
                        <td>{b.quantity}</td>
                        <td>${Number(b.total_price).toLocaleString('es-CL')}</td>
                        <td><span className="adm-method">{b.payment_method === 'mercadopago' ? '💳 MP' : '🏦 Transf.'}</span></td>
                        <td><StatusBadge status={b.payment_status} /></td>
                        <td>
                          <div className="adm-actions">
                            {/* ← MEJORA 2: Botón reenviar tickets */}
                            {b.payment_status === 'confirmed' && (
                              <button className="adm-btn adm-btn--ghost" onClick={() => resend(b.id)} title="Reenviar tickets por email">
                                <Send size={14} />
                              </button>
                            )}
                            {(b.payment_status === 'reserved' || b.payment_status === 'pending') && (
                              <>
                                <button className="adm-btn adm-btn--success" onClick={() => confirm(b.id, true)} title="Confirmar"><Check size={14} /></button>
                                <button className="adm-btn adm-btn--danger" onClick={() => confirm(b.id, false)} title="Rechazar"><X size={14} /></button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      {expandedBookings.includes(b.id) && (
                        <tr className="expanded-row">
                          <td colSpan={8}>
                            <BookingPassengersManager bookingId={b.id} eventId={b.event_id} vans={eventVans[b.event_id] || []} />
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {isMobile && (
            <div className="adm-booking-cards">
              {bookingsFiltrados.length === 0 && (
                <div style={{textAlign:'center',color:'var(--text-3)',padding:'32px 16px'}}>
                  {selectedEventId ? 'No hay reservas para este evento' : 'Sin resultados'}
                </div>
              )}
              {bookingsFiltrados.map(b => (
                <BookingCard key={b.id} booking={b} eventName={getNombreEvento(b.event_id)}
                  expanded={expandedBookings.includes(b.id)}
                  onExpand={() => toggleExpandBooking(b.id, b.event_id)}
                  onConfirm={() => confirm(b.id, true)}
                  onReject={() => confirm(b.id, false)}
                  onResend={() => resend(b.id)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function EventsTab() {
  const [events, setEvents] = useState([])
  const [editingEvent, setEditingEvent] = useState(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [assigningEvent, setAssigningEvent] = useState(null)
  const [eventVans, setEventVans] = useState({})
  const [search, setSearch] = useState('')

  const load = () => {
    getEvents(false).then(r => {
      setEvents(r.data)
      r.data.forEach(event => {
        adminGetEventVans(event.id).then(res => {
          setEventVans(prev => ({ ...prev, [event.id]: res.data }))
        }).catch(() => {})
      })
    }).catch(() => {})
  }

  useEffect(() => { load() }, [])

  const del = async (id) => {
    if (!confirm('¿Desactivar este evento?')) return
    await adminDeleteEvent(id)
    toast.success('Evento desactivado')
    load()
  }

  const filteredEvents = events.filter(ev =>
    ev.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="adm-tab">
      <div className="adm-tab__header">
        <h2>Eventos</h2>
        <button className="adm-btn adm-btn--primary" onClick={() => setShowNewForm(true)}>
          <Plus size={14} /> Nuevo evento
        </button>
      </div>

      {/* Buscador */}
      <div className="adm-search">
        <span className="adm-search__icon">🔍</span>
        <input
          type="text"
          className="adm-search__input"
          placeholder="Buscar evento..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className="adm-search__clear" onClick={() => setSearch('')}>✕</button>
        )}
      </div>

      <div className="adm-events-list">
        {filteredEvents.length === 0 && (
          <div style={{textAlign:'center', color:'var(--text-3)', padding:'32px'}}>
            No se encontraron eventos para "{search}"
          </div>
        )}
        {filteredEvents.map(ev => {
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
                  {ev.genre && ev.genre !== 'otro' && ` · ${GENRES.find(g => g.id === ev.genre)?.label || ''}`}
                </div>
                {vans.length > 0 && (
                  <div className="adm-event-drivers"><Users size={12} />{vans.map(v => v.name).join(', ')}</div>
                )}
              </div>
              <div className="adm-event-status">
                {ev.is_active
                  ? <span className="status-badge" style={{'--sc':'#22c55e'}}>Activo</span>
                  : <span className="status-badge" style={{'--sc':'#9090a8'}}>Inactivo</span>
                }
              </div>
              <div className="adm-actions">
                <button className="adm-btn adm-btn--primary" onClick={() => setAssigningEvent(ev)} title="Asignar vans"><UserPlus size={14} /></button>
                <button className="adm-btn adm-btn--ghost" onClick={() => setEditingEvent(ev)}>Editar</button>
                <button className="adm-btn adm-btn--danger" onClick={() => del(ev.id)}><Trash2 size={14} /></button>
              </div>
            </div>
          )
        })}
      </div>

      {showNewForm && <EventFormModal editing={null} onClose={() => setShowNewForm(false)} onSaved={load} />}
      {editingEvent && <EventFormModal editing={editingEvent} onClose={() => setEditingEvent(null)} onSaved={load} />}
      {assigningEvent && <AssignVanModal event={assigningEvent} onClose={() => setAssigningEvent(null)} onAssigned={load} />}
    </div>
  )
}

function VansTab() {
  const [vans, setVans] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name:'', license_plate:'', capacity:17, owner_email:'', password:'', current_driver_name:'', current_driver_phone:'' })
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
        <button className="adm-btn adm-btn--primary" onClick={() => setShowForm(!showForm)}><Plus size={14} /> Nueva van</button>
      </div>

      {showForm && (
        <div className="adm-form-card">
          <h3>Registrar van</h3>
          <div className="adm-form-grid">
            <div className="adm-field"><label>Nombre *</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Van 1" /></div>
            <div className="adm-field"><label>Patente</label><input value={form.license_plate} onChange={e => setForm({...form, license_plate: e.target.value})} placeholder="BBDD-12" /></div>
            <div className="adm-field"><label>Capacidad</label><input type="number" value={form.capacity} onChange={e => setForm({...form, capacity: parseInt(e.target.value)})} /></div>
            <div className="adm-field"><label>Email (para login PWA) *</label><input type="email" value={form.owner_email} onChange={e => setForm({...form, owner_email: e.target.value})} placeholder="van1@email.com" /></div>
            <div className="adm-field"><label>Contraseña *</label><input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Mínimo 6 caracteres" /></div>
            <div className="adm-field"><label>Conductor actual</label><input value={form.current_driver_name} onChange={e => setForm({...form, current_driver_name: e.target.value})} placeholder="Juan Pérez" /></div>
            <div className="adm-field"><label>Teléfono conductor</label><input value={form.current_driver_phone} onChange={e => setForm({...form, current_driver_phone: e.target.value})} placeholder="+56912345678" /></div>
          </div>
          <div className="adm-form-actions">
            <button className="adm-btn adm-btn--ghost" onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="adm-btn adm-btn--primary" onClick={save} disabled={saving}>{saving ? 'Guardando...' : 'Crear van'}</button>
          </div>
        </div>
      )}

      <div className="adm-drivers-list">
        {vans.map(v => (
          <div key={v.id} className="adm-driver-row">
            <div className="adm-driver-avatar"><span>🚐</span></div>
            <div className="adm-driver-info">
              <div className="adm-cell-main">{v.name}</div>
              <div className="adm-cell-sub">
                {v.license_plate && `📋 ${v.license_plate} · `}{v.capacity} pasajeros
                {v.current_driver_name && ` · 🧑‍✈️ ${v.current_driver_name}`}
              </div>
            </div>
            <div>{v.is_active ? <span className="status-badge" style={{'--sc':'#22c55e'}}>Activa</span> : <span className="status-badge" style={{'--sc':'#9090a8'}}>Inactiva</span>}</div>
            <div className="adm-actions">
              <button className="adm-btn adm-btn--danger" onClick={() => remove(v.id)}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── MEJORA 3: PESTAÑA DE ESTADÍSTICAS ─────────────────────────────────────────
function StatsTab() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminGetStats()
      .then(r => setStats(r.data))
      .catch(() => toast.error('Error cargando estadísticas'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="adm-loading">Cargando estadísticas...</div>
  if (!stats) return null

  const { summary, by_event } = stats

  return (
    <div className="adm-tab">
      <div className="adm-tab__header">
        <h2>Estadísticas</h2>
      </div>

      {/* Tarjetas resumen */}
      <div className="stats-grid">
        <div className="stats-card">
          <div className="stats-card__icon" style={{background:'rgba(34,197,94,0.1)', color:'#22c55e'}}>
            <TrendingUp size={24} />
          </div>
          <div className="stats-card__info">
            <div className="stats-card__value">${Number(summary.total_revenue).toLocaleString('es-CL')}</div>
            <div className="stats-card__label">Ingresos totales CLP</div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card__icon" style={{background:'rgba(245,197,24,0.1)', color:'#FFB800'}}>
            <Ticket size={24} />
          </div>
          <div className="stats-card__info">
            <div className="stats-card__value">{summary.total_tickets_sold}</div>
            <div className="stats-card__label">Tickets vendidos</div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card__icon" style={{background:'rgba(255,107,53,0.1)', color:'#ff6b35'}}>
            <Users size={24} />
          </div>
          <div className="stats-card__info">
            <div className="stats-card__value">{summary.total_tickets_pending}</div>
            <div className="stats-card__label">Tickets pendientes</div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card__icon" style={{background:'rgba(139,92,246,0.1)', color:'#8b5cf6'}}>
            <BarChart2 size={24} />
          </div>
          <div className="stats-card__info">
            <div className="stats-card__value">{summary.total_events_with_sales}</div>
            <div className="stats-card__label">Eventos con ventas</div>
          </div>
        </div>
      </div>

      {/* Tabla por evento */}
      <div style={{marginTop: '32px'}}>
        <h3 style={{marginBottom: '16px', color: 'var(--text)', fontSize: '16px', fontWeight: '600'}}>
          Desglose por evento
        </h3>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Evento</th>
                <th>Fecha</th>
                <th>Tickets</th>
                <th>💳 MP</th>
                <th>🏦 Transf.</th>
                <th>Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {by_event.length === 0 && (
                <tr><td colSpan={6} style={{textAlign:'center', color:'var(--text-3)', padding:32}}>
                  No hay ventas confirmadas aún
                </td></tr>
              )}
              {by_event.map(ev => (
                <tr key={ev.event_id}>
                  <td><div className="adm-cell-main">{ev.event_title}</div></td>
                  <td><div className="adm-cell-sub">{ev.event_date ? new Date(ev.event_date).toLocaleDateString('es-CL') : '—'}</div></td>
                  <td><strong>{ev.total_tickets}</strong></td>
                  <td>{ev.mercadopago_count}</td>
                  <td>{ev.transfer_count}</td>
                  <td><strong style={{color:'#22c55e'}}>${Number(ev.total_revenue).toLocaleString('es-CL')}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('bookings')
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="adm">
      {isMobile && (
        <button className="adm-mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}><Menu size={24} /></button>
      )}
      <aside className={`adm-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="adm-sidebar__logo"><span>🚐</span><span>VanAlConcierto</span></div>
        <nav className="adm-sidebar__nav">
          {TABS.map(t => (
            <button key={t.id} className={`adm-sidebar__link ${activeTab === t.id ? 'adm-sidebar__link--active' : ''}`} onClick={() => { setActiveTab(t.id); setSidebarOpen(false) }}>
              {t.label}
            </button>
          ))}
        </nav>
        <div className="adm-sidebar__footer">
          <div className="adm-sidebar__user">
            <span className="adm-sidebar__user-name">{user?.full_name}</span>
            <span className="adm-sidebar__user-role">Admin</span>
          </div>
          <button className="adm-sidebar__logout" onClick={logout} title="Cerrar sesión"><LogOut size={16} /></button>
        </div>
      </aside>
      <main className="adm-main">
        {activeTab === 'bookings' && <BookingsTab />}
        {activeTab === 'events'   && <EventsTab />}
        {activeTab === 'vans'     && <VansTab />}
        {activeTab === 'stats'    && <StatsTab />}
      </main>
    </div>
  )
}