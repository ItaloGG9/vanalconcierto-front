import { create } from 'zustand'
import { login as apiLogin } from '../services/api'

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('vac_user') || 'null'),
  token: localStorage.getItem('vac_token') || null,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const res = await apiLogin(email, password)
      const { access_token, user_id, role, full_name } = res.data
      const user = { id: user_id, role, full_name }
      localStorage.setItem('vac_token', access_token)
      localStorage.setItem('vac_user', JSON.stringify(user))
      set({ user, token: access_token, isLoading: false })
      return { success: true, role }
    } catch (err) {
      set({ isLoading: false })
      return { success: false, error: err.response?.data?.detail || 'Error al iniciar sesión' }
    }
  },

  logout: () => {
    localStorage.removeItem('vac_token')
    localStorage.removeItem('vac_user')
    set({ user: null, token: null })
  }
}))
