import { useState } from 'react'
import { Link } from 'react-router-dom'

const INITIAL_INVITES = [
  { id: 101, project: 'Campus Event Finder', role: 'Frontend', to: '/team-builder/2/team' },
  { id: 102, project: 'Library Queue Predictor', role: 'Backend', to: '/team-builder/3/team' },
]

const INITIAL_PROJECTS = [
  {
    id: 1,
    title: 'AI-based waste management app',
    status: 'Recommending Team',
    members: [
      { name: 'Nisha V.', joined: true },
      { name: 'Kabir M.', joined: true },
      { name: 'Sana T.', joined: false },
    ],
    to: '/team-builder/1/team',
    actionLabel: 'View Team',
  },
  {
    id: 2,
    title: 'Smart Attendance System',
    status: 'In Progress',
    members: [
      { name: 'Divya P.', joined: true },
      { name: 'Rohan T.', joined: true },
    ],
    to: '/team-builder/2/conversation',
    actionLabel: 'Open',
  },
  {
    id: 3,
    title: 'Campus Marketplace Redesign',
    status: 'Completed',
    members: [
      { name: 'Aisha K.', joined: true },
      { name: 'Vikram S.', joined: true },
      { name: 'Neha R.', joined: true },
    ],
    to: '/team-builder/3/review',
    actionLabel: 'View Summary',
  },
]

function statusSlug(status) {
  return status.toLowerCase().replace(/\s+/g, '-')
}

export default function MyProjects() {
  const [invites, setInvites] = useState(INITIAL_INVITES)
  const [projects, setProjects] = useState(INITIAL_PROJECTS)

  function handleAccept(invite) {
    setInvites((prev) => prev.filter((i) => i.id !== invite.id))
    setProjects((prev) => [
      ...prev,
      {
        id: invite.id,
        title: invite.project,
        status: 'In Progress',
        members: [{ name: 'You', joined: true }],
        to: `/team-builder/${invite.id}/conversation`,
        actionLabel: 'Open',
      },
    ])
  }

  function handleDecline(invite) {
    setInvites((prev) => prev.filter((i) => i.id !== invite.id))
  }

  return (
    <div className="page">
      <div className="page-eyebrow">Project Team Builder</div>
      <h1>My Projects</h1>
      <p className="page-desc">Projects you've started, plus invites where the AI recommended you for a role.</p>

      {invites.length > 0 && (
        <section className="profile-section">
          <div className="profile-section-title">Team invites ({invites.length})</div>
          <ul className="feed-list">
            {invites.map((inv) => (
              <li key={inv.id} className="invite-card">
                <div>
                  <strong>{inv.project}</strong>
                  <div className="page-desc">AI recommended you for the {inv.role} role</div>
                </div>
                <div className="invite-actions">
                  <button type="button" className="btn btn-small" onClick={() => handleAccept(inv)}>Accept</button>
                  <button type="button" className="btn btn-small btn-ghost" onClick={() => handleDecline(inv)}>Decline</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="profile-section">
        <div className="profile-section-title">My Projects</div>
        <ul className="project-card-list">
          {projects.map((p) => {
            const joinedCount = p.members.filter((m) => m.joined).length
            const isForming = p.status === 'Recommending Team'
            return (
              <li key={p.id} className="project-card">
                <div className="project-card-top">
                  <span className="project-card-title">{p.title}</span>
                  <span className={'status-pill status-' + statusSlug(p.status)}>{p.status}</span>
                </div>
                <div className="project-card-members">
                  <div className="avatar-stack">
                    {p.members.map((m, i) => (
                      <span
                        key={i}
                        className={'avatar-chip' + (m.joined ? '' : ' avatar-pending')}
                        title={m.name + (m.joined ? '' : ' (invited, not yet joined)')}
                      >
                        🧑
                      </span>
                    ))}
                  </div>
                  <span className="page-desc">
                    {isForming ? `${joinedCount} of ${p.members.length} joined` : `${p.members.length} member${p.members.length > 1 ? 's' : ''}`}
                  </span>
                </div>
                <Link to={p.to} className="btn btn-small">{p.actionLabel}</Link>
              </li>
            )
          })}
        </ul>
      </section>

      <div className="page-actions">
        <Link to="/team-builder/new" className="btn">+ Start New Project</Link>
      </div>
    </div>
  )
}
