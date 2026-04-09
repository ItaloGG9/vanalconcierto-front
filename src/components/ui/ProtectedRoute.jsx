import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function ProtectedRoute({ children, role }) {
  const user = useAuthStore(s => s.user)
  if (!user) return <Navigate to="/admin/login" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return children
}
