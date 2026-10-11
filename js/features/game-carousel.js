import { GAMES } from "../data/games.js";

(function () {
  const track = document.getElementById("carouselTrack");
  const dotsEl = document.getElementById("carouselDots");
  const counterEl = document.getElementById("carouselCounter");
  const prevBtn = document.getElementById("carouselPrev");
  const nextBtn = document.getElementById("carouselNext");
  const MAX_DOTS = 7;
  let current = 0,
    dotBtns = [],
    lastPositionCount = -1;

  const visCount = () =>
    window.innerWidth >= 1100 ? 3 : window.innerWidth >= 640 ? 2 : 1;
  const posCount = () => Math.max(1, GAMES.length - visCount() + 1);

  GAMES.forEach((g) => {
    const card = document.createElement("div");
    card.className = "showcase-entry slab hov";
    const media = g.img
      ? '<img src="' + g.img + '" alt="' + g.title + '" loading="lazy">'
      : '<div class="showcase-ph"><span>' +
        (g.tag || "Coming soon") +
        "</span></div>";
    card.innerHTML =
      '<div class="showcase-img">' +
      media +
      "</div>" +
      '<div class="showcase-info">' +
      (g.tag ? '<span class="showcase-tag">' + g.tag + "</span>" : "") +
      '<h3 class="showcase-title">' +
      g.title +
      "</h3>" +
      '<p class="showcase-desc">' +
      g.desc +
      "</p></div>";
    track.appendChild(card);
  });

  function rebuildDots() {
    const pc = posCount();
    if (pc === lastPositionCount) return;
    lastPositionCount = pc;
    dotsEl.innerHTML = "";
    dotBtns = [];
    const count = Math.min(pc, MAX_DOTS);
    for (let i = 0; i < count; i++) {
      const dot = document.createElement("button");
      dot.className = "showcase-dot";
      dot.setAttribute("aria-label", "Go to position " + (i + 1));
      dot.addEventListener("click", () => goTo(dotIndexToPos(i)));
      dotsEl.appendChild(dot);
      dotBtns.push(dot);
    }
  }
  function dotIndexToPos(dotIdx) {
    const pc = posCount();
    if (pc <= MAX_DOTS) return dotIdx;
    const half = Math.floor(MAX_DOTS / 2);
    const winStart = Math.max(0, Math.min(current - half, pc - MAX_DOTS));
    return winStart + dotIdx;
  }
  function updateDots() {
    const pc = posCount();
    if (pc > MAX_DOTS) {
      const half = Math.floor(MAX_DOTS / 2);
      const winStart = Math.max(0, Math.min(current - half, pc - MAX_DOTS));
      dotBtns.forEach((d, j) =>
        d.classList.toggle("active", winStart + j === current),
      );
      counterEl.innerHTML =
        '<span class="sc-n">' + (current + 1) + "</span> / " + pc;
      counterEl.classList.add("visible");
    } else {
      dotBtns.forEach((d, i) => d.classList.toggle("active", i === current));
      counterEl.classList.remove("visible");
    }
  }
  function setCardWidths() {
    const vc = visCount();
    const gap = vc > 1 ? (window.innerWidth >= 1100 ? 22 : 14) : 0;
    const cardW = (track.parentElement.offsetWidth - gap * (vc - 1)) / vc;
    track.querySelectorAll(".showcase-entry").forEach((c) => {
      c.style.width = cardW + "px";
      c.style.minWidth = cardW + "px";
    });
    track.style.gap = gap + "px";
    return { cardW, gap };
  }
  function goTo(idx) {
    current = Math.max(
      0,
      Math.min(idx, Math.max(0, GAMES.length - visCount())),
    );
    rebuildDots();
    const { cardW, gap } = setCardWidths();
    track.style.transform = "translateX(-" + current * (cardW + gap) + "px)";
    updateDots();
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current >= GAMES.length - visCount();
  }
  prevBtn.addEventListener("click", () => goTo(current - 1));
  nextBtn.addEventListener("click", () => goTo(current + 1));
  window.addEventListener("resize", () => goTo(current));
  goTo(0);
})();
