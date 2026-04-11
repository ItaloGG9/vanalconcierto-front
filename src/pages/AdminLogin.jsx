import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import './AdminLogin.css'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(email, password)
    if (result.success) {
      toast.success('Bienvenido')
      navigate('/admin')
    } else {
      toast.error(result.error)
    }
  }

  /*const handleSubmit = async (e) => {
  e.preventDefault()
  console.log("Intentando login con:", email) // DEBUG
  
  const result = await login(email, password)
  
  if (result.success) {
    toast.success('Bienvenido')
    navigate('/admin')
  } else {
    // Esto te dirá el error real en la consola sin que se borre
    console.error("Error de login:", result.error) 
    toast.error(result.error || 'Credenciales inválidas')
  }
}*/

  return (
    <div className="alog">
      <div className="alog__bg">
        <div className="alog__gradient" />
        <div className="alog__grid" />
      </div>

      <div className="alog__card">
        <div className="alog__logo">🚐</div>
        <h1 className="alog__title">VanAlConcierto</h1>
        <p className="alog__sub">Panel de administración</p>

        <form className="alog__form" onSubmit={handleSubmit}>
          <div className="alog__field">
            <label>Correo electrónico</label>
            <input
              type="email"
              placeholder="admin@vanalconcierto.cl"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="alog__field">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="alog__btn" type="submit" disabled={isLoading}>
            {isLoading ? 'Ingresando...' : 'Ingresar →'}
          </button>
        </form>

        <a href="/" className="alog__back">← Volver al sitio</a>
      </div>
    </div>
  )
}
