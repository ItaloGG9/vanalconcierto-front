import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://vanalconcierto-backend-production.up.railway.app/api/v1',
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
      // Solo redirigir si NO estamos ya en la página de login
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
export const adminAssignDriver = (eventId, driverId) => api.post(`/events/${eventId}/assign-driver/${driverId}`)

export default api
