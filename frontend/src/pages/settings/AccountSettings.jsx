import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../auth.js'
import { getUser, updateUser, getCurrentUserId } from '../../api.js'

export default function AccountSettings() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [department, setDepartment] = useState('')
  const [year, setYear] = useState('')
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    getUser(getCurrentUserId())
      .then((user) => {
        if (cancelled) return
        setName(user.name || '')
        setDepartment(user.department || '')
        setYear(user.year ? String(user.year) : '')
      })
      .catch((err) => { if (!cancelled) setLoadError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Name is required.')
      setSaved(false)
      return
    }
    setError('')
    setSaving(true)
    try {
      await updateUser(getCurrentUserId(), {
        name: name.trim(),
        department: department.trim() || null,
        year: year ? Number(year) : null,
      })
      setSaved(true)
    } catch (err) {
      setError(err.message)
      setSaved(false)
    } finally {
      setSaving(false)
    }
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="page">
      <div className="page-eyebrow">Settings / Account — live from the real backend + database</div>
      <h1>Account Settings</h1>
      <p className="page-desc">
        Account-level settings only — skill editing lives in Skill Profile, not here.
      </p>

      {loading ? (
        <div className="loading-state">
          <span className="spinner" aria-hidden="true" />
          Loading your account…
        </div>
      ) : loadError ? (
        <p className="form-error">Couldn't load your account: {loadError}</p>
      ) : (
        <form className="form-stack" onSubmit={handleSave}>
          <label>
            Name
            <input type="text" value={name} onChange={(e) => { setName(e.target.value); setSaved(false) }} />
          </label>
          <label>
            Department
            <input type="text" value={department} onChange={(e) => { setDepartment(e.target.value); setSaved(false) }} />
          </label>
          <label>
            Year
            <input type="number" min="1" max="6" value={year} onChange={(e) => { setYear(e.target.value); setSaved(false) }} />
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={emailNotifs}
              onChange={(e) => { setEmailNotifs(e.target.checked); setSaved(false) }}
            />
            Email notifications
          </label>

          {error && <p className="form-error">{error}</p>}
          {saved && <p className="form-success">Saved.</p>}

          <div className="page-actions">
            <button type="submit" className="btn" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
            <button type="button" className="btn btn-ghost" onClick={handleLogout}>Log out</button>
          </div>
        </form>
      )}
    </div>
  )
}
