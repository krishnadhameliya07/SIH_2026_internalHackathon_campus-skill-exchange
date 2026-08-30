import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../auth.js'

export default function AccountSettings() {
  const navigate = useNavigate()
  const [name, setName] = useState('Bhavani')
  const [department, setDepartment] = useState('Computer Science')
  const [year, setYear] = useState('3rd year')
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  function handleSave(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Name is required.')
      setSaved(false)
      return
    }
    setError('')
    setSaved(true)
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="page">
      <div className="page-eyebrow">Settings / Account</div>
      <h1>Account Settings</h1>
      <p className="page-desc">
        Account-level settings only — skill editing lives in Skill Profile, not here.
      </p>

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
          <input type="text" value={year} onChange={(e) => { setYear(e.target.value); setSaved(false) }} />
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
          <button type="submit" className="btn">Save changes</button>
          <button type="button" className="btn btn-ghost" onClick={handleLogout}>Log out</button>
        </div>
      </form>
    </div>
  )
}
