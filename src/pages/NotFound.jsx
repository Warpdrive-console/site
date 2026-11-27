import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="page-head wrap">
      <h1>That page isn't here</h1>
      <p className="lede">The link may be old, or the address has a typo.</p>
      <div className="actions">
        <Link className="gel" to="/">Go to the home page</Link>
      </div>
    </section>
  )
}
