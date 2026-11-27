import { rotur } from '../config'

const TOKEN_KEY = 'wd:rotur-token'
const FLAG_KEY = 'wd:rotur-redirect'
const AUTH_URL = 'https://rotur.dev/auth'

export function savedToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function signOut() {
  localStorage.removeItem(TOKEN_KEY)
}

export function openSignIn() {
  const url = AUTH_URL + '?return_to=' + encodeURIComponent(location.origin + '/account')
  const w = 480
  const h = 640
  const left = Math.max(0, (screen.width - w) / 2)
  const top = Math.max(0, (screen.height - h) / 2)
  const popup = window.open(url, 'rotur_auth', `width=${w},height=${h},left=${left},top=${top}`)
  if (!popup) {
    sessionStorage.setItem(FLAG_KEY, '1')
    location.assign(url)
  }
  return popup
}

export function tokenFromMessage(event) {
  if (event.origin !== 'https://rotur.dev') {
    return null
  }
  if (event.data && event.data.type === 'rotur-auth-token' && event.data.token) {
    return event.data.token
  }
  return null
}

export function tokenFromRedirect(params) {
  const token = params.get('token')
  if (!token) {
    return null
  }
  const started = sessionStorage.getItem(FLAG_KEY)
  sessionStorage.removeItem(FLAG_KEY)
  history.replaceState(null, '', location.pathname)
  if (!started) {
    return null
  }
  return token
}

export async function getAccount(token) {
  const res = await fetch(rotur.api + '/get_user?auth=' + encodeURIComponent(token))
  const data = await res.json()
  if (data.error) {
    signOut()
    throw new Error('Your session ended. Sign in again to see your profile.')
  }
  return data
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
