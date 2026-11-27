import { lazy } from 'react'
import { Link } from 'react-router-dom'
import Splits from '../components/Splits.jsx'
import { links } from '../config'
import '../styles/home.css'
import '../styles/splits.css'

const Hero3D = lazy(() => import('../components/Hero3D.jsx'))

const heroImg = (
  <img
    className="hero-device"
    src="/img/wd01-hero.webp"
    width="1400"
    height="1050"
    alt="The Warpdrive handheld, angled toward the viewer"
  />
)

const engineRow = ['TurboWarp', 'Godot', 'Unity', 'GameMaker', 'Construct', 'GDevelop', 'GB Studio', 'PICO-8']

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="sky-clouds" aria-hidden="true" />
        <div className="wrap hero-grid">
          <div className="hero-square glass hud">
            <h1>Own every game you play.</h1>
            <p className="lede">
              Warpdrive is an indie handheld for cartridges and digital games.
              Mod it, sideload to it, make games for it, and play with friends.
            </p>
            <div className="actions">
              <Link className="gel" to="/gamers">See the handheld</Link>
              <Link className="btn-glass" to="/developers">Make games for it</Link>
            </div>
            <span className="hero-ratio" aria-hidden="true">1:1</span>
          </div>
          <Hero3D fallback={heroImg} />
        </div>
        <div className="horizon" aria-hidden="true" />
      </section>

      <section className="engine-strip" aria-label="Engines Warpdrive runs">
        <div className="wrap engine-row">
          <span className="tech">runs builds from</span>
          <ul>
            {engineRow.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          <Link className="text-link" to="/developers">and more</Link>
        </div>
      </section>

      <section className="section">
        <div className="wrap keep">
          <h2>Yours to keep</h2>
          <div className="keep-grid">
            <article className="keep-main glass">
              <h3>Cartridges and downloads</h3>
              <p>
                Slot in a cartridge or download a game. Either way you own it: no subscription
                to keep playing, and nothing that disappears when a store closes.
              </p>
              <p className="keep-aside">Physical and digital games share one library.</p>
            </article>
            <ul className="keep-list">
              <li>
                <h3>Make the interface yours</h3>
                <p>Themes, layouts, whole replacement frontends. Modding is welcome here.</p>
              </li>
              <li>
                <h3>Sideload anything</h3>
                <p>Homebrew, prototypes, your friend's jam game. No unlock and no fee.</p>
              </li>
              <li>
                <h3>Play with friends</h3>
                <p>
                  One Rotur account for your profile and friends, and originChats for talking,
                  on the handheld and on the web.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section stores">
        <div className="wrap">
          <h2>Three stores, one console</h2>
          <div className="store-grid">
            <article className="store glass">
              <p className="tech">01 — curated</p>
              <h3>The Warpdrive store</h3>
              <p>
                Finished games, submitted by their developers and checked before they go up.
                Digital or on cartridge.
              </p>
            </article>
            <article className="store glass">
              <p className="tech">02 — open</p>
              <h3>The homebrew store</h3>
              <p>
                Experiments, tools and works in progress. Anyone can publish, everything is
                free to browse.
              </p>
            </article>
            <article className="store glass">
              <p className="tech">03 — free</p>
              <h3>Themes &amp; frontends</h3>
              <p>
                Skins, layouts and whole custom frontends from the community. All of it free,
                all of it removable.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section hardware">
        <div className="wrap hardware-grid">
          <img
            className="hardware-device"
            src="/img/wd01-back.webp"
            width="1400"
            height="1050"
            loading="lazy"
            alt="The back of the Warpdrive, showing its contoured grips and analog triggers"
          />
          <div>
            <h2>Small, sharp, and built to hold</h2>
            <dl className="specs">
              <div>
                <dt className="chrome">258 ppi</dt>
                <dd>
                  A 720 × 720 square screen at 3.95 inches. That's a denser image than a
                  24-inch 4K monitor at 184 ppi.
                </dd>
              </div>
              <div>
                <dt className="chrome">8 GB</dt>
                <dd>
                  Of LPDDR4X beside a Snapdragon 778G-class chip. Room to be ambitious,
                  honest enough to reward optimization.
                </dd>
              </div>
              <div>
                <dt className="chrome">7 h</dt>
                <dd>Of play on demanding games. Shorter sessions stretch it further.</dd>
              </div>
            </dl>
            <Link className="text-link" to="/gamers">More about the hardware</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap split-band glass">
          <div>
            <h2>Developers keep most of it</h2>
            <p>
              Developing for Warpdrive is free, with no kit to buy and nothing to apply for.
              When you sell, the split favors you.
            </p>
            <Link className="text-link" to="/developers">Start making games</Link>
          </div>
          <Splits />
        </div>
      </section>

      <section className="section join">
        <div className="wrap join-inner">
          <h2>Build it with us</h2>
          <p>
            Warpdrive is made in the open. Talk to the team, share what you're making,
            and follow along on GitHub.
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
