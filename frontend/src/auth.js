import { setCurrentUserId, clearCurrentUserId } from './api.js'

const KEY = 'csx_auth'

export function isAuthenticated() {
  return localStorage.getItem(KEY) === 'true'
}

/** Call with the real user object returned by signup/login — makes their real id the active one. */
export function login(user) {
  localStorage.setItem(KEY, 'true')
  if (user?.id) setCurrentUserId(user.id)
}

export function logout() {
  localStorage.removeItem(KEY)
  clearCurrentUserId()
}
