# 🚐 VanAlConcierto — Frontend

React + Vite | Deploy en Vercel

---

## 🚀 Instalación local

```bash
npm install
cp .env.example .env
# Edita .env con la URL de tu API Railway
npm run dev
```

## 📦 Deploy en Vercel

1. Sube el código a GitHub
2. En Vercel: New Project → Importa el repo
3. Agrega la variable de entorno:
   - `VITE_API_URL` = `https://tu-api.railway.app/api/v1`
4. Deploy

---

## 📁 Estructura

```
src/
├── pages/
│   ├── Home.jsx            # Página principal + eventos
│   ├── AdminLogin.jsx      # Login admin
│   └── AdminDashboard.jsx  # Panel admin (eventos, reservas, choferes)
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx      # Navbar fija responsive
│   │   ├── Hero.jsx        # Hero animado
│   │   └── Footer.jsx
│   ├── events/
│   │   ├── EventCard.jsx   # Card del evento con badges y precio
│   │   └── EventPanel.jsx  # Panel lateral de compra
│   └── ui/
│       └── ProtectedRoute.jsx
├── services/
│   └── api.js              # Axios + todos los endpoints
├── store/
│   └── authStore.js        # Zustand auth
└── index.css               # Variables CSS y estilos globales
```

---

## 🎨 Diseño

- **Fuentes**: Bebas Neue (display) + DM Sans (body) + DM Mono (código)
- **Paleta**: Fondo oscuro `#0a0a0f` + Amarillo `#f5c518` + Naranja `#ff6b35`
- **Estilo**: Editorial oscuro, grid de fondo, animaciones de entrada

---

## 🔑 Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Sitio público (hero, eventos, cómo funciona) |
| `/admin/login` | Login de administrador |
| `/admin` | Dashboard admin (protegido) |
| `/booking/success` | Resultado pago MP exitoso |
| `/booking/failure` | Resultado pago MP fallido |
| `/booking/pending` | Resultado pago MP pendiente |
