import { Link } from 'react-router-dom'
import '../styles/gamers.css'

// points are in the diagram's own units: image sits at 310,170 and is 1180x659
const callouts = [
  {
    title: 'Hall effect analog triggers',
    sub: 'Magnetic, so no drift',
    point: [505, 182],
    label: [40, 92],
    side: 'left',
  },
  {
    title: 'Hall effect sticks',
    sub: 'Both of them',
    point: [475, 415],
    label: [40, 400],
    side: 'left',
  },
  {
    title: '720 × 720 display',
    sub: '3.95 in, 258 ppi',
    point: [1150, 300],
    label: [1540, 230],
    side: 'right',
  },
  {
    title: 'Side buttons',
    sub: 'Volume and power',
    point: [1478, 545],
    label: [1540, 560],
    side: 'right',
  },
  {
    title: 'Cartridge slot',
    sub: 'Along the bottom edge',
    point: [900, 828],
    label: [900, 920],
    side: 'bottom',
  },
]

// same 2 mm of screen at each density
const MM = 2
const TILE = 240

export default function Gamers() {
  return (
    <>
      <header className="page-head wrap">
        <h1>A handheld for the games you love keeping</h1>
        <p className="lede">
          Cartridges and downloads in one library, an interface you can make your own,
          and your friends one tap away.
        </p>
      </header>

      <section className="section diagram-section">
        <div className="wrap">
          <figure className="diagram glass">
            <svg viewBox="0 0 1800 980" role="img" aria-labelledby="diagram-title">
              <title id="diagram-title">Warpdrive front view with its main parts labelled</title>
              <image href="/img/wd01-front.webp" x="310" y="170" width="1180" height="659" />
              {callouts.map((c) => {
                const [px, py] = c.point
                const [lx, ly] = c.label
                let path
                if (c.side === 'left') {
                  path = `M${px},${py} L${lx + 330},${ly} L${lx},${ly}`
                } else if (c.side === 'right') {
                  path = `M${px},${py} L${lx - 20},${ly} L${lx + 230},${ly}`
                } else {
                  path = `M${px},${py} L${lx},${ly - 44}`
                }
                const anchor = c.side === 'bottom' ? 'middle' : 'start'
                return (
                  <g key={c.title} className="callout">
                    <path d={path} />
                    <circle cx={px} cy={py} r="7" />
                    <text x={lx} y={ly - 14} textAnchor={anchor} className="callout-title">{c.title}</text>
                    <text x={lx} y={ly + 26} textAnchor={anchor} className="callout-sub">{c.sub}</text>
                  </g>
                )
              })}
            </svg>
            <ul className="diagram-list">
              {callouts.map((c) => (
                <li key={c.title}>
                  <strong>{c.title}</strong> {c.sub}
                </li>
              ))}
            </ul>
          </figure>
        </div>
      </section>

      <section className="section">
        <div className="wrap density">
          <div className="density-copy">
            <h2>Sharper than a 4K monitor</h2>
            <p>
              The screen is a perfect square: 720 by 720 pixels in 3.95 inches. That packs
              258 pixels into every inch, where a 24-inch 4K monitor manages 184. Text is
              crisp and pixel art stays clean at every scale.
            </p>
          </div>
          <div className="density-tiles">
            {[
              {
                name: 'Warpdrive',
                ppi: 258,
              },
              {
                name: '24-inch 4K monitor',
                ppi: 184,
              },
            ].map((d) => {
              const pitch = TILE / (MM * d.ppi / 25.4)
              return (
                <figure key={d.name} className="tile">
                  <div
                    className="tile-grid"
                    style={{ backgroundSize: `${pitch}px ${pitch}px` }}
                    aria-hidden="true"
                  />
                  <figcaption>
                    <strong>{d.ppi} ppi</strong>
                    {d.name}
                  </figcaption>
                </figure>
              )
            })}
            <p className="tile-note">The same 2 mm of each screen, magnified.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap pillars">
          <article>
            <h2>Cartridges and downloads, both yours</h2>
            <p>
              Buy a game on a cartridge and it plays straight from the slot. Buy it digitally and it's tied to your account, not to a
              subscription. Lend cartridges, trade them, keep a shelf.
            </p>
          </article>
          <article>
            <h2>Make it look like yours</h2>
            <p>
              The themes and frontends store is full of free skins, layouts and whole
              replacement interfaces the community made. The homebrew store sits beside it,
              and sideloading your own projects is always allowed. Nothing to unlock first.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="wrap feel glass">
          <div>
            <h2>Made to be held for hours</h2>
            <p>
              Hall effect sensors in both sticks and both analog triggers track position
              with magnets, so there's nothing rubbing inside to wear out and drift. The
              grips curve into your palms, and the triggers sit where your fingers rest.
            </p>
          </div>
          <div className="battery">
            <p className="chrome battery-num">7 h</p>
            <p>
              Of play on demanding games. In shorter sessions, a charge lasts longer still.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap friends">
          <h2>Your friends are already here</h2>
          <p>
            Warpdrive uses Rotur accounts, so your profile, friends and badges follow you
            from the handheld to the web. Talk in originChats, and see what your friends
            are up to.
          </p>
          <Link className="gel" to="/account">Sign in with Rotur</Link>
        </div>
      </section>
    </>
  )
}
