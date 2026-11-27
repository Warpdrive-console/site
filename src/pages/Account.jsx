import { useEffect, useRef, useState } from 'react'
import ProfileCard from '../components/ProfileCard.jsx'
import { rotur } from '../config'
import { useContext } from 'react'
import { ColorContext } from '../App.jsx'
import { colors, savedColorId } from '../lib/theme.js'
import { startSignIn, finishSignIn, ensureToken, signOut, getUserInfo, getProfile } from '../lib/rotur.js'
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

  useEffect(() => {
    // the code can only be swapped once, so don't run this twice
    if (started.current) {
      return
    }
    started.current = true

    async function load() {
      const params = new URLSearchParams(location.search)
      let token
      if (params.has('code') || params.has('error')) {
        token = await finishSignIn(params)
      } else {
        token = await ensureToken()
      }
      if (!token) {
        setStatus('signedOut')
        return
      }
      const user = await getUserInfo(token)
      const profile = await getProfile(user.username)
      // userinfo has the canonical avatar url and display name, prefer those
      setMe({
        ...profile,
        pfp: user.picture || profile.pfp,
        display_name: user.name || profile.display_name,
      })
      setStatus('signedIn')
    }

    load().catch((e) => {
      setErr(e.message)
      setStatus('signedOut')
    })
  }, [])

  async function onSignIn() {
    setErr('')
    try {
      await startSignIn()
    } catch (e) {
      setErr(e.message)
    }
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
    } catch (e) {
      setLookupErr(e.message)
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
          <h2>Console colour</h2>
          <p className="color-lede">
            Pick the colour of your Warpdrive, and this site wears it too. Until you pick,
            the site rolls a new colour every visit.
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
                  You'll go to rotur.dev to sign in, then come straight back here. Warpdrive
                  only sees your public profile.
                </p>
                {err && <p className="notice notice-error" role="alert">{err}</p>}
                {rotur.clientId ? (
                  <button className="gel" type="button" onClick={onSignIn}>Sign in with Rotur</button>
                ) : (
                  <p className="notice">
                    Sign-in isn't switched on for this site yet. Add a Rotur app ID as
                    <code>VITE_ROTUR_CLIENT_ID</code> and rebuild.
                  </p>
                )}
                <p className="signin-new">
                  No account yet? You can make one on the Rotur sign-in page.
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
    <div className="color-row" role="radiogroup" aria-label="Console colour">
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
