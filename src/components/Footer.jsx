import { useState } from "preact/hooks";
import { href } from "../lib/router.js";
import { toast } from "../lib/toast.js";
import { DISCORD, GITHUB } from "./Nav.jsx";

const EGGS = [
  "banks says hi 💜",
  "he ate another dorito",
  "you found the secret. congratulations on nothing.",
  "disc drive goes brrr",
  "indie forever. no notes.",
  "ok that's all of them. go outside.",
];

export function Footer() {
  const [n, setN] = useState(0);
  const egg = () => {
    toast(EGGS[n % EGGS.length]);
    setN(n + 1);
  };

  return (
    <footer class="foot">
      <div class="wrap">
        <div class="foot-grid">
          <div class="foot-brand">
            <img src="/warpdrive-logo.png" alt="Warpdrive" width="170" height="67" loading="lazy" />
            <p>
              A love letter to indie gaming.
              <br />
              The system we wish we had.
            </p>
          </div>
          <div>
            <h3>The console</h3>
            <a href={href("technical")}>Hardware</a>
            <a href={href("technical", "form-factors")}>Handheld vs console</a>
            <a href={href("technical", "specs")}>Full specs</a>
            <a href={href("home", "price")}>Price &amp; Kickstarter</a>
          </div>
          <div>
            <h3>Make games</h3>
            <a href={href("developmental")}>Storefront</a>
            <a href={href("developmental", "revenue")}>Revenue calculator</a>
            <a href={href("developmental", "open-source")}>Open source</a>
            <a href="https://rotur.dev/" target="_blank" rel="noopener">
              Rotur
            </a>
          </div>
          <div>
            <h3>Community</h3>
            <a href={DISCORD} target="_blank" rel="noopener">
              Discord
            </a>
            <a href={GITHUB} target="_blank" rel="noopener">
              GitHub
            </a>
            <a href="https://glue3d.net/" target="_blank" rel="noopener" class="badge-88">
              <img src="/ads/buttonglue3d.gif" alt="Glue3D" width="88" height="31" loading="lazy" />
            </a>
          </div>
        </div>
        <div class="foot-bottom">
          <span>© 2026 Warpdrive</span>
          <button class="foot-egg" onClick={egg} aria-label="A secret">
            <img src="/banks/dorito.png" alt="" width="28" height="28" loading="lazy" />
          </button>
        </div>
      </div>
    </footer>
  );
}
