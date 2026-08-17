import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Keep the admin panel and its heavy editor deps out of the public entry chunk.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@dnd-kit') || id.includes('browser-image-compression')) {
              return 'admin-vendor'
            }
            if (id.includes('@supabase')) return 'supabase'
            if (id.includes('motion')) return 'motion'
          }
        },
      },
    },
  },
})
