/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Set at image build via Docker build-args (CI). */
  readonly VITE_API_BASE_URL?: string
  readonly VITE_APP_VERSION?: string
  readonly VITE_GIT_SHA?: string
  readonly VITE_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT?: string
  readonly VITE_OTEL_SERVICE_NAME?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
