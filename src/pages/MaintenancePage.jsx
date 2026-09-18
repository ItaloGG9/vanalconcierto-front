// src/pages/MaintenancePage.jsx
export default function MaintenancePage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center',
      fontFamily: 'Inter, -apple-system, sans-serif',
    }}>
      <div style={{fontSize: '72px', marginBottom: '24px'}}>🚐</div>
      <h1 style={{
        fontSize: 'clamp(28px, 5vw, 48px)',
        fontWeight: '900',
        color: '#FFB800',
        marginBottom: '16px',
        letterSpacing: '-1px',
      }}>
        VanAlConcierto
      </h1>
      <h2 style={{
        fontSize: 'clamp(18px, 3vw, 28px)',
        fontWeight: '700',
        color: '#e8e8f0',
        marginBottom: '16px',
      }}>
        Estamos mejorando para ti 🔧
      </h2>
      <p style={{
        fontSize: '16px',
        color: '#6b6b88',
        maxWidth: '400px',
        lineHeight: '1.6',
        marginBottom: '40px',
      }}>
        Nuestro sitio está en mantenimiento. Volvemos muy pronto con novedades.
        ¡Gracias por tu paciencia!
      </p>
      <a
        href="https://wa.me/56954084889"
        target="_blank"
        rel="noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          background: '#25D366',
          color: '#fff',
          padding: '14px 28px',
          borderRadius: '10px',
          fontWeight: '700',
          fontSize: '15px',
          textDecoration: 'none',
        }}
      >
        💬 Contáctanos por WhatsApp
      </a>
      <p style={{marginTop: '48px', fontSize: '12px', color: '#3a3a55'}}>
        © {new Date().getFullYear()} VanAlConcierto
      </p>
    </div>
  )
}