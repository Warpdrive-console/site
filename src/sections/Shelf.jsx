import { useRef, useState } from "preact/hooks";
import { GAMES } from "../data/games.js";
import { Icon } from "../components/Icon.jsx";

/** Box art: the screenshot when there is one, otherwise generated from the game's hue. */
export function Cover({ game, big = false }) {
  const h = game.hue;
  return (
    <div
      class={"cover" + (big ? " big" : "")}
      style={{ "--h": h, "--h2": (h + 50) % 360 }}
      aria-hidden="true">
      {game.img ? (
        <img src={game.img} alt="" loading="lazy" />
      ) : (
        <div class="cover-art">
          <span class="cover-orb" />
          <span class="cover-grid" />
          <span class="cover-short">{game.short}</span>
        </div>
      )}
      <span class="cover-band">
        <b>warpdrive</b>
        <i>{game.tags[0]}</i>
      </span>
    </div>
  );
}

export function Shelf() {
  const [i, setI] = useState(2);
  const list = useRef(null);
  const g = GAMES[i];
  const go = (n) => {
    const next = (n + GAMES.length) % GAMES.length;
    setI(next);
    list.current?.querySelectorAll("button")[next]?.focus();
  };
  const onKey = (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") (e.preventDefault(), go(i + 1));
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") (e.preventDefault(), go(i - 1));
  };

  return (
    <section class="sec" id="games">
      <div class="wrap">
        <div class="sec-split">
          <h2 class="h2">Games in the works</h2>
          <p class="copy">
            These are being built for Warpdrive right now. Pick a case off the shelf to read about
            it.
          </p>
        </div>

        <div class="shelf">
          <div class="shelf-feature" key={g.id}>
            <div class="feature-case">
              <span class="feature-disc" style={{ "--h": g.hue }} aria-hidden="true">
                <i />
              </span>
              <Cover game={g} big />
            </div>
            <div class="feature-info" aria-live="polite">
              <div class="feature-tags">
                {g.tags.map((t) => (
                  <span key={t} class="tag">
                    {t}
                  </span>
                ))}
              </div>
              <h3 class="feature-title">{g.title}</h3>
              <p>{g.desc}</p>
              <div class="feature-nav">
                <button class="round" onClick={() => go(i - 1)} aria-label="Previous game">
                  <Icon name="left" />
                </button>
                <span>
                  {i + 1} of {GAMES.length}
                </span>
                <button class="round" onClick={() => go(i + 1)} aria-label="Next game">
                  <Icon name="right" />
                </button>
              </div>
            </div>
          </div>

          <div class="shelf-rack" ref={list} role="tablist" aria-label="Games" onKeyDown={onKey}>
            {GAMES.map((x, n) => (
              <button
                key={x.id}
                role="tab"
                aria-selected={n === i}
                tabIndex={n === i ? 0 : -1}
                class={"spine" + (n === i ? " out" : "")}
                style={{ "--h": x.hue, "--n": n }}
                onClick={() => setI(n)}>
                <span class="spine-title">{x.title}</span>
                <span class="spine-logo">WD</span>
              </button>
            ))}
            <div class="shelf-plank" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
