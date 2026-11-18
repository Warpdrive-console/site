import { useEffect, useRef } from "preact/hooks";
import { Warpfield, warp, setWarpHeld } from "../components/Warpfield.jsx";
import { Handheld } from "./Handheld.jsx";
import { href } from "../lib/router.js";
import { calm } from "../lib/fx.js";
import { DISCORD } from "../components/Nav.jsx";
import { Icon } from "../components/Icon.jsx";
import { shell } from "../lib/shell.js";
import { shellById, shellVars } from "../data/shells.js";

/**
 * The headline is set in Tilt Warp, whose letters can rotate in 3D (the XROT
 * and YROT axes). They turn to face the pointer, and lean back when you warp.
 */
function useTiltType(ref) {
  useEffect(() => {
    const el = ref.current;
    let px = 0,
      py = 0,
      cx = 0,
      cy = 0,
      raf = 0;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      px = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (innerWidth / 2)));
      py = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (innerHeight / 2)));
    };
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (calm.value) {
        el.style.setProperty("--yr", 0);
        el.style.setProperty("--xr", 0);
        return;
      }
      cx += (px - cx) * 0.08;
      cy += (py - cy) * 0.08;
      const w = warp.value;
      el.style.setProperty("--yr", (cx * 16).toFixed(2));
      el.style.setProperty("--xr", (-cy * 12 + w * 34).toFixed(2));
    };
    addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", move);
    };
  }, []);
}

function WarpButton() {
  const on = (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setWarpHeld(true);
  };
  const off = () => setWarpHeld(false);
  return (
    <p class="warp-hint">
      <button
        class="warp-btn"
        onPointerDown={on}
        onPointerUp={off}
        onPointerCancel={off}
        onLostPointerCapture={off}
        onContextMenu={(e) => e.preventDefault()}
        disabled={calm.value}>
        Hold to warp
      </button>
      <span class="warp-or">
        or hold <span class="kbd">Space</span>
      </span>
    </p>
  );
}

export function Hero() {
  const title = useRef(null);
  useTiltType(title);
  return (
    <section class="hero" style={shellVars(shellById(shell.value))}>
      <Warpfield />
      <div class="wrap hero-inner">
        <div class="hero-top">
          <h1 class="h1 hero-title" ref={title}>
            A real console for indie games
          </h1>
          <div class="hero-side">
            <p class="lede">
              One handheld, one home console, one library. Games come on disc or as a download, any
              engine runs, and developers keep <strong>90%</strong> of what they sell.
            </p>
            <div class="hero-cta">
              <a class="btn" href={DISCORD} target="_blank" rel="noopener">
                <Icon name="discord" /> Join the Discord
              </a>
              <a class="text-link" href={href("technical")}>
                See the hardware
              </a>
            </div>
          </div>
        </div>
        <Handheld />
        <WarpButton />
      </div>
    </section>
  );
}
