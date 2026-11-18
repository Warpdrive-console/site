import { signal } from "@preact/signals";

/** Pages, keyed by the slug that appears in the URL hash. */
export const PAGES = {
  "": { id: "home", label: "Home" },
  hardware: { id: "technical", label: "Hardware" },
  developers: { id: "developmental", label: "Developers" },
  dashboard: { id: "account", label: "Dashboard" },
  account: { id: "account", label: "Dashboard" }, // old links
};

const slugFor = (id) => Object.keys(PAGES).find((k) => PAGES[k].id === id) ?? "";

function parse() {
  // "#/hardware/specs" → page "hardware", section "specs"
  const [slug = "", section = ""] = location.hash.replace(/^#\/?/, "").split("/");
  return PAGES[slug] ? { page: PAGES[slug].id, section } : { page: "home", section: "" };
}

export const route = signal(parse());

window.addEventListener("hashchange", () => {
  const next = parse();
  const samePage = next.page === route.value.page;
  route.value = next;
  if (next.section) {
    // Let the page render before scrolling to the section.
    requestAnimationFrame(() =>
      document.getElementById(next.section)?.scrollIntoView({ behavior: "smooth" }),
    );
  } else if (!samePage) {
    window.scrollTo({ top: 0, behavior: "instant" });
  }
});

/** Build an href for a page id (and optional section id). */
export const href = (id, section) => "#/" + slugFor(id) + (section ? "/" + section : "");

/** Navigate in code. */
export const go = (id, section) => {
  location.hash = href(id, section);
};
