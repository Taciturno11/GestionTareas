import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { type FormEvent, useState } from 'react'
import coverImage from '../assets/portada_gestion_HD.webp'

function CurvedDivider() {
  const width = 320
  const height = 1000
  const baseX = 235
  const amplitude = 62
  const steps = 140

  let path = `M ${width} 0 L ${baseX} 0 `

  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const y = t * height
    const x = baseX - amplitude * Math.sin(Math.PI * t)
    path += `L ${x.toFixed(2)} ${y.toFixed(2)} `
  }

  path += `L ${width} ${height} Z`

  return (
    <svg
      className="h-full w-[300px] xl:w-[340px]"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d={path} fill="#f5f5f7" />
    </svg>
  )
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!email.trim() || !password.trim()) {
      alert('Completa tu correo y tu contrasena para continuar.')
      return
    }

    alert('Formulario listo para conectar con el backend.')
  }

  return (
    <main className="h-screen overflow-hidden bg-[#f5f5f7] text-slate-900">
      <div className="grid h-full lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden h-full overflow-hidden lg:block">
          <img
            src={coverImage}
            alt="Portada sistema de gestion"
            className="absolute inset-0 h-full w-full object-cover object-[58%_center] xl:object-[25%_center]"
          />

          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-black/20" />

          <div className="relative flex h-full items-end px-10 pb-16 xl:px-14 xl:pb-20">
            <div className="max-w-[500px]">
              <h1 className="text-[3.2rem] font-bold leading-[0.95] text-white xl:text-[3.5rem]">
                Bienvenido al
                <br />
                <span className="text-cyan-300">sistema de Gestion</span>
              </h1>

              <p className="mt-5 text-[1rem] text-white/90 xl:text-[1.05rem]">
                Agenda, organiza, resuelve y mas.
              </p>
            </div>
          </div>
        </section>

        <section className="relative flex h-full items-center justify-center bg-[#f5f5f7] px-8 py-10 sm:px-12 lg:px-14 xl:px-20">
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden lg:block -translate-x-[76%] xl:-translate-x-[79%]">
            <CurvedDivider />
          </div>

          <div className="relative z-10 w-full max-w-[530px]">
            <div className="mb-8 overflow-hidden rounded-[2rem] shadow-xl lg:hidden">
              <img
                src={coverImage}
                alt="Portada sistema de gestion"
                className="h-56 w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/35" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h2 className="text-3xl font-bold leading-tight text-white">
                  Bienvenido al
                  <br />
                  <span className="text-cyan-300">sistema de Gestion</span>
                </h2>
              </div>
            </div>

            <h2 className="text-[3.2rem] font-bold leading-none tracking-tight text-slate-950">
              Iniciar sesion
            </h2>

            <p className="mt-4 text-[1.05rem] text-slate-500">
              Ingrese sus credenciales para continuar
            </p>

            <form className="mt-14 space-y-7" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="mb-3 block text-[0.95rem] font-semibold text-slate-800"
                >
                  Correo electronico
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 text-slate-400">
                    <EnvelopeIcon className="h-5 w-5" />
                  </span>

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@empresa.com"
                    className="h-[58px] w-full rounded-[18px] border border-slate-200 bg-transparent pl-14 pr-5 text-[1rem] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-3 block text-[0.95rem] font-semibold text-slate-800"
                >
                  Contrasena
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 text-slate-400">
                    <LockClosedIcon className="h-5 w-5" />
                  </span>

                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-[58px] w-full rounded-[18px] border border-slate-200 bg-transparent pl-14 pr-5 text-[1rem] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 h-[56px] w-full rounded-[16px] bg-teal-600 text-[1.05rem] font-semibold text-white shadow-lg shadow-teal-700/15 transition hover:bg-teal-700"
              >
                Iniciar sesion
              </button>
            </form>

            <div className="mt-14 mr-15 text-center text-sm text-slate-400">
              Sistema de gestion de tareas - Desarrollado por Martin Nauca
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
