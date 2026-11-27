import Splits from '../components/Splits.jsx'
import { links, engines } from '../config'
import '../styles/developers.css'
import '../styles/splits.css'

const steps = [
  {
    title: 'Build',
    body: 'Make your game with the engine you already like, web or native. There\'s no dev kit to buy and no application to fill in.',
  },
  {
    title: 'Sideload',
    body: 'Put builds straight onto your own Warpdrive to test them on the real screen and real controls.',
  },
  {
    title: 'Share',
    body: 'Publish free builds to the homebrew store any time, and get feedback in originChats while you work.',
  },
  {
    title: 'Release',
    body: 'Submit to the Warpdrive store. Sell digitally and keep 90%, or press cartridges and keep 75%.',
  },
]

export default function Developers() {
  return (
    <>
      <header className="dev-head">
        <div className="wrap">
          <h1>Make games for Warpdrive, for free</h1>
          <p className="lede">
            No kit to buy, nothing to apply for, no gatekeeping. If you can build it,
            you can run it on Warpdrive and share it.
          </p>
        </div>
      </header>

      <section className="section">
        <div className="wrap">
          <h2>Bring the engine you already use</h2>
          <p className="runtime-lede">
            Warpdrive gives web and native developers the same footing: a web runtime for
            TurboWarp, Scratch mods and HTML5 exports, and Android binary support for
            everything that compiles. If your engine ships either, it ships here.
          </p>
          <div className="runtimes">
            <article className="runtime glass">
              <p className="tech">web runtime</p>
              <h3>Runs in the built-in web engine</h3>
              <ul>
                {engines.web.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </article>
            <article className="runtime glass">
              <p className="tech">android binaries</p>
              <h3>Runs as a native build</h3>
              <ul>
                {engines.native.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </article>
          </div>
          <p className="runtime-note">
            SDKs for a handful of these engines are in active development, alongside a
            frontend SDK for building your own console UI. Both are open on{' '}
            <a href={links.github} target="_blank" rel="noreferrer">GitHub</a>.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap dev-hw glass">
          <div>
            <h2>Honest hardware</h2>
            <p>
              Every unit pairs a Snapdragon 778G-class chip with 8 GB of LPDDR4X and that
              720 × 720 screen. It's the middle ground on purpose: enough headroom that a
              jam build runs fine, and enough of a ceiling that optimising your game is
              worth your while.
            </p>
          </div>
          <dl className="hw-specs">
            <div>
              <dt className="chrome">778G</dt>
              <dd>-class Snapdragon</dd>
            </div>
            <div>
              <dt className="chrome">8 GB</dt>
              <dd>LPDDR4X memory</dd>
            </div>
            <div>
              <dt className="chrome">720²</dt>
              <dd>pixels, one square</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="section">
        <div className="wrap dev-split">
          <div>
            <h2>The split</h2>
            <p>
              You made the game, so you keep the bigger share. Physical cartridges have a
              different split from digital titles, and homebrew is free to publish.
            </p>
          </div>
          <div className="glass dev-split-panel">
            <Splits />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2>From idea to release</h2>
          <ol className="steps">
            {steps.map((s, i) => (
              <li key={s.title} className="step">
                <span className="step-num chrome" aria-hidden="true">{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="wrap dev-target">
          <div className="target-screen" aria-hidden="true">
            <span>720</span>
            <span>720</span>
          </div>
          <div>
            <h2>One screen to design for</h2>
            <p>
              Every Warpdrive has the same square display, two Hall effect sticks
              and two analog triggers. Design for one resolution and one set of controls,
              and it looks the way you meant on every unit.
            </p>
            <p>
              Square makes some things easier than you'd think: UI fits without letterboxing,
              and pixel art scales cleanly at 2×, 3×, 4× and up.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap dev-accounts glass">
          <div>
            <h2>Your players are already signed in</h2>
            <p>
              Warpdrive accounts are Rotur accounts. Your game can show a player's name
              and avatar, see their friends and hand out badges, without you building
              sign-up, passwords or moderation tools. The same account works on the web,
              so your game's site can use Sign in with Rotur too.
            </p>
          </div>
          <div className="dev-links">
            <a className="btn-glass" href={links.roturDocs} target="_blank" rel="noreferrer">Read the Rotur docs</a>
            <a className="btn-glass" href={links.originChats} target="_blank" rel="noreferrer">Open originChats</a>
          </div>
        </div>
      </section>

      <section className="section join">
        <div className="wrap join-inner">
          <h2>Ask anything, share everything</h2>
          <p>
            The team and other developers hang out in the Discord. The SDKs, issues and
            examples live on GitHub.
          </p>
          <div className="actions">
            <a className="gel" href={links.discord} target="_blank" rel="noreferrer">Join the Discord</a>
            <a className="btn-glass" href={links.github} target="_blank" rel="noreferrer">View on GitHub</a>
          </div>
        </div>
      </section>
    </>
  )
}
