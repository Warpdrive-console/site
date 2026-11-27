import { Link } from 'react-router-dom'
import { links } from '../config'
import '../styles/footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <div>
          <p className="footer-brand">Warpdrive</p>
          <p className="footer-note">An indie handheld for games you keep.</p>
        </div>
        <ul className="footer-links">
          <li><Link to="/gamers">Players</Link></li>
          <li><Link to="/developers">Developers</Link></li>
          <li><Link to="/account">Account</Link></li>
        </ul>
        <ul className="footer-links">
          <li><a href={links.discord} target="_blank" rel="noreferrer">Discord</a></li>
          <li><a href={links.github} target="_blank" rel="noreferrer">GitHub</a></li>
          <li><a href={links.originChats} target="_blank" rel="noreferrer">originChats</a></li>
        </ul>
      </div>
      <p className="wrap footer-fine">Accounts by Rotur. Chat by originChats.</p>
    </footer>
  )
}
