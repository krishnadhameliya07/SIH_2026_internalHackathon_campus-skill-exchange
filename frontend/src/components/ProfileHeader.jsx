export default function ProfileHeader({ name, subtitle, bio, stats, actions }) {
  return (
    <div className="profile-header">
      <div className="profile-avatar-lg">🧑</div>
      <div className="profile-header-info">
        <h1 className="profile-name">{name}</h1>
        <p className="profile-subtitle">{subtitle}</p>
        {bio && <p className="profile-bio">{bio}</p>}

        {stats && stats.length > 0 && (
          <div className="profile-stats">
            {stats.map((s) => (
              <div className="profile-stat" key={s.label}>
                <div className="profile-stat-value">{s.value}</div>
                <div className="profile-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {actions && <div className="page-actions">{actions}</div>}
      </div>
    </div>
  )
}
