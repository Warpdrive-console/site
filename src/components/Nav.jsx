import { Link, NavLink } from 'react-router-dom'
import { links } from '../config'
import '../styles/nav.css'

export default function Nav() {
  return (
    <header className="nav-shell">
      <a className="skip" href="#main">Skip to content</a>
      <nav className="nav glass" aria-label="Main">
        <Link to="/" className="wordmark" aria-label="Warpdrive home">
          <span className="wordmark-mark" aria-hidden="true" />
          Warpdrive
        </Link>
        <div className="nav-links">
          <NavLink to="/gamers">Players</NavLink>
          <NavLink to="/developers">Developers</NavLink>
          <NavLink to="/account">Account</NavLink>
        </div>
        <div className="nav-out">
          <a href={links.discord} target="_blank" rel="noreferrer">Discord</a>
          <a href={links.github} target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </nav>
    </header>
  )
}
