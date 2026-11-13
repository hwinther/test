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
  plugins: [
    tailwindcss(),
    // Local HTTPS for `npm run dev` only. The plugin looks up the mkcert release on the GitHub API
    // whenever Vite starts a server, which `react-router build` does too, and that lookup fails in
    // CI and Docker builds.
    ...(process.env.npm_lifecycle_event === 'dev' ? [mkcert()] : []),
    ...(process.env.VITEST ? [] : [reactRouter()]),
  ],
  build: {
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setupTests.ts',
    mockReset: true,
    include: ['app/**/*.{test,spec}.{ts,tsx}', 'test/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      enabled: true,
      provider: 'istanbul',
      reporter: ['cobertura', 'lcov', 'html', 'json'],
      // Every source file counts, not only the ones a test imports (Vitest's default), so an untested
      // file shows up as 0 %. Unit tests own the logic (components, hooks, lib, the API client's own
      // code); routes are the e2e suite's, which measures them (tests/e2e/playwright.config.ts leaves
      // out the rest of this list too). Also left out: orval's generated client and models, the mocks,
      // bootstrapping, OTel setup, and the two games (throwaway code, to be rewritten).
      include: ['app/**/*.{ts,tsx}'],
      exclude: [
        'app/**/*.{test,spec}.{ts,tsx}',
        'app/**/*.d.ts',
        'app/api/endpoints/**',
        'app/api/models/**',
        'app/mock.ts',
        'app/entry.*',
        'app/root.tsx',
        'app/routes.ts',
        'app/otel/**',
        'app/components/game/mario/**',
        'app/components/game/maritime-ventures/**',
        'app/routes/**',
      ],
    },
    reporters: ['verbose', 'github-actions', 'junit', 'json'],
    outputFile: {
      junit: './coverage/junit-report.xml',
      json: './coverage/json-report.json',
    },
  },
})
