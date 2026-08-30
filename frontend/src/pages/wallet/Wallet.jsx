import { useState } from 'react'

const TRANSACTIONS = [
  { id: 1, title: 'Python tutoring session', subtitle: 'Taught a Python session to a fellow student', date: 'May 28, 2025', delta: 2 },
  { id: 2, title: 'Figma basics from Alex', subtitle: 'Learned Figma basics from Alex', date: 'May 27, 2025', delta: -1 },
  { id: 3, title: 'Promo video edit', subtitle: 'Helped edit a promo video for a club event', date: 'May 26, 2025', delta: 1 },
  { id: 4, title: 'Mentorship session', subtitle: 'Mentored a junior on React basics', date: 'May 24, 2025', delta: 5 },
  { id: 5, title: 'Poster design help', subtitle: 'Got help designing an event poster', date: 'May 20, 2025', delta: -3 },
  { id: 6, title: 'Team project — landing page', subtitle: 'Built the landing page for a team project', date: 'May 15, 2025', delta: 3 },
]

const WAYS_TO_EARN = [
  { title: 'Teach a session', detail: 'Help a fellow student learn something you know', range: '+2 to +5' },
  { title: 'Complete a request', detail: 'Take on a Marketplace request and deliver it', range: '+1 to +4' },
  { title: 'Mentor someone', detail: 'Guide another student through a learning path', range: '+3 to +5' },
  { title: 'Verify your skills', detail: 'Add evidence to your skill graph', range: '+1' },
]

export default function Wallet() {
  const [showAll, setShowAll] = useState(false)

  const balance = 120
  const earnedThisMonth = TRANSACTIONS.filter((t) => t.delta > 0).reduce((sum, t) => sum + t.delta, 0)
  const visible = showAll ? TRANSACTIONS : TRANSACTIONS.slice(0, 4)

  return (
    <div className="page">
      <div className="page-eyebrow">Credits / Wallet</div>
      <h1>Wallet</h1>
      <p className="page-desc">Your campus credits balance and activity, earned by helping others and spent on getting help.</p>

      <div className="wallet-hero">
        <div>
          <div className="wallet-hero-label">Available Balance</div>
          <div className="wallet-balance">{balance} <span className="wallet-balance-unit">credits</span></div>
        </div>
        <div className="wallet-hero-stats">
          <div>
            <div className="profile-stat-value">+{earnedThisMonth}</div>
            <div className="profile-stat-label">Earned this month</div>
          </div>
          <div>
            <div className="profile-stat-value">{TRANSACTIONS.length}</div>
            <div className="profile-stat-label">Transactions</div>
          </div>
        </div>
      </div>

      <section className="profile-section">
        <div className="profile-section-title">Recent Activity</div>
        <ul className="wallet-activity-list">
          {visible.map((t) => (
            <li key={t.id} className="wallet-activity-item">
              <span className={'wallet-activity-icon ' + (t.delta > 0 ? 'earn' : 'spend')}>
                {t.delta > 0 ? '↑' : '↓'}
              </span>
              <div className="wallet-activity-body">
                <div className="wallet-activity-title">{t.title}</div>
                <div className="wallet-activity-subtitle">{t.subtitle}</div>
              </div>
              <div className="wallet-activity-right">
                <span className={'wallet-activity-delta ' + (t.delta > 0 ? 'earn' : 'spend')}>
                  {t.delta > 0 ? '+' : ''}{t.delta}
                </span>
                <div className="wallet-activity-date">{t.date}</div>
              </div>
            </li>
          ))}
        </ul>
        {TRANSACTIONS.length > 4 && (
          <button type="button" className="link-small wallet-toggle" onClick={() => setShowAll((v) => !v)}>
            {showAll ? 'Show less' : `Show all ${TRANSACTIONS.length} transactions`}
          </button>
        )}
      </section>

      <section className="profile-section">
        <div className="profile-section-title">How to Earn Credits</div>
        <ul className="wallet-earn-list">
          {WAYS_TO_EARN.map((w) => (
            <li key={w.title} className="wallet-earn-item">
              <div>
                <div className="wallet-earn-title">{w.title}</div>
                <div className="wallet-activity-subtitle">{w.detail}</div>
              </div>
              <span className="wallet-earn-range">{w.range}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
