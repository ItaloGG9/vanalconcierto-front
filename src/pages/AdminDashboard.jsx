// Solo muestro las partes que cambiaron:

// ── EVENTS TAB ──────────────────────────────────────────────────────────────── 
function EventsTab() {
  const [events, setEvents] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    title: '', description: '', pickup_info: '', event_date: '',
    price: '', original_price: '', total_capacity: '', is_round_trip: true, is_active: true  // ← CAMBIO: stock → total_capacity
  })
  const [imageFile, setImageFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [assigningEvent, setAssigningEvent] = useState(null)
  const [eventDrivers, setEventDrivers] = useState({})

  const load = () => {
    getEvents(false).then(r => {
      setEvents(r.data)
      r.data.forEach(event => {
        adminGetEventDrivers(event.id).then(res => {
          setEventDrivers(prev => ({
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
    setForm({ 
      title:'', description:'', pickup_info:'', event_date:'', 
      price:'', original_price:'', total_capacity:'',  // ← CAMBIO
      is_round_trip:true, is_active:true 
    })
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
      total_capacity: ev.total_capacity,  // ← CAMBIO: stock → total_capacity
      is_round_trip: ev.is_round_trip,
      is_active: ev.is_active
    })
    setShowForm(true)
  }

  const save = async () => {
    if (!form.title || !form.price || !form.event_date || !form.total_capacity) {  // ← CAMBIO
      toast.error('Completa los campos obligatorios')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        total_capacity: parseInt(form.total_capacity),  // ← CAMBIO: stock → total_capacity
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
              <label>Capacidad Total (suma de todas las vans) *</label>  {/* ← CAMBIO: label más claro */}
              <input 
                type="number" 
                value={form.total_capacity}  // ← CAMBIO: stock → total_capacity
                onChange={e => setForm({...form, total_capacity: e.target.value})}  // ← CAMBIO
                placeholder="34 (ej: 2 vans × 17)" 
              />
              <small style={{color:'var(--text-3)',fontSize:'12px'}}>
                Ej: 2 vans de 17 + 1 van de 15 = 49 cupos
              </small>
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

      <div className="adm-events-list">
        {events.map(ev => {
          const drivers = eventDrivers[ev.id] || []
          const available = ev.available_capacity ?? 0  // ← CAMBIO: usar available_capacity
          return (
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
                  {new Date(ev.event_date).toLocaleDateString('es-CL')} · ${Number(ev.price).toLocaleString('es-CL')} CLP · {available} cupos disponibles {/* ← CAMBIO */}
                </div>
                {drivers.length > 0 && (
                  <div className="adm-event-drivers">
                    <Users size={12} />
                    {drivers.map(d => d.users?.full_name).join(', ')}
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
                  title="Asignar choferes"
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
        <AssignDriverModal
          event={assigningEvent}
          onClose={() => setAssigningEvent(null)}
          onAssigned={() => load()}
        />
      )}
    </div>
  )
}

// El resto del código (BookingsTab, DriversTab, etc.) sigue igual