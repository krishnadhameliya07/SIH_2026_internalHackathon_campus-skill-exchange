import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { login } from '../../auth.js'
import { createUser } from '../../api.js'

export default function AIConfirm() {
  const location = useLocation()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { name, email, department, year, bio, availability } = location.state || {}

  async function handleConfirm() {
    if (!name || !email) {
      setError('Missing signup details — go back and start from Sign up.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const user = await createUser({ name, email, department, year, bio, availability })
      login(user)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="page-eyebrow">Auth & Onboarding</div>
      <h1>Confirm your details</h1>
      <p className="page-desc">
        Creates your real skillX account — skill extraction from a resume/GitHub happens
        afterward, in Edit Skills.
      </p>
      <ul className="page-bullets">
        <li>Name: {name || '—'}</li>
        <li>Email: {email || '—'}</li>
        {department && <li>Department: {department}</li>}
        {year && <li>Year: {year}</li>}
        {availability && <li>Availability: {availability}</li>}
      </ul>

      {error && <p className="form-error">{error}</p>}

      <div className="page-actions">
        <button type="button" className="btn" onClick={handleConfirm} disabled={submitting}>
          {submitting ? 'Creating your account…' : 'Confirm → Dashboard'}
        </button>
      </div>
    </div>
  )
}
