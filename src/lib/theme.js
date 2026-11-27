// console colours. shell paints the 3d model, accent + deep drive the ui,
// sky is the top of the page gradient (everything lighter derives from it)
export const colors = [
  { id: 'sky', name: 'Sky Blue', shell: '#94d4e2', accent: '#139fd6', deep: '#0a6fa3', sky: '#b7e3f8' },
  { id: 'powder', name: 'Powder Pink', shell: '#fab3c7', accent: '#d34e7e', deep: '#a83463', sky: '#fcd4e2' },
  { id: 'mint', name: 'Mint Green', shell: '#cae9c3', accent: '#55951f', deep: '#3f711a', sky: '#cdecc5' },
  { id: 'lemon', name: 'Pastel Yellow', shell: '#f1ef8e', accent: '#a98416', deep: '#81650f', sky: '#f4f0ae' },
  { id: 'coral', name: 'Coral Red', shell: '#f6a79b', accent: '#c8452c', deep: '#9c3015', sky: '#fcd2c9' },
  { id: 'lilac', name: 'Lilac', shell: '#ae87b8', accent: '#8b5fa0', deep: '#6e4583', sky: '#e4d4ea' },
]

const KEY = 'wd:color'

export function savedColorId() {
  return localStorage.getItem(KEY)
}

export function pickInitial() {
  const saved = savedColorId()
  const match = colors.find((c) => c.id === saved)
  if (match) {
    return match
  }
  return colors[Math.floor(Math.random() * colors.length)]
}

export function storeColor(id) {
  if (id) {
    localStorage.setItem(KEY, id)
  } else {
    localStorage.removeItem(KEY)
  }
}

export function applyColor(c) {
  const root = document.documentElement
  root.style.setProperty('--shell', c.shell)
  root.style.setProperty('--accent', c.accent)
  root.style.setProperty('--accent-deep', c.deep)
  root.style.setProperty('--sky-top', c.sky)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    meta.setAttribute('content', c.sky)
  }
}
