import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { createScreen } from "../lib/consoleScreen.js";
import { useVisible } from "../lib/hooks.jsx";
import { calm, lowEnd } from "../lib/fx.js";
import { GAMES } from "../data/games.js";
import { SHELLS, shellById, shellVars } from "../data/shells.js";
import { shell, setShell, nextShell } from "../lib/shell.js";
import { signedIn } from "../lib/rotur.js";

const webgl = (() => {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
})();

/**
 * The WD-01 handheld, as a 3D model you can spin. Its buttons work: the d-pad
 * and shoulders flip through the games on its menu, A opens one, select
 * changes the shell. Without WebGL it falls back to a flat drawing.
 */
export function Handheld() {
  const host = useRef(null);
  const view = useRef(null);
  const visible = useVisible(host);
  const [mode, setMode] = useState(webgl ? "loading" : "flat");
  const [pressed, setPressed] = useState({});
  const s = shellById(shell.value);
  const screen = useMemo(() => createScreen(GAMES, s.glow), []);

  const act = (name, on) => {
    setPressed((p) => ({ ...p, [name]: on }));
    view.current?.setPressed(name, on);
    if (!on) return;
    if (name === "a" || name === "start") screen.launch();
    else if (name === "b") screen.back();
    else if (name === "left" || name === "l" || name === "y") screen.next(-1);
    else if (name === "right" || name === "r" || name === "x") screen.next(1);
    else if (name === "select") nextShell();
    else if (name === "home") screen.boot();
  };

  useEffect(() => {
    if (mode !== "loading") return;
    let dead = false;
    import("../lib/handheld3d.js")
      .then(({ mountHandheld }) => {
        if (dead) return;
        view.current = mountHandheld(host.current, {
          screen: screen.canvas,
          paint: shellById(shell.value).paint,
          lowEnd: !!lowEnd,
          calm: () => calm.value,
          onButton: act,
          onStick: (d) => screen.next(d),
          onFrame: (dt) => screen.step(dt),
        });
        view.current.run(visible);
        setMode("3d");
      })
      .catch((e) => {
        console.warn("3D handheld unavailable", e);
        if (!dead) setMode("flat");
      });
    return () => {
      dead = true;
      view.current?.destroy();
      view.current = null;
    };
  }, []);

  useEffect(() => view.current?.run(visible), [visible, mode]);
  useEffect(() => {
    view.current?.setPaint(s.paint);
    screen.setGlow(s.glow);
  }, [s.id]);

  // the flat fallback drives the screen itself
  const slot = useRef(null);
  useEffect(() => {
    if (mode !== "flat" || !visible) return;
    slot.current?.appendChild(screen.canvas);
    screen.canvas.className = "hh-screen";
    let raf = 0,
      last = performance.now();
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      screen.step(Math.min(0.05, (now - last) / 1000));
      last = now;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode, visible]);

  // keyboard, only while the handheld has focus
  const KEYS = {
    ArrowLeft: "left",
    ArrowRight: "right",
    ArrowUp: "up",
    ArrowDown: "down",
    Enter: "a",
    " ": "a",
    z: "a",
    x: "b",
    Escape: "b",
    Backspace: "b",
    q: "l",
    e: "r",
  };
  const onKey = (on) => (e) => {
    const k = KEYS[e.key] || KEYS[e.key.toLowerCase?.()];
    if (!k) return;
    e.preventDefault();
    if (on && e.repeat) return;
    act(k, on);
  };

  const hold = (name) => ({
    onPointerDown: (e) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture?.(e.pointerId);
      act(name, true);
    },
    onPointerUp: () => act(name, false),
    onPointerCancel: () => act(name, false),
  });

  return (
    <div class="hh-stage" style={shellVars(s)}>
      <div
        ref={host}
        class={"hh3d " + mode}
        tabIndex={0}
        data-own-space
        role="group"
        aria-roledescription="3D model"
        aria-label={`The Warpdrive WD-01 handheld in ${s.name}. Drag to spin it. Arrow keys flip through the games on its screen, Enter opens one.`}
        onKeyDown={onKey(true)}
        onKeyUp={onKey(false)}>
        {mode === "flat" && (
          <div class="hh">
            <div class="hh-left">
              <div class="dpad">
                <button class={"dp-l" + (pressed.left ? " down" : "")} aria-label="Previous game" {...hold("left")} />
                <button class={"dp-r" + (pressed.right ? " down" : "")} aria-label="Next game" {...hold("right")} />
                <span class="dp-u" />
                <span class="dp-d" />
                <span class="dp-c" />
              </div>
            </div>
            <div class="hh-mid">
              <div class="hh-bezel" ref={slot}>
                <span class="hh-led" />
              </div>
            </div>
            <div class="hh-right">
              <div class="abxy">
                <button class={"btn-b" + (pressed.b ? " down" : "")} {...hold("b")} aria-label="B: back">
                  B
                </button>
                <button class={"btn-a" + (pressed.a ? " down" : "")} {...hold("a")} aria-label="A: open">
                  A
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div class="hh-under">
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
        <p class="hh-caption">
          <strong>{s.name}</strong>. {mode === "flat" ? "Press the buttons" : "Drag to spin it, press the buttons"}
          {signedIn.value ? ". Your colour is saved to your Rotur account." : "."}
        </p>
      </div>
    </div>
  );
}
