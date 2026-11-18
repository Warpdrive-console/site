// Console shell finishes, taken from the handheld renders: candy metallic
// paint over a chrome frame. paint: the 3D model's base colour.
// a/b: light and dark ends of the CSS gradient, ink: buttons, glow: accent light.
export const SHELLS = [
  { id: "grape", name: "Grape", paint: "#4b2a7a", a: "#8a63c7", b: "#2c1450", ink: "#1c0b36", glow: "#c9a8ff" },
  { id: "copper", name: "Copper", paint: "#b8521a", a: "#f0a060", b: "#7a2c08", ink: "#3d1404", glow: "#ffc48a" },
  { id: "cobalt", name: "Cobalt", paint: "#1a3f9a", a: "#5b8ae6", b: "#0b1f5c", ink: "#06112e", glow: "#a8c8ff" },
  { id: "cherry", name: "Cherry", paint: "#a8101c", a: "#f05060", b: "#5c0610", ink: "#2e0308", glow: "#ffb0b8" },
  { id: "rose", name: "Rose", paint: "#c99aa8", a: "#f6dbe2", b: "#9c6c7c", ink: "#5a3442", glow: "#ffe4ec" },
  { id: "forest", name: "Forest", paint: "#17502c", a: "#4fa06a", b: "#0a2a16", ink: "#04140a", glow: "#b6ffcc" },
];

export const shellById = (id) => SHELLS.find((s) => s.id === id) || SHELLS[0];

export const shellVars = (s) => ({
  "--shell-a": s.a,
  "--shell-b": s.b,
  "--shell-ink": s.ink,
  "--shell-glow": s.glow,
});
