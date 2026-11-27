import { createContext, useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Nav from './components/Nav.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Gamers from './pages/Gamers.jsx'
import Developers from './pages/Developers.jsx'
import Account from './pages/Account.jsx'
import NotFound from './pages/NotFound.jsx'
import { pickInitial, applyColor, storeColor } from './lib/theme.js'

export const ColorContext = createContext(null)

const titles = {
  '/': 'Warpdrive',
  '/gamers': 'For players | Warpdrive',
  '/developers': 'For developers | Warpdrive',
  '/account': 'Account | Warpdrive',
}

export default function App() {
  const { pathname } = useLocation()
  const [color, setColor] = useState(pickInitial)

  useEffect(() => {
    applyColor(color)
  }, [color])

  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = titles[pathname] || 'Warpdrive'
  }, [pathname])

  function chooseColor(c) {
    storeColor(c ? c.id : null)
    if (c) {
      setColor(c)
    }
  }

  return (
    <ColorContext.Provider value={{ color, chooseColor }}>
      <Nav />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gamers" element={<Gamers />} />
          <Route path="/developers" element={<Developers />} />
          <Route path="/account" element={<Account />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </ColorContext.Provider>
  )
}
