import { useState } from "preact/hooks";
import { useInView, useCountUp } from "../lib/hooks.jsx";
import { SHELLS, shellById, shellVars } from "../data/shells.js";
import { shell, setShell } from "../lib/shell.js";
import { DISCORD } from "../components/Nav.jsx";
import { Icon } from "../components/Icon.jsx";

const IN_BOX = [
  ["Warpdrive home console", "in the shell colour you pick"],
  ["Banks stickers", "not optional, non-negotiable"],
  ["A bundled game", "disc included, picked at random"],
  ["Free shipping", "USA, discounted worldwide"],
  ["Gamepad support", "Bluetooth, wired, SNES, PS5, most things in between"],
  ["Printed mailer box", "inside and out"],
];

const TIERS = [
  { id: "thanks", name: "Thank you + stickers", price: 15, approx: true, gets: ["Our thanks", "Banks stickers"] },
  { id: "game", name: "Physical game", price: 25, approx: true, gets: ["A game on disc, in a purple collector case"] },
  { id: "console", name: "Console bundle", price: 225, gets: ["Home console", "A bundled game", "Banks stickers", "Free US shipping"] },
  { id: "pad", name: "Console + 8BitDo controller", price: 250, approx: true, gets: ["The console bundle", "An 8BitDo controller"] },
  { id: "full", name: "Full bundle + store credit", price: 300, approx: true, gets: ["Console + controller", "Store credit"] },
];

/** A front-on home console, recoloured by the shell picker. */
export function HomeConsole({ s }) {
  return (
    <div class={"hc" + (s.clear ? " clear" : "")} style={shellVars(s)} aria-hidden="true">
      <div class="hc-top" />
      <div class="hc-face">
        <span class="hc-slot" />
        <span class="hc-logo">warpdrive</span>
        <span class="hc-led" />
        <span class="hc-ports">
          <i />
          <i />
        </span>
      </div>
      <div class="hc-feet">
        <i />
        <i />
      </div>
    </div>
  );
}

export function Price() {
  const s = shellById(shell.value);
  const [tier, setTier] = useState("console");
  const t = TIERS.find((x) => x.id === tier);
  const [ref, seen] = useInView();
  const total = useCountUp(t.price, seen, 500);

  return (
    <section class="sec" id="price">
      <div class="wrap">
        <h2 class="h2 sec-title">One price, and no tricks</h2>

        <div class="price-grid">
          <div class="retail">
            <div class="retail-box" style={shellVars(s)}>
              <span class="retail-name">warpdrive</span>
              <span class="retail-sub">Home console</span>
              <HomeConsole s={s} />
              <span class="retail-colour">{s.name}</span>
              <span class="price-sticker" aria-label="225 dollars">
                <small>$</small>225
              </span>
            </div>
            <div class="retail-pick">
              <p class="small">Choose a shell colour</p>
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
            <h3 class="h3 in-box-title">In the box</h3>
            <ul class="in-box">
              {IN_BOX.map(([a, b]) => (
                <li key={a}>
                  <strong>{a}</strong>, {b}
                </li>
              ))}
              <li>
                <strong>Pre-orders</strong> open{" "}
                <span class="someday" tabIndex={0} data-tip="No, seriously. One day. Probably.">
                  someday lmao
                </span>
              </li>
            </ul>
          </div>

          <form class="reply-card" onSubmit={(e) => e.preventDefault()} ref={ref}>
            <div class="reply-top">
              <h3>Kickstarter reply card</h3>
              <p>
                The campaign is coming. Batch size follows demand, with plenty of colour choice.
                Tick the tier you'd back.
              </p>
            </div>
            <fieldset class="reply-tiers">
              <legend class="sr-only">Kickstarter tiers</legend>
              {TIERS.map((x) => (
                <label key={x.id} class={"reply-tier" + (x.id === tier ? " on" : "")}>
                  <input
                    type="radio"
                    name="tier"
                    value={x.id}
                    checked={x.id === tier}
                    onChange={() => setTier(x.id)}
                  />
                  <span class="reply-box" aria-hidden="true" />
                  <span class="reply-name">{x.name}</span>
                  <span class="reply-dots" aria-hidden="true" />
                  <span class="reply-price">
                    {x.approx ? "about " : ""}${x.price}
                  </span>
                </label>
              ))}
            </fieldset>
            <div class="reply-sum">
              <p>
                You'd get {t.gets.map((g, n) => (n ? (n === t.gets.length - 1 ? " and " : ", ") : "") + g.charAt(0).toLowerCase() + g.slice(1))}.
              </p>
              <p class="reply-total">
                {t.approx ? "About " : ""}
                <b>${total}</b>
              </p>
            </div>
            <a class="btn reply-btn" href={DISCORD} target="_blank" rel="noopener">
              <Icon name="discord" /> Get told when it launches
            </a>
            <p class="reply-fine">Prices marked "about" are estimates until the campaign goes live.</p>
          </form>
        </div>
      </div>
    </section>
  );
}
