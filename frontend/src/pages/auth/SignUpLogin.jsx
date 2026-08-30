import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../../auth.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function SignUpLogin() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')

  function switchMode(next) {
    setMode(next)
    setError('')
  }

  function handleSubmit(e) {
    e.preventDefault()

    if (mode === 'signup' && !firstName.trim()) {
      setError('Enter your first name.')
      return
    }
    if (!EMAIL_RE.test(email)) {
      setError('Enter a valid college email.')
      return
    }
    if (!password) {
      setError(mode === 'login' ? 'Enter your password.' : 'Choose a password.')
      return
    }
    if (mode === 'signup' && !agreed) {
      setError('You need to agree to the Terms & Privacy Policy to continue.')
      return
    }

    setError('')
    if (mode === 'login') {
      login()
      navigate('/')
    } else {
      navigate('/verify')
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

        <label>
          Password
          <div className="password-field">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </label>

        {mode === 'signup' && (
          <label className="checkbox-row checkbox-row-terms">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <span>I agree to the skillX Terms of Service and Privacy Policy.</span>
          </label>
        )}

        {error && <p className="form-error form-error-centered">{error}</p>}

        <button type="submit" className="btn btn-block">
          {mode === 'login' ? 'Log in' : 'Join skillX'}
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
