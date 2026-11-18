import { useEffect, useRef, useState } from "preact/hooks";
import { Icon } from "../components/Icon.jsx";

const ENGINES = [
  { name: "Scratch", web: true },
  { name: "TurboWarp", web: true },
  { name: "GB Studio", web: true },
  { name: "GDevelop", web: true },
  { name: "Unity" },
  { name: "GameMaker" },
  { name: "Godot" },
  { name: "Anything else" },
];

/** Rule 01: pick any engine, it boots exactly the same way. */
function EngineToy() {
  const [pick, setPick] = useState(null);
  const [p, setP] = useState(0);
  const raf = useRef(0);
  const boot = (e) => {
    setPick(e);
    cancelAnimationFrame(raf.current);
    const t0 = performance.now();
    const tick = (t) => {
      const v = Math.min(1, (t - t0) / 900);
      setP(v);
      if (v < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  const done = pick && p >= 1;
  return (
    <div class="toy engine-toy">
      <div class="engine-chips" role="group" aria-label="Pick an engine">
        {ENGINES.map((e) => (
          <button
            key={e.name}
            class={"chip" + (e.web ? " web" : "") + (pick === e ? " on" : "")}
            onClick={() => boot(e)}>
            {e.name}
          </button>
        ))}
      </div>
      <div class="toy-screen" aria-live="polite">
        {!pick ? (
          <span class="dim">Pick an engine.</span>
        ) : (
          <>
            <span>
              Starting a <b>{pick.name}</b> game <span class="dim">({pick.web ? "web" : "native"})</span>
            </span>
            <span class="bar">
              <i style={{ transform: `scaleX(${p})` }} />
            </span>
            {done && (
              <span class="ok">Same shelf, same speed, same store page as every other engine.</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** Rule 02: a browser-tab game becomes a real console release. */
function ShipToy() {
  const [shipped, setShipped] = useState(false);
  return (
    <div class={"toy ship-toy" + (shipped ? " shipped" : "")}>
      <div class="ship-tab">
        <span class="dots">
          <i />
          <i />
          <i />
        </span>
        <span>my-first-game.sb3</span>
      </div>
      <div class="ship-case" aria-hidden={!shipped}>
        <span class="ship-disc" />
        <span class="ship-cover">
          <b>MY FIRST GAME</b>
          <small>WARPDRIVE</small>
        </span>
      </div>
      <button class="btn btn-quiet sm ship-btn" onClick={() => setShipped(!shipped)} aria-pressed={shipped}>
        {shipped ? (
          <>
            <Icon name="check" /> On the shelf
          </>
        ) : (
          "Ship it"
        )}
      </button>
    </div>
  );
}

/** Rule 03: own it on one device, it's free on the others. */
function DevicesToy() {
  const [dev, setDev] = useState("tv");
  const devices = [
    ["tv", "tv", "Home console"],
    ["handheld", "handheld", "Handheld"],
    ["mini", "handheld", "Mini handheld"],
  ];
  return (
    <div class="toy devices-toy">
      <div class="dev-row" role="radiogroup" aria-label="Play on">
        {devices.map(([id, icon, label]) => (
          <button key={id} role="radio" aria-checked={dev === id} class={"dev" + (dev === id ? " on" : "")} onClick={() => setDev(id)}>
            <Icon name={icon} />
            <span>{label}</span>
          </button>
        ))}
      </div>
      <div class="toy-screen">
        <span>
          Spectrum in the Void, on the {devices.find((d) => d[0] === dev)[2].toLowerCase()}
        </span>
        <span class="price-tag">
          {dev === "tv" ? (
            <>
              <b>Owned</b> <span class="dim">bought once, on disc</span>
            </>
          ) : (
            <>
              <b class="free">$0</b> <span class="dim">to play here too. Save synced.</span>
            </>
          )}
        </span>
      </div>
    </div>
  );
}

function Rule({ title, children, toy, flip }) {
  return (
    <article class={"rule" + (flip ? " flip" : "")}>
      <div class="rule-copy">
        <h3 class="h3">{title}</h3>
        <div class="copy">{children}</div>
      </div>
      {toy}
    </article>
  );
}

export function Rules() {
  return (
    <section class="sec" id="rules">
      <div class="wrap">
        <h2 class="h2 sec-title">Three rules we don't bend</h2>
        <div class="rules">
          <Rule title="Every engine is equal" toy={<EngineToy />}>
            <p>
              Web engines like <strong>Scratch, TurboWarp and GB Studio</strong> and native engines
              like <strong>Unity, GameMaker and Godot</strong> get the same system level
              optimisation, the same integration and the same shelf space. Web games don't get
              pushed into a corner of the store.
            </p>
          </Rule>
          <Rule title="Built for the next generation of developers" toy={<ShipToy />} flip>
            <p>
              Plenty of young developers have games living in a browser tab or a project folder.
              Warpdrive gives them a real store page, a real disc and a real audience.
            </p>
          </Rule>
          <Rule title="Buy once, play everywhere" toy={<DevicesToy />}>
            <p>
              Buy a game once, digital or disc, and your <strong>Rotur account</strong> adds it to
              your library. Move from the TV to any handheld without paying again. Your saves come
              with you.
            </p>
          </Rule>
        </div>
      </div>
    </section>
  );
}
