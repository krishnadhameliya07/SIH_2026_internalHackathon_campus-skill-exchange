import { setCurrentUserId, clearCurrentUserId } from './api.js'

// In-memory only (not localStorage) — a page refresh should land back on
// signup, not resume whoever was signed in last session.
let authenticated = false

export function isAuthenticated() {
  return authenticated
}

/** Call with the real user object returned by signup/login — makes their real id the active one. */
export function login(user) {
  authenticated = true
  if (user?.id) setCurrentUserId(user.id)
}

export function logout() {
  authenticated = false
  clearCurrentUserId()
}
