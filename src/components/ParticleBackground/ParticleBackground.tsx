import { useEffect, useId } from 'react'
import particlesScriptUrl from 'particles.js/particles.js?url'

import { useTheme } from '@/theme/theme-context'

const PARTICLES_SCRIPT_ID = 'particles-js-script'
let particlesScriptPromise: Promise<void> | null = null

function getParticlesConfig() {
  const particleColor = '#7C87F3'
  const lineColor = '#7C87F3'

  return {
    particles: {
      number: {
        value: 110,
        density: {
          enable: true,
          value_area: 950,
        },
      },
      color: {
        value: particleColor,
      },
      shape: {
        type: 'circle',
        stroke: {
          width: 0,
          color: particleColor,
        },
      },
      opacity: {
        value: 0.48,
        random: true,
        anim: {
          enable: true,
          speed: 0.35,
          opacity_min: 0.22,
          sync: false,
        },
      },
      size: {
        value: 2.1,
        random: true,
        anim: {
          enable: false,
        },
      },
      line_linked: {
        enable: true,
        distance: 150,
        color: lineColor,
        opacity: 0.34,
        width: 1,
      },
      move: {
        enable: true,
        speed: 0.5,
        direction: 'none',
        random: true,
        straight: false,
        out_mode: 'out',
        bounce: false,
      },
    },
    interactivity: {
      detect_on: 'window',
      events: {
        onhover: {
          enable: true,
          mode: 'repulse',
        },
        onclick: {
          enable: false,
        },
        resize: true,
      },
      modes: {
        repulse: {
          distance: 105,
          duration: 0.8,
        },
      },
    },
    retina_detect: true,
  }
}

function destroyParticles() {
  window.pJSDom?.forEach(instance => {
    instance.pJS?.fn?.vendors?.destroypJS?.()
  })
  window.pJSDom = []
}

function includesMode(mode: string | string[] | undefined, expectedMode: string) {
  return Array.isArray(mode) ? mode.includes(expectedMode) : mode === expectedMode
}

function installSmoothRepulse(isDark: boolean) {
  const runtime = window.pJSDom?.[0]?.pJS
  const modes = runtime?.fn?.modes
  const interactivity = runtime?.interactivity

  if (!runtime || !modes || !interactivity) return

  modes.repulseParticle = particle => {
    const onHover = interactivity.events?.onhover
    const mouse = interactivity.mouse
    const repulse = interactivity.modes?.repulse

    if (!onHover?.enable || !includesMode(onHover.mode, 'repulse')) return
    if (interactivity.status !== 'mousemove') return
    if (typeof mouse?.pos_x !== 'number' || typeof mouse.pos_y !== 'number') return

    const dxMouse = particle.x - mouse.pos_x
    const dyMouse = particle.y - mouse.pos_y
    const distance = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse)
    const repulseRadius = repulse?.distance ?? (isDark ? 96 : 78)

    if (!Number.isFinite(distance) || distance <= 0.01 || distance > repulseRadius) return

    const ease = 1 - distance / repulseRadius
    const force = ease * ease * (isDark ? 4.8 : 3.6)
    const nextX = particle.x + (dxMouse / distance) * force
    const nextY = particle.y + (dyMouse / distance) * force

    if (runtime.particles?.move?.out_mode === 'bounce') {
      const canvasWidth = runtime.canvas?.w ?? 0
      const canvasHeight = runtime.canvas?.h ?? 0

      if (nextX - particle.radius > 0 && nextX + particle.radius < canvasWidth) particle.x = nextX
      if (nextY - particle.radius > 0 && nextY + particle.radius < canvasHeight) particle.y = nextY
      return
    }

    particle.x = nextX
    particle.y = nextY
  }
}

function loadParticlesScript() {
  if (window.particlesJS) return Promise.resolve()
  if (particlesScriptPromise) return particlesScriptPromise

  particlesScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(PARTICLES_SCRIPT_ID) as HTMLScriptElement | null

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener('error', () => reject(new Error('No se pudo cargar particles.js')), {
        once: true,
      })
      return
    }

    const script = document.createElement('script')
    script.id = PARTICLES_SCRIPT_ID
    script.src = particlesScriptUrl
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('No se pudo cargar particles.js'))
    document.body.appendChild(script)
  })

  return particlesScriptPromise
}

export default function ParticleBackground() {
  const { resolvedTheme } = useTheme()
  const reactId = useId()
  const elementId = `particles-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`
  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    let isCancelled = false

    if (!isDark) {
      destroyParticles()

      return () => {
        isCancelled = true
        destroyParticles()
      }
    }

    loadParticlesScript()
      .then(() => {
        if (isCancelled) return

        destroyParticles()
        window.particlesJS?.(elementId, getParticlesConfig())
        installSmoothRepulse(isDark)
      })
      .catch(error => {
        console.warn('No se pudo inicializar el fondo de particulas.', error)
      })

    return () => {
      isCancelled = true
      destroyParticles()
    }
  }, [elementId, isDark])

  if (!isDark) return null

  return (
    <div
      id={elementId}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    />
  )
}
