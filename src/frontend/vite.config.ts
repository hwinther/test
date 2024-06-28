import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import vike from 'vike/plugin'
import mkcert from 'vite-plugin-mkcert'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5173,
  },
  plugins: [react(), vike({ prerender: true }), mkcert()],
})
