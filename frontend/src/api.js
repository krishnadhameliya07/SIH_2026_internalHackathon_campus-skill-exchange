const API_BASE = 'http://localhost:8000'

// In-memory only (not localStorage) — a page refresh should forget who was
// signed in and start at signup again, not silently resume the last session.
let currentUserId = null

export function getCurrentUserId() {
  return currentUserId ?? 4
}

export function setCurrentUserId(id) {
  currentUserId = id
}

export function clearCurrentUserId() {
  currentUserId = null
}

async function request(path, options) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || `Request failed: ${res.status}`)
  }
  return res.json()
}

export function getSkills() {
  return request('/skills')
}

export function createRequest({ description, skillId, deadline }) {
  return request('/requests', {
    method: 'POST',
    body: JSON.stringify({
      user_id: getCurrentUserId(),
      description,
      skill_required: skillId,
      deadline,
    }),
  })
}

/**
 * The real "type your goal" flow — no skill dropdown. The AI figures out
 * which distinct skills the goal needs (could be several) and returns
 * real matches grouped by skill.
 */
export function createSmartRequest({ description, deadline }) {
  return request('/requests/smart', {
    method: 'POST',
    body: JSON.stringify({
      user_id: getCurrentUserId(),
      description,
      deadline,
    }),
  })
}

export function getRequests() {
  return request('/requests')
}

export function getServices() {
  return request('/services')
}

export function createService({ title, description, skillId, availability, credits }) {
  return request('/services', {
    method: 'POST',
    body: JSON.stringify({
      user_id: getCurrentUserId(),
      title,
      description,
      skill_id: skillId,
      availability,
      credits,
    }),
  })
}

export function getUserSkills(userId) {
  return request(`/users/${userId}/skills`)
}

export function addUserSkill({ skillId, proficiency }) {
  return request(`/users/${getCurrentUserId()}/skills`, {
    method: 'POST',
    body: JSON.stringify({
      skill_id: skillId,
      proficiency,
      verification_status: 'Self-declared',
    }),
  })
}

export function getSkillGraph(userId) {
  return request(`/users/${userId}/skill-graph`)
}

/** Real AI call — file upload, so this bypasses the JSON request() helper (needs multipart, not JSON). */
export async function analyzeProfile({ resumeFile, resumeText, githubUsername, bio }) {
  const form = new FormData()
  if (resumeFile) form.append('resume_file', resumeFile)
  if (resumeText) form.append('resume_text', resumeText)
  if (githubUsername) form.append('github_username', githubUsername)
  if (bio) form.append('bio', bio)

  const res = await fetch(`${API_BASE}/users/${getCurrentUserId()}/analyze-profile`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || `Request failed: ${res.status}`)
  }
  return res.json()
}

export function getMatchesForRequest(requestId) {
  return request(`/matches/request/${requestId}`)
}

export function getUser(userId) {
  return request(`/users/${userId}`)
}

/** Real signup — creates a real row in the database with whatever name/details were typed in. */
export function createUser({ name, email, department, year, bio, availability }) {
  return request('/users', {
    method: 'POST',
    body: JSON.stringify({ name, email, department, year, bio, availability }),
  })
}

/** No password check by design — this just finds an existing account by email. */
export function lookupUserByEmail(email) {
  return request(`/users/lookup/${encodeURIComponent(email)}`)
}

export function updateUser(userId, updates) {
  return request(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
}

/** Qualitative tier from the real match score — same "no fake precision" rule as the mock version. */
export function scoreTier(score) {
  if (score >= 75) return 'Strong Match'
  if (score >= 50) return 'Good Match'
  return 'Possible Match'
}
