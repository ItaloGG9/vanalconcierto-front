// src/components/VansManager.jsx - CREAR NUEVO

import { useState, useEffect } from 'react'
import { adminGetVans, adminCreateVan, adminDeleteVan } from '../services/api'
import toast from 'react-hot-toast'
import './VansManager.css'

export default function VansManager() {
  const [vans, setVans] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  
  const [form, setForm] = useState({
    name: '',
    license_plate: '',
    capacity: 17,
    owner_email: '',
    password: '',
    current_driver_name: '',
    current_driver_phone: ''
  })

  useEffect(() => {
    loadVans()
  }, [])

  const loadVans = async () => {
    try {
      setLoading(true)
      const res = await adminGetVans()
      setVans(res.data)
    } catch (err) {
      toast.error('Error cargando vans')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await adminCreateVan(form)
      toast.success('Van creada correctamente')
      setShowForm(false)
      setForm({
        name: '',
        license_plate: '',
        capacity: 17,
        owner_email: '',
        password: '',
        current_driver_name: '',
        current_driver_phone: ''
      })
      loadVans()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error creando van')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`¿Eliminar van "${name}"?`)) return
    
    try {
      await adminDeleteVan(id)
      toast.success('Van eliminada')
      loadVans()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error eliminando van')
    }
  }

  return (
    <div className="vans-manager">
      <div className="vans-manager__header">
        <h2>Gestión de Vans</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancelar' : '+ Nueva Van'}
        </button>
      </div>

      {showForm && (
        <form className="van-form" onSubmit={handleSubmit}>
          <div className="van-form__row">
            <input
              type="text"
              placeholder="Nombre (ej: Van 1, Van Azul)"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Patente (ej: BBDD-12)"
              value={form.license_plate}
              onChange={(e) => setForm({...form, license_plate: e.target.value})}
            />
            <input
              type="number"
              placeholder="Capacidad"
              value={form.capacity}
              onChange={(e) => setForm({...form, capacity: parseInt(e.target.value)})}
              min="1"
              required
            />
          </div>
          
          <div className="van-form__row">
            <input
              type="email"
              placeholder="Email del dueño (para login)"
              value={form.owner_email}
              onChange={(e) => setForm({...form, owner_email: e.target.value})}
              required
            />
            <input
              type="password"
              placeholder="Contraseña (para login)"
              value={form.password}
              onChange={(e) => setForm({...form, password: e.target.value})}
              required
              minLength="6"
            />
          </div>
          
          <div className="van-form__row">
            <input
              type="text"
              placeholder="Conductor inicial (opcional)"
              value={form.current_driver_name}
              onChange={(e) => setForm({...form, current_driver_name: e.target.value})}
            />
            <input
              type="tel"
              placeholder="Teléfono conductor (opcional)"
              value={form.current_driver_phone}
              onChange={(e) => setForm({...form, current_driver_phone: e.target.value})}
            />
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creando...' : 'Crear Van'}
          </button>
        </form>
      )}

      <div className="vans-list">
        {loading && <p>Cargando...</p>}
        
        {vans.length === 0 && !loading && (
          <p className="empty-state">No hay vans registradas</p>
        )}
        
        {vans.map(van => (
          <div key={van.id} className="van-card">
            <div className="van-card__header">
              <h3>{van.name}</h3>
              <span className={`van-card__status ${van.is_active ? 'active' : 'inactive'}`}>
                {van.is_active ? '✅ Activa' : '❌ Inactiva'}
              </span>
            </div>
            
            <div className="van-card__info">
              <div className="van-card__row">
                <span>📋 Patente:</span>
                <strong>{van.license_plate || 'Sin patente'}</strong>
              </div>
              <div className="van-card__row">
                <span>👥 Capacidad:</span>
                <strong>{van.capacity} pasajeros</strong>
              </div>
              <div className="van-card__row">
                <span>📧 Email login:</span>
                <strong>{van.owner_email}</strong>
              </div>
              {van.current_driver_name && (
                <div className="van-card__row">
                  <span>🚗 Conductor actual:</span>
                  <strong>{van.current_driver_name} - {van.current_driver_phone}</strong>
                </div>
              )}
            </div>
            
            <div className="van-card__actions">
              <button 
                className="btn-danger-outline"
                onClick={() => handleDelete(van.id, van.name)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}