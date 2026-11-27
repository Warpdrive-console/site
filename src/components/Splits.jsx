const rows = [
  {
    label: 'Digital titles',
    dev: 90,
  },
  {
    label: 'Physical cartridges',
    dev: 75,
  },
]

export default function Splits() {
  return (
    <div className="splits">
      {rows.map((r) => (
        <div className="split" key={r.label}>
          <div className="split-head">
            <span>{r.label}</span>
            <span className="split-nums">
              <strong>{r.dev}%</strong> to you, {100 - r.dev}% to Warpdrive
            </span>
          </div>
          <div className="split-track" role="img" aria-label={`${r.dev} percent to the developer`}>
            <div className="split-fill" style={{ width: `${r.dev}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}
