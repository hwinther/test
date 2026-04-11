import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'
import mkcert from 'vite-plugin-mkcert'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 5173,
  },
  plugins: [tailwindcss(), mkcert(), ...(process.env.VITEST ? [] : [reactRouter()])],
  build: {
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setupTests.ts',
    mockReset: true,
    include: ['app/**/*.{test,spec}.{ts,tsx}', 'test/**/*.{test,spec}.{ts,tsx}'],
    coverage: { enabled: true, provider: 'istanbul', reporter: ['cobertura', 'lcov', 'html', 'json'] },
    reporters: ['verbose', 'github-actions', 'junit', 'json'],
    outputFile: {
      junit: './coverage/junit-report.xml',
      json: './coverage/json-report.json',
    },
  },
})
