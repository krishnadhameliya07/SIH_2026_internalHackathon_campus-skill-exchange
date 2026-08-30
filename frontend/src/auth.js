const KEY = 'csx_auth'

/**
 * Stand-in for real auth until the backend exists. Same shape a real
 * token-based check would have (isAuthenticated/login/logout), so swapping
 * localStorage for a real session/token later doesn't change any callers.
 */
export function isAuthenticated() {
  return localStorage.getItem(KEY) === 'true'
}

export function login() {
  localStorage.setItem(KEY, 'true')
}

export function logout() {
  localStorage.removeItem(KEY)
}
