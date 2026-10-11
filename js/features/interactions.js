const msgs = [
  "\u{1F49C} banks says hi",
  "\u{1F99D} he ate another dorito",
  "you found the secret. congratulations on nothing.",
  "disc drive goes brrr",
  "indie forever. no notes.",
];

function showBanks() {
  const div = document.createElement("div");
  div.style.cssText =
    "position:fixed;inset:0;z-index:9990;display:flex;align-items:center;justify-content:center;background:rgba(4,4,7,0.92);cursor:pointer;animation:fu 0.4s ease forwards";
  div.innerHTML =
    "<div style=\"text-align:center;font-family:'Space Mono',monospace\">" +
    '<div style="font-size:clamp(48px,10vw,96px);margin-bottom:24px">\u{1F99D}</div>' +
    '<div style="font-size:12px;letter-spacing:0.2em;color:var(--neon-pink);text-transform:uppercase;margin-bottom:8px">banks approved</div>' +
    '<div style="font-size:10px;color:var(--silver-dim);letter-spacing:0.12em">click anywhere to close</div></div>';
  div.addEventListener("click", () => div.remove());
  document.body.appendChild(div);
}

(function () {
  const egg = document.getElementById("footerEgg");
  const toast = document.getElementById("egg-toast");
  if (!egg || !toast) return;

  let i = 0;
  let timer;

  egg.addEventListener("click", () => {
    toast.textContent = msgs[i % msgs.length];
    i++;
    toast.classList.add("show");
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove("show"), 2800);
  });
})();

(function () {
  const seq = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
  let idx = 0;
  document.addEventListener("keydown", (e) => {
    idx = e.keyCode === seq[idx] ? idx + 1 : 0;
    if (idx === seq.length) {
      idx = 0;
      showBanks();
    }
  });
})();

(function () {
  const items = document.querySelectorAll(".spec-item");
  items.forEach((item) => {
    const header = item.querySelector(".spec-header");
    if (!header) return;
    header.addEventListener("click", () => {
      const wasOpen = item.classList.contains("active");
      items.forEach((i) => i.classList.remove("active"));
      if (!wasOpen) item.classList.add("active");
    });
  });
})();
