declare module 'particles.js'

declare module 'particles.js/particles.js?url' {
  const src: string
  export default src
}

interface ParticlesJsInstance {
  pJS?: ParticlesJsRuntime
}

interface ParticleJsParticle {
  x: number
  y: number
  radius: number
}

interface ParticlesJsRuntime {
  canvas?: {
    w?: number
    h?: number
  }
  interactivity?: {
    status?: string
    mouse?: {
      pos_x?: number | null
      pos_y?: number | null
    }
    events?: {
      onhover?: {
        enable?: boolean
        mode?: string | string[]
      }
    }
    modes?: {
      repulse?: {
        distance?: number
      }
    }
  }
  particles?: {
    move?: {
      out_mode?: string
    }
  }
  fn?: {
    modes?: {
      repulseParticle?: (particle: ParticleJsParticle) => void
    }
    vendors?: {
      destroypJS?: () => void
    }
  }
}

interface Window {
  particlesJS?: (tagId: string, params: unknown) => void
  pJSDom?: ParticlesJsInstance[] | null
}
