import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import {
  adminGetBookings, adminConfirmTransfer,
  adminCreateEvent, adminUpdateEvent, adminDeleteEvent, adminUploadEventImage,
  adminGetDrivers, adminCreateDriver, adminVerifyDriver, adminDeleteDriver,
  adminAssignDriver, getEvents
} from '../services/api'
import toast from 'react-hot-toast'
import { LogOut, Plus, Check, X, Trash2, Upload, Users, Calendar, ShoppingBag, ChevronDown } from 'lucide-react'
import './AdminDashboard.css'

// ── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'bookings', label: '📦 Reservas' },
  { id: 'events',   label: '🎵 Eventos' },
  { id: 'drivers',  label: '🚐 Choferes' },
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

// ── BOOKINGS TAB ──────────────────────────────────────────────────────────────
function BookingsTab() {
  const [bookings, setBookings] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

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
                <tr><td colSpan={7} style={{textAlign:'center', color:'var(--text-3)', padding:32}}>Sin resultados</td></tr>
              )}
              {bookings.map(b => (
                <tr key={b.id}>
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
    price: '', original_price: '', stock: '', is_round_trip: true, is_active: true
  })
  const [imageFile, setImageFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => getEvents(false).then(r => setEvents(r.data)).catch(() => {})

  useEffect(() => { load() }, [])

  const openNew = () => {
    setEditing(null)
    setForm({ title:'', description:'', pickup_info:'', event_date:'', price:'', original_price:'', stock:'', is_round_trip:true, is_active:true })
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
      stock: ev.stock,
      is_round_trip: ev.is_round_trip,
      is_active: ev.is_active
    })
    setShowForm(true)
  }

  const save = async () => {
    if (!form.title || !form.price || !form.event_date || !form.stock) {
      toast.error('Completa los campos obligatorios')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        stock: parseInt(form.stock),
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
      // Subir imagen si hay
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

      {/* Form */}
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
              <label>Stock (cupos) *</label>
              <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} placeholder="20" />
            </div>
            <div className="adm-field">
              <label>Precio CLP *</label>
              <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="15000" />
            </div>
            <div className="adm-field">
              <label>Precio original (oferta)</label>
              <input type="number" value={form.original_price} onChange={e => setForm({...form, original_price: e.target.value})} placeholder="20000" />
            </div>
            <div className="adm-field adm-field--full">
              <label>Puntos de recogida</label>
              <textarea rows={3} value={form.pickup_info} onChange={e => setForm({...form, pickup_info: e.target.value})} placeholder="Punto 1: Plaza Italia 08:00&#10;Punto 2: Metro Baquedano 08:15" />
            </div>
            <div className="adm-field adm-field--full">
              <label>Descripción</label>
              <textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Descripción del viaje..." />
            </div>
            <div className="adm-field">
              <label>Imagen del evento</label>
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

      {/* Lista */}
      <div className="adm-events-list">
        {events.map(ev => (
          <div key={ev.id} className="adm-event-row">
            <div className="adm-event-img">
              {ev.image_url
                ? <img src={ev.image_url} alt={ev.title} />
                : <span>🎵</span>
              }
            </div>
            <div className="adm-event-info">
              <div className="adm-cell-main">{ev.title}</div>
              <div className="adm-cell-sub">
                {new Date(ev.event_date).toLocaleDateString('es-CL')} · ${Number(ev.price).toLocaleString('es-CL')} CLP · {ev.stock} cupos
              </div>
            </div>
            <div className="adm-event-status">
              {ev.is_active
                ? <span className="status-badge" style={{'--sc':'#22c55e'}}>Activo</span>
                : <span className="status-badge" style={{'--sc':'#9090a8'}}>Inactivo</span>
              }
            </div>
            <div className="adm-actions">
              <button className="adm-btn adm-btn--ghost" onClick={() => openEdit(ev)}>Editar</button>
              <button className="adm-btn adm-btn--danger" onClick={() => del(ev.id)}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── DRIVERS TAB ───────────────────────────────────────────────────────────────
function DriversTab() {
  const [drivers, setDrivers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ email:'', full_name:'', phone:'', van_plate:'', van_capacity:8, available_days:[] })
  const [saving, setSaving] = useState(false)

  const DAYS = ['lunes','martes','miércoles','jueves','viernes','sábado','domingo']

  const load = () => adminGetDrivers().then(r => setDrivers(r.data)).catch(() => {})
  useEffect(() => { load() }, [])

  const toggleDay = (day) => {
    setForm(f => ({
      ...f,
      available_days: f.available_days.includes(day)
        ? f.available_days.filter(d => d !== day)
        : [...f.available_days, day]
    }))
  }

  const save = async () => {
    if (!form.email || !form.full_name || !form.van_plate) {
      toast.error('Completa los campos obligatorios')
      return
    }
    setSaving(true)
    try {
      await adminCreateDriver(form)
      toast.success('Chofer creado exitosamente')
      setShowForm(false)
      setForm({ email:'', full_name:'', phone:'', van_plate:'', van_capacity:8, available_days:[] })
      load()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Error creando chofer')
    } finally { setSaving(false) }
  }

  const verify = async (id) => {
    await adminVerifyDriver(id)
    toast.success('Chofer verificado ✅')
    load()
  }

  const remove = async (id) => {
    if (!confirm('¿Desactivar este chofer?')) return
    await adminDeleteDriver(id)
    toast.success('Chofer desactivado')
    load()
  }

  return (
    <div className="adm-tab">
      <div className="adm-tab__header">
        <h2>Choferes</h2>
        <button className="adm-btn adm-btn--primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={14} /> Nuevo chofer
        </button>
      </div>

      {showForm && (
        <div className="adm-form-card">
          <h3>Registrar chofer</h3>
          <div className="adm-form-grid">
            <div className="adm-field">
              <label>Nombre completo *</label>
              <input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} placeholder="Juan Pérez" />
            </div>
            <div className="adm-field">
              <label>Email *</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="chofer@email.com" />
            </div>
            <div className="adm-field">
              <label>Teléfono</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+56912345678" />
            </div>
            <div className="adm-field">
              <label>Patente del furgón *</label>
              <input value={form.van_plate} onChange={e => setForm({...form, van_plate: e.target.value})} placeholder="AB1234" />
            </div>
            <div className="adm-field">
              <label>Capacidad</label>
              <input type="number" value={form.van_capacity} onChange={e => setForm({...form, van_capacity: parseInt(e.target.value)})} />
            </div>
            <div className="adm-field adm-field--full">
              <label>Días disponibles</label>
              <div className="adm-days">
                {DAYS.map(d => (
                  <button
                    key={d}
                    type="button"
                    className={`adm-day ${form.available_days.includes(d) ? 'adm-day--active' : ''}`}
                    onClick={() => toggleDay(d)}
                  >{d.slice(0,3)}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="adm-form-actions">
            <button className="adm-btn adm-btn--ghost" onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="adm-btn adm-btn--primary" onClick={save} disabled={saving}>
              {saving ? 'Guardando...' : 'Crear chofer'}
            </button>
          </div>
        </div>
      )}

      <div className="adm-drivers-list">
        {drivers.map(d => (
          <div key={d.id} className="adm-driver-row">
            <div className="adm-driver-avatar">
              {d.avatar_url ? <img src={d.avatar_url} alt={d.full_name} /> : <span>🧑‍✈️</span>}
            </div>
            <div className="adm-driver-info">
              <div className="adm-cell-main">{d.full_name}</div>
              <div className="adm-cell-sub">
                🚐 {d.van_plate} · {d.van_capacity} pasajeros
                {d.available_days?.length > 0 && ` · ${d.available_days.join(', ')}`}
              </div>
            </div>
            <div>
              {d.is_verified
                ? <span className="status-badge" style={{'--sc':'#22c55e'}}>Verificado</span>
                : <span className="status-badge" style={{'--sc':'#f5c518'}}>Pendiente</span>
              }
            </div>
            <div className="adm-actions">
              {!d.is_verified && (
                <button className="adm-btn adm-btn--success" onClick={() => verify(d.id)}>
                  <Check size={14} /> Verificar
                </button>
              )}
              <button className="adm-btn adm-btn--danger" onClick={() => remove(d.id)}>
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
      {/* Sidebar */}
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

      {/* Contenido */}
      <main className="adm-main">
        {activeTab === 'bookings' && <BookingsTab />}
        {activeTab === 'events'   && <EventsTab />}
        {activeTab === 'drivers'  && <DriversTab />}
      </main>
    </div>
  )
}
