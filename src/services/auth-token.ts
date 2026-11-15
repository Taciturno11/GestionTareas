const AUTH_TOKEN_KEY = 'gt_auth_token'

function getTokenTimestamp(token: string, claim: 'exp' | 'iat'): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) as Record<string, unknown>
    const value = payload[claim]
    return typeof value === 'number' && Number.isFinite(value) ? value * 1000 : null
  } catch {
    return null
  }
}

export function getAuthTokenExpiration(token: string): number | null {
  return getTokenTimestamp(token, 'exp')
}

export function getAuthTokenIssuedAt(token: string): number | null {
  return getTokenTimestamp(token, 'iat')
}

export function getAuthToken() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  if (token && (getAuthTokenExpiration(token) ?? 0) <= Date.now()) {
    expireAuthSession(token)
    return null
  }
  return token
}

export function saveAuthToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

// Solo reemplaza si la sesion sigue siendo la misma, para no pisar un login nuevo.
export function replaceAuthToken(previousToken: string, nextToken: string) {
  if (localStorage.getItem(AUTH_TOKEN_KEY) !== previousToken) return
  saveAuthToken(nextToken)
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function expireAuthSession(token: string) {
  if (localStorage.getItem(AUTH_TOKEN_KEY) !== token) return
  clearAuthToken()
  if (window.location.pathname !== '/login') window.location.replace('/login')
}
