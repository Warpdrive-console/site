import { useEffect, useRef, useState } from "preact/hooks";
import { fmt } from "../lib/hooks.jsx";
import { recall, remember } from "../lib/rotur.js";
import { calm } from "../lib/fx.js";
import { toast } from "../lib/toast.js";
import { Icon } from "../components/Icon.jsx";

const STICKERS = [
  { src: "/banks/loving.png", say: "genuinely in love" },
  { src: "/banks/waving.png", say: "he's waving back" },
  { src: "/banks/toking.png", say: "no comment" },
  { src: "/banks/ew.png", say: "same tbh" },
  { src: "/banks/dorito.png", say: "all he eats" },
  { src: "/banks/autism.png", say: "peak form" },
];

// where stickers start, as fractions of the board: [x, y, rotation]
const HOME = [
  [0.1, 0.12, -9],
  [0.4, 0.06, 6],
  [0.7, 0.14, -4],
  [0.16, 0.55, 8],
  [0.46, 0.5, -7],
  [0.74, 0.56, 11],
];

const scatter = () =>
  STICKERS.map(() => [0.05 + Math.random() * 0.68, 0.05 + Math.random() * 0.55, (Math.random() - 0.5) * 34]);

export function Banks() {
  const board = useRef(null);
  const els = useRef([]);
  const st = useRef(HOME.map(([x, y, r], i) => ({ x, y, r, vx: 0, vy: 0, vr: 0, z: i })));
  const [boops, setBoops] = useState(() => recall("boops", 0));
  const [bubble, setBubble] = useState(null);
  const top = useRef(STICKERS.length);
  const save = useRef(0);

  const place = (i) => {
    const s = st.current[i];
    const el = els.current[i];
    if (!el) return;
    el.style.left = s.x * 100 + "%";
    el.style.top = s.y * 100 + "%";
    el.style.setProperty("--r", s.r + "deg");
    el.style.zIndex = s.z;
  };

  useEffect(() => {
    st.current.forEach((_, i) => place(i));
  }, []);

  // tossed stickers glide, rotate and bounce off the board edges
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const b = board.current;
      if (!b) return;
      const bw = b.clientWidth,
        bh = b.clientHeight;
      st.current.forEach((s, i) => {
        if (s.drag || (Math.abs(s.vx) + Math.abs(s.vy) + Math.abs(s.vr) < 0.01)) return;
        const el = els.current[i];
        const mw = el.offsetWidth / bw,
          mh = el.offsetHeight / bh;
        s.x += s.vx / bw;
        s.y += s.vy / bh;
        s.r += s.vr;
        if (s.x < 0 || s.x > 1 - mw) (s.vx *= -0.6), (s.x = Math.max(0, Math.min(1 - mw, s.x)));
        if (s.y < 0 || s.y > 1 - mh) (s.vy *= -0.6), (s.y = Math.max(0, Math.min(1 - mh, s.y)));
        s.vx *= 0.93;
        s.vy *= 0.93;
        s.vr *= 0.9;
        place(i);
      });
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const boop = (i) => {
    const n = boops + 1;
    setBoops(n);
    clearTimeout(save.current);
    save.current = setTimeout(() => remember("boops", n), 1200);
    const el = els.current[i];
    el.classList.remove("boop");
    void el.offsetWidth;
    el.classList.add("boop");
    setBubble({ i, say: STICKERS[i].say, k: n });
    if (n === 100) toast("100 boops. banks is overwhelmed 💜");
  };

  const down = (i) => (e) => {
    const s = st.current[i];
    const el = els.current[i];
    const b = board.current.getBoundingClientRect();
    el.setPointerCapture(e.pointerId);
    s.drag = {
      ox: e.clientX - b.left - s.x * b.width,
      oy: e.clientY - b.top - s.y * b.height,
      t: performance.now(),
      sx: e.clientX,
      sy: e.clientY,
      lx: e.clientX,
      ly: e.clientY,
      lt: performance.now(),
    };
    s.z = ++top.current;
    s.vx = s.vy = s.vr = 0;
    el.classList.add("held");
    place(i);
  };
  const move = (i) => (e) => {
    const s = st.current[i];
    if (!s.drag) return;
    const b = board.current.getBoundingClientRect();
    const el = els.current[i];
    const now = performance.now();
    const dt = Math.max(8, now - s.drag.lt);
    s.vx = ((e.clientX - s.drag.lx) / dt) * 16;
    s.vy = ((e.clientY - s.drag.ly) / dt) * 16;
    s.drag.lx = e.clientX;
    s.drag.ly = e.clientY;
    s.drag.lt = now;
    s.x = Math.max(-0.05, Math.min(1 - el.offsetWidth / b.width + 0.05, (e.clientX - b.left - s.drag.ox) / b.width));
    s.y = Math.max(-0.05, Math.min(1 - el.offsetHeight / b.height + 0.05, (e.clientY - b.top - s.drag.oy) / b.height));
    s.r += (s.vx * 0.6 - (s.r % 360) * 0.02) * 0.2;
    place(i);
  };
  const up = (i) => (e) => {
    const s = st.current[i];
    if (!s.drag) return;
    const moved = Math.hypot(e.clientX - s.drag.sx, e.clientY - s.drag.sy);
    const quick = performance.now() - s.drag.t < 350;
    s.drag = null;
    els.current[i].classList.remove("held");
    if (moved < 6 && quick) {
      s.vx = s.vy = 0;
      boop(i);
    } else {
      if (calm.value) s.vx = s.vy = 0;
      s.vr = s.vx * 0.15;
    }
  };

  const shuffle = () => {
    const next = scatter();
    st.current.forEach((s, i) => {
      [s.x, s.y, s.r] = next[i];
      s.vx = s.vy = s.vr = 0;
      els.current[i].classList.add("glide");
      place(i);
      setTimeout(() => els.current[i]?.classList.remove("glide"), 600);
    });
  };

  useEffect(() => {
    if (!bubble) return;
    const t = setTimeout(() => setBubble(null), 1700);
    return () => clearTimeout(t);
  }, [bubble]);

  const bubbleAt = bubble && st.current[bubble.i];

  return (
    <section class="sec" id="banks">
      <div class="wrap banks-grid">
        <div class="banks-copy">
          <h2 class="h2">Meet Banks</h2>
          <p class="lede">
            A raccoon in a <strong>purple bandana</strong>. He owns no other clothes fashionable
            enough to flaunt. Lazy, gluttonous, lurking, stalking. He spends his days eating,
            drinking, sleeping and gaming in alarming excess. He is a chud. We love him.
          </p>
          <p class="small">Drawn by Rigby, @ToastGh0ast.</p>
          <p class="boops">
            {boops === 0 ? (
              "Drag the stickers around, toss them, or tap one to boop it."
            ) : (
              <>
                Banks has been booped <b key={boops}>{fmt(boops)}</b> {boops === 1 ? "time" : "times"}.
              </>
            )}
          </p>
          <button class="btn btn-quiet sm" onClick={shuffle}>
            <Icon name="shuffle" /> Shuffle the stickers
          </button>
        </div>

        <div class="board">
          <div class="board-in" ref={board}>
            <span class="sheen" aria-hidden="true" />
            {STICKERS.map((s, i) => (
              <button
                key={s.src}
                ref={(el) => (els.current[i] = el)}
                class="sticker"
                aria-label={"Boop Banks: " + s.say}
                onPointerDown={down(i)}
                onPointerMove={move(i)}
                onPointerUp={up(i)}
                onPointerCancel={up(i)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), boop(i))}>
                <img src={s.src} alt="" draggable={false} loading="lazy" />
              </button>
            ))}
            {bubble && (
              <span
                key={bubble.k}
                class="bubble"
                role="status"
                style={{ left: bubbleAt.x * 100 + 8 + "%", top: bubbleAt.y * 100 + "%" }}>
                {bubble.say}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
