import { useState } from 'react'
import { Menu, X, Copy, Check, CreditCard, MapPin } from 'lucide-react'
import './Navbar.css'

const BANK_ACCOUNTS = [
  { bank: 'Mercado Pago', icon: '💳', type: 'Cuenta Vista',     account: '1050518507',    rut: '10.268.196-7', name: 'Edith Francesca Constenla Azúa', email: 'fconsten@gmail.com' },
  { bank: 'Tenpo',        icon: '📱', type: 'Cuenta Vista',     account: '111110268196',  rut: '10.268.196-7', name: 'Edith Francesca Constenla Azúa', email: 'fconsten@gmail.com' },
  { bank: 'Banco Santander', icon: '🏦', type: 'Cuenta Corriente', account: '000071837424', rut: '10.268.196-7', name: 'Edith Francesca Constenla Azúa', email: 'fconsten@gmail.com' },
  { bank: 'Banco Falabella', icon: '🏦', type: 'Cuenta Corriente', account: '1-999-689476-6', rut: '10.268.196-7', name: 'Edith Francesca Constenla Azúa', email: 'fconsten@gmail.com' },
  { bank: 'Banco Estado',  icon: '🏛️', type: 'Cuenta RUT',      account: '10.268.196-7',  rut: '10.268.196-7', name: 'Edith Francesca Constenla Azúa', email: 'fconsten@gmail.com', note: 'Si tienes problemas al transferir, intenta con otra cuenta.' },
]

const PICKUP_POINTS = [
  { name: 'Peñablanca – Líder, Manuel Montt',               maps: 'https://maps.app.goo.gl/o1vn2wpjFvseqtwAA' },
  { name: 'Villa Alemana – Paradero 7 (frente a la Copec)', maps: 'https://maps.app.goo.gl/bYk3WodRzAsaiTxC7?g_st=ac' },
  { name: 'Belloto – Paradero Ex La Polar',                  maps: 'https://maps.app.goo.gl/UYMJjM2kY9bz7Wo36?g_st=ac' },
  { name: 'Quilpué – Paradero 26',                           maps: 'https://maps.app.goo.gl/HSR5eomJLR1J1VDj6?g_st=ac' },
  { name: 'Viña del Mar – Plaza México, Paradero 1 Norte',   maps: 'https://maps.app.goo.gl/c433ZwZfAthDoRZ68?g_st=ac' },
  { name: 'Valparaíso – Costado PUCV, Av. Argentina',        maps: 'https://maps.app.goo.gl/tzQxDSVVcg8PkfYVA?g_st=ac' },
  { name: 'Placilla – Pasarela Ruta 68',                     maps: 'https://maps.app.goo.gl/jgNC32tD35B3woZB6?g_st=ac' },
  { name: 'Casablanca – Ruta 68',                            maps: 'https://maps.app.goo.gl/1XUW8RpHSjJRmeAv7?g_st=ac' },
  { name: 'Curacaví – Ruta 68',                              maps: 'https://maps.app.goo.gl/YLF2JGV6CqYDzo9r8?g_st=ac' },
]

function TransferModal({ onClose }) {
  const [copiedIndex, setCopiedIndex] = useState(null)

  const copyAll = (acc, index) => {
    const text = `Banco: ${acc.bank}\nTipo: ${acc.type}\nCuenta: ${acc.account}\nRUT: ${acc.rut}\nNombre: ${acc.name}\nEmail: ${acc.email}`
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="transfer-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="transfer-modal">
        <div className="transfer-modal__header">
          <h2>💸 Datos de transferencia</h2>
          <button className="transfer-modal__close" onClick={onClose}><X size={20} /></button>
        </div>
        <p className="transfer-modal__sub">
          Transfiere el monto exacto a cualquiera de estas cuentas y envíanos el comprobante por WhatsApp.
        </p>
        <div className="transfer-modal__accounts">
          {BANK_ACCOUNTS.map((acc, i) => (
            <div key={i} className="transfer-account">
              <div className="transfer-account__header">
                <span className="transfer-account__icon">{acc.icon}</span>
                <div>
                  <div className="transfer-account__bank">{acc.bank}</div>
                  <div className="transfer-account__type">{acc.type}</div>
                </div>
                <button
                  className={`transfer-account__copy ${copiedIndex === i ? 'transfer-account__copy--done' : ''}`}
                  onClick={() => copyAll(acc, i)}
                >
                  {copiedIndex === i ? <><Check size={13} /> Copiado</> : <><Copy size={13} /> Copiar</>}
                </button>
              </div>
              <div className="transfer-account__rows">
                <div className="transfer-account__row"><span>Nombre</span><strong>{acc.name}</strong></div>
                <div className="transfer-account__row"><span>RUT</span><strong>{acc.rut}</strong></div>
                <div className="transfer-account__row"><span>N° Cuenta</span><strong>{acc.account}</strong></div>
                <div className="transfer-account__row"><span>Email</span><strong>{acc.email}</strong></div>
              </div>
              {acc.note && <div className="transfer-account__note">⚠️ {acc.note}</div>}
            </div>
          ))}
        </div>
        <a href="https://wa.me/56954084889" target="_blank" rel="noreferrer" className="transfer-modal__wa">
          💬 Enviar comprobante por WhatsApp
        </a>
      </div>
    </div>
  )
}

function PickupModal({ onClose }) {
  return (
    <div className="transfer-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="transfer-modal">
        <div className="transfer-modal__header">
          <h2>📍 Puntos de recogida</h2>
          <button className="transfer-modal__close" onClick={onClose}><X size={20} /></button>
        </div>
        <p className="transfer-modal__sub">
          Estos son los puntos de recogida habituales. Los horarios exactos se informan al reservar.
        </p>
        <div className="pickup-modal__list">
          {PICKUP_POINTS.map((p, i) => (
            <div key={i} className="pickup-modal__item">
              <div className="pickup-modal__name">
                <span className="pickup-modal__num">{String(i + 1).padStart(2, '0')}</span>
                {p.name}
              </div>
              <a
                href={p.maps}
                target="_blank"
                rel="noreferrer"
                className="pickup-modal__maps-btn"
              >
                <MapPin size={14} /> Ver en Maps
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [showPickup, setShowPickup] = useState(false)

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setMobileMenuOpen(false)
    }
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar__container">
          <a href="/" className="navbar__logo">
            <img src="/van-al-concierto_logo-completo (1).svg" alt="VanAlConcierto" className="navbar__logo-img" />
            <span className="navbar__logo-text">VANALCONCIERTO</span>
          </a>

          <div className="navbar__menu">
            <button onClick={() => scrollToSection('eventos')} className="navbar__link">Eventos</button>
            <button onClick={() => scrollToSection('como-funciona')} className="navbar__link">¿Cómo funciona?</button>
            <button onClick={() => scrollToSection('contacto')} className="navbar__link">Contacto</button>
            <button onClick={() => setShowPickup(true)} className="navbar__link navbar__link--pickup">
              <MapPin size={15} /> Puntos de recogida
            </button>
            <button onClick={() => setShowTransfer(true)} className="navbar__link navbar__link--transfer">
              <CreditCard size={15} /> Transferencia
            </button>
          </div>

          <button className="navbar__mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="navbar__mobile-menu">
            <button onClick={() => scrollToSection('eventos')} className="navbar__mobile-link">Eventos</button>
            <button onClick={() => scrollToSection('como-funciona')} className="navbar__mobile-link">¿Cómo funciona?</button>
            <button onClick={() => scrollToSection('contacto')} className="navbar__mobile-link">Contacto</button>
            <button onClick={() => { setShowPickup(true); setMobileMenuOpen(false) }} className="navbar__mobile-link navbar__mobile-link--pickup">
              📍 Puntos de recogida
            </button>
            <button onClick={() => { setShowTransfer(true); setMobileMenuOpen(false) }} className="navbar__mobile-link navbar__mobile-link--transfer">
              💸 Ver datos de transferencia
            </button>
          </div>
        )}
      </nav>

      {showTransfer && <TransferModal onClose={() => setShowTransfer(false)} />}
      {showPickup && <PickupModal onClose={() => setShowPickup(false)} />}
    </>
  )
}