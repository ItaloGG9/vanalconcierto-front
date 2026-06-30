// vite.config.js - REEMPLAZAR CON ESTE

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'VanAlConcierto',
        short_name: 'VanAlConcierto',
        description: 'Reserva tu van al concierto',
        theme_color: '#FFB800',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],

  server: {
    headers: {
      // CSP SIN unsafe-eval
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://sdk.mercadopago.com",  // unsafe-inline necesario para React
        "style-src 'self' 'unsafe-inline'",                                // unsafe-inline necesario para CSS-in-JS
        "img-src 'self' data: blob: https://yqchxjrsxyzqazoruwyd.supabase.co",
        "connect-src 'self' https://insightful-reprieve-production.up.railway.app https://yqchxjrsxyzqazoruwyd.supabase.co https://api.mercadopago.com",
        "font-src 'self'",
        "frame-src https://www.mercadopago.com.ar https://www.mercadopago.cl",
        "object-src 'none'",
        "base-uri 'self'"
      ].join('; ')
    }
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        }
      }
    }
  }
})