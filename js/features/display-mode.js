const MODE_KEY = "wd_display_mode";
const MODE_DAYS = 365;
let _perfMode = false;

function _setCookie(name, val, days) {
  const d = new Date();
  d.setTime(d.getTime() + days * 86400000);
  document.cookie =
    name + "=" + val + ";expires=" + d.toUTCString() + ";path=/;SameSite=Lax";
}
function _getCookie(name) {
  const m = document.cookie.match("(?:^|; )" + name + "=([^;]*)");
  return m ? decodeURIComponent(m[1]) : null;
}
export function applyMode(mode) {
  _perfMode = mode === "perf";
  document.body.classList.toggle("perf-mode", _perfMode);
  const sf = document.getElementById("starfield");
  if (sf) sf.classList.toggle("perf-hidden", _perfMode);
  const bg = document.getElementById("modeToggleGorgeous");
  const bp = document.getElementById("modeTogglePerf");
  if (bg && bp) {
    bg.classList.toggle("active", !_perfMode);
    bp.classList.toggle("active", _perfMode);
  }
}
function pickMode(mode) {
  _setCookie(MODE_KEY, mode, MODE_DAYS);
  applyMode(mode);
  const mp = document.getElementById("modePicker");
  if (mp) {
    mp.classList.remove("visible");
    setTimeout(() => {
      mp.style.display = "none";
    }, 400);
  }
}
(function () {
  const saved = _getCookie(MODE_KEY);
  const show = () => {
    const mp = document.getElementById("modePicker");
    if (mp) mp.classList.add("visible");
  };
  if (saved) {
    applyMode(saved);
    return;
  }
  if (document.readyState !== "loading") setTimeout(show, 600);
  else window.addEventListener("DOMContentLoaded", () => setTimeout(show, 600));
})();

export const isPerfMode = () => _perfMode;
window.pickMode = pickMode;
