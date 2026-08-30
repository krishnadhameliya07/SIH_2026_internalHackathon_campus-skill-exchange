import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const INITIAL_MESSAGES = [
  { id: 1, from: 'them', text: "Hey! Happy to help with this — when's the deadline?" },
  { id: 2, from: 'me', text: 'Saturday evening works, thanks!' },
  { id: 3, from: 'them', text: "Sounds good, I'll get started." },
]

/**
 * Shared screen — reused as-is by Marketplace, Team Builder, and Mentorship
 * (one implementation, not three), per the agreed UI map. Behavior at the
 * bottom of the thread differs slightly by context, since Marketplace/Team
 * Builder tasks have a one-shot completion screen but Mentorship treats
 * ending the relationship as an action from My Mentorships instead.
 */
export default function ConversationThread() {
  const location = useLocation()
  const segments = location.pathname.split('/').filter(Boolean)
  const area = segments[0] // 'marketplace' | 'team-builder' | 'mentorship'

  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [draft, setDraft] = useState('')

  function handleSend(e) {
    e.preventDefault()
    if (!draft.trim()) return
    setMessages((prev) => [...prev, { id: prev.length + 1, from: 'me', text: draft.trim() }])
    setDraft('')
  }

  let completeAction = null
  if (area === 'marketplace') {
    const id = segments[2] ?? '102'
    completeAction = { to: `/marketplace/review/${id}`, label: 'Mark task complete →' }
  } else if (area === 'team-builder') {
    const projectId = segments[1] ?? '1'
    completeAction = { to: `/team-builder/${projectId}/review`, label: 'Mark project complete →' }
  } else if (area === 'mentorship') {
    completeAction = { to: '/mentorship', label: '← Back to My Mentorships to end this mentorship' }
  }

  return (
    <div className="page">
      <div className="page-eyebrow">Shared screen — reused across areas</div>
      <h1>Conversation</h1>
      <p className="page-desc">
        Coordinate the task/project/mentoring session here. Deliberately simple —
        no video calling or file sharing, per the "don't build feature-heavy" constraint.
      </p>

      <div className="thread">
        {messages.map((m) => (
          <div key={m.id} className={'thread-msg ' + m.from}>{m.text}</div>
        ))}
      </div>

      <form className="thread-input" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Type a message…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="submit" className="btn btn-small">Send</button>
      </form>

      {completeAction && (
        <div className="page-actions">
          <Link to={completeAction.to} className="btn btn-ghost">{completeAction.label}</Link>
        </div>
      )}
    </div>
  )
}
