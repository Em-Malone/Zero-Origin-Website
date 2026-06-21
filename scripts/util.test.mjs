import { describe, it, expect } from 'vitest';
import { slugify, parse } from './util.mjs';

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Pulse Awards')).toBe('pulse-awards');
  });

  it('collapses runs of non-alphanumerics into a single hyphen', () => {
    expect(slugify('Eurovision — Vienna 2025!!')).toBe('eurovision-vienna-2025');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  --Hello World--  ')).toBe('hello-world');
  });
});

describe('parse', () => {
  it('reads --flag value pairs', () => {
    expect(parse(['--title', 'My Show', '--year', '2025'])).toEqual({
      flags: { title: 'My Show', year: '2025' },
      pos: [],
    });
  });

  it('collects bare arguments positionally', () => {
    expect(parse(['my-slug', 'photo.jpg', 'shot.png'])).toEqual({
      flags: {},
      pos: ['my-slug', 'photo.jpg', 'shot.png'],
    });
  });

  it('mixes flags and positionals', () => {
    expect(parse(['my-slug', '--title', 'New'])).toEqual({
      flags: { title: 'New' },
      pos: ['my-slug'],
    });
  });
});
