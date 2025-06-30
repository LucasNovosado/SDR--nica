import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      manifest: {
        name: 'SDR Única',
        short_name: 'SDR',
        start_url: '/',
        display: 'standalone',
        background_color: '#0A2F5C', // azul já usado no projeto
        theme_color: '#0A2F5C', // azul já usado no projeto
        icons: [
          {
            src: 'src/assets/react.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: 'src/assets/react.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
        ],
      },
      workbox: {
        navigateFallback: '/offline.html',
      },
    })
  ],
})
