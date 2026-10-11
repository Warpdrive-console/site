import { applyMode, isPerfMode } from "./display-mode.js";
import { isMobile } from "./visual-effects.js";
import { observeAll } from "./scroll-effects.js";

const ambMap = {
  home: "ambHome",
  technical: "ambTechnical",
  developmental: "ambDevelopmental",
  account: "ambHome",
};
export function goPage(name) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".nav-link")
    .forEach((l) => l.classList.remove("active"));
  const pg = document.getElementById("page-" + name);
  if (pg) pg.classList.add("active");
  document
    .querySelectorAll('.nav-link[data-page="' + name + '"]')
    .forEach((l) => l.classList.add("active"));
  Object.values(ambMap).forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("visible");
  });
  const ambId = ambMap[name];
  if (ambId && !isMobile())
    setTimeout(() => {
      const el = document.getElementById(ambId);
      if (el) el.classList.add("visible");
    }, 100);
  window.scrollTo({ top: 0, behavior: "smooth" });
  setTimeout(observeAll, 80);
  closeMobileMenu();
  if (name === "account") applyMode(isPerfMode() ? "perf" : "gorgeous");
}
document
  .querySelectorAll(".nav-link[data-page]")
  .forEach((b) => b.addEventListener("click", () => goPage(b.dataset.page)));
setTimeout(() => {
  if (!isMobile()) {
    const el = document.getElementById("ambHome");
    if (el) el.classList.add("visible");
  }
}, 200);

const hamburger = document.getElementById("hamburger"),
  mobileMenu = document.getElementById("mobileMenu");
let menuOpen = false;
function openMobileMenu() {
  menuOpen = true;
  hamburger.classList.add("open");
  mobileMenu.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeMobileMenu() {
  menuOpen = false;
  hamburger.classList.remove("open");
  mobileMenu.classList.remove("open");
  document.body.style.overflow = "";
}
hamburger.addEventListener("click", () =>
  menuOpen ? closeMobileMenu() : openMobileMenu(),
);

window.goPage = goPage;
