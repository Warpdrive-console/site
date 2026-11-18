import { signal, effect } from "@preact/signals";
import { recall, remember, saved } from "./rotur.js";
import { SHELLS } from "../data/shells.js";

/** The shell colour picked anywhere on the site (hero handheld, price configurator). */
export const shell = signal(recall("shell", "grape"));

export function setShell(id) {
  shell.value = id;
  remember("shell", id);
}

export function nextShell() {
  const i = SHELLS.findIndex((x) => x.id === shell.value);
  setShell(SHELLS[(i + 1) % SHELLS.length].id);
}

// a colour saved on the Rotur account wins once it loads
effect(() => {
  const s = saved.value.shell;
  if (s && SHELLS.some((x) => x.id === s)) shell.value = s;
});
