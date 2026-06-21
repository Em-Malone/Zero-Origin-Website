# Zero Origin — Website

Technical services for live entertainment. A small React + [Vite](https://vite.dev)
single-page site, deployed as a static build on [Vercel](https://vercel.com).

## Develop

```bash
npm install
npm run dev        # local dev server with hot reload
npm run build      # production build → dist/
npm run preview    # serve the production build locally
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel: **New Project → import the repo**. Vercel auto-detects Vite, so no
   configuration is needed (Build = `npm run build`, Output = `dist`).
3. Every push to the default branch triggers an automatic redeploy.

There is no database, server, or login — the whole site is static files plus
JSON content, so it's fast, free to host, and nothing can go down at runtime.

## Editing content

All editable content lives in [`content/`](content/) — see
[`content/README.md`](content/README.md) for the full guide. In short:

- **Projects** (and their carousel images) → `content/projects.json`, managed with
  `npm run project …` (see below). Images are committed to `public/img/<slug>/`.
- **Products** → `content/products.json`.

> Put `--` right after `project` / `product` so npm passes your flags through.

```bash
npm run project -- list                                  # list projects
npm run project -- add --title "…" --year 2025 …         # add
npm run project -- edit <slug> --title "…"               # edit
npm run project -- images <slug> ./photo.jpg …           # upload carousel images
npm run project -- remove <slug>                          # delete

npm run product -- list                                  # products work the same way
npm run product -- add --name "…" --href "#" --cta "…"   # add
npm run product -- image <slug> ./shot.png               # set the screenshot
npm run product -- remove <slug>                          # delete
```

After editing: `git commit` and `git push` — Vercel redeploys automatically.

## Project layout

```
index.html              Vite entry (loads src/main.jsx)
src/
  main.jsx              App shell + routing, mounts React
  Chrome.jsx           Nav, Footer, project modal + carousel
  HomePage.jsx         …one module per page
  ProjectsPage.jsx
  ProductsPage.jsx
  ContactPage.jsx
  ZOMark.jsx           Logo monogram
  MoodyPlaceholder.jsx Generated placeholder art (used when a project has no images)
  styles.css           All styles
content/                Editable JSON content (source of truth)
public/img/<slug>/      Committed carousel images
scripts/manage.mjs      The `npm run project` CLI
```
