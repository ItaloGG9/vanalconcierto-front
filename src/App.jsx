import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { HelmetProvider } from 'react-helmet-async'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import ProtectedRoute from './components/ui/ProtectedRoute'

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              fontFamily: 'var(--font-body)',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#0a0a0f' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#0a0a0f' } },
          }}
        />
        <Routes>
          {/* Sitio público */}
          <Route path="/" element={
            <>
              <Navbar />
              <Home />
              <Footer />
            </>
          } />

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Resultado de pago MP */}
          <Route path="/booking/success" element={<BookingResult type="success" />} />
          <Route path="/booking/failure" element={<BookingResult type="failure" />} />
          <Route path="/booking/pending" element={<BookingResult type="pending" />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  )
}

function BookingResult({ type }) {
  const msgs = {
    success: { icon: '✅', title: '¡Pago exitoso!', text: 'Recibirás tu ticket QR en breve.', color: '#22c55e' },
    failure: { icon: '❌', title: 'Pago fallido', text: 'Hubo un problema con tu pago. Intenta nuevamente.', color: '#ef4444' },
    pending: { icon: '⏳', title: 'Pago pendiente', text: 'Tu pago está siendo procesado. Te notificaremos pronto.', color: '#f5c518' },
  }
  const m = msgs[type]
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, background: 'var(--bg)', padding: 24 }}>
      <span style={{ fontSize: 72 }}>{m.icon}</span>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: m.color }}>{m.title}</h1>
      <p style={{ color: 'var(--text-2)', fontSize: 18 }}>{m.text}</p>
      <a href="/" style={{ marginTop: 16, padding: '12px 28px', background: 'var(--accent)', color: 'var(--bg)', borderRadius: 6, fontWeight: 700 }}>
        Volver al inicio
      </a>
    </div>
  )
}
