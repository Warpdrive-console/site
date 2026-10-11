import { isMobile } from "./visual-effects.js";

const pL1 = document.getElementById("pL1");
const pL2 = document.getElementById("pL2");

let scrollY_cached = 0;
let rafPending = false;

function applyParallax() {
  pL1.style.transform = "translate3d(0," + scrollY_cached * -0.03 + "px,0)";
  pL2.style.transform = "translate3d(0," + scrollY_cached * -0.06 + "px,0)";
  rafPending = false;
}

if (!isMobile()) {
  window.addEventListener(
    "scroll",
    () => {
      scrollY_cached = window.scrollY;
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(applyParallax);
      }
    },
    { passive: true },
  );
}

const obs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        obs.unobserve(e.target);
      }
    });
  },
  { threshold: 0.06 },
);

export function observeAll() {
  document
    .querySelectorAll(".reveal:not(.visible)")
    .forEach((el) => obs.observe(el));
}

observeAll();

const statObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll(".stat-val").forEach((sv) => {
        const m = sv.textContent.trim().match(/^([^\d]*)(\d+)(.*)$/);
        if (!m) return;

        const pre = m[1];
        const end = parseInt(m[2]);
        const suf = m[3];

        let cur = 0;
        const step = Math.max(1, Math.floor(end / 40));
        const iv = setInterval(() => {
          cur = Math.min(cur + step, end);
          sv.textContent = pre + cur + suf;
          if (cur >= end) clearInterval(iv);
        }, 28);
      });
      statObs.unobserve(e.target);
    });
  },
  { threshold: 0.2 },
);

document.querySelectorAll(".hero-stats").forEach((el) => statObs.observe(el));
