import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function ProfileSkillsSetup() {
  const location = useLocation()
  const navigate = useNavigate()
  const [department, setDepartment] = useState('')
  const [year, setYear] = useState('')
  const [bio, setBio] = useState('')
  const [availability, setAvailability] = useState('')

  function handleContinue(e) {
    e.preventDefault()
    navigate('/onboarding/confirm', {
      state: {
        ...location.state,
        department: department.trim() || undefined,
        year: year ? Number(year) : undefined,
        bio: bio.trim() || undefined,
        availability: availability.trim() || undefined,
      },
    })
  }

  return (
    <div className="page">
      <div className="page-eyebrow">Auth & Onboarding</div>
      <h1>Profile & Skills Setup</h1>
      <p className="page-desc">
        Basic info now — skills come next, once your account exists (AI extraction from
        resume/GitHub happens later, in Edit Skills).
      </p>

      <form className="form-stack" onSubmit={handleContinue}>
        <label>
          Department
          <input type="text" placeholder="e.g. Computer Science" value={department} onChange={(e) => setDepartment(e.target.value)} />
        </label>
        <label>
          Year
          <input type="number" min="1" max="6" placeholder="e.g. 3" value={year} onChange={(e) => setYear(e.target.value)} />
        </label>
        <label>
          Bio
          <textarea rows={3} placeholder="A line or two about yourself" value={bio} onChange={(e) => setBio(e.target.value)} />
        </label>
        <label>
          Availability
          <input type="text" placeholder="e.g. weekends" value={availability} onChange={(e) => setAvailability(e.target.value)} />
        </label>

        <div className="page-actions">
          <button type="submit" className="btn">Continue → AI Confirm</button>
        </div>
      </form>
    </div>
  )
}
