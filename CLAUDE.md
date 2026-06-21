# CLAUDE.md

Guidance for working in this repository. Read this before making changes.

## What this is

Zero Origin's marketing website: a small **React 18 + Vite** single-page app,
built to static files and hosted on **Vercel**. There is no server, database, or
auth — the runtime is just static HTML/CSS/JS plus JSON content. Keep it that way.

- `index.html` → loads `src/main.jsx` (Vite entry).
- `src/` → one component module per page, plus shared chrome. All CSS lives in
  `src/styles.css`.
- `content/*.json` → the **source of truth** for projects and products.
- `public/img/<slug>/` → committed images, referenced by the JSON.
- `scripts/manage.mjs` → Node CLI (`npm run project` / `npm run product`) that
  edits the JSON and processes images.

## Commands

```bash
npm install
npm run dev          # dev server with hot reload
npm run build        # production build → dist/
npm run preview      # serve the production build locally

npm run lint         # ESLint (flat config, React + hooks rules)
npm run lint:fix     # ESLint with autofix
npm run format       # Prettier — rewrite files in place
npm run format:check # Prettier — verify without writing
npm test             # Vitest, single run
npm run test:watch   # Vitest, watch mode
```

## CI — what must pass

`main` is protected: CI (`.github/workflows/ci.yml`) runs on every push/PR and
all four steps must pass to merge, so run them before you finish:

- `npm run lint` — no ESLint errors.
- `npm run format:check` — Prettier-clean. Rules (`.prettierrc.json`): single
  quotes, semicolons, 2-space indent, 100-char width, trailing commas, always
  parenthesise arrow params. Just run `npm run format` to comply.
- `npm test` — Vitest green.
- `npm run build` — builds successfully.

## Coding standards — enforce these

**Formatting and linting are automated — don't fight them.** Prettier owns
whitespace, quotes, and line wrapping (config in `.prettierrc.json`); run
`npm run format` rather than hand-aligning. ESLint (`eslint.config.js`) catches
correctness issues — unused vars, React hooks rules, unescaped JSX. Fix the
cause, not the symptom; reach for `eslint-disable` only with a comment saying why.

**Match the surrounding code.** Read the neighbouring file before writing. Mirror
its naming and component shape (Prettier handles the rest). Consistency beats
personal preference.

**Conventions already in use (follow them):**

- ES modules (`"type": "module"`), single quotes, semicolons (enforced by Prettier).
- Functional components only, named exports (e.g. `export function HomePage(...)`),
  one page component per file. `main.jsx` is the only default-free entry.
- Hooks: `useState`/`useEffect`/`useCallback`. Always clean up listeners in the
  `useEffect` return. Wrap event handlers passed as props in `useCallback`.
- CSS class names use the `zo-` prefix and kebab-case (`zo-tweak-row`). Add new
  styles to `src/styles.css` — do not introduce CSS-in-JS or a CSS framework.
- `localStorage`/`postMessage` access is wrapped in `try/catch` — keep that habit;
  the site must never throw in a sandboxed iframe.

**Keep it small and dependency-light.** This is a static brochure site. Do not add
runtime dependencies (state libraries, routers, UI kits) without a clear need —
routing here is deliberately a hash + `useState`. Prefer plain React and CSS.

**Functions and components stay focused.** Files are intentionally short
(50–200 lines). If a component grows past that, split it rather than letting it
sprawl. No dead code, no commented-out blocks left behind.

**Names say what they mean.** Descriptive variable and function names; no
abbreviations that aren't already in the codebase. Comments explain _why_, not
_what_ — see the "handshake" comment in `main.jsx` for the right level.

## Tests

Tests run on [Vitest](https://vitest.dev) (`*.test.{js,mjs,jsx}`, node
environment by default). The suite is small and focused on logic that can break
silently — start with `scripts/util.test.mjs`, which covers the pure CLI helpers.

- Test pure functions, not the framework. The reason `slugify`/`parse` live in
  `scripts/util.mjs` (no IO, no `sharp`, no shebang) is so they're trivially
  importable and testable — keep new pure logic factored out the same way.
- When you fix a bug in logic, add a test that would have caught it.
- For DOM/component tests, switch that file's environment to `jsdom` (install it
  and set it per-file or in `vitest.config.js`); don't pull it in until needed.

## Content is data, not code

- Edit projects/products through the CLI, **not** by hand-editing JSON, so images
  and slugs stay consistent:
  ```bash
  npm run project -- list
  npm run project -- add --title "…" --year 2025 …
  npm run project -- images <slug> ./photo.jpg
  npm run product -- list
  ```
- Images are auto-compressed and committed to `public/img/<slug>/`. Don't commit
  raw multi-MB originals.
- Keep content (the JSON) separate from presentation (the components). Components
  render whatever the JSON provides; they should not hard-code project data.

## Before you finish

- Run `npm run lint`, `npm run format:check`, and `npm test` — all must pass.
- Run `npm run build` if you touched anything that affects the build, and confirm
  it succeeds.
- Don't commit `node_modules/` or `dist/` (already git-ignored).
- Only `git commit` / `git push` when explicitly asked. A push to the default
  branch triggers an automatic Vercel deploy — treat it as publishing.
- Keep `README.md` and `content/README.md` accurate if you change workflows.
