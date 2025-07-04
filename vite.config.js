import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      manifest: {
        name: 'ÚnicaPRO',
        short_name: 'ÚnicaPRO',
        start_url: '.',
        display: 'standalone',
        background_color: '#0a0a0f',
        theme_color: '#00d4ff',
        icons: [
          {
            src: 'unicaPro.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'unicaPro.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        // Se você tiver "offline.html" e quiser manter, pode configurar um fallback separado
        // fallback: {
        //   document: '/index.html',
        //   offline: '/offline.html'
        // }
      },
    })
  ],
})
