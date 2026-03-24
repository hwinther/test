import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import vike from 'vike/plugin'
import mkcert from 'vite-plugin-mkcert'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5173,
  },
  plugins: [react(), vike(), mkcert()],
  resolve: {
    alias: {
      '~': '/src',
      //'~components': '/src/components',
      //'~pages': '/src/pages',
      '~test': '/test',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setupTests.ts',
    mockReset: true,
    coverage: { enabled: true, provider: 'istanbul', reporter: ['cobertura', 'lcov', 'html', 'json'] },
    reporters: ['verbose', 'github-actions', 'junit', 'json'],
    outputFile: {
      junit: './coverage/junit-report.xml',
      json: './coverage/json-report.json',
    },
  },
})
