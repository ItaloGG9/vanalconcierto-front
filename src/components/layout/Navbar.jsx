// src/components/layout/Navbar.jsx - Frontend público

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import './Navbar.css'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setMobileMenuOpen(false)
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar__container">
        {/* Logo */}
        <a href="/" className="navbar__logo">
          <img src="/van-al-concierto_logo-completo (1).svg" alt="VanAlConcierto" className="navbar__logo-img" />
          <span className="navbar__logo-text">VANALCONCIERTO</span>
        </a>

        {/* Desktop Menu */}
        <div className="navbar__menu">
          <button onClick={() => scrollToSection('eventos')} className="navbar__link">
            Eventos
          </button>
          <button onClick={() => scrollToSection('como-funciona')} className="navbar__link">
            ¿Cómo funciona?
          </button>
          <button onClick={() => scrollToSection('contacto')} className="navbar__link">
            Contacto
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="navbar__mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="navbar__mobile-menu">
          <button onClick={() => scrollToSection('eventos')} className="navbar__mobile-link">
            Eventos
          </button>
          <button onClick={() => scrollToSection('como-funciona')} className="navbar__mobile-link">
            ¿Cómo funciona?
          </button>
          <button onClick={() => scrollToSection('contacto')} className="navbar__mobile-link">
            Contacto
          </button>
        </div>
      )}
    </nav>
  )
}