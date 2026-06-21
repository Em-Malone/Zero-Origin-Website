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

import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  rmSync,
  existsSync,
  readdirSync,
  statSync,
} from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { slugify, parse } from './util.mjs';

const ROOT = resolve(fileURLToPath(import.meta.url), '../..');
const IMG_ROOT = join(ROOT, 'public', 'img');
const dataPath = (file) => join(ROOT, 'content', file);

const PALETTES = ['cool', 'warm', 'magenta', 'mono'];

// ── Shared helpers ──────────────────────────────────────────────────────────
const die = (msg) => {
  console.error('✗ ' + msg);
  process.exit(1);
};
const ok = (msg) => console.log('✓ ' + msg);

const read = (file) => JSON.parse(readFileSync(dataPath(file), 'utf8'));
const write = (file, list) => writeFileSync(dataPath(file), JSON.stringify(list, null, 2) + '\n');

function find(list, slug, kind) {
  const x = list.find((e) => e.slug === slug);
  if (!x) die(`No ${kind} with slug "${slug}". Run: npm run ${kind} list`);
  return x;
}

// Compression settings — tuned for web display, not print.
const MAX_EDGE = 2400; // longest-edge cap in px; downscales big camera/phone originals
const JPEG_QUALITY = 82; // visually near-lossless for photos, large size savings
const PNG_COMPRESSION = 9; // max zlib effort; lossless, kept for screenshots/UI

const kb = (bytes) => Math.round(bytes / 1024);

// Copy a source file into public/img/<slug>/ with a sequential, lowercase name,
// re-encoding it through sharp so it's downscaled + compressed for the web.
// PNGs stay PNG (crisp text/UI); everything else is normalised to JPEG.
async function copyImage(slug, src, index) {
  if (!existsSync(src)) die(`file not found: ${src}`);
  const dir = join(IMG_ROOT, slug);
  mkdirSync(dir, { recursive: true });

  const srcExt = extname(src).toLowerCase();
  const isPng = srcExt === '.png';
  const ext = isPng ? '.png' : '.jpg';
  const name = `${String(index).padStart(2, '0')}${ext}`;
  const dest = join(dir, name);

  // metadata:false (the default) strips EXIF/GPS. withoutEnlargement avoids
  // upscaling images already smaller than the cap.
  const pipeline = sharp(src).rotate().resize({
    width: MAX_EDGE,
    height: MAX_EDGE,
    fit: 'inside',
    withoutEnlargement: true,
  });
  if (isPng) await pipeline.png({ compressionLevel: PNG_COMPRESSION }).toFile(dest);
  else await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toFile(dest);

  const before = statSync(src).size;
  const after = statSync(dest).size;
  const saved = before > 0 ? Math.round((1 - after / before) * 100) : 0;
  console.log(`    compressed ${kb(before)}KB → ${kb(after)}KB (−${saved}%)`);

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
      console.log(
        `  ${p.slug.padEnd(22)} ${String(p.year).padEnd(6)} ${p.discipline.padEnd(14)} ${n} image${n === 1 ? '' : 's'}  ${p.title}`,
      );
    }
  },
  add({ flags }) {
    if (!flags.title) die('add requires at least --title');
    if (flags.palette && !PALETTES.includes(flags.palette))
      die(`palette must be one of: ${PALETTES.join(', ')}`);
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
    ok(
      `added project "${flags.title}" (${slug}). Add photos: npm run project images ${slug} ./photo.jpg`,
    );
  },
  edit({ flags, pos }) {
    if (!pos[0]) die('usage: npm run project edit <slug> --title ...');
    if (flags.palette && !PALETTES.includes(flags.palette))
      die(`palette must be one of: ${PALETTES.join(', ')}`);
    const data = read(PROJECTS);
    const p = find(data, pos[0], 'project');
    for (const f of PROJECT_FIELDS) {
      if (flags[f] !== undefined) p[f] = f === 'year' ? Number(flags[f]) : flags[f];
    }
    write(PROJECTS, data);
    ok(`updated ${pos[0]}`);
  },
  async images({ pos }) {
    const [slug, ...files] = pos;
    if (!slug || !files.length) die('usage: npm run project images <slug> <file...>');
    const data = read(PROJECTS);
    const p = find(data, slug, 'project');
    p.images = p.images || [];
    // Continue numbering after whatever is already on disk.
    const dir = join(IMG_ROOT, slug);
    let n = existsSync(dir) ? readdirSync(dir).length : 0;
    for (const src of files) {
      const webPath = await copyImage(slug, src, ++n);
      // Each row is { src, credit }; credit is left blank to fill in by hand.
      p.images.push({ src: webPath, credit: '' });
      ok(`${basename(src)} → ${webPath}`);
    }
    write(PROJECTS, data);
    ok(`${p.images.length} image(s) on "${slug}"`);
  },
  rmimage({ pos }) {
    const [slug, idxRaw] = pos;
    const idx = Number(idxRaw);
    if (!slug || !Number.isInteger(idx))
      die('usage: npm run project rmimage <slug> <index>  (0-based)');
    const data = read(PROJECTS);
    const p = find(data, slug, 'project');
    const imgs = p.images || [];
    if (idx < 0 || idx >= imgs.length) die(`index out of range (0..${imgs.length - 1})`);
    const [removed] = imgs.splice(idx, 1);
    // Entries may be a bare path (legacy) or { src, credit }.
    const removedPath = typeof removed === 'string' ? removed : removed.src;
    rmDiskPath(removedPath);
    write(PROJECTS, data);
    ok(`removed ${removedPath}`);
  },
  remove({ pos }) {
    if (!pos[0]) die('usage: npm run project remove <slug>');
    const data = read(PROJECTS);
    find(data, pos[0], 'project');
    write(
      PROJECTS,
      data.filter((p) => p.slug !== pos[0]),
    );
    rmImgDir(pos[0]);
    ok(`removed project "${pos[0]}" and its images`);
  },
};

// ── Products ────────────────────────────────────────────────────────────────
const PRODUCTS = 'products.json';
const PRODUCT_FIELDS = [
  'name',
  'type',
  'status',
  'subtitle',
  'description',
  'href',
  'cta',
  'price',
];

const product = {
  list() {
    const data = read(PRODUCTS);
    if (!data.length) return console.log('(no products yet)');
    for (const p of data) {
      console.log(
        `  ${p.slug.padEnd(16)} ${(p.type || '').padEnd(8)} ${p.image ? '[image]' : '[     ]'}  ${p.name}`,
      );
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
    ok(
      `added product "${flags.name}" (${slug}). Add a shot: npm run product image ${slug} ./shot.png`,
    );
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
  async image({ pos }) {
    const [slug, file] = pos;
    if (!slug || !file) die('usage: npm run product image <slug> <file>');
    const data = read(PRODUCTS);
    const p = find(data, slug, 'product');
    // One screenshot per product: clear any previous folder, then copy fresh.
    if (p.image) rmDiskPath(p.image);
    rmImgDir(slug);
    p.image = await copyImage(slug, file, 1);
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
    write(
      PRODUCTS,
      data.filter((p) => p.slug !== pos[0]),
    );
    rmImgDir(pos[0]);
    ok(`removed product "${pos[0]}" and its image`);
  },
};

// ── Dispatch ────────────────────────────────────────────────────────────────
// Invoked as `manage.mjs <kind> <cmd> ...`, where kind is project|product.
// The npm scripts ("project"/"product") pass the kind as the first arg.
const tables = { project, product };

// Only run the CLI when invoked directly (node manage.mjs …), not when this
// module is imported — e.g. by the unit tests for the pure helpers above.
async function main() {
  const [kind, cmd, ...rest] = process.argv.slice(2);
  const table = tables[kind];
  if (!table) {
    console.log('Usage: npm run project <cmd> | npm run product <cmd>');
    process.exit(kind ? 1 : 0);
  }
  if (!cmd || !table[cmd]) {
    console.log(`${kind} commands: ${Object.keys(table).join(' | ')}`);
    console.log(`Run a command with no further args for its usage, e.g. npm run ${kind} add`);
    process.exit(cmd ? 1 : 0);
  }
  await table[cmd](parse(rest));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
