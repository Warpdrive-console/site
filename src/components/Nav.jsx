import { useEffect, useRef, useState, useLayoutEffect } from "preact/hooks";
import { route, href } from "../lib/router.js";
import { calm, setCalm } from "../lib/fx.js";
import { user, signedIn, displayName, avatarUrl, signIn, signOut, ROTUR_ACCOUNT_URL } from "../lib/rotur.js";
import { Icon } from "./Icon.jsx";

export const DISCORD = "https://discord.gg/Dv6K2vNyfK";
export const GITHUB = "https://github.com/Warpdrive-console";

const LINKS = [
  ["home", "Home"],
  ["technical", "Hardware"],
  ["developmental", "Developers"],
];

function Avatar({ name, size = 28 }) {
  return (
    <img
      class="avatar"
      src={avatarUrl(name, size * 2)}
      alt=""
      width={size}
      height={size}
      loading="lazy"
    />
  );
}

function AccountMenu() {
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = (e) => !box.current?.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  if (!signedIn.value) {
    return (
      <button class="nav-acct" onClick={signIn}>
        Sign in
      </button>
    );
  }
  const name = user.value.username;
  return (
    <div class="acct-wrap" ref={box}>
      <button
        class="nav-acct in"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}>
        <Avatar name={name} />
        <span class="nav-acct-name">{displayName.value}</span>
      </button>
      {open && (
        <div class="acct-menu" role="menu">
          <div class="acct-menu-head">
            <Avatar name={name} size={40} />
            <div>
              <strong>{displayName.value}</strong>
              <span>@{name}</span>
            </div>
          </div>
          <a role="menuitem" href={href("account")} onClick={() => setOpen(false)}>
            <Icon name="handheld" /> Your dashboard
          </a>
          <a role="menuitem" href={ROTUR_ACCOUNT_URL} target="_blank" rel="noopener">
            <Icon name="user" /> Manage your Rotur account <Icon name="ext" class="dim" />
          </a>
          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              signOut();
            }}>
            <Icon name="out" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export function FxToggle({ label = false }) {
  const on = !calm.value;
  return (
    <button
      class={"fx-toggle" + (on ? " on" : "")}
      onClick={() => setCalm(on)}
      aria-pressed={on}
      title={on ? "Turn motion off" : "Turn motion on"}>
      <Icon name={on ? "spark" : "pause"} />
      {label ? <span>{on ? "Motion on" : "Motion off"}</span> : <span class="sr-only">Motion</span>}
    </button>
  );
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [sheet, setSheet] = useState(false);
  const links = useRef(null);
  const [pill, setPill] = useState(null);
  const page = route.value.page;

  useEffect(() => {
    const on = () => setScrolled(scrollY > 24);
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);

  // slide the highlight under the current page's link
  useLayoutEffect(() => {
    const place = () => {
      const a = links.current?.querySelector(`[data-id="${page}"]`);
      setPill(a ? { x: a.offsetLeft, w: a.offsetWidth } : null);
    };
    place();
    document.fonts?.ready.then(place);
    addEventListener("resize", place);
    return () => removeEventListener("resize", place);
  }, [page]);

  useEffect(() => setSheet(false), [page]);
  useEffect(() => {
    document.body.style.overflow = sheet ? "hidden" : "";
  }, [sheet]);

  return (
    <>
      <header class={"nav" + (scrolled ? " scrolled" : "")}>
        <div class="nav-bar">
          <a class="nav-logo" href={href("home")} aria-label="Warpdrive home">
            <img src="/warpdrive-logo.png" alt="Warpdrive" width="124" height="49" />
          </a>
          <nav class="nav-links" ref={links} aria-label="Main">
            {pill && <span class="nav-pill" style={{ "--x": pill.x + "px", "--w": pill.w + "px" }} />}
            {LINKS.map(([id, label]) => (
              <a
                key={id}
                data-id={id}
                href={href(id)}
                class={page === id ? "on" : ""}
                aria-current={page === id ? "page" : undefined}>
                {label}
              </a>
            ))}
          </nav>
          <div class="nav-right">
            <FxToggle />
            <a class="btn sm nav-discord" href={DISCORD} target="_blank" rel="noopener">
              <Icon name="discord" /> Discord
            </a>
            <AccountMenu />
            <button
              class="nav-burger"
              aria-label={sheet ? "Close menu" : "Open menu"}
              aria-expanded={sheet}
              onClick={() => setSheet(!sheet)}>
              <Icon name={sheet ? "close" : "menu"} />
            </button>
          </div>
        </div>
        <ScrollProgress />
      </header>

      <div class={"sheet" + (sheet ? " open" : "")} aria-hidden={!sheet}>
        <nav class="sheet-links" aria-label="Mobile">
          {LINKS.map(([id, label], i) => (
            <a key={id} href={href(id)} style={{ "--i": i }} class={page === id ? "on" : ""}>
              {label}
            </a>
          ))}
          {signedIn.value && (
            <a href={href("account")} style={{ "--i": 3 }} class={page === "account" ? "on" : ""}>
              Your dashboard
            </a>
          )}
        </nav>
        <div class="sheet-foot">
          <a class="btn" href={DISCORD} target="_blank" rel="noopener">
            <Icon name="discord" /> Join the Discord
          </a>
          <a class="btn btn-quiet" href={GITHUB} target="_blank" rel="noopener">
            <Icon name="github" /> GitHub
          </a>
          <FxToggle label />
        </div>
      </div>
    </>
  );
}

function ScrollProgress() {
  const bar = useRef(null);
  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - innerHeight;
        bar.current?.style.setProperty("--p", max > 0 ? scrollY / max : 0);
      });
    };
    on();
    addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on);
    return () => {
      removeEventListener("scroll", on);
      removeEventListener("resize", on);
    };
  }, []);
  return <div class="nav-progress" ref={bar} aria-hidden="true" />;
}

export { Avatar };
