import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

const LISTINGS = [
  {
    id: 1,
    type: 'Request',
    posterId: 'priya',
    poster: 'Priya S.',
    title: 'Need a poster designed for our hackathon',
    tags: ['Graphic Design', 'Poster'],
    meta: 'Due Friday',
    category: 'Design',
  },
  {
    id: 2,
    type: 'Offer',
    posterId: 'alex',
    poster: 'Alex R.',
    title: 'I can teach Python to beginners on weekends',
    tags: ['Python', 'Tutoring'],
    meta: 'Weekends · 1 credit/hr',
    category: 'Tutoring',
  },
  {
    id: 3,
    type: 'Request',
    posterId: 'mira',
    poster: 'Mira K.',
    title: 'Need someone to edit a 5-minute promo video',
    tags: ['Video Editing'],
    meta: 'Due Saturday',
    category: 'Video & Media',
  },
]

const POPULAR_TAGS = ['Poster Design', 'Video Editing', 'Web Development', 'Logo Design', 'Python Tutoring']

const CATEGORIES = [
  { name: 'Design', icon: '🎨' },
  { name: 'Programming', icon: '💻' },
  { name: 'Writing', icon: '✍️' },
  { name: 'Video & Media', icon: '🎬' },
  { name: 'Tutoring', icon: '📚' },
  { name: 'Other', icon: '🔧' },
]

export default function MarketplaceFeed() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('need') // 'need' | 'can'
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)

  function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) {
      setError(mode === 'need' ? 'Describe what you need help with.' : 'Describe what you can offer.')
      return
    }
    setError('')
    const destination = mode === 'need' ? '/marketplace/post-request' : '/marketplace/post-offer'
    navigate(destination, { state: { prefill: text.trim() } })
  }

  function handlePopularTag(tag) {
    setMode('need')
    setText(`I need help with ${tag.toLowerCase()}`)
    if (error) setError('')
  }

  function toggleCategory(name) {
    setSelectedCategory((prev) => (prev === name ? null : name))
  }

  const filteredListings = selectedCategory
    ? LISTINGS.filter((l) => l.category === selectedCategory)
    : LISTINGS

  return (
    <div className="page">
      <div className="page-eyebrow">Marketplace</div>
      <h1>Marketplace</h1>

      <div className="tab-row">
        <NavLink to="/marketplace" end className={({ isActive }) => 'tab' + (isActive ? ' active' : '')}>
          Feed
        </NavLink>
        <NavLink to="/marketplace/my-activity" className={({ isActive }) => 'tab' + (isActive ? ' active' : '')}>
          My Activity
        </NavLink>
      </div>

      <form className="hero-box" onSubmit={handleSubmit}>
        <div className="hero-toggle">
          <button
            type="button"
            className={'toggle-btn' + (mode === 'need' ? ' active' : '')}
            onClick={() => setMode('need')}
          >
            I need help
          </button>
          <button
            type="button"
            className={'toggle-btn' + (mode === 'can' ? ' active' : '')}
            onClick={() => setMode('can')}
          >
            I can help
          </button>
        </div>
        <input
          type="text"
          value={text}
          onChange={(e) => { setText(e.target.value); if (error) setError('') }}
          placeholder={
            mode === 'need'
              ? 'e.g. I need someone to edit a 5-minute promotional video by Saturday'
              : 'e.g. I can teach Python to beginners on weekends'
          }
        />
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn">Submit</button>

        <div className="popular-row">
          <span className="popular-label">Popular:</span>
          {POPULAR_TAGS.map((tag) => (
            <button key={tag} type="button" className="popular-tag" onClick={() => handlePopularTag(tag)}>
              {tag}
            </button>
          ))}
        </div>
      </form>

      <div className="category-row">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            type="button"
            className={'category-chip' + (selectedCategory === cat.name ? ' active' : '')}
            onClick={() => toggleCategory(cat.name)}
          >
            <span aria-hidden="true">{cat.icon}</span> {cat.name}
          </button>
        ))}
      </div>

      <div className="filter-bar">
        <select defaultValue="">
          <option value="" disabled>Availability</option>
          <option>This week</option>
          <option>Weekends</option>
        </select>
        <select defaultValue="recent">
          <option value="recent">Sort: Recent</option>
          <option value="relevance">Sort: Relevance</option>
        </select>
      </div>

      {filteredListings.length > 0 ? (
        <ul className="listing-feed">
          {filteredListings.map((listing) => (
            <li key={listing.id} className="listing-card">
              <Link to={`/profile/${listing.posterId}`} className="listing-poster">
                🧑 {listing.poster}
              </Link>
              <Link to={`/marketplace/listing/${listing.id}`} className="listing-body">
                <span className={'listing-badge ' + listing.type.toLowerCase()}>{listing.type}</span>
                <h3>{listing.title}</h3>
                <div className="listing-tags">
                  {listing.tags.map((t) => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>
                <div className="listing-meta">{listing.meta}</div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="page-desc fallback-note">
          Nothing posted in {selectedCategory} yet. <button type="button" className="link-btn" onClick={() => setSelectedCategory(null)}>Clear filter</button>
        </p>
      )}
    </div>
  )
}
