import { isPerfMode } from "./display-mode.js";

export const isMobile = () => window.innerWidth < 768;
const isLowEnd = () => {
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
    return true;
  if (navigator.deviceMemory && navigator.deviceMemory <= 4) return true;
  const c = document.createElement("canvas");
  const gl2 = c.getContext("webgl2");
  const gl = gl2 || c.getContext("webgl");
  if (gl) {
    let r = "";
    if (gl2) r = gl2.getParameter(gl2.RENDERER) || "";
    else {
      const dbg = gl.getExtension("WEBGL_debug_renderer_info");
      if (dbg) r = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || "";
    }
    if (/swiftshader|llvmpipe|mesa/i.test(r)) return true;
  }
  return false;
};
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
export const lowEnd = isLowEnd();
if (lowEnd) document.documentElement.classList.add("low-end");

let tabVisible = true;
document.addEventListener("visibilitychange", () => {
  tabVisible = !document.hidden;
});

const sf = document.getElementById("starfield");
const ctx = sf.getContext("2d", { alpha: true });
let W,
  H,
  stars = [],
  particles = [],
  shootingStars = [],
  mobile = false,
  dpr = 1;
const starSf = document.createElement("canvas");
const starCtx = starSf.getContext("2d", { alpha: true });
let starF = 0;
let _lastW = 0;

const SIN_N = 4096,
  SIN_K = SIN_N / (Math.PI * 2);
const SIN_TABLE = new Float32Array(SIN_N);
for (let i = 0; i < SIN_N; i++) SIN_TABLE[i] = Math.sin(i / SIN_K);

function resize() {
  const newW = window.innerWidth,
    newH = window.innerHeight;
  const widthChanged = newW !== _lastW;
  _lastW = newW;
  dpr = lowEnd ? 1 : Math.min(window.devicePixelRatio || 1, 2);
  W = newW;
  H = newH;
  sf.width = W * dpr;
  sf.height = H * dpr;
  sf.style.width = W + "px";
  sf.style.height = H + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  starSf.width = W * dpr;
  starSf.height = H * dpr;
  starCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  starF = 0;
  mobile = isMobile();
  if (widthChanged || !stars.length) {
    makeStars();
    makeParticles();
  }
}

function makeStars() {
  const n = lowEnd
    ? Math.min(60, Math.floor((W * H) / 14000))
    : mobile
      ? Math.min(120, Math.floor((W * H) / 8000))
      : Math.min(350, Math.floor((W * H) / 4800));
  stars = Array.from({ length: n }, () => {
    const fg = Math.random() < 0.14;
    const spd = Math.random() * 0.0003 + 0.00006;
    const t = Math.random() < 0.6 ? 0 : Math.random() < 0.5 ? 1 : 2;
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: fg
        ? Math.pow(Math.random(), 1.1) * 2.6 + 0.9
        : Math.pow(Math.random(), 2.4) * 1 + 0.08,
      baseA: fg ? Math.random() * 0.4 + 0.28 : Math.random() * 0.18 + 0.02,
      phi: (Math.random() * SIN_N) | 0,
      dphi: Math.max(1, (spd * 40 * SIN_K) | 0),
      sphi: (Math.random() * SIN_N) | 0,
      dsphi: Math.max(1, (spd * 12 * SIN_K) | 0),
      solidFill: t === 1 ? "#a0d2ff" : t === 2 ? "#fff5d2" : "#d2d7e6",
    };
  });
}

function drawPoly(c, x, y, r, a, sides, step) {
  const b = (((a * SIN_K) | 0) + 3072) & (SIN_N - 1);
  c.beginPath();
  for (let i = 0; i < sides; i++) {
    const si = (b + i * step) & (SIN_N - 1);
    if (i)
      c.lineTo(
        x + r * SIN_TABLE[(si + 1024) & (SIN_N - 1)],
        y + r * SIN_TABLE[si],
      );
    else
      c.moveTo(
        x + r * SIN_TABLE[(si + 1024) & (SIN_N - 1)],
        y + r * SIN_TABLE[si],
      );
  }
  c.closePath();
}

const COLORS = [
  "191,47,255",
  "0,229,255",
  "255,34,163",
  "107,31,160",
  "255,90,175",
];
const SOLID = {
  "191,47,255": "#bf2fff",
  "0,229,255": "#00e5ff",
  "255,34,163": "#ff22a3",
  "107,31,160": "#6b1fa0",
  "255,90,175": "#ff5aaf",
};
const SS_SOLID = {
  "255,255,255": "#ffffff",
  "200,220,255": "#c8dcff",
  "191,130,255": "#bf82ff",
  "100,230,255": "#64e6ff",
  "255,200,230": "#ffc8e6",
};
const SHAPES = [
  "pentagon",
  "hexagon",
  "triangle",
  "cube",
  "diamond",
  "square",
  "ps3",
  "cyber",
];

function makeParticles() {
  particles = Array.from({ length: lowEnd ? 0 : mobile ? 16 : 33 }, () =>
    spawnParticle(SHAPES),
  );
}

function spawnParticle(pool) {
  const x = Math.random() * W,
    y = Math.random() * H;
  const type = pool[Math.floor(Math.random() * pool.length)];
  const cr = COLORS[Math.floor(Math.random() * COLORS.length)];
  const depth = Math.random() < 0.3 ? 0 : Math.random() < 0.6 ? 1 : 2;
  const sz = [0.4, 0.85, 1.45][depth];
  const spd = [0.4, 1, 1.6][depth];
  const alp =
    depth === 0
      ? Math.random() * 0.08 + 0.04
      : depth === 1
        ? Math.random() * 0.16 + 0.18
        : Math.random() * 0.18 + 0.38;
  const lw = [0.5, 1, 1.8][depth];
  const base = {
    type,
    x,
    y,
    cr,
    depth,
    vx: (Math.random() - 0.5) * 0.18 * spd,
    vy: (Math.random() - 0.5) * 0.18 * spd,
    va:
      (Math.random() < 0.5 ? 1 : -1) *
      (Math.random() * 0.006 + 0.001) *
      (depth === 0 ? 0.4 : 1),
    angle: Math.random() * Math.PI * 2,
    alpha: alp,
    lw,
    stroke: "rgba(" + cr + "," + alp.toFixed(3) + ")",
    solidFill: SOLID[cr],
  };
  if (type === "ps3") {
    const h = Math.random() < 0.5 ? 285 : 195;
    return Object.assign({}, base, {
      r: (Math.random() * 2.8 + 0.6) * sz,
      solidFill: h === 285 ? "#d282ed" : "#82d2ed",
      trail: new Float32Array(14),
      tw: 0,
      tc: 0,
    });
  }
  if (type === "cyber")
    return Object.assign({}, base, {
      r: (Math.random() * 2.5 + 0.7) * sz,
      phi: (Math.random() * SIN_N) | 0,
      dphi: Math.max(1, ((Math.random() * 0.018 + 0.006) * SIN_K) | 0),
      vx: 0,
      vy: 0,
    });
  if (type === "cube")
    return Object.assign({}, base, {
      size: (Math.random() * 11 + 6) * sz,
      va: (Math.random() < 0.5 ? 1 : -1) * 0.001,
      s2: "rgba(" + cr + "," + (alp * 0.6).toFixed(3) + ")",
      s3: "rgba(" + cr + "," + (alp * 0.8).toFixed(3) + ")",
    });
  if (type === "pentagon" || type === "hexagon" || type === "triangle")
    return Object.assign({}, base, {
      r: (Math.random() * 10 + 5) * sz,
      strokeInner: "rgba(" + cr + "," + (alp * 0.3).toFixed(3) + ")",
    });
  return Object.assign({}, base, {
    size: (Math.random() * 10 + 4) * sz,
    strokeInner: "rgba(" + cr + "," + (alp * 0.35).toFixed(3) + ")",
  });
}

function wrap(p, pad = 40) {
  if (p.x < -pad) p.x = W + pad;
  if (p.x > W + pad) p.x = -pad;
  if (p.y < -pad) p.y = H + pad;
  if (p.y > H + pad) p.y = -pad;
}

resize();
let _rt;
window.addEventListener("resize", () => {
  clearTimeout(_rt);
  _rt = setTimeout(resize, 150);
});

let lastFrame = 0;

function draw(now) {
  requestAnimationFrame(draw);
  if (!tabVisible || isPerfMode()) return;
  if (lowEnd && now - lastFrame < 50) return;
  if (mobile && now - lastFrame < 16) return;
  const dt = Math.min(3, lastFrame ? (now - lastFrame) / 16.67 : 1);
  lastFrame = now;

  if (prefersReducedMotion) {
    ctx.clearRect(0, 0, W, H);
    for (const s of stars) {
      ctx.globalAlpha = s.baseA;
      ctx.fillStyle = s.solidFill;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, 6.283);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    return;
  }

  ctx.globalAlpha = 1;
  ctx.clearRect(0, 0, W, H);

  if (starF === 0) {
    starCtx.globalAlpha = 1;
    starCtx.clearRect(0, 0, W, H);
    for (const s of stars) {
      s.phi = (s.phi + s.dphi * 3) & (SIN_N - 1);
      s.sphi = (s.sphi + s.dsphi * 3) & (SIN_N - 1);
      const tw = lowEnd ? 0.6 : SIN_TABLE[s.phi] * 0.22 + 0.6;
      const sparkle = !lowEnd && SIN_TABLE[s.sphi] > 0.97;
      const a = s.baseA * tw * (sparkle ? 1.8 : 1);
      const r = s.r * (sparkle ? 1.7 : 1);
      starCtx.globalAlpha = a;
      starCtx.fillStyle = s.solidFill;
      starCtx.beginPath();
      starCtx.arc(s.x, s.y, r, 0, 6.283);
      starCtx.fill();
      if (sparkle && s.r > 0.55) {
        starCtx.globalAlpha = a * 0.45;
        starCtx.strokeStyle = "#c8e1ff";
        starCtx.lineWidth = 0.5;
        const l = r * 4;
        starCtx.beginPath();
        starCtx.moveTo(s.x - l, s.y);
        starCtx.lineTo(s.x + l, s.y);
        starCtx.moveTo(s.x, s.y - l);
        starCtx.lineTo(s.x, s.y + l);
        starCtx.stroke();
      }
    }
    starCtx.globalAlpha = 1;
  }
  starF = (starF + 1) % 3;
  ctx.drawImage(starSf, 0, 0, starSf.width, starSf.height, 0, 0, W, H);
  ctx.globalAlpha = 1;

  const maxSS = lowEnd ? 2 : mobile ? 5 : 12;
  if (shootingStars.length < maxSS) {
    if (Math.random() < 0.0014) {
      const fl = Math.random() < 0.5;
      const col = Math.random() < 0.7 ? "255,255,255" : "200,220,255";
      shootingStars.push({
        tl: 26,
        x: fl ? -20 : W + 20,
        y: Math.random() * H * 0.65,
        vx: (fl ? 1 : -1) * (Math.random() * 6 + 4),
        vy: Math.random() * 2.2 + 0.6,
        life: 1,
        decay: Math.random() * 0.011 + 0.007,
        solidColor: SS_SOLID[col],
        lwk: 1.8,
        hs: true,
      });
    }
    if (Math.random() < 0.0009) {
      const col = Math.random() < 0.5 ? "191,130,255" : "100,230,255";
      shootingStars.push({
        tl: 20,
        x: Math.random() * W * 0.6,
        y: -10,
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 9 + 5,
        life: 1,
        decay: Math.random() * 0.018 + 0.013,
        solidColor: SS_SOLID[col],
        lwk: 1.8,
        hs: true,
      });
    }
    if (Math.random() < 0.0006) {
      const fl = Math.random() < 0.5;
      shootingStars.push({
        tl: 38,
        x: fl ? -20 : W + 20,
        y: Math.random() * H * 0.5 + H * 0.1,
        vx: (fl ? 1 : -1) * (Math.random() * 3 + 2),
        vy: Math.random() * 1.2 + 0.2,
        life: 1,
        decay: Math.random() * 0.006 + 0.004,
        solidColor: "#ffc8e6",
        lwk: 1.4,
        hs: false,
      });
    }
  }
  for (let i = shootingStars.length - 1; i >= 0; i--) {
    const ss = shootingStars[i];
    ss.x += ss.vx * dt;
    ss.y += ss.vy * dt;
    ss.life -= ss.decay * dt;
    if (
      ss.life <= 0 ||
      ss.x < -300 ||
      ss.x > W + 300 ||
      ss.y > H + 200 ||
      ss.y < -200
    ) {
      shootingStars.splice(i, 1);
      continue;
    }
    ctx.strokeStyle = ss.solidColor;
    ctx.globalAlpha = ss.life * 0.9;
    ctx.lineWidth = ss.life * ss.lwk;
    ctx.beginPath();
    ctx.moveTo(ss.x, ss.y);
    ctx.lineTo(ss.x - ss.vx * ss.tl, ss.y - ss.vy * ss.tl);
    ctx.stroke();
    if (!lowEnd && ss.hs && ss.life > 0.25) {
      const hr = 2.2 * ss.life;
      ctx.fillStyle = ss.solidColor;
      ctx.globalAlpha = ss.life * 0.75;
      ctx.beginPath();
      ctx.arc(ss.x, ss.y, hr, 0, 6.283);
      ctx.fill();
      ctx.globalAlpha = ss.life * 0.08;
      ctx.beginPath();
      ctx.arc(ss.x, ss.y, hr * 3.5, 0, 6.283);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  for (const p of particles) {
    const { type, x, y } = p;
    if (type === "pentagon") {
      p.angle += p.va;
      drawPoly(ctx, x, y, p.r, p.angle, 5, 819);
      ctx.strokeStyle = p.stroke;
      ctx.lineWidth = 0.9 * p.lw;
      ctx.stroke();
      drawPoly(ctx, x, y, p.r * 0.5, p.angle + 0.3, 5, 819);
      ctx.strokeStyle = p.strokeInner;
      ctx.lineWidth = 0.4 * p.lw;
      ctx.stroke();
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      wrap(p);
    } else if (type === "hexagon") {
      p.angle += p.va;
      drawPoly(ctx, x, y, p.r, p.angle, 6, 682);
      ctx.strokeStyle = p.stroke;
      ctx.lineWidth = 0.8 * p.lw;
      ctx.stroke();
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      wrap(p);
    } else if (type === "triangle") {
      p.angle += p.va;
      drawPoly(ctx, x, y, p.r, p.angle, 3, 1365);
      ctx.strokeStyle = p.stroke;
      ctx.lineWidth = 0.8 * p.lw;
      ctx.stroke();
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      wrap(p);
    } else if (type === "cube") {
      p.angle += p.va;
      const h = p.size * 0.58,
        w = p.size;
      ctx.lineWidth = 0.8 * p.lw;
      ctx.beginPath();
      ctx.moveTo(x, y - h);
      ctx.lineTo(x + w / 2, y - h / 2);
      ctx.lineTo(x, y);
      ctx.lineTo(x - w / 2, y - h / 2);
      ctx.closePath();
      ctx.strokeStyle = p.stroke;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - w / 2, y - h / 2);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x - w / 2, y + h / 2);
      ctx.closePath();
      ctx.strokeStyle = p.s2;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w / 2, y - h / 2);
      ctx.lineTo(x + w / 2, y + h / 2);
      ctx.lineTo(x, y + h);
      ctx.closePath();
      ctx.strokeStyle = p.s3;
      ctx.stroke();
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      wrap(p);
    } else if (type === "diamond" || type === "square") {
      p.angle += p.va;
      const off = type === "diamond" ? 512 : 0;
      const si = (((p.angle * SIN_K) | 0) + off) & (SIN_N - 1);
      const cs = SIN_TABLE[(si + 1024) & (SIN_N - 1)],
        sn = SIN_TABLE[si],
        hh = p.size / 2;
      const A = hh * cs,
        B = hh * sn;
      ctx.beginPath();
      ctx.moveTo(x + A - B, y + A + B);
      ctx.lineTo(x - A - B, y + A - B);
      ctx.lineTo(x - A + B, y - A - B);
      ctx.lineTo(x + A + B, y - A + B);
      ctx.closePath();
      ctx.strokeStyle = p.stroke;
      ctx.lineWidth = 0.8 * p.lw;
      ctx.stroke();
      const h2 = hh / 2,
        A2 = h2 * cs,
        B2 = h2 * sn;
      ctx.beginPath();
      ctx.moveTo(x + A2 - B2, y + A2 + B2);
      ctx.lineTo(x - A2 - B2, y + A2 - B2);
      ctx.lineTo(x - A2 + B2, y - A2 - B2);
      ctx.lineTo(x + A2 + B2, y - A2 + B2);
      ctx.closePath();
      ctx.strokeStyle = p.strokeInner;
      ctx.lineWidth = 0.4 * p.lw;
      ctx.stroke();
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      wrap(p);
    } else if (type === "ps3") {
      p.trail[p.tw] = p.x;
      p.trail[p.tw + 1] = p.y;
      p.tw = (p.tw + 2) % 14;
      if (p.tc < 7) p.tc++;
      const inv = 1 / p.tc;
      ctx.fillStyle = p.solidFill;
      for (let i = 0; i < p.tc; i++) {
        const ti = (p.tw + 14 - 2 * (p.tc - i)) % 14;
        ctx.globalAlpha = i * inv * p.alpha * 0.5;
        ctx.beginPath();
        ctx.arc(p.trail[ti], p.trail[ti + 1], p.r * (i * inv) * 0.7, 0, 6.283);
        ctx.fill();
      }
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 6.283);
      ctx.fill();
      ctx.globalAlpha = 1;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      wrap(p);
    } else if (type === "cyber") {
      p.phi = (p.phi + p.dphi) & (SIN_N - 1);
      const pa = (SIN_TABLE[p.phi] * 0.5 + 0.5) * p.alpha;
      ctx.fillStyle = p.solidFill;
      ctx.strokeStyle = p.solidFill;
      ctx.globalAlpha = pa;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 6.283);
      ctx.fill();
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = pa * 0.12;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 3.1, 0, 6.283);
      ctx.stroke();
      ctx.globalAlpha = pa * 0.06;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 4.4, 0, 6.283);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
  ctx.globalAlpha = 1;
}
requestAnimationFrame(draw);
