import { useEffect, useRef, useState } from "preact/hooks";
import { useVisible } from "../lib/hooks.jsx";
import { HomeConsole } from "../sections/Price.jsx";
import { PARTS, COMPARE, FORMS } from "../data/specs.jsx";
import { shell } from "../lib/shell.js";
import { shellById, shellVars } from "../data/shells.js";
import { calm } from "../lib/fx.js";
import { Icon } from "../components/Icon.jsx";

function Intro() {
  return (
    <section class="hw-intro">
      <div class="wrap">
        <h1 class="h1 hw-title">Built different, on purpose</h1>
        <div class="pillars">
          <div>
            <h2 class="h3">Open source runtime</h2>
            <p class="copy">
              <strong>Web games run through Chromium</strong> with WebGPU.{" "}
              <strong>Native ARM binaries</strong> come later for full performance titles. Either
              way you pick the engine, from Unity or GameMaker to Scratch, GB Studio and GDevelop.
            </p>
          </div>
          <div>
            <h2 class="h3">Made by modders</h2>
            <p class="copy">
              We grew up on Newgrounds, itch.io and Game Jolt, and on PS3, Xbox 360 and Wii
              modding. <strong>Open firmware, a moddable frontend and a homebrew launcher</strong>{" "}
              ship in the box.
            </p>
          </div>
          <div>
            <h2 class="h3">Physical media</h2>
            <p class="copy">
              Full size DVDs in <strong>purple collector cases</strong>. The home console has a disc
              drive for collectors and anyone without decent Wi-Fi. Install the disc and it plays
              without it.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** A side-on handheld for the form factor switch, in the picked shell. */
function MiniHandheld({ s }) {
  return (
    <div class={"mini-hh" + (s.clear ? " clear" : "")} style={shellVars(s)} aria-hidden="true">
      <span class="mh-dpad" />
      <span class="mh-screen">
        <i />
      </span>
      <span class="mh-btns">
        <i />
        <i />
      </span>
    </div>
  );
}

function FormFactors() {
  const [form, setForm] = useState("handheld");
  const f = FORMS[form];
  const s = shellById(shell.value);
  const col = form === "handheld" ? 1 : 2;
  return (
    <section class="sec" id="form-factors">
      <div class="wrap">
        <div class="sec-split">
          <h2 class="h2">One family, two shapes</h2>
          <p class="copy">
            Every handheld runs the same silicon, so a mobile build is a single target. The home
            console steps up a tier for the TV. <strong>Both play the same library.</strong>
          </p>
        </div>

        <div class="ff">
          <div class="seg" role="tablist" aria-label="Form factor">
            <span class="seg-thumb" style={{ "--i": col - 1 }} aria-hidden="true" />
            <button role="tab" aria-selected={form === "handheld"} onClick={() => setForm("handheld")}>
              Handhelds
            </button>
            <button role="tab" aria-selected={form === "console"} onClick={() => setForm("console")}>
              Home console
            </button>
          </div>

          <div class="ff-body" key={form}>
            <div class="ff-visual">{form === "handheld" ? <MiniHandheld s={s} /> : <HomeConsole s={s} />}</div>
            <div class="ff-copy">
              <h3 class="h3">{f.title}</h3>
              <p class="copy">{f.body}</p>
              <ul class="plain-list">
                {f.list.map(([a, b]) => (
                  <li key={a}>
                    <strong>{a}</strong>, {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div class={"cmp col-" + col} role="table" aria-label="Handheld and home console compared">
            <div class="cmp-row cmp-head" role="row">
              <span role="columnheader">Spec</span>
              <span role="columnheader">Handhelds</span>
              <span role="columnheader">Home console</span>
            </div>
            {COMPARE.map(([k, a, b]) => (
              <div class="cmp-row" role="row" key={k}>
                <span role="rowheader">{k}</span>
                <span role="cell">{a}</span>
                <span role="cell">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


// which part on the board lights up for each spec
const LIT = { soc: "soc", gpu: "soc", node: "soc", api: "soc", ram: "ram", storage: "storage", os: "storage", media: "media" };

const range = (n) => Array.from({ length: n }, (_, i) => i);

/** A trace bus: each path drawn once to sit on the board, once as the moving pulse. */
function Bus({ on, d }) {
  return (
    <g class={"tr" + (on ? " on" : "")}>
      {d.map((p, i) => (
        <path key={"b" + i} d={p} />
      ))}
      {on &&
        d.map((p, i) => (
          <path key={"p" + i} class="pulse" d={p} style={{ animationDelay: i * -0.15 + "s" }} />
        ))}
    </g>
  );
}

/** The home console's board, top down. Pick a part to read about it. */
function Board({ lit, sel, choose }) {
  const part = (id, label, children) => (
    <g class={"part" + (lit === id ? " on" : "")} onClick={() => choose(id)} aria-label={label} role="button" tabIndex={-1}>
      {children}
    </g>
  );
  return (
    <svg class="pcb-svg" viewBox="0 84 640 356" role="img" aria-label="The Warpdrive home console's board">
      <defs>
        <linearGradient id="pcb-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#2c1060" />
          <stop offset="1" stop-color="#13052c" />
        </linearGradient>
        <linearGradient id="chip-dark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#3d3754" />
          <stop offset="0.5" stop-color="#1c1828" />
          <stop offset="1" stop-color="#121019" />
        </linearGradient>
        <linearGradient id="chip-silver" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ffffff" />
          <stop offset="0.48" stop-color="#d4d7e3" />
          <stop offset="0.52" stop-color="#b3b7c8" />
          <stop offset="1" stop-color="#8d91a6" />
        </linearGradient>
        <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#f4f5fa" />
          <stop offset="0.5" stop-color="#9a9db2" />
          <stop offset="1" stop-color="#d8dae4" />
        </linearGradient>
        <linearGradient id="gloss" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stop-color="#fff" stop-opacity="0.16" />
          <stop offset="0.35" stop-color="#fff" stop-opacity="0.03" />
          <stop offset="0.36" stop-color="#fff" stop-opacity="0" />
        </linearGradient>
        <pattern id="pcb-dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="8" cy="8" r="1" fill="#b6ff4a" opacity="0.12" />
        </pattern>
      </defs>

      <rect class="pcb-board" x="8" y="92" width="624" height="340" rx="26" fill="url(#pcb-bg)" />
      <rect x="8" y="92" width="624" height="340" rx="26" fill="url(#pcb-dots)" />
      {[
        [38, 122],
        [602, 122],
        [38, 402],
        [602, 402],
      ].map(([x, y]) => (
        <g key={x + "-" + y}>
          <circle cx={x} cy={y} r="13" fill="url(#metal)" />
          <circle cx={x} cy={y} r="7" fill="#0b0420" />
        </g>
      ))}

      {/* traces, from the chip out to each part */}
      <Bus on={lit === "ram"} d={range(5).map((i) => `M395 ${150 + i * 11} H452`)} />
      <Bus
        on={lit === "storage"}
        d={[
          ...range(3).map((i) => `M395 ${246 + i * 10} H${426 - i * 10} V${268 + i * 10} H452`),
          ...range(3).map((i) => `M536 ${266 + i * 12} H558`),
        ]}
      />
      <Bus on={lit === "media"} d={range(5).map((i) => `M245 ${168 + i * 12} H82`)} />
      <Bus
        on={false}
        d={[
          ...range(3).map((i) => `M${262 + i * 9} 285 V${330 + i * 9} H${222 + i * 9} V394`),
          ...range(2).map((i) => `M${312 + i * 9} 285 V398`),
          ...range(3).map((i) => `M${352 + i * 9} 285 V${334 + (2 - i) * 9} H${372 + i * 9} V394`),
        ]}
      />

      {/* little passives scattered round the chip */}
      {range(6).map((i) => (
        <rect key={"c" + i} x={252 + i * 24} y="114" width="12" height="7" rx="1.5" fill="url(#metal)" opacity="0.7" />
      ))}
      {range(4).map((i) => (
        <rect key={"r" + i} x={118 + i * 26} y="262" width="14" height="8" rx="1.5" fill="#2a2338" stroke="#5c5476" />
      ))}

      {part(
        "soc",
        "Processor",
        <>
          <rect class="chip-body" x="245" y="135" width="150" height="150" rx="12" fill="url(#chip-silver)" />
          <rect x="245" y="135" width="150" height="150" rx="12" fill="url(#gloss)" />
          <text class="chip-name dark" x="320" y="196">
            QCS6490
          </text>
          <g class={"die" + (sel === "gpu" || sel === "api" ? " on" : "")}>
            <rect x="268" y="214" width="48" height="26" rx="5" />
            <text x="292" y="232">
              GPU
            </text>
          </g>
          <g class={"die" + (sel === "node" ? " on" : "")}>
            <rect x="324" y="214" width="48" height="26" rx="5" />
            <text x="348" y="232">
              6nm
            </text>
          </g>
        </>,
      )}
      {part(
        "ram",
        "Memory",
        <>
          <rect class="chip-body" x="452" y="140" width="128" height="66" rx="8" fill="url(#chip-dark)" />
          <rect x="452" y="140" width="128" height="66" rx="8" fill="url(#gloss)" />
          <text class="chip-name" x="516" y="170">
            LPDDR5
          </text>
          <text class="chip-sub" x="516" y="190">
            8GB
          </text>
        </>,
      )}
      {part(
        "storage",
        "Storage",
        <>
          <rect class="chip-body" x="452" y="250" width="84" height="62" rx="8" fill="url(#chip-dark)" />
          <rect x="452" y="250" width="84" height="62" rx="8" fill="url(#gloss)" />
          <text class="chip-name" x="494" y="278">
            eMMC
          </text>
          <text class="chip-sub" x="494" y="297">
            {sel === "os" ? "OS" : "256GB"}
          </text>
          <rect class="chip-body" x="558" y="246" width="62" height="74" rx="6" fill="url(#metal)" />
          <rect x="566" y="300" width="46" height="8" rx="2" fill="#0b0420" />
          <text class="chip-sub dark" x="589" y="282">
            SD
          </text>
        </>,
      )}
      {part(
        "media",
        "Media",
        <>
          <rect class="chip-body" x="34" y="150" width="48" height="128" rx="7" fill="url(#chip-dark)" />
          {range(8).map((i) => (
            <rect key={i} x="66" y={160 + i * 14} width="9" height="7" rx="1" fill="url(#metal)" />
          ))}
          <text class="chip-sub" x="48" y="214" transform="rotate(-90 48 214)">
            DVD
          </text>
        </>,
      )}

      {/* ports along the back edge */}
      <rect x="196" y="394" width="74" height="34" rx="5" fill="url(#metal)" />
      <rect x="206" y="404" width="54" height="14" rx="3" fill="#0b0420" />
      <rect x="296" y="398" width="48" height="24" rx="12" fill="url(#metal)" />
      <rect x="306" y="406" width="28" height="8" rx="4" fill="#0b0420" />
      <rect x="360" y="394" width="64" height="34" rx="4" fill="url(#metal)" />
      <rect x="370" y="404" width="44" height="12" rx="2" fill="#0b0420" />
      <text class="silk" x="233" y="386">
        HDMI
      </text>
      <text class="silk" x="320" y="390">
        USB-C
      </text>
      <text class="silk" x="392" y="386">
        USB
      </text>
      <text class="silk" x="120" y="370">
        WD-01 rev A
      </text>
    </svg>
  );
}

function SpecExplorer() {
  const [sel, setSel] = useState("soc");
  const [auto, setAuto] = useState(true);
  const box = useRef(null);
  const visible = useVisible(box);
  const part = PARTS.find((p) => p.id === sel);

  // tour the board on its own until someone picks a part
  useEffect(() => {
    if (!auto || !visible || calm.value) return;
    const t = setInterval(() => {
      setSel((cur) => PARTS[(PARTS.findIndex((p) => p.id === cur) + 1) % PARTS.length].id);
    }, 3800);
    return () => clearInterval(t);
  }, [auto, visible]);

  const choose = (id) => {
    setAuto(false);
    setSel(id);
  };
  const onKey = (e) => {
    const i = PARTS.findIndex((p) => p.id === sel);
    const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = PARTS[(i + d + PARTS.length) % PARTS.length].id;
    choose(n);
    e.currentTarget.querySelector(`[data-id="${n}"]`)?.focus();
  };

  return (
    <section class="sec" id="specs">
      <div class="wrap">
        <div class="sec-split">
          <h2 class="h2">Inside the home console</h2>
          <p class="copy">
            Industrial parts with long availability and no surprise end of life. Pick a part on the
            board to read about it.
          </p>
        </div>

        <div>
          <div class="explorer" ref={box}>
          <div class="board-diagram">
            <Board lit={LIT[sel] || sel} sel={sel} choose={choose} />
          </div>

          <div class="spec-side">
            <div class="spec-tabs" role="tablist" aria-label="Parts" aria-orientation="vertical" onKeyDown={onKey}>
              {PARTS.map((p) => (
                <button
                  key={p.id}
                  data-id={p.id}
                  role="tab"
                  aria-selected={p.id === sel}
                  tabIndex={p.id === sel ? 0 : -1}
                  class={"spec-tab" + (p.id === sel ? " on" : "")}
                  onClick={() => choose(p.id)}>
                  <Icon name={p.icon} />
                  <span class="spec-k">{p.key}</span>
                  <span class="spec-v">{p.val}</span>
                  {p.id === sel && auto && visible && !calm.value && <span class="spec-timer" aria-hidden="true" />}
                </button>
              ))}
            </div>
            <div class="spec-detail" role="tabpanel" key={sel} aria-live="polite">
              <h3 class="h3">
                {part.key}: {part.val}
              </h3>
              <p class="copy">{part.body}</p>
            </div>
          </div>
          </div>
        </div>

        <p class="callout">
          Industrial hardware at the developer's mercy. Push it to its limits, or use it to play 30
          year old games. We think it's the most capable indie console at this price.
        </p>
      </div>
    </section>
  );
}

/** Grab the disc and spin it. Lets go with momentum. */
function SpinDisc() {
  const disc = useRef(null);
  const st = useRef({ a: 0, v: 0.6, drag: null });
  const [out, setOut] = useState(true);
  const [rpm, setRpm] = useState(0);

  useEffect(() => {
    let raf = 0,
      frames = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const s = st.current;
      if (!s.drag) {
        if (!calm.value) s.v += ((out ? 0.6 : 0) - s.v) * 0.004;
        else s.v = 0;
        s.a += s.v;
      }
      disc.current?.style.setProperty("--a", s.a + "deg");
      if (++frames % 10 === 0) setRpm(Math.round(Math.abs(s.v) * 10));
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [out]);

  const angle = (e) => {
    const r = disc.current.getBoundingClientRect();
    return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
  };
  const down = (e) => {
    disc.current.setPointerCapture(e.pointerId);
    st.current.drag = { last: angle(e), t: performance.now() };
    st.current.v = 0;
  };
  const move = (e) => {
    const s = st.current;
    if (!s.drag) return;
    const a = angle(e);
    let d = a - s.drag.last;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    const now = performance.now();
    s.a += d;
    s.v = (d / Math.max(8, now - s.drag.t)) * 16;
    s.drag.last = a;
    s.drag.t = now;
  };
  const up = () => (st.current.drag = null);

  return (
    <div class={"spin-stage" + (out ? " out" : "")}>
      <div class="dvd-case" aria-hidden="true">
        <span class="dvd-spine" />
        <span class="dvd-label">
          <b>warpdrive</b>
          <i>collector edition</i>
        </span>
      </div>
      <div
        class="spin-disc"
        ref={disc}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        role="img"
        aria-label="A Warpdrive game disc. Drag to spin it.">
        <span class="spin-ring" />
        <span class="spin-text">warpdrive collector edition</span>
        <span class="spin-hub" />
      </div>
      <div class="spin-ui">
        <span>{rpm * 10} rpm</span>
        <button class="btn btn-quiet sm" onClick={() => setOut(!out)}>
          <Icon name={out ? "box" : "disc"} /> {out ? "Put it back" : "Take it out"}
        </button>
      </div>
    </div>
  );
}

const FACTS = [
  ["Full size DVDs", "4.7GB per disc"],
  ["Custom cases", "so the case matches what the developer had in mind"],
  ["Install once", "and play forever without the disc"],
  ["About $5 a disc", "to make. Cheap to produce, lovely to own"],
  ["Disc runs", "go to our favourite titles"],
  ["Buying the disc", "unlocks the game on your handheld too"],
];

function Discs() {
  return (
    <section class="sec" id="discs">
      <div class="wrap discs-grid">
        <SpinDisc />
        <div>
          <h2 class="h2">Games you can hold</h2>
          <p class="lede">
            Real discs in purple collector cases. Grab the disc and give it a spin.
          </p>
          <ul class="plain-list">
            {FACTS.map(([a, b]) => (
              <li key={a}>
                <strong>{a}</strong>, {b}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function Hardware() {
  return (
    <>
      <Intro />
      <FormFactors />
      <SpecExplorer />
      <Discs />
    </>
  );
}
