import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import {
  adminGetBookings, adminConfirmTransfer,
  adminCreateEvent, adminUpdateEvent, adminDeleteEvent, adminUploadEventImage,
  adminGetDrivers, adminCreateDriver, adminVerifyDriver, adminDeleteDriver,
  adminAssignDriver, adminUnassignDriver, adminGetEventDrivers, getEvents,
  adminGetVans, adminCreateVan, adminDeleteVan,
  adminGetEventVans, adminAssignVan, adminUnassignVan,
  adminGetBookingPassengers, adminResendTickets, adminGetStats,
  adminReassignPassenger,
  adminSuspendEvent, adminReactivateEvent,
  adminGetRefunds, adminMarkRefunded,
  adminArchiveEvent, adminUnarchiveEvent,
  adminAutoArchive, adminGetArchivedEvents
} from '../services/api'
import toast from 'react-hot-toast'
import { LogOut, Plus, Check, X, Trash2, Users, UserPlus, Menu, Send, BarChart2, TrendingUp, Ticket } from 'lucide-react'
import BookingPassengersManager from '../components/BookingPassengersManager'
import PickupTimeSelector from '../components/PickupTimeSelector'
import '../components/PickupTimeSelector.css'
import './AdminDashboard.css'

const TABS = [
  { id: 'bookings', label: '📦 Reservas' },
  { id: 'events',   label: '🎵 Eventos' },
  { id: 'vans',     label: '🚐 Vans' },
  { id: 'stats',    label: '📊 Estadísticas' },
  { id: 'refunds',   label: '💸 Reembolsos' },
  { id: 'archived',  label: '📦 Archivados' },
]

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

function VanAssignCell({ bookingId, eventId, vans }) {
  const [passengers, setPassengers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminGetBookingPassengers(bookingId)
      .then(r => setPassengers(r.data || []))
      .catch(() => setPassengers([]))
      .finally(() => setLoading(false))
  }, [bookingId])

  const handleReassign = async (passengerId, newVanId) => {
    try {
      await adminReassignPassenger(passengerId, newVanId || null)
      const vanObj = vans.find(v => v.id === newVanId)
      setPassengers(prev => prev.map(p =>
        p.id === passengerId
          ? { ...p, assigned_van_id: newVanId || null, vans: vanObj ? { id: vanObj.id, name: vanObj.name } : null }
          : p
      ))
      toast.success(newVanId ? 'Van asignada ✅' : 'Van removida')
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Error asignando')
    }
  }

  if (loading) return <span style={{fontSize:'11px',color:'var(--text-3)'}}>Cargando...</span>
  if (!passengers.length) return <span style={{fontSize:'11px',color:'var(--text-3)'}}>Sin pasajeros</span>

  return (
    <div className="van-cell">
      {passengers.map(p => (
        <div key={p.id} className="van-cell__row">
          <span className="van-cell__name">{p.full_name}</span>
          <select
            className="van-cell__select"
            value={p.assigned_van_id ?? ''}
            onChange={e => handleReassign(p.id, e.target.value)}
          >
            <option value="">Sin asignar</option>
            {vans.map(v => (
              <option key={v.id} value={v.id}>🚐 {v.name}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  )
}

function ManualPassengerModal({ events, onClose, onSaved }) {
  const [form, setForm] = useState({
    event_id: '', customer_name: '', customer_email: '', customer_phone: '',
    full_name: '', pickup_point: '', return_point: '', trip_type: 'round_trip',
    total_price: '', paid_amount: '',
  })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!form.event_id || !form.customer_name || !form.customer_phone) {
      toast.error('Completa los campos obligatorios'); return
    }
    setSaving(true)
    try {
      const token = localStorage.getItem('vac_token')
      const res = await fetch(`${import.meta.env.VITE_API_URL}/bookings/admin/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          event_id: form.event_id,
          customer_name: form.customer_name,
          customer_email: form.customer_email || `manual_${Date.now()}@vanalconcierto.cl`,
          customer_phone: form.customer_phone,
          quantity: 1,
          total_price: parseFloat(form.total_price) || 0,
          paid_amount: parseFloat(form.paid_amount) || 0,
          payment_method: 'manual',
          payment_status: 'confirmed',
          passenger: {
            full_name: form.full_name || form.customer_name,
            pickup_point: form.pickup_point,
            return_point: form.return_point,
            trip_type: form.trip_type,
          }
        })
      })
      if (!res.ok) throw new Error()
      toast.success('Pasajero agregado ✅')
      onSaved(); onClose()
    } catch { toast.error('Error al guardar') }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card modal-card--wide">
        <div className="modal-header">
          <h3>➕ Ingreso manual de pasajero</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">
          <div className="adm-form-grid">
            <div className="adm-field adm-field--full">
              <label>Evento *</label>
              <select value={form.event_id} onChange={e => setForm({...form, event_id: e.target.value})}>
                <option value="">Seleccionar evento...</option>
                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
              </select>
            </div>
            <div className="adm-field"><label>Nombre cliente *</label><input value={form.customer_name} onChange={e => setForm({...form, customer_name: e.target.value})} placeholder="Juan Pérez" /></div>
            <div className="adm-field"><label>Teléfono *</label><input value={form.customer_phone} onChange={e => setForm({...form, customer_phone: e.target.value})} placeholder="+56912345678" /></div>
            <div className="adm-field"><label>Email</label><input value={form.customer_email} onChange={e => setForm({...form, customer_email: e.target.value})} placeholder="correo@email.com" /></div>
            <div className="adm-field">
              <label>Tipo de viaje</label>
              <select value={form.trip_type} onChange={e => setForm({...form, trip_type: e.target.value})}>
                <option value="round_trip">Ida y vuelta</option>
                <option value="outbound_only">Solo ida</option>
                <option value="return_only">Solo vuelta</option>
              </select>
            </div>
            <div className="adm-field">
              <label>Punto de recogida</label>
              <select value={form.pickup_point} onChange={e => setForm({...form, pickup_point: e.target.value})}>
                <option value="">Seleccionar...</option>
                {PICKUP_POINTS_LIST.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="adm-field">
              <label>Punto de retorno</label>
              <select value={form.return_point} onChange={e => setForm({...form, return_point: e.target.value})}>
                <option value="">Seleccionar...</option>
                {PICKUP_POINTS_LIST.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="adm-field"><label>Total CLP</label><input type="number" value={form.total_price} onChange={e => setForm({...form, total_price: e.target.value})} placeholder="15000" /></div>
            <div className="adm-field"><label>Ya pagado CLP</label><input type="number" value={form.paid_amount} onChange={e => setForm({...form, paid_amount: e.target.value})} placeholder="0" /></div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="adm-btn adm-btn--ghost" onClick={onClose}>Cancelar</button>
          <button className="adm-btn adm-btn--primary" onClick={save} disabled={saving}>{saving ? 'Guardando...' : 'Agregar pasajero'}</button>
        </div>
      </div>
    </div>
  )
}

function BookingCard({ booking, eventName, onExpand, expanded, onConfirm, onReject, onResend, onConfirmPending, eventVans }) {
  const pending = Math.max(0, Number(booking.total_price) - Number(booking.paid_amount ?? booking.total_price))
  const paid = Number(booking.paid_amount ?? booking.total_price)
  const isMpReserved = booking.payment_method === 'mercadopago' && booking.payment_status === 'reserved'

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
      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ flex: 1 }}><span className="adm-booking-card-label">Cupos</span><div className="adm-booking-card-value">{booking.quantity}</div></div>
        <div style={{ flex: 1 }}><span className="adm-booking-card-label">Total</span><div className="adm-booking-card-value">${Number(booking.total_price).toLocaleString('es-CL')}</div></div>
        <div style={{ flex: 1 }}><span className="adm-booking-card-label">Pagado</span><div className="adm-booking-card-value" style={{color:'#22c55e'}}>${paid.toLocaleString('es-CL')}</div></div>
        {pending > 0 && (
          <div style={{ flex: 1 }}>
            <span className="adm-booking-card-label">Pendiente</span>
            <div style={{display:'flex',alignItems:'center',gap:'4px'}}>
              <span className="adm-booking-card-value" style={{
                color: Number(booking.paid_amount ?? 0) >= Number(booking.total_price) ? '#22c55e' : '#ff6b35'
              }}>${pending.toLocaleString('es-CL')}</span>
              {Number(booking.paid_amount ?? 0) < Number(booking.total_price) && (
                <button className="adm-btn adm-btn--success" style={{padding:'2px 6px',fontSize:'10px'}} onClick={onConfirmPending} title="Confirmar segundo pago">✓</button>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="adm-booking-card-row">
        <span className="adm-booking-card-label">Método</span>
        <span className="adm-method">
          {booking.payment_method === 'mercadopago' ? '💳 MP' : booking.payment_method === 'manual' ? '🤝 Manual' : '🏦 Transf.'}
          {booking.payment_plan === '50%' && <span style={{fontSize:'10px',color:'#ff6b35',marginLeft:'4px'}}>· 2 partes</span>}
        </span>
      </div>
      <div style={{marginTop:'8px'}}>
        <div className="adm-booking-card-label" style={{marginBottom:'6px'}}>Asignación de van</div>
        <VanAssignCell bookingId={booking.id} eventId={booking.event_id} vans={eventVans || []} />
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <button className="adm-btn adm-btn--ghost" onClick={() => onExpand()} style={{ flex: 1 }}>
          {expanded ? '▼ Ocultar info' : '▶ Ver detalle'}
        </button>
        {(booking.payment_status === 'confirmed' || booking.payment_status === 'reserved') && (
          <button className="adm-btn adm-btn--ghost" onClick={() => onResend()} title="Reenviar tickets"><Send size={14} /></button>
        )}
        {(booking.payment_status === 'reserved' || booking.payment_status === 'pending') && !isMpReserved && (
          <>
            <button className="adm-btn adm-btn--success" onClick={() => onConfirm()} title="Confirmar"><Check size={14} /></button>
            <button className="adm-btn adm-btn--danger" onClick={() => onReject()} title="Rechazar"><X size={14} /></button>
          </>
        )}
      </div>
      {expanded && (
        <div style={{ marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
          <BookingPassengersManager bookingId={booking.id} eventId={booking.event_id} vans={eventVans || []} />
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
  const [showManual, setShowManual] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const load = () => {
    setLoading(true)
    adminGetBookings(filter !== 'all' ? { status: filter } : {})
      .then(r => {
        const data = filter === 'all'
          ? r.data.filter(b => b.payment_status !== 'rejected')
          : r.data
        setBookings(data)
      })
      .catch(() => toast.error('Error cargando reservas'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { getEvents(false).then(r => setEvents(r.data)).catch(() => {}) }, [])
  useEffect(load, [filter])

  const confirm = async (id, approved) => {
    try {
      await adminConfirmTransfer({ booking_id: id, approved })
      toast.success(approved ? 'Confirmado ✅' : 'Rechazado')
      load()
    } catch { toast.error('Error al procesar') }
  }

  const confirmPending = async (id) => {
    try {
      await adminConfirmTransfer({ booking_id: id, approved: true })
      toast.success('Segundo pago confirmado ✅')
      load()
    } catch { toast.error('Error al confirmar') }
  }

  const resend = async (id) => {
    try {
      await adminResendTickets(id)
      toast.success('Tickets reenviados ✅')
    } catch (e) { toast.error(e.response?.data?.detail || 'Error reenviando tickets') }
  }

  const loadEventVans = async (eventId) => {
    if (eventVans[eventId]) return
    try {
      const res = await adminGetEventVans(eventId)
      setEventVans(prev => ({...prev, [eventId]: res.data}))
    } catch {}
  }

  useEffect(() => {
    bookings.forEach(b => { if (!eventVans[b.event_id]) loadEventVans(b.event_id) })
  }, [bookings])

  const toggleExpand = async (bookingId, eventId) => {
    setExpandedBookings(prev =>
      prev.includes(bookingId) ? prev.filter(id => id !== bookingId) : [...prev, bookingId]
    )
    await loadEventVans(eventId)
  }

  const bookingsFiltrados = selectedEventId ? bookings.filter(b => b.event_id === selectedEventId) : bookings
  const getNombreEvento = (eventId) => events.find(e => e.id === eventId)?.title || 'Evento desconocido'
  const eventoSeleccionado = selectedEventId ? events.find(e => e.id === selectedEventId)?.title : 'Todos los eventos'

  return (
    <div className="adm-tab">
      <div className="adm-tab__header">
        <h2>Reservas</h2>
        <button className="adm-btn adm-btn--primary" onClick={() => setShowManual(true)}>
          <Plus size={14} /> Ingreso manual
        </button>
      </div>

      <div className="adm-filters-container">
        <div style={{position:'relative', width: isMobile ? '100%' : '200px'}}>
          <button className="adm-select" onClick={() => setShowEventDropdown(!showEventDropdown)} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}}>
            <span>{eventoSeleccionado}</span>
            <span style={{transform: showEventDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition:'transform 0.3s'}}>▼</span>
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
                    <th>Cliente</th>
                    <th>Evento</th>
                    <th>Van por pasajero</th>
                    <th>Cupos</th>
                    <th>Total</th>
                    <th>Pagado</th>
                    <th>Pendiente</th>
                    <th>Método</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingsFiltrados.length === 0 && (
                    <tr><td colSpan={11} style={{textAlign:'center',color:'var(--text-3)',padding:32}}>
                      {selectedEventId ? 'No hay reservas para este evento' : 'Sin resultados'}
                    </td></tr>
                  )}
                  {bookingsFiltrados.map(b => {
                    const paid = Number(b.paid_amount ?? b.total_price)
                    const pending = Math.max(0, Number(b.total_price) - paid)
                    const isMpReserved = b.payment_method === 'mercadopago' && b.payment_status === 'reserved'
                    return (
                      <>
                        <tr key={b.id}>
                          <td><button onClick={() => toggleExpand(b.id, b.event_id)} className="btn-expand">{expandedBookings.includes(b.id) ? '▼' : '▶'}</button></td>
                          <td>
                            <div className="adm-cell-main">{b.customer_name}</div>
                            <div className="adm-cell-sub">{b.customer_email}</div>
                          </td>
                          <td><div className="adm-cell-sub">{getNombreEvento(b.event_id)}</div></td>
                          <td><VanAssignCell bookingId={b.id} eventId={b.event_id} vans={eventVans[b.event_id] || []} /></td>
                          <td>{b.quantity}</td>
                          <td>${Number(b.total_price).toLocaleString('es-CL')}</td>
                          <td style={{color:'#22c55e'}}>${paid.toLocaleString('es-CL')}</td>
                          <td>
                            {pending > 0 ? (
                              <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                                <span style={{color: b.paid_amount >= b.total_price ? '#22c55e' : '#ff6b35', fontWeight:'600'}}>
                                  ${pending.toLocaleString('es-CL')}
                                </span>
                                {Number(b.paid_amount ?? 0) < Number(b.total_price) && (
                                  <button className="adm-btn adm-btn--success" style={{padding:'3px 7px',fontSize:'11px'}} onClick={() => confirmPending(b.id)} title="Confirmar segundo pago">✓</button>
                                )}
                              </div>
                            ) : <span style={{color:'var(--text-3)'}}>—</span>}
                          </td>
                          <td>
                            <div><span className="adm-method">{b.payment_method === 'mercadopago' ? '💳 MP' : b.payment_method === 'manual' ? '🤝 Manual' : '🏦 Transf.'}</span></div>
                            {b.payment_plan === '50%' && <div style={{fontSize:'10px',color:'#ff6b35',fontFamily:'var(--font-mono)',marginTop:'2px'}}>2 partes</div>}
                          </td>
                          <td><StatusBadge status={b.payment_status} /></td>
                          <td>
                            <div className="adm-actions">
                              {(b.payment_status === 'confirmed' || (b.payment_status === 'reserved' && isMpReserved)) && (
                                <button className="adm-btn adm-btn--ghost" onClick={() => resend(b.id)} title="Reenviar tickets"><Send size={14} /></button>
                              )}
                              {(b.payment_status === 'reserved' || b.payment_status === 'pending') && !isMpReserved && (
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
                            <td colSpan={11} style={{padding:'0', background:'var(--bg-2)'}}>
                              <BookingPassengersManager bookingId={b.id} eventId={b.event_id} vans={eventVans[b.event_id] || []} />
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })}
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
                <BookingCard key={b.id} booking={b}
                  eventName={getNombreEvento(b.event_id)}
                  expanded={expandedBookings.includes(b.id)}
                  onExpand={() => toggleExpand(b.id, b.event_id)}
                  onConfirm={() => confirm(b.id, true)}
                  onReject={() => confirm(b.id, false)}
                  onResend={() => resend(b.id)}
                  onConfirmPending={() => confirmPending(b.id)}
                  eventVans={eventVans[b.event_id] || []}
                />
              ))}
            </div>
          )}
        </>
      )}

      {showManual && (
        <ManualPassengerModal events={events} onClose={() => setShowManual(false)} onSaved={load} />
      )}
    </div>
  )
}

function EventFormModal({ editing, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: editing?.title || '', description: editing?.description || '',
    pickup_info: editing?.pickup_info || '', event_date: editing?.event_date?.slice(0,16) || '',
    price: editing?.price || '', price_one_way: editing?.price_one_way || '',
    original_price: editing?.original_price || '',
    total_capacity: editing?.total_capacity || '', is_round_trip: editing?.is_round_trip ?? true,
    is_active: editing?.is_active ?? true, genre: editing?.genre || 'otro',
  })
  const [imageFile, setImageFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!form.title || !form.price || !form.event_date || !form.total_capacity) { toast.error('Completa los campos obligatorios'); return }
    setSaving(true)
    try {
      const payload = { ...form, price: parseFloat(form.price), price_one_way: form.price_one_way ? parseFloat(form.price_one_way) : null, original_price: form.original_price ? parseFloat(form.original_price) : null, total_capacity: parseInt(form.total_capacity), event_date: new Date(form.event_date).toISOString() }
      let eventId = editing?.id
      if (editing) { await adminUpdateEvent(editing.id, payload); toast.success('Evento actualizado') }
      else { const res = await adminCreateEvent(payload); eventId = res.data.id; toast.success('Evento creado') }
      if (imageFile && eventId) { await adminUploadEventImage(eventId, imageFile); toast.success('Imagen subida') }
      onSaved(); onClose()
    } catch (e) { toast.error(e.response?.data?.detail || 'Error guardando evento') }
    finally { setSaving(false) }
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
            <div className="adm-field adm-field--full"><label>Título *</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Nombre del concierto" /></div>
            <div className="adm-field"><label>Fecha y hora *</label><input type="datetime-local" value={form.event_date} onChange={e => setForm({...form, event_date: e.target.value})} /></div>
            <div className="adm-field"><label>Capacidad Total *</label><input type="number" value={form.total_capacity} onChange={e => setForm({...form, total_capacity: e.target.value})} placeholder="34" /></div>
            <div className="adm-field">
              <label>Precio ida y vuelta CLP *</label>
              <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="19000" />
            </div>
            <div className="adm-field">
              <label>Precio solo ida / solo vuelta CLP</label>
              <input type="number" value={form.price_one_way} onChange={e => setForm({...form, price_one_way: e.target.value})} placeholder="16000 (opcional)" />
              <span style={{fontSize:'11px',color:'var(--text-3)',marginTop:'2px'}}>Si lo dejas vacío, no aparece la opción de solo ida/vuelta</span>
            </div>
            <div className="adm-field"><label>Precio original (tachado)</label><input type="number" value={form.original_price} onChange={e => setForm({...form, original_price: e.target.value})} placeholder="20000" /></div>
            <div className="adm-field"><label>Género Musical</label><select value={form.genre} onChange={e => setForm({...form, genre: e.target.value})}>{GENRES.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}</select></div>
            <div className="adm-field adm-field--full"><label>Puntos de recogida</label><PickupTimeSelector value={form.pickup_info} onChange={(v) => setForm({...form, pickup_info: v})} /></div>
            <div className="adm-field adm-field--full"><label>Descripción</label><textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
            <div className="adm-field"><label>Imagen</label><input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} /></div>
            <div className="adm-field adm-field--check">
              <label><input type="checkbox" checked={form.is_round_trip} onChange={e => setForm({...form, is_round_trip: e.target.checked})} /> Incluye ida y vuelta</label>
              <label><input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} /> Evento activo</label>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="adm-btn adm-btn--ghost" onClick={onClose}>Cancelar</button>
          <button className="adm-btn adm-btn--primary" onClick={save} disabled={saving}>{saving ? 'Guardando...' : (editing ? 'Actualizar' : 'Crear evento')}</button>
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
      .then(([vansRes, assignedRes]) => { setVans(vansRes.data); setAssignedVans(assignedRes.data.map(v => v.id)) })
      .catch(() => toast.error('Error cargando vans'))
      .finally(() => setLoading(false))
  }, [event.id])
  const handleAssign = async (vanId) => {
    try { await adminAssignVan(event.id, vanId); setAssignedVans([...assignedVans, vanId]); toast.success('Van asignada ✅'); onAssigned() }
    catch (e) { toast.error(e.response?.data?.detail || 'Error asignando van') }
  }
  const handleUnassign = async (vanId) => {
    try { const res = await adminUnassignVan(event.id, vanId); setAssignedVans(assignedVans.filter(id => id !== vanId)); toast.success('Van desasignada'); if (res.data?.warning) toast.error(res.data.warning, { duration: 6000 }); onAssigned() }
    catch (e) { toast.error('Error desasignando van') }
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
          {loading ? <div style={{textAlign:'center',padding:'32px',color:'var(--text-3)'}}>Cargando vans...</div>
          : vans.length === 0 ? <div style={{textAlign:'center',padding:'32px',color:'var(--text-3)'}}>No hay vans registradas.</div>
          : (
            <div className="drivers-assign-list">
              {vans.map(van => {
                const isAssigned = assignedVans.includes(van.id)
                return (
                  <div key={van.id} className="driver-assign-item">
                    <div className="driver-assign-avatar"><span>🚐</span></div>
                    <div className="driver-assign-info">
                      <div className="adm-cell-main">{van.name}</div>
                      <div className="adm-cell-sub">{van.license_plate && `📋 ${van.license_plate} · `}{van.capacity} pasajeros{van.current_driver_name && ` · 🧑‍✈️ ${van.current_driver_name}`}</div>
                    </div>
                    <button className={`adm-btn ${isAssigned ? 'adm-btn--danger' : 'adm-btn--success'}`} onClick={() => isAssigned ? handleUnassign(van.id) : handleAssign(van.id)}>
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

function EventsTab() {
  const [events, setEvents] = useState([])
  const [editingEvent, setEditingEvent] = useState(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [assigningEvent, setAssigningEvent] = useState(null)
  const [eventVans, setEventVans] = useState({})
  const [search, setSearch] = useState('')
  const load = () => {
    getEvents(false).then(r => {
      const active = r.data.filter(ev => !ev.is_archived)
      setEvents(active)
      active.forEach(event => adminGetEventVans(event.id).then(res => setEventVans(prev => ({ ...prev, [event.id]: res.data }))).catch(() => {}))
    }).catch(() => {})
  }
  useEffect(() => {
    adminAutoArchive().catch(() => {})
    load()
  }, [])
  const del = async (id) => {
    if (!confirm('¿Desactivar este evento?')) return
    await adminDeleteEvent(id); toast.success('Evento desactivado'); load()
  }
  const filteredEvents = events.filter(ev => ev.title.toLowerCase().includes(search.toLowerCase()))
  return (
    <div className="adm-tab">
      <div className="adm-tab__header"><h2>Eventos</h2><button className="adm-btn adm-btn--primary" onClick={() => setShowNewForm(true)}><Plus size={14} /> Nuevo evento</button></div>
      <div className="adm-search">
        <span className="adm-search__icon">🔍</span>
        <input type="text" className="adm-search__input" placeholder="Buscar evento..." value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button className="adm-search__clear" onClick={() => setSearch('')}>✕</button>}
      </div>
      <div className="adm-events-list">
        {filteredEvents.length === 0 && <div style={{textAlign:'center',color:'var(--text-3)',padding:'32px'}}>No se encontraron eventos</div>}
        {filteredEvents.map(ev => {
          const vans = eventVans[ev.id] || []
          const available = ev.available_capacity ?? 0
          return (
            <div key={ev.id} className="adm-event-row">
              <div className="adm-event-img">{ev.image_url ? <img src={ev.image_url} alt={ev.title} /> : <span>🎵</span>}</div>
              <div className="adm-event-info">
                <div className="adm-cell-main">{ev.title}</div>
                <div className="adm-cell-sub">{new Date(ev.event_date).toLocaleDateString('es-CL')} · ${Number(ev.price).toLocaleString('es-CL')} CLP · {available} cupos{ev.genre && ev.genre !== 'otro' && ` · ${GENRES.find(g => g.id === ev.genre)?.label || ''}`}</div>
                {vans.length > 0 && <div className="adm-event-drivers"><Users size={12} />{vans.map(v => v.name).join(', ')}</div>}
              </div>
              <div className="adm-event-status">
                {ev.is_suspended
                  ? <span className="status-badge" style={{'--sc':'#ef4444'}}>Suspendido</span>
                  : ev.is_active
                  ? <span className="status-badge" style={{'--sc':'#22c55e'}}>Activo</span>
                  : <span className="status-badge" style={{'--sc':'#9090a8'}}>Inactivo</span>}
              </div>
              <div className="adm-actions">
                <button className="adm-btn adm-btn--primary" onClick={() => setAssigningEvent(ev)} title="Asignar vans"><UserPlus size={14} /></button>
                <button className="adm-btn adm-btn--ghost" onClick={() => setEditingEvent(ev)}>Editar</button>
                {ev.is_suspended ? (
                  <button className="adm-btn adm-btn--success" onClick={async () => { await adminReactivateEvent(ev.id); toast.success('Evento reactivado ✅'); load() }}>✅ Reactivar</button>
                ) : (
                  <button style={{background:'#f59e0b',color:'#000',border:'none',padding:'6px 10px',borderRadius:'6px',fontSize:'12px',cursor:'pointer',fontWeight:'600'}}
                    onClick={async () => { if (!confirm('¿Suspender este evento? Todas las reservas pasarán a reembolso pendiente.')) return; await adminSuspendEvent(ev.id); toast.success('Evento suspendido'); load() }}>
                    ⚠️ Suspender
                  </button>
                )}
                <button style={{background:'var(--bg-2)',color:'var(--text-3)',border:'1px solid var(--border)',padding:'6px 10px',borderRadius:'6px',fontSize:'12px',cursor:'pointer'}}
                  onClick={async () => { if (!confirm('¿Archivar este evento?')) return; await adminArchiveEvent(ev.id); toast.success('Evento archivado 📦'); load() }}>
                  📦 Archivar
                </button>
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
    if (!form.name || !form.owner_email || !form.password) { toast.error('Completa los campos obligatorios'); return }
    setSaving(true)
    try { await adminCreateVan(form); toast.success('Van creada'); setShowForm(false); setForm({ name:'', license_plate:'', capacity:17, owner_email:'', password:'', current_driver_name:'', current_driver_phone:'' }); load() }
    catch (e) { toast.error(e.response?.data?.detail || 'Error creando van') }
    finally { setSaving(false) }
  }
  const remove = async (id) => {
    if (!confirm('¿Eliminar esta van?')) return
    try { await adminDeleteVan(id); toast.success('Van eliminada'); load() }
    catch (e) { toast.error(e.response?.data?.detail || 'Error eliminando van') }
  }
  return (
    <div className="adm-tab">
      <div className="adm-tab__header"><h2>Vans</h2><button className="adm-btn adm-btn--primary" onClick={() => setShowForm(!showForm)}><Plus size={14} /> Nueva van</button></div>
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
            <div className="adm-driver-info"><div className="adm-cell-main">{v.name}</div><div className="adm-cell-sub">{v.license_plate && `📋 ${v.license_plate} · `}{v.capacity} pasajeros{v.current_driver_name && ` · 🧑‍✈️ ${v.current_driver_name}`}</div></div>
            <div>{v.is_active ? <span className="status-badge" style={{'--sc':'#22c55e'}}>Activa</span> : <span className="status-badge" style={{'--sc':'#9090a8'}}>Inactiva</span>}</div>
            <div className="adm-actions"><button className="adm-btn adm-btn--danger" onClick={() => remove(v.id)}><Trash2 size={14} /></button></div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatsTab() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { adminGetStats().then(r => setStats(r.data)).catch(() => toast.error('Error')).finally(() => setLoading(false)) }, [])
  if (loading) return <div className="adm-loading">Cargando estadísticas...</div>
  if (!stats) return null
  const { summary, by_event } = stats
  return (
    <div className="adm-tab">
      <div className="adm-tab__header"><h2>Estadísticas</h2></div>
      <div className="stats-grid">
        <div className="stats-card"><div className="stats-card__icon" style={{background:'rgba(34,197,94,0.1)',color:'#22c55e'}}><TrendingUp size={24} /></div><div className="stats-card__info"><div className="stats-card__value">${Number(summary.total_revenue).toLocaleString('es-CL')}</div><div className="stats-card__label">Ingresos totales CLP</div></div></div>
        <div className="stats-card"><div className="stats-card__icon" style={{background:'rgba(245,197,24,0.1)',color:'#FFB800'}}><Ticket size={24} /></div><div className="stats-card__info"><div className="stats-card__value">{summary.total_tickets_sold}</div><div className="stats-card__label">Tickets vendidos</div></div></div>
        <div className="stats-card"><div className="stats-card__icon" style={{background:'rgba(255,107,53,0.1)',color:'#ff6b35'}}><Users size={24} /></div><div className="stats-card__info"><div className="stats-card__value">{summary.total_tickets_pending}</div><div className="stats-card__label">Tickets pendientes</div></div></div>
        <div className="stats-card"><div className="stats-card__icon" style={{background:'rgba(139,92,246,0.1)',color:'#8b5cf6'}}><BarChart2 size={24} /></div><div className="stats-card__info"><div className="stats-card__value">{summary.total_events_with_sales}</div><div className="stats-card__label">Eventos con ventas</div></div></div>
      </div>
      <div style={{marginTop:'32px'}}>
        <h3 style={{marginBottom:'16px',color:'var(--text)',fontSize:'16px',fontWeight:'600'}}>Desglose por evento</h3>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>Evento</th><th>Fecha</th><th>Tickets</th><th>💳 MP</th><th>🏦 Transf.</th><th>Ingresos</th></tr></thead>
            <tbody>
              {by_event.length === 0 && <tr><td colSpan={6} style={{textAlign:'center',color:'var(--text-3)',padding:32}}>Sin ventas confirmadas</td></tr>}
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

function RefundsTab() {
  const [refunds, setRefunds] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [notes, setNotes] = useState({})

  const load = () => {
    setLoading(true)
    adminGetRefunds()
      .then(r => setRefunds(r.data))
      .catch(() => toast.error('Error cargando reembolsos'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const markRefunded = async (id) => {
    try {
      await adminMarkRefunded(id, notes[id] || '')
      toast.success('Reembolso confirmado ✅')
      load()
    } catch { toast.error('Error al confirmar reembolso') }
  }

  const filtered = refunds.filter(r =>
    filter === 'all' ? true : r.refund_status === filter
  )

  return (
    <div className="adm-tab">
      <div className="adm-tab__header">
        <h2>Reembolsos</h2>
        <span style={{fontSize:'13px',color:'var(--text-3)'}}>
          {refunds.filter(r => r.refund_status === 'pending').length} pendientes
        </span>
      </div>

      <div className="adm-filters-container">
        <select value={filter} onChange={e => setFilter(e.target.value)} className="adm-select">
          <option value="pending">⏳ Pendientes</option>
          <option value="refunded">✅ Reembolsados</option>
          <option value="all">Todos</option>
        </select>
      </div>

      {loading ? <div className="adm-loading">Cargando...</div> : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Evento</th>
                <th>Total</th>
                <th>Pagado</th>
                <th>A reembolsar</th>
                <th>Método</th>
                <th>Estado</th>
                <th>Notas</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={9} style={{textAlign:'center',color:'var(--text-3)',padding:32}}>
                  {filter === 'pending' ? 'No hay reembolsos pendientes 🎉' : 'Sin resultados'}
                </td></tr>
              )}
              {filtered.map(b => {
                const paid = Number(b.paid_amount ?? b.total_price)
                const isPending = b.refund_status === 'pending'
                return (
                  <tr key={b.id}>
                    <td>
                      <div className="adm-cell-main">{b.customer_name}</div>
                      <div className="adm-cell-sub">{b.customer_phone}</div>
                      <div className="adm-cell-sub">{b.customer_email}</div>
                    </td>
                    <td>
                      <div className="adm-cell-main">{b.events?.title || '—'}</div>
                      {b.events?.is_suspended && (
                        <div className="adm-cell-sub" style={{color:'#ef4444',fontSize:'11px'}}>⚠️ Suspendido</div>
                      )}
                    </td>
                    <td>${Number(b.total_price).toLocaleString('es-CL')}</td>
                    <td style={{color:'#22c55e'}}>${paid.toLocaleString('es-CL')}</td>
                    <td style={{color:'#f59e0b',fontWeight:'600'}}>${paid.toLocaleString('es-CL')}</td>
                    <td>
                      <span className="adm-method">
                        {b.payment_method === 'mercadopago' ? '💳 MP' : b.payment_method === 'manual' ? '🤝 Manual' : '🏦 Transf.'}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={isPending ? 'pending' : 'refunded'} />
                      {b.refunded_at && (
                        <div className="adm-cell-sub">{new Date(b.refunded_at).toLocaleDateString('es-CL')}</div>
                      )}
                    </td>
                    <td>
                      {isPending ? (
                        <input
                          placeholder="Nota opcional"
                          value={notes[b.id] || ''}
                          onChange={e => setNotes(prev => ({...prev, [b.id]: e.target.value}))}
                          style={{width:'120px',fontSize:'12px',background:'var(--bg-2)',border:'1px solid var(--border)',borderRadius:'6px',padding:'4px 8px',color:'var(--text)'}}
                        />
                      ) : (
                        <span style={{fontSize:'12px',color:'var(--text-3)'}}>{b.refund_notes || '—'}</span>
                      )}
                    </td>
                    <td>
                      {isPending && (
                        <button className="adm-btn adm-btn--success" onClick={() => markRefunded(b.id)}>
                          ✓ Confirmar
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={{marginTop:'20px',padding:'16px',background:'var(--bg-2)',borderRadius:'10px',fontSize:'13px',color:'var(--text-3)',lineHeight:'1.7'}}>
        <strong style={{color:'var(--text)'}}>💡 Flujo de reembolso:</strong><br/>
        1. Ve a <strong>Eventos</strong> y presiona <strong>⚠️ Suspender</strong> en el evento cancelado.<br/>
        2. Todas las reservas confirmadas aparecen aquí como pendientes.<br/>
        3. Devuelve el dinero manualmente por transferencia o MP al cliente.<br/>
        4. Marca <strong>✓ Confirmar</strong> para registrar que se hizo el reembolso.
      </div>
    </div>
  )
}


// ── ARCHIVED TAB ──────────────────────────────────────────────────────────────
function ArchivedTab() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminGetArchivedEvents()
      .then(r => setEvents(r.data))
      .catch(() => toast.error('Error cargando archivados'))
      .finally(() => setLoading(false))
  }, [])

  const unarchive = async (id) => {
    try {
      await adminUnarchiveEvent(id)
      toast.success('Evento restaurado ✅')
      setEvents(prev => prev.filter(e => e.id !== id))
    } catch { toast.error('Error al restaurar') }
  }

  return (
    <div className="adm-tab">
      <div className="adm-tab__header">
        <h2>Eventos Archivados</h2>
        <span style={{fontSize:'13px',color:'var(--text-3)'}}>{events.length} eventos</span>
      </div>

      <div style={{padding:'12px 16px',background:'rgba(99,102,241,0.08)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'10px',fontSize:'13px',color:'var(--text-3)',marginBottom:'20px',lineHeight:'1.6'}}>
        <strong style={{color:'var(--text)'}}>📦 Eventos archivados automáticamente</strong><br/>
        Los eventos se archivan automáticamente 24 horas después de su fecha. Puedes restaurarlos si es necesario.
      </div>

      {loading ? <div className="adm-loading">Cargando...</div> : events.length === 0 ? (
        <div style={{textAlign:'center',color:'var(--text-3)',padding:'48px',background:'var(--bg-card)',borderRadius:'12px'}}>
          <div style={{fontSize:'40px',marginBottom:'12px'}}>📭</div>
          <p>No hay eventos archivados</p>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Evento</th>
                <th>Fecha</th>
                <th>Archivado</th>
                <th>Pasajeros</th>
                <th>Recaudado</th>
                <th>Cobrado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev.id}>
                  <td>
                    <div className="adm-cell-main">{ev.title}</div>
                    {ev.genre && ev.genre !== 'otro' && (
                      <div className="adm-cell-sub">{ev.genre}</div>
                    )}
                  </td>
                  <td>
                    <div className="adm-cell-sub">{new Date(ev.event_date).toLocaleDateString('es-CL')}</div>
                    <div className="adm-cell-sub">{new Date(ev.event_date).toLocaleTimeString('es-CL', {hour:'2-digit',minute:'2-digit'})}</div>
                  </td>
                  <td>
                    <div className="adm-cell-sub">{ev.archived_at ? new Date(ev.archived_at).toLocaleDateString('es-CL') : '—'}</div>
                  </td>
                  <td><strong>{ev.final_passengers || 0}</strong></td>
                  <td><strong style={{color:'var(--text)'}}>${Number(ev.final_revenue || 0).toLocaleString('es-CL')}</strong></td>
                  <td><strong style={{color:'#22c55e'}}>${Number(ev.final_collected || 0).toLocaleString('es-CL')}</strong></td>
                  <td>
                    <button
                      className="adm-btn adm-btn--ghost"
                      onClick={() => unarchive(ev.id)}
                      style={{fontSize:'12px'}}
                    >
                      ↩️ Restaurar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
      {isMobile && <button className="adm-mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}><Menu size={24} /></button>}
      <aside className={`adm-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="adm-sidebar__logo"><span>🚐</span><span>VanAlConcierto</span></div>
        <nav className="adm-sidebar__nav">
          {TABS.map(t => <button key={t.id} className={`adm-sidebar__link ${activeTab === t.id ? 'adm-sidebar__link--active' : ''}`} onClick={() => { setActiveTab(t.id); setSidebarOpen(false) }}>{t.label}</button>)}
        </nav>
        <div className="adm-sidebar__footer">
          <div className="adm-sidebar__user"><span className="adm-sidebar__user-name">{user?.full_name}</span><span className="adm-sidebar__user-role">Admin</span></div>
          <button className="adm-sidebar__logout" onClick={logout} title="Cerrar sesión"><LogOut size={16} /></button>
        </div>
      </aside>
      <main className="adm-main">
        {activeTab === 'bookings' && <BookingsTab />}
        {activeTab === 'events'   && <EventsTab />}
        {activeTab === 'vans'     && <VansTab />}
        {activeTab === 'stats'    && <StatsTab />}
        {activeTab === 'refunds'  && <RefundsTab />}
        {activeTab === 'archived' && <ArchivedTab />}
      </main>
    </div>
  )
}