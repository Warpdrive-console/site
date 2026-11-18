import { useEffect, useRef } from "preact/hooks";
import { signal } from "@preact/signals";
import { calm, isMobile } from "../lib/fx.js";

/** 0 = cruising, 1 = full warp. The hero headline leans back as this rises. */
export const warp = signal(0);
let held = false;
export const setWarpHeld = (on) => {
  held = on;
};

const TINTS = ["238,240,246", "238,240,246", "201,168,255", "201,168,255", "255,61,168"];

/**
 * A 3D starfield that fills its parent. Hold Space (or the warp button) to
 * jump. Only runs while on screen.
 */
export function Warpfield() {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    const host = cv.parentElement;
    const ctx = cv.getContext("2d");
    let W = 0,
      H = 0,
      raf = 0,
      stars = [],
      onScreen = true,
      last = performance.now();
    let vx = 0.5,
      vy = 0.45,
      tx = 0.5,
      ty = 0.45;

    const spawn = (z = 1) => ({
      x: (Math.random() * 2 - 1) * 1.4,
      y: (Math.random() * 2 - 1) * 1.4,
      z: Math.max(0.02, z),
      t: TINTS[(Math.random() * TINTS.length) | 0],
      s: Math.random() * 0.9 + 0.4,
    });
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = host.clientWidth;
      H = host.clientHeight;
      cv.width = W * dpr;
      cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(700, (W * H) / (isMobile() ? 2800 : 2000)));
      stars = Array.from({ length: n }, () => spawn(Math.random()));
      if (calm.value) still();
    };
    const project = (s, z) => {
      const f = Math.max(W, H) * 0.15;
      return [W * vx + (s.x / z) * f, H * vy + (s.y / z) * f];
    };
    const still = () => {
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        const [x, y] = project(s, s.z);
        ctx.globalAlpha = Math.min(0.6, (1 - s.z) * 0.8 + 0.1);
        ctx.fillStyle = `rgb(${s.t})`;
        ctx.fillRect(x, y, s.s, s.s);
      }
      ctx.globalAlpha = 1;
    };

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(48, now - last);
      last = now;
      if (!onScreen || document.hidden || calm.value) return;

      warp.value += ((held ? 1 : 0) - warp.value) * (held ? 0.035 : 0.06);
      const w = warp.value;
      const speed = 0.00008 + w * w * 0.0026;
      vx += (tx - vx) * 0.03;
      vy += (ty - vy) * 0.03;

      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = "round";
      const k = 1 + w * 7;
      for (const s of stars) {
        const step = speed * dt * (0.7 + s.s * 0.3);
        s.z -= step;
        if (s.z <= 0.02) {
          Object.assign(s, spawn(1));
          continue;
        }
        const [x, y] = project(s, s.z);
        if (x < -50 || x > W + 50 || y < -50 || y > H + 50) {
          Object.assign(s, spawn(1));
          continue;
        }
        // The tail is the same star further back in depth, so it heads toward
        // the vanishing point but never crosses it (no lines meeting mid-screen).
        const [tx2, ty2] = project(s, Math.min(1.2, s.z + step * k));
        const near = 1 - s.z;
        ctx.globalAlpha = Math.min(1, near * 1.1 + 0.06) * Math.min(1, near * 4);
        ctx.strokeStyle = `rgb(${s.t})`;
        ctx.lineWidth = s.s * (0.6 + near * 1.5);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(tx2 + 0.01, ty2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const onPointer = (e) => {
      const r = host.getBoundingClientRect();
      tx = 0.5 + ((e.clientX - r.left) / r.width - 0.5) * 0.16;
      ty = 0.45 + ((e.clientY - r.top) / r.height - 0.5) * 0.16;
    };
    const typing = (t) => t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
    const down = (e) => {
      if (e.code !== "Space" || typing(e.target) || e.target.closest?.("[data-own-space]") || !onScreen) return;
      e.preventDefault();
      held = true;
    };
    const up = (e) => e.code === "Space" && (held = false);
    const blur = () => (held = false);

    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      if (!onScreen) held = false;
    });
    io.observe(host);
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();
    raf = requestAnimationFrame(frame);
    const offCalm = calm.subscribe((c) => c && still());
    addEventListener("pointermove", onPointer, { passive: true });
    addEventListener("keydown", down);
    addEventListener("keyup", up);
    addEventListener("blur", blur);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      offCalm();
      removeEventListener("pointermove", onPointer);
      removeEventListener("keydown", down);
      removeEventListener("keyup", up);
      removeEventListener("blur", blur);
    };
  }, []);

  return <canvas class="warpfield" ref={ref} aria-hidden="true" />;
}
