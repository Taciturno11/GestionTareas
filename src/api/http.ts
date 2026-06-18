import { clearAuthToken, getAuthToken } from '@/services/auth-token'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface HttpOptions {
  method?: HttpMethod
  body?: unknown
  query?: Record<string, string | number | boolean | null | undefined>
  auth?: boolean
}

export class ApiError extends Error {
  readonly status: number
  readonly details?: unknown

  constructor(status: number, message: string, details?: unknown) {
    super(message)
    this.status = status
    this.details = details
  }
}

export function expectArray<T>(payload: unknown, resource: string): T[] {
  if (Array.isArray(payload)) return payload as T[]

  throw new TypeError(`Respuesta invalida de ${resource}: se esperaba una lista`)
}

function buildUrl(path: string, query?: HttpOptions['query']) {
  const rawUrl = path.startsWith('http') ? path : `${API_BASE_URL}${path}`
  const url = new URL(rawUrl, window.location.origin)

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })

  return url.toString()
}

async function parseResponse(response: Response) {
  if (response.status === 204) return null

  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

export async function http<T>(path: string, options: HttpOptions = {}): Promise<T> {
  const token = options.auth === false ? null : getAuthToken()
  const headers = new Headers()

  if (options.body !== undefined) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(buildUrl(path, options.query), {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  const payload = await parseResponse(response)

  if (!response.ok) {
    if (response.status === 401) clearAuthToken()

    const message = typeof payload === 'object' && payload && 'message' in payload
      ? String((payload as { message: unknown }).message)
      : 'Request failed'

    throw new ApiError(response.status, message, payload)
  }

  return payload as T
}
