#!/usr/bin/env node
// Projects + products + their images, managed from one place.
//
// content/projects.json and content/products.json are the single source of
// truth. Images are committed to public/img/<slug>/ and referenced as
// "/img/<slug>/<file>". This CLI keeps the JSON and the files in sync so you
// never hand-edit a path.
//
// Projects (carousel = many images):
//   npm run project list
//   npm run project add    --title "Pulse — Awards" --year 2025 \
//                          --discipline Broadcast --venue "London" --role "TD" [--palette warm]
//   npm run project edit   <slug> --title "New title" --year 2026 ...
//   npm run project images <slug> <file...>     # add image(s) to the carousel
//   npm run project rmimage <slug> <index>      # remove one carousel image by position
//   npm run project remove <slug>               # delete project + its image folder
//
// Products (one screenshot each):
//   npm run product list
//   npm run product add    --name "LTCue" --subtitle "..." --href "#" --cta "Download" [--type free]
//   npm run product edit   <slug> --status "..." --href "..." ...
//   npm run product image  <slug> <file>        # set/replace the screenshot
//   npm run product rmimage <slug>              # clear the screenshot
//   npm run product remove <slug>
//
// After any change: git add -A && git commit && git push  → Vercel redeploys.

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(import.meta.url), '../..');
const IMG_ROOT = join(ROOT, 'public', 'img');
const dataPath = (file) => join(ROOT, 'content', file);

const PALETTES = ['cool', 'warm', 'magenta', 'mono'];

// ── Shared helpers ──────────────────────────────────────────────────────────
const die = (msg) => { console.error('✗ ' + msg); process.exit(1); };
const ok = (msg) => console.log('✓ ' + msg);
const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const read = (file) => JSON.parse(readFileSync(dataPath(file), 'utf8'));
const write = (file, list) => writeFileSync(dataPath(file), JSON.stringify(list, null, 2) + '\n');

// --flag value  →  { flag: value }; bare args collected positionally.
function parse(argv) {
  const flags = {}; const pos = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) flags[argv[i].slice(2)] = argv[++i];
    else pos.push(argv[i]);
  }
  return { flags, pos };
}

function find(list, slug, kind) {
  const x = list.find((e) => e.slug === slug);
  if (!x) die(`No ${kind} with slug "${slug}". Run: npm run ${kind} list`);
  return x;
}

// Copy a source file into public/img/<slug>/ with a sequential, lowercase name.
function copyImage(slug, src, index) {
  if (!existsSync(src)) die(`file not found: ${src}`);
  const dir = join(IMG_ROOT, slug);
  mkdirSync(dir, { recursive: true });
  const ext = (extname(src) || '.jpg').toLowerCase();
  const name = `${String(index).padStart(2, '0')}${ext}`;
  copyFileSync(src, join(dir, name));
  return `/img/${slug}/${name}`;
}

const rmDiskPath = (webPath) => {
  const onDisk = join(ROOT, 'public', webPath.replace(/^\//, ''));
  if (existsSync(onDisk)) rmSync(onDisk);
};
const rmImgDir = (slug) => {
  const dir = join(IMG_ROOT, slug);
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
};

// ── Projects ────────────────────────────────────────────────────────────────
const PROJECTS = 'projects.json';
const PROJECT_FIELDS = ['title', 'year', 'venue', 'role', 'discipline', 'palette', 'summary'];

const project = {
  list() {
    const data = read(PROJECTS);
    if (!data.length) return console.log('(no projects yet)');
    for (const p of data) {
      const n = (p.images || []).length;
      console.log(`  ${p.slug.padEnd(22)} ${String(p.year).padEnd(6)} ${p.discipline.padEnd(14)} ${n} image${n === 1 ? '' : 's'}  ${p.title}`);
    }
  },
  add({ flags }) {
    if (!flags.title) die('add requires at least --title');
    if (flags.palette && !PALETTES.includes(flags.palette)) die(`palette must be one of: ${PALETTES.join(', ')}`);
    const data = read(PROJECTS);
    const slug = slugify(flags.slug || flags.title);
    if (data.some((p) => p.slug === slug)) die(`slug "${slug}" already exists`);
    data.push({
      slug,
      title: flags.title,
      year: flags.year ? Number(flags.year) : new Date().getFullYear(),
      venue: flags.venue || '',
      role: flags.role || '',
      palette: flags.palette || 'cool',
      discipline: flags.discipline || 'Live Music',
      images: [],
      credits: [{ role: 'Media Server', name: 'Zero Origin' }],
      summary: flags.summary || '',
    });
    write(PROJECTS, data);
    ok(`added project "${flags.title}" (${slug}). Add photos: npm run project images ${slug} ./photo.jpg`);
  },
  edit({ flags, pos }) {
    if (!pos[0]) die('usage: npm run project edit <slug> --title ...');
    if (flags.palette && !PALETTES.includes(flags.palette)) die(`palette must be one of: ${PALETTES.join(', ')}`);
    const data = read(PROJECTS);
    const p = find(data, pos[0], 'project');
    for (const f of PROJECT_FIELDS) {
      if (flags[f] !== undefined) p[f] = f === 'year' ? Number(flags[f]) : flags[f];
    }
    write(PROJECTS, data);
    ok(`updated ${pos[0]}`);
  },
  images({ pos }) {
    const [slug, ...files] = pos;
    if (!slug || !files.length) die('usage: npm run project images <slug> <file...>');
    const data = read(PROJECTS);
    const p = find(data, slug, 'project');
    p.images = p.images || [];
    // Continue numbering after whatever is already on disk.
    const dir = join(IMG_ROOT, slug);
    let n = existsSync(dir) ? readdirSync(dir).length : 0;
    for (const src of files) {
      const webPath = copyImage(slug, src, ++n);
      p.images.push(webPath);
      ok(`${basename(src)} → ${webPath}`);
    }
    write(PROJECTS, data);
    ok(`${p.images.length} image(s) on "${slug}"`);
  },
  rmimage({ pos }) {
    const [slug, idxRaw] = pos;
    const idx = Number(idxRaw);
    if (!slug || !Number.isInteger(idx)) die('usage: npm run project rmimage <slug> <index>  (0-based)');
    const data = read(PROJECTS);
    const p = find(data, slug, 'project');
    const imgs = p.images || [];
    if (idx < 0 || idx >= imgs.length) die(`index out of range (0..${imgs.length - 1})`);
    const [removed] = imgs.splice(idx, 1);
    rmDiskPath(removed);
    write(PROJECTS, data);
    ok(`removed ${removed}`);
  },
  remove({ pos }) {
    if (!pos[0]) die('usage: npm run project remove <slug>');
    const data = read(PROJECTS);
    find(data, pos[0], 'project');
    write(PROJECTS, data.filter((p) => p.slug !== pos[0]));
    rmImgDir(pos[0]);
    ok(`removed project "${pos[0]}" and its images`);
  },
};

// ── Products ────────────────────────────────────────────────────────────────
const PRODUCTS = 'products.json';
const PRODUCT_FIELDS = ['name', 'type', 'status', 'subtitle', 'description', 'href', 'cta', 'price'];

const product = {
  list() {
    const data = read(PRODUCTS);
    if (!data.length) return console.log('(no products yet)');
    for (const p of data) {
      console.log(`  ${p.slug.padEnd(16)} ${(p.type || '').padEnd(8)} ${p.image ? '[image]' : '[     ]'}  ${p.name}`);
    }
  },
  add({ flags }) {
    if (!flags.name) die('add requires at least --name');
    const data = read(PRODUCTS);
    const slug = slugify(flags.slug || flags.name);
    if (data.some((p) => p.slug === slug)) die(`slug "${slug}" already exists`);
    data.push({
      slug,
      type: flags.type || 'paid',
      status: flags.status || '',
      name: flags.name,
      subtitle: flags.subtitle || '',
      description: flags.description || '',
      href: flags.href || '#',
      cta: flags.cta || 'Learn more',
      image: '',
    });
    write(PRODUCTS, data);
    ok(`added product "${flags.name}" (${slug}). Add a shot: npm run product image ${slug} ./shot.png`);
  },
  edit({ flags, pos }) {
    if (!pos[0]) die('usage: npm run product edit <slug> --status ...');
    const data = read(PRODUCTS);
    const p = find(data, pos[0], 'product');
    for (const f of PRODUCT_FIELDS) {
      if (flags[f] !== undefined) p[f] = flags[f];
    }
    write(PRODUCTS, data);
    ok(`updated ${pos[0]}`);
  },
  image({ pos }) {
    const [slug, file] = pos;
    if (!slug || !file) die('usage: npm run product image <slug> <file>');
    const data = read(PRODUCTS);
    const p = find(data, slug, 'product');
    // One screenshot per product: clear any previous folder, then copy fresh.
    if (p.image) rmDiskPath(p.image);
    rmImgDir(slug);
    p.image = copyImage(slug, file, 1);
    write(PRODUCTS, data);
    ok(`${basename(file)} → ${p.image}`);
  },
  rmimage({ pos }) {
    if (!pos[0]) die('usage: npm run product rmimage <slug>');
    const data = read(PRODUCTS);
    const p = find(data, pos[0], 'product');
    if (p.image) rmDiskPath(p.image);
    rmImgDir(pos[0]);
    p.image = '';
    write(PRODUCTS, data);
    ok(`cleared screenshot on "${pos[0]}"`);
  },
  remove({ pos }) {
    if (!pos[0]) die('usage: npm run product remove <slug>');
    const data = read(PRODUCTS);
    find(data, pos[0], 'product');
    write(PRODUCTS, data.filter((p) => p.slug !== pos[0]));
    rmImgDir(pos[0]);
    ok(`removed product "${pos[0]}" and its image`);
  },
};

// ── Dispatch ────────────────────────────────────────────────────────────────
// Invoked as `manage.mjs <kind> <cmd> ...`, where kind is project|product.
// The npm scripts ("project"/"product") pass the kind as the first arg.
const tables = { project, product };
const [kind, cmd, ...rest] = process.argv.slice(2);
const table = tables[kind];
if (!table) { console.log('Usage: npm run project <cmd> | npm run product <cmd>'); process.exit(kind ? 1 : 0); }
if (!cmd || !table[cmd]) {
  console.log(`${kind} commands: ${Object.keys(table).join(' | ')}`);
  console.log(`Run a command with no further args for its usage, e.g. npm run ${kind} add`);
  process.exit(cmd ? 1 : 0);
}
table[cmd](parse(rest));
