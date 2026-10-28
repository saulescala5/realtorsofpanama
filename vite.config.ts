import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { importListingFromUrl } from './supabase/functions/_shared/listing-import'

/** Dev-only stand-in for the `import-listing` Edge Function. */
function importListingApi(): Plugin {
  return {
    name: 'rop-import-listing',
    configureServer(server) {
      server.middlewares.use('/api/import-listing', async (req, res) => {
        let body = ''
        for await (const chunk of req) body += chunk
        const { url } = JSON.parse(body || '{}')
        const result = await importListingFromUrl(String(url ?? ''))
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(result))
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), importListingApi()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { port: 5173 },
})
