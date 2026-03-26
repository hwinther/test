/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT?: string
  readonly VITE_OTEL_SERVICE_NAME?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
