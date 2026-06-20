# Content

This folder is the **single source of truth** for everything editable on the site.
Change a file here, commit, and push — Vercel rebuilds and deploys automatically.

You can edit these files locally, or directly in GitHub's web editor (the pencil icon).

---

## `projects.json`

An array of project objects. Each one:

| Field        | Type     | Notes                                                                 |
|--------------|----------|-----------------------------------------------------------------------|
| `slug`       | string   | Unique id, URL-safe (e.g. `aurora-residency`). Also the image folder. |
| `title`      | string   | Shown on the card and modal.                                          |
| `year`       | number   | e.g. `2025`.                                                          |
| `venue`      | string   | e.g. `O2 Academy Brixton, London`.                                    |
| `role`       | string   | Zero Origin's role on the project.                                    |
| `discipline` | string   | Drives the filter buttons, e.g. `Live Music`, `Tour`, `Broadcast`.    |
| `palette`    | string   | Placeholder art colour: `cool` \| `warm` \| `magenta` \| `mono`.      |
| `images`     | string[] | Carousel image paths, e.g. `/img/aurora-residency/01.jpg`. May be empty. |
| `credits`    | object[] | `{ "role": "...", "name": "..." }` rows in the modal.                 |
| `summary`    | string   | Paragraph in the modal.                                               |

**Images:** when `images` is empty, a generated placeholder is shown (using `palette`).
When it has entries, the carousel and card thumbnail use the real photos.
Don't hand-edit image paths — use the CLI below, which copies the files into
`public/img/<slug>/` and keeps `images` in sync.

## `products.json`

An array of product cards shown on the Products page.

| Field         | Type   | Notes                                                      |
|---------------|--------|------------------------------------------------------------|
| `slug`        | string | Unique id, URL-safe. Also the image folder.                |
| `type`        | string | `paid` \| `free` \| `concept` (concept hides the link).    |
| `status`      | string | Pill text, e.g. `Available now`.                           |
| `name`        | string | Product title.                                             |
| `subtitle`    | string | One-line tagline.                                          |
| `description` | string | Paragraph.                                                 |
| `href`        | string | Link target. External (`https://…`) opens in a new tab.    |
| `cta`         | string | Button label.                                              |
| `price`       | string | Optional pill, e.g. `From £9/mo`.                           |
| `image`       | string | Screenshot path, e.g. `/img/ltcue/01.png`. Empty = hidden. |

Manage products with `npm run product …` (mirrors projects). Don't hand-edit
the `image` path — use `npm run product image <slug> <file>`.

---

## Managing content from the command line

Projects and products share one CLI; images are copied into `public/img/<slug>/`
and the JSON path is recorded for you.

```bash
# ── Projects (carousel = many images) ────────────────────────────────────────
npm run project list                       # show all projects + image counts

# add (slug is derived from --title if you omit --slug)
npm run project add --title "Pulse — Awards" --year 2025 \
    --discipline Broadcast --venue "London" --role "Technical Direction" --palette warm

npm run project edit pulse-awards --title "Pulse 2026" --year 2026   # edit fields
npm run project images pulse-awards ./photos/a.jpg ./photos/b.jpg     # add carousel images
npm run project rmimage pulse-awards 0     # remove one image by position (0-based)
npm run project remove pulse-awards        # delete project + its image folder

# ── Products (one screenshot each) ───────────────────────────────────────────
npm run product list
npm run product add --name "LTCue" --subtitle "Check your sync" --href "#" --cta "Download" --type free
npm run product edit ltcue --status "Free download"
npm run product image ltcue ./shots/ltcue.png     # set/replace the screenshot
npm run product rmimage ltcue                      # clear the screenshot
npm run product remove ltcue
```

After any change: `git add -A && git commit -m "..." && git push` → Vercel redeploys.
