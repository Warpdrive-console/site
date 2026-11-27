# Warpdrive site

React + Vite. Routes: `/`, `/gamers`, `/developers`, `/account`.

    npm install
    npm run dev       # http://localhost:5173
    npm run build     # outputs dist/

## Rotur sign-in

Sign-in works out of the box: the Account page opens rotur.dev/auth in a popup (or a
full redirect if the popup is blocked), Rotur hands back an account token, and the site
loads the profile with it. No app registration or client id needed.

## Console colors

`src/lib/theme.js` holds the six colorways. The chosen one retints the UI accent, the page background and the
3D model, is saved in localStorage from the Account page, and when nothing is saved the
site rolls a random one per visit.

## The hero model

`public/models/wd01.glb` (~4 MB) loads lazily; until it's ready (or if WebGL is missing)
the static render in `public/img/` shows instead. Drag rotates it; no zoom.

## Hosting

GitHub Pages: push this folder to a repo named `warpdrive-console.github.io` (or any repo
with a custom domain attached), then in the repo settings set Pages -> Source -> GitHub
Actions. The included workflow builds and deploys on every push to main. The build also
writes `dist/404.html`, which is how the `/gamers`-style routes survive a direct visit
on Pages.

Don't use a plain project repo without a custom domain: the site would live under
`/repo-name/` and every absolute path (routes, model, images) would break.

Netlify and Vercel also work as-is: `public/_redirects` and `vercel.json` cover their
route fallbacks.

## Layout

- `src/pages/` one file per route
- `src/components/` nav, footer, splits, profile card, Hero3D
- `src/lib/` rotur auth + theme
- `src/styles/` one stylesheet per concern
