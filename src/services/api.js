import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
})

// Inyectar token JWT si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vac_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Manejar errores globalmente
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('vac_token')
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(err)
  }
)

// ── Eventos ─────────────────────────────────────────────────
export const getEvents = () => api.get('/events/')
export const getEvent = (id) => api.get(`/events/${id}`)

// ── Bookings ─────────────────────────────────────────────────
export const createMPBooking = (data) => api.post('/bookings/mercadopago', data)
export const createTransferBooking = (data) => api.post('/bookings/transfer', data)
export const getPickupPoints = () => api.get('/bookings/pickup-points')

// ── Auth ──────────────────────────────────────────────────────
export const login = (email, password) => api.post('/auth/login', { email, password })

// ── Admin ─────────────────────────────────────────────────────
export const adminGetBookings = (params) => api.get('/bookings/admin/all', { params })
export const adminConfirmTransfer = (data) => api.post('/bookings/transfer/confirm', data)
export const adminCreateEvent = (data) => api.post('/events/', data)
export const adminUpdateEvent = (id, data) => api.put(`/events/${id}`, data)
export const adminDeleteEvent = (id) => api.delete(`/events/${id}`)
export const adminUploadEventImage = (id, file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post(`/events/${id}/upload-image`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
}
export const adminGetDrivers = () => api.get('/drivers/')
export const adminCreateDriver = (data) => api.post('/drivers/', data)
export const adminVerifyDriver = (id) => api.put(`/drivers/${id}/verify`)
export const adminDeleteDriver = (id) => api.delete(`/drivers/${id}`)

// ── Asignación de choferes a eventos ───────────────────────
export const adminAssignDriver = (eventId, driverId) => api.post(`/events/${eventId}/assign-driver/${driverId}`)
export const adminUnassignDriver = (eventId, driverId) => api.delete(`/events/${eventId}/assign-driver/${driverId}`)
export const adminGetEventDrivers = (eventId) => api.get(`/events/${eventId}/drivers`)

// ── Vans ─────────────────────────────────────────────────────
export const adminGetVans = () => api.get('/vans/')
export const adminCreateVan = (data) => api.post('/vans/', data)
export const adminUpdateVan = (id, data) => api.put(`/vans/${id}`, data)
export const adminDeleteVan = (id) => api.delete(`/vans/${id}`)

// Asignar/desasignar vans a eventos
export const adminAssignVan = (eventId, vanId) => api.post('/vans/assign', null, { params: { event_id: eventId, van_id: vanId } })
export const adminUnassignVan = (eventId, vanId) => api.delete('/vans/unassign', { params: { event_id: eventId, van_id: vanId } })
export const adminGetEventVans = (eventId) => api.get(`/vans/event/${eventId}`)

// ── Gestión de pasajeros ──────────────────────────────────────
export const adminGetEventPassengers = (eventId) => api.get(`/bookings/events/${eventId}/passengers`)
export const adminReassignPassenger = (passengerId, vanId) => api.put(`/bookings/passengers/${passengerId}/reassign`, null, { params: { van_id: vanId } })
export const adminAutoAssignPassengers = (eventId) => api.post(`/bookings/events/${eventId}/auto-assign`)

// ── PWA Chofer ────────────────────────────────────────────────
export const vanLogin = (email, password) => api.post('/vans/login', { email, password })
export const getVanPassengers = (vanId, eventId) => api.get(`/driver/van/${vanId}/passengers`, { params: { event_id: eventId } })
export const scanPassengerQR = (vanId, qrCode, tripDirection) => api.post(`/driver/van/${vanId}/scan`, null, { params: { qr_code: qrCode, trip_direction: tripDirection } })
export const getVanStats = (vanId, eventId) => api.get(`/driver/van/${vanId}/stats`, { params: { event_id: eventId } })
export const updateVanDriver = (vanId, driverName, driverPhone) => api.put(`/vans/${vanId}/driver`, null, { params: { driver_name: driverName, driver_phone: driverPhone } })

export default api