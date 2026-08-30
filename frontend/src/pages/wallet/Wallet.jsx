const TRANSACTIONS = [
  { id: 1, text: '+2 credits — taught Python tutoring session', delta: '+2' },
  { id: 2, text: '-1 credit — learned Figma basics from Alex', delta: '-1' },
  { id: 3, text: '+1 credit — helped edit a promo video', delta: '+1' },
]

export default function Wallet() {
  return (
    <div className="page">
      <div className="page-eyebrow">Credits / Wallet</div>
      <h1>Wallet</h1>
      <div className="wallet-balance">120 Campus Credits</div>
      <p className="page-desc">One combined screen — balance and transaction history together, no separate drill-down.</p>

      <ul className="feed-list feed-list-muted">
        {TRANSACTIONS.map((t) => (
          <li key={t.id}>
            {t.text} <span className="status-pill">{t.delta}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
