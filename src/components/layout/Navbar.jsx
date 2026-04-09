import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import './Navbar.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [location])

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">🚐</span>
          <span className="navbar__logo-text">VanAlConcierto</span>
        </Link>

        <ul className={`navbar__links ${open ? 'navbar__links--open' : ''}`}>
          <li><a href="#eventos" onClick={() => setOpen(false)}>Eventos</a></li>
          <li><a href="#como-funciona" onClick={() => setOpen(false)}>¿Cómo funciona?</a></li>
          <li><a href="#contacto" onClick={() => setOpen(false)}>Contacto</a></li>
          <li>
            <Link to="/admin/login" className="navbar__cta">
              Admin
            </Link>
          </li>
        </ul>

        <button className="navbar__hamburger" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </nav>
  )
}
