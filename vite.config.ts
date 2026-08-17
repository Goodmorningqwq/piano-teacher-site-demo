import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
/**
 * Drop legacy WOFF sources from the built CSS.
 *
 * @fontsource lists every face twice — `url(x.woff2) format('woff2'),
 * url(x.woff) format('woff')`. WOFF2 has been supported by every browser
 * since ~2016, so the WOFF half is never fetched; it just sits in the
 * render-blocking stylesheet and on disk. With ~112 sliced CJK faces that
 * is a lot of dead weight: it roughly halves both the CSS and the deploy.
 *
 * The orphaned .woff assets are dropped from the bundle in the same pass,
 * so nothing is emitted that the CSS no longer points at.
 */
function stripLegacyWoff(): Plugin {
  return {
    name: 'strip-legacy-woff',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const stillReferenced = new Set<string>()
      const basename = (path: string) => path.split('/').pop() ?? path

      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'asset' || !chunk.fileName.endsWith('.css')) continue

        const css = typeof chunk.source === 'string' ? chunk.source : null
        if (css === null) continue

        const stripped = css.replace(
          /\s*,\s*url\([^)]*\.woff\)\s*format\((["'])woff\1\)/g,
          '',
        )
        chunk.source = stripped

        for (const match of stripped.matchAll(/url\(([^)]*\.woff)\)/g)) {
          stillReferenced.add(basename(match[1]))
        }
      }

      for (const [key, chunk] of Object.entries(bundle)) {
        if (chunk.fileName.endsWith('.woff') && !stillReferenced.has(basename(chunk.fileName))) {
          delete bundle[key]
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), stripLegacyWoff()],
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
