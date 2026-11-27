import { useContext, useEffect, useRef, useState } from 'react'
import ProfileCard from '../components/ProfileCard.jsx'
import { ColorContext } from '../App.jsx'
import { colors, savedColorId } from '../lib/theme.js'
import { savedToken, saveToken, signOut, openSignIn, tokenFromMessage, tokenFromRedirect, getAccount, getProfile } from '../lib/rotur.js'
import '../styles/account.css'

export default function Account() {
  const [status, setStatus] = useState('loading')
  const [me, setMe] = useState(null)
  const [err, setErr] = useState('')
  const started = useRef(false)

  const [query, setQuery] = useState('')
  const [found, setFound] = useState(null)
  const [lookupErr, setLookupErr] = useState('')
  const [looking, setLooking] = useState(false)

  async function loadFromToken(token) {
    const acct = await getAccount(token)
    const profile = await getProfile(acct.username)
    setMe({
      ...profile,
      bio: profile.bio || acct.bio,
      display_name: profile.display_name || acct.display_name,
    })
    setStatus('signedIn')
  }

  useEffect(() => {
    if (started.current) {
      return
    }
    started.current = true

    function onMessage(event) {
      const token = tokenFromMessage(event)
      if (!token) {
        return
      }
      saveToken(token)
      setErr('')
      setStatus('loading')
      loadFromToken(token).catch((e) => {
        setErr(e.message)
        setStatus('signedOut')
      })
    }
    window.addEventListener('message', onMessage)

    const token = tokenFromRedirect(new URLSearchParams(location.search)) || savedToken()
    if (token) {
      saveToken(token)
      loadFromToken(token).catch((e) => {
        setErr(e.message)
        setStatus('signedOut')
      })
    } else {
      setStatus('signedOut')
    }

    return () => window.removeEventListener('message', onMessage)
  }, [])

  function onSignIn() {
    setErr('')
    openSignIn()
  }

  function onSignOut() {
    signOut()
    setMe(null)
    setStatus('signedOut')
  }

  async function onLookup(e) {
    e.preventDefault()
    const name = query.trim().replace(/^@/, '')
    if (!name) {
      return
    }
    setLooking(true)
    setLookupErr('')
    setFound(null)
    try {
      setFound(await getProfile(name))
    } catch (e2) {
      setLookupErr(e2.message)
    }
    setLooking(false)
  }

  return (
    <>
      <header className="page-head wrap">
        <h1>Your Warpdrive account</h1>
        <p className="lede">
          Warpdrive uses Rotur accounts. Sign in once and your profile, friends and badges
          are the same on the handheld, in originChats and here.
        </p>
      </header>

      <section className="section color-pick">
        <div className="wrap">
          <h2>Console color</h2>
          <p className="color-lede">
            Pick the color of your Warpdrive, and this site wears it too. Until you pick,
            the site rolls a new color every visit.
          </p>
          <ColorPicker />
        </div>
      </section>

      <section className="section account">
        <div className="wrap account-grid">
          <div className="account-main" aria-live="polite">
            {status === 'loading' && (
              <div className="glass account-panel">
                <p className="account-wait">Checking your Rotur sign-in…</p>
              </div>
            )}

            {status === 'signedOut' && (
              <div className="glass account-panel signin">
                <h2>Sign in with Rotur</h2>
                <p>
                  A Rotur window opens, you sign in there, and you're back here with your
                  profile. Warpdrive never sees your password.
                </p>
                {err && <p className="notice notice-error" role="alert">{err}</p>}
                <button className="gel" type="button" onClick={onSignIn}>Sign in with Rotur</button>
                <p className="signin-new">
                  No account yet? You can make one in the same window.
                </p>
              </div>
            )}

            {status === 'signedIn' && (
              <ProfileCard profile={me}>
                <button className="btn-glass" type="button" onClick={onSignOut}>Sign out</button>
              </ProfileCard>
            )}
          </div>

          <aside className="lookup">
            <h2>Find a player</h2>
            <p>Look up anyone's public Rotur profile by username.</p>
            <form className="lookup-form" onSubmit={onLookup}>
              <label htmlFor="lookup-name">Username</label>
              <div className="lookup-row">
                <input
                  id="lookup-name"
                  className="field"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="mist"
                  autoComplete="off"
                  spellCheck="false"
                />
                <button className="btn-glass" type="submit" disabled={looking}>
                  {looking ? 'Looking…' : 'Look up'}
                </button>
              </div>
            </form>
            {lookupErr && <p className="notice notice-error" role="alert">{lookupErr}</p>}
            {found && <ProfileCard profile={found} />}
          </aside>
        </div>
      </section>
    </>
  )
}

function ColorPicker() {
  const { color, chooseColor } = useContext(ColorContext)
  const [saved, setSaved] = useState(savedColorId())

  function pick(c) {
    chooseColor(c)
    setSaved(c.id)
  }

  function unpick() {
    chooseColor(null)
    setSaved(null)
  }

  return (
    <div className="color-row" role="radiogroup" aria-label="Console color">
      {colors.map((c) => (
        <button
          key={c.id}
          type="button"
          role="radio"
          aria-checked={saved === c.id}
          className={'color-chip' + (saved === c.id ? ' on' : '')}
          onClick={() => pick(c)}
        >
          <span className="color-dot" style={{ '--c': c.shell }} aria-hidden="true" />
          {c.name}
        </button>
      ))}
      <button
        type="button"
        role="radio"
        aria-checked={saved === null}
        className={'color-chip' + (saved === null ? ' on' : '')}
        onClick={unpick}
      >
        <span className="color-dot color-dot-random" aria-hidden="true" />
        Surprise me{saved === null && ` (today: ${color.name})`}
      </button>
    </div>
  )
}
