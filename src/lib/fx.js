import { signal, effect } from "@preact/signals";

// "Calm" turns off the heavy motion: warp field, tilt, sparks, marquee.
// Default: calm when the OS asks for reduced motion or the device looks weak.
// The old site stored the choice in the `wd_display_mode` cookie; keep reading it.

const KEY = "wd_display_mode";
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

export const isMobile = () => window.innerWidth < 768;

export const lowEnd =
  (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) ||
  (navigator.deviceMemory && navigator.deviceMemory <= 2);

function saved() {
  const m = document.cookie.match("(?:^|; )" + KEY + "=([^;]*)");
  return m ? decodeURIComponent(m[1]) : null;
}

const initial = saved();
export const calm = signal(initial ? initial === "perf" : reduced.matches || !!lowEnd);

export function setCalm(on) {
  calm.value = on;
  const d = new Date(Date.now() + 365 * 864e5);
  document.cookie = `${KEY}=${on ? "perf" : "gorgeous"};expires=${d.toUTCString()};path=/;SameSite=Lax`;
}

effect(() => document.body.classList.toggle("calm", calm.value));
