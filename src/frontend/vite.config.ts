import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vitest/config'
import vike from 'vike/plugin'
import mkcert from 'vite-plugin-mkcert'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5173,
  },
  plugins: [react(), vike({ prerender: true }), mkcert()],
  resolve: {
    alias: {
      '~': '/src',
      '~components': '/src/components',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setupTests.ts',
    mockReset: true,
    coverage: { provider: 'istanbul' },
    reporters: ['verbose', 'github-actions', 'junit', 'json'],
    outputFile: {
      junit: './coverage/junit-report.xml',
      json: './coverage/json-report.json',
    },
  },
})
