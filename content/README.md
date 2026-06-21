# Content

This folder is the **single source of truth** for everything editable on the site.
Change a file here, open a PR, and merging it to `main` rebuilds and deploys on
Vercel automatically. See [Publishing changes](#publishing-changes) below — `main`
is protected, so you can't push to it directly.

---

## `projects.json`

An array of project objects. Each one:

| Field        | Type     | Notes                                                                                                                                      |
| ------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `slug`       | string   | Unique id, URL-safe (e.g. `aurora-residency`). Also the image folder.                                                                      |
| `title`      | string   | Shown on the card and modal.                                                                                                               |
| `year`       | number   | e.g. `2025`.                                                                                                                               |
| `venue`      | string   | e.g. `O2 Academy Brixton, London`.                                                                                                         |
| `role`       | string   | Zero Origin's role on the project.                                                                                                         |
| `discipline` | string   | Drives the filter buttons, e.g. `Live Music`, `Tour`, `Broadcast`.                                                                         |
| `palette`    | string   | Placeholder art colour: `cool` \| `warm` \| `magenta` \| `mono`.                                                                           |
| `images`     | array    | Carousel images. Each entry is either a path string, or `{ "src": "/img/…", "credit": "Name" }` to print a per-photo credit. May be empty. |
| `credits`    | object[] | `{ "role": "...", "name": "..." }` rows in the modal.                                                                                      |
| `summary`    | string   | Paragraph in the modal.                                                                                                                    |

**Images:** when `images` is empty, a generated placeholder is shown (using `palette`).
When it has entries, the carousel and card thumbnail use the real photos.
Don't hand-edit image _paths_ — use the CLI below, which copies the files into
`public/img/<slug>/` and keeps `images` in sync.

**Photo credits** print bottom-left in the carousel (and change as you swipe).
To add one, turn the bare string into an object with a `credit`:

```json
"images": [
  { "src": "/img/eurovision-song-contest-vienna/01.webp", "credit": "Jane Doe" },
  { "src": "/img/eurovision-song-contest-vienna/02.jpg",  "credit": "EBU / Sarah Lee" },
  "/img/eurovision-song-contest-vienna/03.jpg"
]
```

The last entry has no credit — both forms are fine, even in the same project.
The CLI always writes bare strings; add the `{ "src", "credit" }` wrapper by hand
where you want a credit.

## `products.json`

An array of product cards shown on the Products page.

| Field         | Type   | Notes                                                      |
| ------------- | ------ | ---------------------------------------------------------- |
| `slug`        | string | Unique id, URL-safe. Also the image folder.                |
| `type`        | string | `paid` \| `free` \| `concept` (concept hides the link).    |
| `status`      | string | Pill text, e.g. `Available now`.                           |
| `name`        | string | Product title.                                             |
| `subtitle`    | string | One-line tagline.                                          |
| `description` | string | Paragraph.                                                 |
| `href`        | string | Link target. External (`https://…`) opens in a new tab.    |
| `cta`         | string | Button label.                                              |
| `price`       | string | Optional pill, e.g. `From £9/mo`.                          |
| `image`       | string | Screenshot path, e.g. `/img/ltcue/01.png`. Empty = hidden. |

Manage products with `npm run product …` (mirrors projects). Don't hand-edit
the `image` path — use `npm run product image <slug> <file>`.

---

## Image criteria

|                  | Project carousel                                                                                     | Product screenshot |
| ---------------- | ---------------------------------------------------------------------------------------------------- | ------------------ |
| **Aspect ratio** | 16:9 in the modal; the grid card crops it to 4:3                                                     | 16:9               |
| **Recommended**  | ~1600×900 (2000×1125 for retina)                                                                     | ~1600×900          |
| **Cropping**     | `object-fit: cover` — fills the frame, centre-cropped. Off-ratio images are cropped, not letterboxed | same               |
| **Formats**      | `.jpg`, `.png`, `.webp` (webp = smallest). The CLI keeps your file's extension                       | same               |
| **File size**    | Keep under ~300–500 KB each — images are committed to the git repo and served as-is                  | same               |

There is **no automatic resizing or compression** — what you commit is what
ships. Compress/resize before uploading (e.g. <https://squoosh.app>). The CLI
doesn't validate ratio or size; a wrong ratio just crops.

- Carousel images display in the order listed in `images[]`, which is the order
  you pass files to `npm run project -- images`. The **first** image is also the
  grid-card thumbnail, so lead with your strongest shot.

---

## Managing content from the command line

Projects and products share one CLI; images are copied into `public/img/<slug>/`
and the JSON path is recorded for you.

> ⚠️ **Always put `--` right after `project` / `product`.** npm needs it to pass
> your `--title`, `--year`, … flags through to the script. Without it npm tries
> to read them as its own options and your flags are silently dropped (you'll see
> `npm warn Unknown cli config "--title"` and nothing gets added).

```bash
# ── Projects (carousel = many images) ────────────────────────────────────────
npm run project -- list                       # show all projects + image counts

# add (slug is derived from --title if you omit --slug)
npm run project -- add --title "Pulse — Awards" --year 2025 \
    --discipline Broadcast --venue "London" --role "Technical Direction" --palette warm

npm run project -- edit pulse-awards --title "Pulse 2026" --year 2026   # edit fields
npm run project -- images pulse-awards ./photos/a.jpg ./photos/b.jpg     # add carousel images
npm run project -- rmimage pulse-awards 0     # remove one image by position (0-based)
npm run project -- remove pulse-awards        # delete project + its image folder

# ── Products (one screenshot each) ───────────────────────────────────────────
npm run product -- list
npm run product -- add --name "LTCue" --subtitle "Check your sync" --href "#" --cta "Download" --type free
npm run product -- edit ltcue --status "Free download"
npm run product -- image ltcue ./shots/ltcue.png     # set/replace the screenshot
npm run product -- rmimage ltcue                      # clear the screenshot
npm run product -- remove ltcue
```

On Windows PowerShell, quote any value with spaces (as shown). The `--` rule is
the same everywhere.

---

## Publishing changes

`main` is protected and CI must pass, so all changes go through a pull request —
you can't push to `main` directly, and merging is what publishes.

```bash
# 1. Branch off an up-to-date main
git checkout main; git pull
git checkout -b content/<short-description>

# 2. Make changes via the CLI above (not by hand-editing JSON)

# 3. Run the CI checks locally — all four must pass before you push
npm run lint
npm run format:check
npm test
npm run build

# 4. Commit and push the branch
git add content/ public/img/
git commit -m "Add <project> to portfolio"
git push -u origin content/<short-description>

# 5. Open a PR; once CI is green, squash-merge it
gh pr create --fill
gh pr merge --squash
```

The squash-merge to `main` triggers the Vercel deploy — treat it as publishing.
