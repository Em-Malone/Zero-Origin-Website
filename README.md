# Zero Origin — Website

Technical services for live entertainment. A small React + [Vite](https://vite.dev)
single-page site, deployed as a static build on [Vercel](https://vercel.com).

## Develop

```bash
npm install
npm run dev        # local dev server with hot reload
npm run build      # production build → dist/
npm run preview    # serve the production build locally

npm run lint       # ESLint
npm run format     # Prettier (rewrite files); format:check to verify only
npm test           # Vitest
```

Before pushing, run `npm run lint`, `npm run format:check`, and `npm test` — all
should pass.

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

### Ship a change in one command

Once you've made an edit, `npm run ship` does the whole release dance — runs the
CI checks locally, creates a branch, commits, pushes, opens a PR, waits for CI to
pass, squash-merges, deletes the branch, and drops you back on an up-to-date
`main`. Just give it a branch name:

```bash
npm run ship -- add-fta-project                          # commit msg = branch name
npm run ship -- fix-lol-slug "Fix LoL slug 2026 -> 2025"  # custom commit message
```

If the local checks fail, nothing is pushed. Run it from `main` with changes
staged or unstaged — it picks them all up. A merge to `main` triggers the Vercel
deploy, so treat `ship` as publishing.

To handle the commit/merge yourself instead: `git commit` and `git push` —
Vercel redeploys automatically.

## Contact form

The contact form ([`src/ContactPage.jsx`](src/ContactPage.jsx)) submits enquiries
via [Web3Forms](https://web3forms.com) — a hosted form-to-email service. There is
no backend: the form `POST`s straight to `api.web3forms.com`, which emails each
submission to the address registered with the account. A hidden honeypot field
(`botcheck`) filters out bots.

Configuration:

1. The form needs a Web3Forms **access key**, read from the `VITE_WEB3FORMS_KEY`
   environment variable (see [`.env.example`](.env.example)).
   - **Local:** copy `.env.example` to `.env.local` and paste the key.
   - **Vercel:** add `VITE_WEB3FORMS_KEY` under **Project → Settings →
     Environment Variables**, then redeploy (it's a build-time variable).
2. The key is **public by design** — it only routes mail to the verified address,
   so it's safe in the client bundle. The env var just keeps it out of source and
   makes rotation easy. The mailbox/recipient is configured in the Web3Forms
   dashboard, not in this repo.

To change where enquiries are delivered, update the recipient in the Web3Forms
dashboard — no code change needed.

## External services

Everything this site depends on that lives **outside this repo**:

| Service                              | Used for                          | Where it's configured                                        |
| ------------------------------------ | --------------------------------- | ------------------------------------------------------------ |
| [Vercel](https://vercel.com)         | Hosting / builds / deploys        | Vercel project settings (incl. `VITE_WEB3FORMS_KEY` env var) |
| [Web3Forms](https://web3forms.com)   | Contact-form delivery             | Web3Forms dashboard (recipient); key in env (see above)      |
| [123-reg](https://www.123-reg.co.uk) | Registrar for `zero-origin.co.uk` | 123-reg control panel — see below                            |
| GitHub                               | Source + CI (`prettier --check`)  | `.github/workflows/`; `main` is branch-protected             |

**DNS.** The domain is registered at 123-reg, but its DNS is served by GoDaddy's
nameservers (`ns67` / `ns68.domaincontrol.com`). You still edit the records
through the **123-reg** control panel — it writes to that zone — so 123-reg is the
panel to use despite the GoDaddy nameservers. Records that point the site at Vercel:

- `A` on `@` → Vercel (use the IP shown in Vercel → Settings → Domains)
- `CNAME` on `www` → Vercel (use the target shown there)

`www.zero-origin.co.uk` is the canonical (primary) domain; the bare
`zero-origin.co.uk` 308-redirects to it. Vercel issues and renews the HTTPS
certificate automatically once these records resolve.

> Note: the same zone also holds the `MX` records for Google Workspace email
> (`mail@zero-origin.co.uk`). Those are **unrelated to this site or the contact
> form** — don't change them when updating the site's DNS.

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
scripts/
  manage.mjs           The `npm run project` / `product` CLI
  ship.mjs             `npm run ship` — branch, check, PR, merge in one go
  util.mjs             Pure CLI helpers (unit-tested)
  util.test.mjs        Vitest tests for the helpers
eslint.config.js        ESLint flat config
.prettierrc.json        Prettier config
vitest.config.js        Vitest config
```
