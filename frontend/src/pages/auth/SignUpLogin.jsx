import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../../auth.js'
import { lookupUserByEmail } from '../../api.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function SignUpLogin() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function switchMode(next) {
    setMode(next)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (mode === 'signup' && !firstName.trim()) {
      setError('Enter your first name.')
      return
    }
    if (!EMAIL_RE.test(email)) {
      setError('Enter a valid college email.')
      return
    }
    if (mode === 'signup' && !agreed) {
      setError('You need to agree to the Terms & Privacy Policy to continue.')
      return
    }

    setError('')

    if (mode === 'signup') {
      // Carry the real typed name/email forward through the rest of onboarding —
      // the account itself gets created at the end, once we also have their
      // profile details, so it's a single real signup, not a half-built one.
      navigate('/verify', { state: { name: `${firstName.trim()} ${lastName.trim()}`.trim(), email: email.trim() } })
      return
    }

    // Login: no password check by design — just find the account by email.
    setSubmitting(true)
    try {
      const user = await lookupUserByEmail(email.trim())
      login(user)
      navigate('/')
    } catch {
      setError('No account found with that email. Try signing up instead.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-form-wrap">
      <h1 className="auth-heading">{mode === 'login' ? 'Log in' : 'Sign up'}</h1>
      <p className="auth-subtext">
        {mode === 'login'
          ? 'Log in with your college email.'
          : 'Create your skillX account with your college email — only students can join.'}
      </p>

      <div className="tab-row tab-row-centered">
        <button
          type="button"
          className={'tab' + (mode === 'login' ? ' active' : '')}
          onClick={() => switchMode('login')}
        >
          Log in
        </button>
        <button
          type="button"
          className={'tab' + (mode === 'signup' ? ' active' : '')}
          onClick={() => switchMode('signup')}
        >
          Sign up
        </button>
      </div>

      <form className="form-stack" onSubmit={handleSubmit}>
        {mode === 'signup' && (
          <div className="name-row">
            <label>
              First name
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </label>
            <label>
              Last name
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </label>
          </div>
        )}

        <label>
          College email
          <input
            type="email"
            placeholder="you@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        {mode === 'signup' && (
          <label className="checkbox-row checkbox-row-terms">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <span>I agree to the skillX Terms of Service and Privacy Policy.</span>
          </label>
        )}

        {error && <p className="form-error form-error-centered">{error}</p>}

        <button type="submit" className="btn btn-block" disabled={submitting}>
          {submitting ? 'Logging in…' : mode === 'login' ? 'Log in' : 'Join skillX'}
        </button>
      </form>

      <p className="auth-switch">
        {mode === 'login' ? (
          <>Don't have an account? <button type="button" className="link-btn" onClick={() => switchMode('signup')}>Sign up</button></>
        ) : (
          <>Already have an account? <button type="button" className="link-btn" onClick={() => switchMode('login')}>Log in</button></>
        )}
      </p>
    </div>
  )
}
