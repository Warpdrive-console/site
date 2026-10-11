import { isPerfMode } from "./display-mode.js";
import { isMobile, lowEnd } from "./visual-effects.js";

const colors = ["191,47,255", "255,34,163", "0,229,255"];
let last = 0;

function onMouseMove(e) {
  if (isPerfMode()) return;
  const now = Date.now();
  if (now - last < 80 || Math.random() > 0.45) return;
  last = now;

  const sparkEl = document.createElement("div");
  const sparkZ = Math.random() * 4 + 2;
  const color = colors[Math.floor(Math.random() * colors.length)];
  sparkEl.className = "spark";

  const x = e.clientX - sparkZ / 2;
  const y = e.clientY - sparkZ / 2;
  const alpha = Math.random() * 0.6 + 0.3;
  const blur = sparkZ * 2;

  sparkEl.style.cssText = `
      width: ${sparkZ}px;
      height: ${sparkZ}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(${color}, ${alpha});
      box-shadow: 0 0 ${blur}px rgba(${color}, 0.5);
    `;

  document.body.appendChild(sparkEl);
  const animation = sparkEl.animate(
    [
      { opacity: 1, transform: "scale(1) translate(0,0)" },
      {
        opacity: 0,
        transform: `
        scale(0)
        translate(
          ${(Math.random() - 0.5) * 20}px,
          ${-Math.random() * 14 - 4}px
        )`,
      },
    ],
    { duration: 500 + Math.random() * 300, easing: "ease-out" },
  );
  animation.onfinish = () => sparkEl.remove();
}

(function () {
  if (isMobile() || lowEnd) return;
  document.addEventListener("mousemove", onMouseMove, { passive: true });
})();
