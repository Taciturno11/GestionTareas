interface RuntimeConfig {
  TLDRAW_LICENSE_KEY?: string
}

declare global {
  interface Window {
    __GESTION_TAREAS_CONFIG__?: RuntimeConfig
  }
}

export function getTldrawLicenseKey() {
  return window.__GESTION_TAREAS_CONFIG__?.TLDRAW_LICENSE_KEY || import.meta.env.VITE_TLDRAW_LICENSE_KEY || undefined
}
