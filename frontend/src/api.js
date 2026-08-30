const API_BASE = 'http://localhost:8000'

// Stand-in for a real logged-in user until real auth exists on the backend —
// this is Bhavani's seeded row in the actual database.
export const CURRENT_USER_ID = 4

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
      user_id: CURRENT_USER_ID,
      description,
      skill_required: skillId,
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
      user_id: CURRENT_USER_ID,
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
  return request(`/users/${CURRENT_USER_ID}/skills`, {
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

  const res = await fetch(`${API_BASE}/users/${CURRENT_USER_ID}/analyze-profile`, {
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

/** Qualitative tier from the real match score — same "no fake precision" rule as the mock version. */
export function scoreTier(score) {
  if (score >= 75) return 'Strong Match'
  if (score >= 50) return 'Good Match'
  return 'Possible Match'
}
