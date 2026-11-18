# site

The Warpdrive website: the marketing site for the console, plus a dashboard for
owners at `#/dashboard`. Built with Preact and Vite, with Rotur
([rotur-sdk](https://www.npmjs.com/package/rotur-sdk)) for accounts.

```sh
npm install
npm run dev     # local dev server
npm run build   # production build in dist/
```

Sign in uses Rotur's popup flow by default. To use a registered Rotur app
instead, set `VITE_ROTUR_APP` to its app id at build time.

The hero handheld is a three.js model built in code (`src/lib/handheld3d.js`),
loaded lazily, with a flat fallback when WebGL isn't available.
