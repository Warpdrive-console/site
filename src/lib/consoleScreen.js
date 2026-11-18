// What the handheld's screen shows: a boot glow, then a menu of the games in
// the works. It's a canvas, used as the 3D model's screen texture.
export const SW = 480;
export const SH = 360;

const FONT = '"Tilt Warp", system-ui, sans-serif';
const BODY = '"Schibsted Grotesk", system-ui, sans-serif';

function rr(x, left, top, w, h, r) {
  x.beginPath();
  x.roundRect(left, top, w, h, r);
}

/** A cover for a game: its image, or generated art from its hue. */
function makeCover(g) {
  const c = document.createElement("canvas");
  c.width = 180;
  c.height = 250;
  const x = c.getContext("2d");
  const paint = (img) => {
    const bg = x.createLinearGradient(0, 0, 180, 250);
    bg.addColorStop(0, `hsl(${g.hue} 75% 42%)`);
    bg.addColorStop(1, `hsl(${g.hue + 40} 70% 12%)`);
    x.fillStyle = bg;
    x.fillRect(0, 0, 180, 250);
    if (img) {
      const s = Math.max(180 / img.width, 250 / img.height);
      x.drawImage(img, (180 - img.width * s) / 2, (250 - img.height * s) / 2, img.width * s, img.height * s);
    } else {
      const orb = x.createRadialGradient(120, 80, 4, 120, 80, 110);
      orb.addColorStop(0, `hsl(${g.hue} 95% 80%)`);
      orb.addColorStop(0.5, `hsl(${g.hue} 85% 50% / 0.6)`);
      orb.addColorStop(1, "transparent");
      x.fillStyle = orb;
      x.fillRect(0, 0, 180, 250);
      x.fillStyle = "rgba(255,255,255,0.9)";
      x.font = `46px ${FONT}`;
      x.fillText(g.short, 14, 64);
    }
    // a gloss sweep across the top, like a shrink-wrapped case
    const gl = x.createLinearGradient(0, 0, 180, 120);
    gl.addColorStop(0, "rgba(255,255,255,0.35)");
    gl.addColorStop(0.45, "rgba(255,255,255,0.05)");
    gl.addColorStop(0.46, "rgba(255,255,255,0)");
    x.fillStyle = gl;
    x.fillRect(0, 0, 180, 250);
    x.fillStyle = "#5b1f9e";
    x.fillRect(0, 222, 180, 28);
    x.fillStyle = "#fff";
    x.font = `15px ${FONT}`;
    x.fillText("warpdrive", 10, 241);
  };
  paint(null);
  if (g.img) {
    const img = new Image();
    img.onload = () => paint(img);
    img.src = g.img;
  }
  return c;
}

export function createScreen(games, glow = "#c9a8ff") {
  const canvas = document.createElement("canvas");
  canvas.width = SW;
  canvas.height = SH;
  const x = canvas.getContext("2d");
  const covers = games.map(makeCover);

  let mode = "boot",
    t = 0, // time in the current mode
    clock = 0,
    sel = 0,
    shown = 0, // eased selection, for the carousel slide
    idle = 0,
    tint = glow;

  const go = (m) => {
    mode = m;
    t = 0;
  };

  function bootFrame() {
    x.fillStyle = "#05020c";
    x.fillRect(0, 0, SW, SH);
    const grow = Math.min(1, t / 1.1);
    const r = 20 + grow * 80;
    const o = x.createRadialGradient(SW / 2, SH / 2 - 20, 0, SW / 2, SH / 2 - 20, r * 2.2);
    o.addColorStop(0, "#fff");
    o.addColorStop(0.18, tint);
    o.addColorStop(0.5, tint + "55");
    o.addColorStop(1, "transparent");
    x.globalAlpha = Math.min(1, t * 2);
    x.fillStyle = o;
    x.fillRect(0, 0, SW, SH);
    // the ring swells out once
    x.strokeStyle = tint;
    x.lineWidth = 3;
    x.globalAlpha = Math.max(0, 1 - t / 1.4);
    x.beginPath();
    x.arc(SW / 2, SH / 2 - 20, 30 + t * 140, 0, Math.PI * 2);
    x.stroke();
    x.globalAlpha = Math.max(0, Math.min(1, (t - 0.8) * 2));
    x.fillStyle = "#fff";
    x.textAlign = "center";
    x.font = `52px ${FONT}`;
    x.fillText("warpdrive", SW / 2, SH / 2 + 110);
    x.globalAlpha = 1;
    x.textAlign = "left";
    if (t > 2.6) go("menu");
  }

  function backdrop() {
    const bg = x.createLinearGradient(0, 0, 0, SH);
    bg.addColorStop(0, "#1d0a3d");
    bg.addColorStop(1, "#08031a");
    x.fillStyle = bg;
    x.fillRect(0, 0, SW, SH);
    // slow glowing blobs drifting behind the menu
    for (let i = 0; i < 3; i++) {
      const bx = SW * (0.5 + 0.42 * Math.sin(clock * 0.3 + i * 2.1));
      const by = SH * (0.45 + 0.3 * Math.cos(clock * 0.23 + i * 1.7));
      const g = x.createRadialGradient(bx, by, 0, bx, by, 170);
      g.addColorStop(0, i === 1 ? "rgba(255,61,168,0.28)" : tint + "40");
      g.addColorStop(1, "transparent");
      x.fillStyle = g;
      x.fillRect(0, 0, SW, SH);
    }
    // a floor of light lines
    x.strokeStyle = tint + "26";
    x.lineWidth = 1;
    for (let i = 0; i < 9; i++) {
      const y = SH - 60 + i * i * 1.6;
      x.beginPath();
      x.moveTo(0, y);
      x.lineTo(SW, y);
      x.stroke();
    }
  }

  function header() {
    x.fillStyle = "rgba(255,255,255,0.92)";
    x.font = `20px ${FONT}`;
    x.fillText("warpdrive", 22, 36);
    x.font = `600 15px ${BODY}`;
    x.textAlign = "right";
    const d = new Date();
    x.fillText(d.getHours() + ":" + String(d.getMinutes()).padStart(2, "0"), SW - 22, 34);
    x.textAlign = "left";
    // battery
    x.strokeStyle = "rgba(255,255,255,0.8)";
    x.lineWidth = 1.5;
    rr(x, SW - 92, 22, 22, 12, 3);
    x.stroke();
    x.fillStyle = "#b6ff4a";
    x.fillRect(SW - 89, 25, 14, 6);
  }

  function menuFrame() {
    backdrop();
    header();
    shown += (sel - shown) * 0.16;
    const n = games.length;
    // cards, nearest last so the selected one sits on top
    const order = games.map((_, i) => i).sort((a, b) => Math.abs(b - shown) - Math.abs(a - shown));
    for (const i of order) {
      const off = i - shown;
      const s = 1 - Math.min(0.45, Math.abs(off) * 0.28);
      const w = 132 * s,
        h = 184 * s;
      const cx = SW / 2 + off * 118;
      const cy = 168;
      x.globalAlpha = Math.max(0, 1 - Math.abs(off) * 0.35);
      if (i === sel) {
        x.shadowColor = tint;
        x.shadowBlur = 28;
      }
      x.save();
      rr(x, cx - w / 2, cy - h / 2, w, h, 10);
      x.clip();
      x.drawImage(covers[i], cx - w / 2, cy - h / 2, w, h);
      x.restore();
      x.shadowBlur = 0;
      if (i === sel) {
        x.strokeStyle = "#fff";
        x.lineWidth = 3;
        rr(x, cx - w / 2 - 4, cy - h / 2 - 4, w + 8, h + 8, 13);
        x.stroke();
      }
      x.globalAlpha = 1;
    }
    const g = games[sel];
    x.fillStyle = "#fff";
    x.textAlign = "center";
    x.font = `26px ${FONT}`;
    x.fillText(g.title, SW / 2, 302);
    x.font = `600 14px ${BODY}`;
    x.fillStyle = "rgba(230,220,255,0.75)";
    x.fillText(g.tags.join("  /  "), SW / 2, 326);
    x.textAlign = "left";
    // dots
    for (let i = 0; i < n; i++) {
      x.fillStyle = i === sel ? "#fff" : "rgba(255,255,255,0.3)";
      x.beginPath();
      x.arc(SW / 2 - (n - 1) * 7 + i * 14, 346, 3, 0, Math.PI * 2);
      x.fill();
    }
    if (idle > 3.2) {
      idle = 0;
      sel = (sel + 1) % n;
    }
  }

  function launchFrame() {
    menuFrame();
    const k = Math.min(1, t / 0.35);
    x.fillStyle = `rgba(255,255,255,${(1 - k) * 0.9})`;
    x.fillRect(0, 0, SW, SH);
    const g = games[sel];
    x.globalAlpha = k;
    const bg = x.createRadialGradient(SW / 2, SH / 2, 10, SW / 2, SH / 2, SW * 0.7);
    bg.addColorStop(0, `hsl(${g.hue} 80% 45%)`);
    bg.addColorStop(1, `hsl(${g.hue + 40} 70% 8%)`);
    x.fillStyle = bg;
    x.fillRect(0, 0, SW, SH);
    x.fillStyle = "#fff";
    x.textAlign = "center";
    x.font = `40px ${FONT}`;
    x.fillText(g.title, SW / 2, SH / 2);
    x.font = `600 17px ${BODY}`;
    x.fillText("In development. Coming to Warpdrive.", SW / 2, SH / 2 + 36);
    x.textAlign = "left";
    x.globalAlpha = 1;
    if (t > 2.4) go("menu");
  }

  return {
    canvas,
    step(dt) {
      t += dt;
      clock += dt;
      idle += dt;
      if (mode === "boot") bootFrame();
      else if (mode === "launch") launchFrame();
      else menuFrame();
      // faint scanlines and a vignette, for the CRT feel
      x.fillStyle = "rgba(0,0,0,0.12)";
      for (let y = 0; y < SH; y += 3) x.fillRect(0, y, SW, 1);
    },
    next(d) {
      if (mode === "boot") return go("menu");
      if (mode === "launch") go("menu");
      idle = -4;
      sel = (sel + d + games.length) % games.length;
    },
    launch() {
      if (mode === "boot") return go("menu");
      idle = -4;
      go(mode === "launch" ? "menu" : "launch");
    },
    back() {
      if (mode === "launch") go("menu");
    },
    boot() {
      go("boot");
    },
    setGlow(c) {
      tint = c;
    },
  };
}
