import { rotur } from '../config'

// sign in with rotur: oauth code flow + pkce as a public client, no server needed
// docs: https://docs.rotur.dev/advanced-oauth/authorize

const TOKEN_KEY = 'wd:rotur-token'
const PENDING_KEY = 'wd:rotur-signin'

function b64url(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function redirectUri() {
  return location.origin + '/account'
}

export async function startSignIn() {
  const verifier = b64url(crypto.getRandomValues(new Uint8Array(32)))
  const challenge = b64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)))
  const state = b64url(crypto.getRandomValues(new Uint8Array(16)))
  sessionStorage.setItem(PENDING_KEY, JSON.stringify({ verifier, state }))

  const url = new URL(rotur.api + '/oauth/authorize')
  url.search = new URLSearchParams({
    response_type: 'code',
    client_id: rotur.clientId,
    redirect_uri: redirectUri(),
    scope: 'profile offline_access',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  })
  location.assign(url)
}

export async function finishSignIn(params) {
  const saved = JSON.parse(sessionStorage.getItem(PENDING_KEY))
  sessionStorage.removeItem(PENDING_KEY)
  history.replaceState(null, '', location.pathname)

  if (!saved || params.get('state') !== saved.state) {
    throw new Error('That sign-in didn\'t start on this page. Try signing in again.')
  }
  if (params.get('error') === 'access_denied') {
    throw new Error('You didn\'t sign in. You can try again whenever you like.')
  }
  if (params.has('error')) {
    throw new Error(`Rotur couldn't sign you in (${params.get('error')}).`)
  }

  const res = await fetch(rotur.api + '/oauth/token', {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: params.get('code'),
      redirect_uri: redirectUri(),
      client_id: rotur.clientId,
      code_verifier: saved.verifier,
    }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error_description || data.error)
  }

  const token = {
    access: data.access_token,
    expires: Date.now() + data.expires_in * 1000,
    refresh: data.refresh_token || null,
  }
  localStorage.setItem(TOKEN_KEY, JSON.stringify(token))
  return token
}

// access tokens last an hour; the refresh token quietly gets a new one.
// each refresh token works once, so always keep the replacement.
async function refresh(token) {
  const res = await fetch(rotur.api + '/oauth/token', {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: token.refresh,
      client_id: rotur.clientId,
    }),
  })
  const data = await res.json()
  if (!res.ok) {
    signOut()
    throw new Error(data.error_description || 'Your session ended. Sign in again.')
  }
  const next = {
    access: data.access_token,
    expires: Date.now() + data.expires_in * 1000,
    refresh: data.refresh_token || null,
  }
  localStorage.setItem(TOKEN_KEY, JSON.stringify(next))
  return next
}

export async function ensureToken() {
  const token = JSON.parse(localStorage.getItem(TOKEN_KEY))
  if (!token) {
    return null
  }
  if (token.expires > Date.now() + 60_000) {
    return token
  }
  if (!token.refresh) {
    localStorage.removeItem(TOKEN_KEY)
    return null
  }
  return refresh(token)
}

export function signOut() {
  localStorage.removeItem(TOKEN_KEY)
}

export async function getUserInfo(token) {
  const res = await fetch(rotur.api + '/oauth/userinfo', {
    headers: { Authorization: `Bearer ${token.access}` },
  })
  if (res.status === 401) {
    signOut()
    throw new Error('Your session ended. Sign in again to see your profile.')
  }
  if (!res.ok) {
    throw new Error(`Rotur didn't answer (${res.status}). Try again in a moment.`)
  }
  return res.json()
}

export async function getProfile(username) {
  const res = await fetch(`${rotur.api}/profile?username=${encodeURIComponent(username)}&include_posts=false`)
  if (res.status === 404) {
    throw new Error(`No Rotur account is called "${username}".`)
  }
  if (!res.ok) {
    throw new Error(`Rotur didn't answer (${res.status}). Try again in a moment.`)
  }
  return res.json()
}
