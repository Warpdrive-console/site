import { useEffect } from "preact/hooks";
import { authState, authError, signIn, closeAuth } from "../lib/rotur.js";
import { toasts } from "../lib/toast.js";
import { Icon } from "./Icon.jsx";

/** Shown while the Rotur sign in window is open, or when it failed. */
export function AuthSheet() {
  const state = authState.value;
  useEffect(() => {
    if (state === "idle") return;
    const esc = (e) => e.key === "Escape" && closeAuth();
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  }, [state]);
  if (state === "idle") return null;

  return (
    <div class="auth-scrim" onClick={(e) => e.target === e.currentTarget && closeAuth()}>
      <div class="auth-card" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button class="auth-x" onClick={closeAuth} aria-label="Close">
          <Icon name="close" />
        </button>
        <div class={"auth-orb" + (state === "error" ? " err" : "")} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        {state === "waiting" ? (
          <>
            <h2 id="auth-title" class="h3">Finish in the Rotur window</h2>
            <p>
              Warpdrive signs in with a <strong>Rotur</strong> account. Sign in or make one in that window,
              and this page picks it up.
            </p>
            <button class="link-btn" onClick={signIn}>
              Open the window again
            </button>
          </>
        ) : (
          <>
            <h2 id="auth-title" class="h3">Sign in didn't finish</h2>
            <p>{authError.value}</p>
            <div class="auth-actions">
              <button class="btn sm" onClick={signIn}>
                Try again
              </button>
              <button class="btn btn-quiet sm" onClick={closeAuth}>
                Not now
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function Toasts() {
  return (
    <div class="toasts" role="status" aria-live="polite">
      {toasts.value.map((t) => (
        <div key={t.id} class={"toast " + t.tone}>
          {t.text}
        </div>
      ))}
    </div>
  );
}
