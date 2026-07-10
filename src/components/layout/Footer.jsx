import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
  <img 
    src="/van-al-concierto_logo-completo (1).svg" 
    alt="VanAlConcierto" 
    style={{ width: '50px', height: 'auto' }} 
  />
  <p>Tu van al concierto más cercano.</p>
</div>
        <div className="footer__copy">
          © {new Date().getFullYear()} VanAlConcierto. Todos los derechos reservados. | <a href="/privacy">Política de Privacidad</a> | <a href="/terms">Términos de Servicio</a>
        </div>
      </div>
    </footer>
  )
}
