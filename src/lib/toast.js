import { signal } from "@preact/signals";

export const toasts = signal([]);
let n = 0;

/** Show a short message at the bottom of the screen. */
export function toast(text, { tone = "pink", ms = 2800 } = {}) {
  const id = ++n;
  toasts.value = [...toasts.value.slice(-2), { id, text, tone }];
  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }, ms);
}
