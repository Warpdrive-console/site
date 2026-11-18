import { useEffect, useRef, useState } from "preact/hooks";
import {
  signedIn,
  username,
  displayName,
  friends,
  saved,
  signIn,
  signOut,
  avatarUrl,
  profileUrl,
  liveStatus,
  linkInfo,
  linkUrl,
  forgetSaved,
  explain,
  ROTUR_ACCOUNT_URL,
} from "../lib/rotur.js";
import { SHELLS, shellById } from "../data/shells.js";
import { shell, setShell } from "../lib/shell.js";
import { calm, setCalm } from "../lib/fx.js";
import { toast } from "../lib/toast.js";
import { href } from "../lib/router.js";
import { Icon } from "../components/Icon.jsx";

const nameOf = (f) => (typeof f === "string" ? f : f?.username || f?.name || "");

function SignedOut() {
  return (
    <section class="dash-out">
      <div class="wrap dash-out-grid">
        <div>
          <h1 class="h1 dash-title">Your Warpdrive, from anywhere</h1>
          <p class="lede">
            Sign in with your <strong>Rotur</strong> account to link a console, see which friends are
            online, and keep your shell colour and settings in sync.
          </p>
          <div class="hero-cta">
            <button class="btn" onClick={signIn}>
              Sign in with Rotur
            </button>
            <a class="text-link" href="https://rotur.dev/" target="_blank" rel="noopener">
              What's Rotur?
            </a>
          </div>
        </div>
        <div class="dash-out-art screen" aria-hidden="true">
          <span class="dash-orb" />
          <span class="dash-out-cap">Signed out</span>
        </div>
      </div>
    </section>
  );
}

function Header() {
  const name = username.value;
  return (
    <header class="dash-head">
      <div class="wrap dash-head-in">
        <img class="dash-avatar" src={avatarUrl(name, 192)} alt="" width="96" height="96" />
        <div class="dash-who">
          <h1 class="h2">{displayName.value}</h1>
          <a class="dash-handle" href={profileUrl(name)} target="_blank" rel="noopener">
            @{name} on Rotur
          </a>
        </div>
        <div class="dash-acts">
          <a class="btn btn-quiet sm" href={ROTUR_ACCOUNT_URL} target="_blank" rel="noopener">
            <Icon name="user" /> Manage your Rotur account <Icon name="ext" />
          </a>
          <button class="btn btn-chrome sm" onClick={signOut}>
            <Icon name="out" /> Sign out
          </button>
        </div>
      </div>
    </header>
  );
}

/** Six hex characters, typed into six glossy keys. */
function LinkConsole() {
  const [code, setCode] = useState("");
  const [info, setInfo] = useState(null);
  const [state, setState] = useState("idle"); // idle | checking | found | gone | error
  const [err, setErr] = useState("");
  const input = useRef(null);

  useEffect(() => {
    setInfo(null);
    setErr("");
    if (code.length < 6) return setState("idle");
    let dead = false;
    setState("checking");
    linkInfo(code).then(
      (d) => {
        if (dead) return;
        if (!d) return setState("gone");
        setInfo(d);
        setState("found");
      },
      (e) => {
        if (dead) return;
        setErr(explain(e));
        setState("error");
      },
    );
    return () => (dead = true);
  }, [code]);

  const onInput = (e) => {
    const v = e.currentTarget.value.toUpperCase().replace(/[^0-9A-F]/g, "").slice(0, 6);
    e.currentTarget.value = v;
    setCode(v);
  };

  return (
    <section class="dash-card link-card" aria-labelledby="link-h">
      <h2 id="link-h" class="h3">
        Link a console
      </h2>
      <p class="copy">
        When a Warpdrive asks you to sign in, it shows a six character code. Type it here to see
        what it's asking for, then approve it on Rotur.
      </p>
      <label class="code-keys" onClick={() => input.current?.focus()}>
        <span class="sr-only">Console code</span>
        <input
          ref={input}
          class="code-input"
          inputMode="text"
          autocomplete="off"
          autocapitalize="characters"
          spellcheck={false}
          maxLength={6}
          onInput={onInput}
          data-own-space
        />
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} class={"code-key" + (code[i] ? " in" : "") + (i === code.length ? " at" : "")} aria-hidden="true">
            {code[i] || ""}
          </span>
        ))}
      </label>
      <div class="link-out" aria-live="polite">
        {state === "checking" && <p class="small">Looking up that code.</p>}
        {state === "gone" && <p class="small">That code has expired or doesn't exist. Get a new one on the console.</p>}
        {state === "error" && <p class="small">{err}</p>}
        {state === "found" && info && (
          <div class="link-found">
            <Icon name={info.linked ? "check" : "handheld"} />
            <div>
              <strong>{info.name || "A device"}</strong>
              <span>
                {info.linked
                  ? "is already linked."
                  : `wants ${info.permissions?.length || 0} ${info.permissions?.length === 1 ? "permission" : "permissions"} on your account.`}
              </span>
            </div>
            {!info.linked && (
              <a class="btn btn-lime sm" href={linkUrl(code)} target="_blank" rel="noopener">
                Approve on Rotur <Icon name="ext" />
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function activityOf(st) {
  const a = st && Object.values(st.activities || {})[0];
  return a ? a.title || a.name || a.application?.name || "" : "";
}

function Friends() {
  const list = (friends.value || []).map(nameOf).filter(Boolean);
  const [live, setLive] = useState({});

  useEffect(() => {
    if (!list.length) return;
    let dead = false;
    const load = () =>
      list.slice(0, 24).forEach((n) =>
        liveStatus(n).then(
          (s) => !dead && setLive((l) => ({ ...l, [n]: s })),
          () => {},
        ),
      );
    load();
    const t = setInterval(load, 60000);
    return () => {
      dead = true;
      clearInterval(t);
    };
  }, [list.join()]);

  const isOn = (n) => {
    const p = live[n]?.presence;
    return p && p !== "offline" && p !== "invisible";
  };
  const sorted = [...list].sort((a, b) => isOn(b) - isOn(a) || a.localeCompare(b));
  const online = list.filter(isOn).length;

  return (
    <section class="dash-card friends-card" aria-labelledby="friends-h">
      <div class="dash-card-head">
        <h2 id="friends-h" class="h3">
          Friends
        </h2>
        {list.length > 0 && <span class="online">{online} online</span>}
      </div>
      {friends.value === null ? (
        <p class="small">Loading your friends.</p>
      ) : !list.length ? (
        <p class="copy">
          No Rotur friends yet. Add some on{" "}
          <a class="text-link" href="https://rotur.dev/" target="_blank" rel="noopener">
            rotur.dev
          </a>{" "}
          and they'll show up here and on your console.
        </p>
      ) : (
        <ul class="friend-list">
          {sorted.map((n) => {
            const st = live[n];
            const act = activityOf(st);
            return (
              <li key={n}>
                <a href={profileUrl(n)} target="_blank" rel="noopener">
                  <span class={"pres is-" + (st?.presence || "offline")}>
                    <img src={avatarUrl(n, 80)} alt="" width="40" height="40" loading="lazy" />
                  </span>
                  <span class="fl-body">
                    <strong>{n}</strong>
                    <span>{act || st?.status || (isOn(n) ? "Online" : "Offline")}</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function Synced() {
  const s = shellById(shell.value);
  const boops = saved.value.boops || 0;
  const forget = async () => {
    try {
      await forgetSaved();
      toast("Cleared what Warpdrive saved");
    } catch (e) {
      toast(explain(e));
    }
  };
  return (
    <section class="dash-card synced-card" aria-labelledby="synced-h">
      <h2 id="synced-h" class="h3">
        Synced to your account
      </h2>
      <div class="synced-row">
        <span>
          <strong>Shell colour</strong>
          <span>{s.name}</span>
        </span>
        <div class="swatches" role="radiogroup" aria-label="Shell colour">
          {SHELLS.map((x) => (
            <button
              key={x.id}
              role="radio"
              aria-checked={x.id === shell.value}
              aria-label={x.name}
              title={x.name}
              class={"swatch" + (x.id === shell.value ? " on" : "")}
              style={{ "--sa": x.a, "--sb": x.b }}
              onClick={() => setShell(x.id)}
            />
          ))}
        </div>
      </div>
      <div class="synced-row">
        <span>
          <strong>Banks boops</strong>
          <span>
            {boops ? `${boops} so far.` : "None yet."} <a class="text-link" href={href("home", "banks")}>Go boop him</a>
          </span>
        </span>
      </div>
      <div class="synced-row">
        <span>
          <strong>Motion</strong>
          <span>{calm.value ? "Off, the site keeps still" : "On, stars and spins"}</span>
        </span>
        <button
          class={"toggle" + (calm.value ? "" : " on")}
          role="switch"
          aria-checked={!calm.value}
          aria-label="Motion"
          onClick={() => setCalm(!calm.value)}>
          <i />
        </button>
      </div>
      <button class="link-btn forget" onClick={forget}>
        Forget everything Warpdrive saved
      </button>
    </section>
  );
}

function Library() {
  return (
    <section class="dash-card library-card" aria-labelledby="lib-h">
      <h2 id="lib-h" class="h3">
        Library
      </h2>
      <div class="lib-empty">
        <div class="lib-slots" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <p class="copy">
          Nothing here yet. Games you buy, on disc or as a download, land here and play on every
          Warpdrive you own.
        </p>
        <a class="btn btn-quiet sm" href={href("home", "games")}>
          See what's in the works
        </a>
      </div>
    </section>
  );
}

export function Dashboard() {
  if (!signedIn.value) return <SignedOut />;
  return (
    <>
      <Header />
      <div class="wrap dash-grid">
        <LinkConsole />
        <Friends />
        <Synced />
        <Library />
      </div>
    </>
  );
}
