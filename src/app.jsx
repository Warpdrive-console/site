import { useEffect, useState } from "preact/hooks";
import { route } from "./lib/router.js";
import { Nav } from "./components/Nav.jsx";
import { Footer } from "./components/Footer.jsx";
import { AuthSheet, Toasts } from "./components/Overlays.jsx";
import { Home } from "./pages/Home.jsx";
import { Hardware } from "./pages/Hardware.jsx";
import { Developers } from "./pages/Developers.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";

const VIEWS = { home: Home, technical: Hardware, developmental: Developers, account: Dashboard };
const TITLES = {
  home: "Warpdrive: the indie game console",
  technical: "Hardware · Warpdrive",
  developmental: "Developers · Warpdrive",
  account: "Your Warpdrive",
};

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

function BanksApproved({ onClose }) {
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  }, []);
  return (
    <button class="banks-approved" onClick={onClose} aria-label="Close">
      <img src="/banks/waving.png" alt="Banks waving" />
      <strong>Banks approves.</strong>
      <small>Click anywhere to close</small>
    </button>
  );
}

export function App() {
  const { page, section } = route.value;
  const View = VIEWS[page] || Home;
  const [banks, setBanks] = useState(false);

  useEffect(() => {
    document.body.dataset.page = page;
    document.title = TITLES[page] || TITLES.home;
  }, [page]);

  // deep links like #/hardware/specs: scroll once the page has rendered
  useEffect(() => {
    if (section) requestAnimationFrame(() => document.getElementById(section)?.scrollIntoView());
  }, []);

  useEffect(() => {
    let i = 0;
    const key = (e) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      i = k === KONAMI[i] ? i + 1 : k === KONAMI[0] ? 1 : 0;
      if (i === KONAMI.length) {
        i = 0;
        setBanks(true);
      }
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, []);

  return (
    <>
      <a class="skip" href="#main">
        Skip to content
      </a>
      <Nav />
      <main id="main" key={page}>
        <View />
      </main>
      <Footer />
      <AuthSheet />
      <Toasts />
      {banks && <BanksApproved onClose={() => setBanks(false)} />}
    </>
  );
}
