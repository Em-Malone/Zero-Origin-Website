// Pure helpers for the content CLI — no IO, no dependencies, so they're easy
// to unit-test in isolation (see util.test.mjs). Kept separate from manage.mjs,
// which has a shebang and imports sharp.

// "Pulse — Awards 2025" → "pulse-awards-2025"
export const slugify = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// --flag value  →  { flag: value }; bare args collected positionally.
export function parse(argv) {
  const flags = {};
  const pos = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) flags[argv[i].slice(2)] = argv[++i];
    else pos.push(argv[i]);
  }
  return { flags, pos };
}
