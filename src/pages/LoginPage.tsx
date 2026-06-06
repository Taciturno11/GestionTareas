import {
  ArrowLeftIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import { type FormEvent, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { authApi, type AuthResponse, type OtpRequiredResponse } from '@/api/auth.api'
import { saveAuthToken } from '@/services/auth-token'
import { syncBackendWorkspaceDataToLocalStorage } from '@/services/backend-sync'
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

function formatCountdown(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds)
  const minutes = Math.floor(safeSeconds / 60)
  const seconds = safeSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function secondsUntil(value: string, now: number) {
  return Math.max(0, Math.ceil((new Date(value).getTime() - now) / 1000))
}

function isOtpRequiredResponse(result: AuthResponse | OtpRequiredResponse): result is OtpRequiredResponse {
  return 'requiresTwoFactor' in result && result.requiresTwoFactor
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [otpChallenge, setOtpChallenge] = useState<OtpRequiredResponse | null>(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!otpChallenge) return

    const timer = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [otpChallenge])

  async function completeAuthenticatedSession(result: AuthResponse) {
    saveAuthToken(result.token)
    await syncBackendWorkspaceDataToLocalStorage()
    navigate(from, { replace: true })
  }

  function resetOtpFlow() {
    setOtpChallenge(null)
    setOtpCode('')
    setError('')
    setNow(Date.now())
  }

  async function handleCredentialsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Completa tu correo y tu contrasena para continuar.')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await authApi.login({ email: email.trim(), password })

      if (isOtpRequiredResponse(result)) {
        setOtpChallenge(result)
        setOtpCode('')
        setPassword('')
        setNow(Date.now())
        return
      }

      await completeAuthenticatedSession(result)
    } catch (loginError) {
      console.error(loginError)
      setError('No se pudo iniciar sesion. Revisa tus credenciales o el backend local.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleOtpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!otpChallenge) return

    setError('')

    if (otpCode.trim().length < 4) {
      setError('Ingresa el codigo que recibiste por correo.')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await authApi.verifyOtp({
        challengeId: otpChallenge.challengeId,
        code: otpCode.trim(),
      })

      await completeAuthenticatedSession(result)
    } catch (verificationError) {
      console.error(verificationError)
      setError('No se pudo validar el codigo. Revisa el correo o solicita uno nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleResendOtp() {
    if (!otpChallenge) return

    setError('')
    setIsResending(true)

    try {
      const result = await authApi.resendOtp({ challengeId: otpChallenge.challengeId })
      setOtpChallenge(result)
      setOtpCode('')
      setNow(Date.now())
    } catch (resendError) {
      console.error(resendError)
      setError('No se pudo reenviar el codigo todavia. Intenta nuevamente en unos segundos.')
    } finally {
      setIsResending(false)
    }
  }

  const isOtpStep = Boolean(otpChallenge)
  const expiresInSeconds = otpChallenge ? secondsUntil(otpChallenge.expiresAt, now) : 0
  const resendInSeconds = otpChallenge ? secondsUntil(otpChallenge.resendAvailableAt, now) : 0

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
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden -translate-x-[76%] lg:block xl:-translate-x-[79%]">
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

            {!isOtpStep && (
              <>
                <h2 className="text-[3.2rem] font-bold leading-none tracking-tight text-slate-950">
                  Iniciar sesion
                </h2>

                <p className="mt-4 text-[1.05rem] text-slate-500">
                  Ingrese sus credenciales para continuar
                </p>
              </>
            )}

            {isOtpStep && otpChallenge && (
              <>
                <button
                  type="button"
                  onClick={resetOtpFlow}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Volver
                </button>

                <div className="mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                  <ShieldCheckIcon className="h-7 w-7" />
                </div>

                <h2 className="mt-6 text-[3rem] font-bold leading-none tracking-tight text-slate-950">
                  Verificar acceso
                </h2>

                <p className="mt-4 text-[1.05rem] text-slate-500">
                  Enviamos un codigo a <span className="font-semibold text-slate-700">{otpChallenge.emailHint}</span>.
                  Ingresalo para completar el inicio de sesion.
                </p>
              </>
            )}

            <form
              className="mt-14 space-y-7"
              onSubmit={isOtpStep ? handleOtpSubmit : handleCredentialsSubmit}
            >
              {!isOtpStep && (
                <>
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
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="usuario@empresa.com"
                        className="cursor-text-dark h-[58px] w-full rounded-[18px] border border-slate-200 bg-transparent pl-14 pr-5 text-[1rem] text-slate-700 caret-gray-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
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
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="********"
                        className="cursor-text-dark h-[58px] w-full rounded-[18px] border border-slate-200 bg-transparent pl-14 pr-5 text-[1rem] text-slate-700 caret-gray-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                      />
                    </div>
                  </div>
                </>
              )}

              {isOtpStep && otpChallenge && (
                <div className="space-y-5">
                  <div className="rounded-[22px] border border-slate-200 bg-white px-5 py-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Codigo de verificacion</p>
                        <p className="mt-1 text-sm text-slate-500">
                          Vence en {formatCountdown(expiresInSeconds)}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        2FA email
                      </span>
                    </div>

                    <input
                      id="otp-code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={otpCode}
                      onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, '').slice(0, 8))}
                      placeholder="123456"
                      className="cursor-text-dark mt-5 h-[62px] w-full rounded-[18px] border border-slate-200 bg-[#fbfbfc] px-5 text-center text-[1.8rem] font-semibold tracking-[0.35em] text-slate-900 caret-gray-900 outline-none transition placeholder:tracking-[0.25em] placeholder:text-slate-300 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                    />
                  </div>

                  <div className="flex flex-col gap-3 rounded-[20px] border border-dashed border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-slate-700">No recibiste el correo?</p>
                      <p className="mt-1">
                        {resendInSeconds > 0
                          ? `Puedes solicitar otro codigo en ${formatCountdown(resendInSeconds)}.`
                          : 'Ya puedes solicitar un nuevo codigo.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isResending || isSubmitting || resendInSeconds > 0}
                      className="h-11 rounded-[14px] border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isResending ? 'Reenviando...' : 'Reenviar codigo'}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 h-[56px] w-full rounded-[16px] bg-teal-600 text-[1.05rem] font-semibold text-white shadow-lg shadow-teal-700/15 transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-80"
              >
                {isSubmitting
                  ? isOtpStep ? 'Validando...' : 'Ingresando...'
                  : isOtpStep ? 'Verificar codigo' : 'Iniciar sesion'}
              </button>

              {error && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </p>
              )}
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
