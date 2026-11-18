import { useEffect, useRef, useState } from "preact/hooks";
import { fmt, money } from "../lib/hooks.jsx";
import { signedIn, username, displayName, friends, signIn, avatarUrl, profileUrl } from "../lib/rotur.js";
import { GITHUB } from "../components/Nav.jsx";
import { Avatar } from "../components/Nav.jsx";
import { Icon } from "../components/Icon.jsx";

const CHANNELS = [
  {
    id: "store",
    name: "Storefront",
    cut: 0.9,
    icon: "globe",
    body: "The official, curated digital store. There's a quality bar, submission is free, and you keep 90% of every sale.",
  },
  {
    id: "disc",
    name: "Disc",
    cut: 0.7,
    icon: "disc",
    body: "DVD releases with custom cases, printed discs and collector editions. You keep 70%.",
  },
  {
    id: "open",
    name: "Open-Ware",
    cut: null,
    icon: "box",
    body: "A third party store for fan games, emulators and mods. We take nothing.",
  },
  {
    id: "home",
    name: "Homebrew",
    cut: null,
    icon: "terminal",
    body: "A local sideloader for modders and tinkerers. No store, no approval, no permission.",
  },
];

// copies slider runs on a log scale, 10 to 100k
const toCopies = (v) => Math.round(Math.pow(10, 1 + v * 4) / 10) * 10;

function Intro() {
  return (
    <section class="dev-intro">
      <div class="wrap">
        <h1 class="h1 dev-title">Your game. Your cut.</h1>
        <p class="lede">
          Free to develop for, with no gatekeeping. There are four ways to ship, and you keep the
          majority on all of them.
        </p>
      </div>
    </section>
  );
}

function Revenue() {
  const [ch, setCh] = useState("store");
  const [price, setPrice] = useState(12);
  const [v, setV] = useState(0.55);
  const c = CHANNELS.find((x) => x.id === ch);
  const copies = toCopies(v);
  const gross = price * copies;
  const keep = c.cut ? gross * c.cut : 0;
  const usual = gross * 0.7;

  const onKey = (e) => {
    const i = CHANNELS.findIndex((x) => x.id === ch);
    const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = CHANNELS[(i + d + CHANNELS.length) % CHANNELS.length].id;
    setCh(n);
    e.currentTarget.querySelector(`[data-id="${n}"]`)?.focus();
  };

  return (
    <section class="sec" id="revenue">
      <div class="wrap">
        <div class="sec-split">
          <h2 class="h2">Four ways to ship</h2>
          <p class="copy">Pick a channel, set a price and a number of copies, and see what reaches you.</p>
        </div>
        <div class="rev">
          <div class="rev-tabs" role="tablist" aria-label="Ways to ship" aria-orientation="vertical" onKeyDown={onKey}>
            {CHANNELS.map((x) => (
              <button
                key={x.id}
                data-id={x.id}
                role="tab"
                aria-selected={x.id === ch}
                tabIndex={x.id === ch ? 0 : -1}
                class={"rev-tab" + (x.id === ch ? " on" : "")}
                onClick={() => setCh(x.id)}>
                <Icon name={x.icon} />
                <span class="rev-name">{x.name}</span>
                <span class="rev-cut">{x.cut ? Math.round(x.cut * 100) + "%" : x.id === "open" ? "Free" : "Local"}</span>
              </button>
            ))}
          </div>

          <div class="rev-screen screen" role="tabpanel">
            <p class="rev-body">{c.body}</p>
            {c.cut ? (
              <>
                <div class="rev-sliders">
                  <label>
                    <span>
                      Price <b>{money(price)}</b>
                    </span>
                    <input type="range" min="1" max="60" step="1" value={price} onInput={(e) => setPrice(+e.currentTarget.value)} />
                  </label>
                  <label>
                    <span>
                      Copies sold <b>{fmt(copies)}</b>
                    </span>
                    <input type="range" min="0" max="1" step="0.001" value={v} onInput={(e) => setV(+e.currentTarget.value)} />
                  </label>
                </div>
                <div class="rev-out">
                  <p class="rev-keep">
                    You keep
                    <b>{money(Math.round(keep))}</b>
                  </p>
                  <div class="rev-bars" aria-hidden="true">
                    <div class="rev-bar">
                      <span>Warpdrive {c.name.toLowerCase()}</span>
                      <i style={{ "--w": c.cut }} />
                    </div>
                    <div class="rev-bar usual">
                      <span>A store taking the usual 30%</span>
                      <i style={{ "--w": 0.7 }} />
                    </div>
                  </div>
                  {c.cut > 0.7 && (
                    <p class="small">
                      That's {money(Math.round(keep - usual))} more than a 30% cut would leave you.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div class="rev-free">
                <Icon name={c.icon} />
                <p>{c.id === "open" ? "Warpdrive takes 0%." : "Nothing between you and the player."}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Stop on the handheld, carry on from the same save on the TV. */
function Sync() {
  const [on, setOn] = useState("handheld");
  const [moving, setMoving] = useState(false);
  const save = signedIn.value ? `${displayName.value}'s save` : "Your save";
  const swap = () => {
    setMoving(true);
    setTimeout(() => {
      setOn((o) => (o === "handheld" ? "tv" : "handheld"));
      setMoving(false);
    }, 900);
  };
  return (
    <section class="sec" id="sync">
      <div class="wrap sync-grid">
        <div>
          <h2 class="h2">One account, every device</h2>
          <p class="lede">
            <strong>Rotur</strong> bridges the hardware gap. It syncs your library, your saves and
            your cross play data, so the home console and the handheld feel like two halves of the
            same thing.
          </p>
          <ul class="plain-list">
            <li>
              <strong>Universal library</strong>, digital or disc, one purchase for every Warpdrive
              you own
            </li>
            <li>
              <strong>Saves from anywhere</strong>, switch from the handheld to the console without
              missing a beat
            </li>
            <li>
              <strong>Cross play by default</strong>, handheld and console share the same lobbies
            </li>
            <li>
              <strong>Nobody rebuys</strong> the same game on both
            </li>
          </ul>
        </div>
        <div class="sync-toy screen">
          <div class={"sync-dev" + (on === "handheld" ? " has" : "")}>
            <Icon name="handheld" />
            <span>Handheld</span>
          </div>
          <div class={"sync-cloud" + (moving ? " busy" : "")}>
            <Icon name="cloud" />
            <span class="sync-save" data-at={moving ? "cloud" : on}>
              <b>Spectrum in the Void</b>
              <i>{save}</i>
            </span>
          </div>
          <div class={"sync-dev" + (on === "tv" ? " has" : "")}>
            <Icon name="tv" />
            <span>Home console</span>
          </div>
          <button class="btn btn-lime sm sync-btn" onClick={swap} disabled={moving}>
            {on === "handheld" ? "Carry on on the TV" : "Take it with you"}
          </button>
        </div>
      </div>
    </section>
  );
}

const SOCIAL = [
  ["user", "Profiles and gamertags", "sync across every device, and stay optional"],
  ["users", "Friends, parties and a networking API", "real time and console native"],
  ["mic", "Voice chat", "built in, no app, no setup"],
  ["chat", "Messages and communities", "round up your friends and build a space for them"],
  ["lock", "Payments from your phone", "card details never touch the console"],
];

function nameOf(f) {
  return typeof f === "string" ? f : f?.username || f?.name || "";
}

function Social() {
  const list = (friends.value || []).map(nameOf).filter(Boolean);
  return (
    <section class="sec" id="social">
      <div class="wrap social-grid">
        <div class="social-panel screen">
          {signedIn.value ? (
            <>
              <div class="me-row">
                <Avatar name={username.value} size={48} />
                <div>
                  <strong>{displayName.value}</strong>
                  <span>@{username.value}</span>
                </div>
                <span class="online">Online</span>
              </div>
              <p class="social-sub">
                {friends.value === null
                  ? "Loading your friends."
                  : list.length
                    ? `${list.length} Rotur ${list.length === 1 ? "friend" : "friends"}, already on your Warpdrive`
                    : "No Rotur friends yet. They'll show up here when you add some."}
              </p>
              <div class="friend-grid">
                {list.slice(0, 12).map((n) => (
                  <a key={n} class="friend" href={profileUrl(n)} target="_blank" rel="noopener" title={n}>
                    <img src={avatarUrl(n, 96)} alt="" width="48" height="48" loading="lazy" />
                    <span>{n}</span>
                  </a>
                ))}
              </div>
            </>
          ) : (
            <div class="social-out">
              <Icon name="users" />
              <p>Sign in and your Rotur friends show up here, the same list you'll see on the console.</p>
              <button class="btn sm" onClick={signIn}>
                Sign in with Rotur
              </button>
            </div>
          )}
        </div>
        <div>
          <h2 class="h2">Get social, make a friend</h2>
          <ul class="social-list">
            {SOCIAL.map(([icon, a, b]) => (
              <li key={a}>
                <span class="social-ico">
                  <Icon name={icon} />
                </span>
                <span>
                  <strong>{a}</strong>, {b}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

const SDKS = [
  ["Warpdrive SDK", "core dev tools, achievements, gamepad support and console integration"],
  ["Rotur API", "the social layer, library sync, friends, chat and multiplayer"],
  ["Frontend framework", "the console UI. Theme it, or replace the dashboard"],
];

function Terminal() {
  const [lines, setLines] = useState([
    ["out", "warpdrive dev shell. type help, or try a command below."],
  ]);
  const [cmd, setCmd] = useState("");
  const box = useRef(null);
  const input = useRef(null);
  useEffect(() => {
    if (box.current) box.current.scrollTop = box.current.scrollHeight;
  }, [lines]);

  const run = (raw) => {
    const c = raw.trim();
    if (!c) return;
    const out = [];
    const [head, ...rest] = c.split(/\s+/);
    if (c === "help") out.push("commands: git clone warpdrive-console, ls, cd <repo>, rotur profile, clear");
    else if (c === "clear") return setLines([]), setCmd("");
    else if (head === "git" && rest[0] === "clone") out.push("Cloning into 'warpdrive-console'... done.", "the repos live at github.com/Warpdrive-console");
    else if (head === "ls") out.push("Gamepad-Plus/  site/  (and more on GitHub)");
    else if (head === "cd") out.push(rest[0] ? `you're in ${rest[0]} now. it's nice in here.` : "cd where?");
    else if (c === "rotur profile")
      out.push(signedIn.value ? `signed in as ${username.value} (${displayName.value})` : "not signed in. sign in with Rotur from the top bar.");
    else if (head === "sudo") out.push("nice try.");
    else out.push("pretend it did something ✓");
    setLines((l) => [...l, ["in", c], ...out.map((o) => ["out", o])]);
    setCmd("");
  };

  return (
    <div class="term" onClick={() => input.current?.focus()}>
      <div class="term-bar">
        <i />
        <i />
        <i />
        <span>terminal</span>
      </div>
      <div class="term-body" ref={box} aria-live="polite">
        {lines.map(([k, t], i) => (
          <p key={i} class={k}>
            {k === "in" && <span class="term-ps">$</span>}
            {t}
          </p>
        ))}
        <form
          class="term-line"
          onSubmit={(e) => {
            e.preventDefault();
            run(cmd);
          }}>
          <span class="term-ps">$</span>
          <input
            ref={input}
            value={cmd}
            onInput={(e) => setCmd(e.currentTarget.value)}
            aria-label="Type a command"
            autocomplete="off"
            spellcheck={false}
            data-own-space
          />
        </form>
      </div>
      <div class="term-try">
        {["git clone warpdrive-console", "ls", "rotur profile"].map((c) => (
          <button key={c} class="chip" onClick={() => run(c)}>
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

function OpenSource() {
  return (
    <section class="sec" id="open-source">
      <div class="wrap os-grid">
        <div>
          <h2 class="h2">Built in the open</h2>
          <p class="lede">
            The runtime, the dev tools and the social layer are <strong>open source</strong>. Fork
            it, audit it, break it, fix it. Moddability isn't bolted on, it's the foundation.
          </p>
          <ul class="sdk-list">
            {SDKS.map(([a, b]) => (
              <li key={a}>
                <strong>{a}</strong>
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <a class="btn btn-chrome" href={GITHUB} target="_blank" rel="noopener">
            <Icon name="github" /> View on GitHub
          </a>
        </div>
        <Terminal />
      </div>
    </section>
  );
}

export function Developers() {
  return (
    <>
      <Intro />
      <Revenue />
      <Sync />
      <Social />
      <OpenSource />
    </>
  );
}
