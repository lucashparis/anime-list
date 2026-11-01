import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const WALKTHROUGH = 'docs/walkthrough.md';
const MAX_LINES = 250;
const LINK = /\[[^\]]+\]\(([^)\s]+)\)/g;

function slug(heading: string) {
  return heading
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s/g, '-');
}

function headingsOf(path: string) {
  const lines = readFileSync(path, 'utf8').split('\n');
  return lines
    .filter((line) => /^#{1,6} /.test(line))
    .map((line) => slug(line.replace(/^#+ /, '')));
}

function relativeLinks() {
  const text = readFileSync(WALKTHROUGH, 'utf8');
  return [...text.matchAll(LINK)]
    .map((match) => match[1] ?? '')
    .filter((url) => !url.startsWith('http'));
}

describe('docs/walkthrough.md', () => {
  it('fits a 10-minute read', () => {
    const lines = readFileSync(WALKTHROUGH, 'utf8').trimEnd().split('\n');
    expect(lines.length).toBeLessThanOrEqual(MAX_LINES);
  });

  it.each(relativeLinks())('has a working link to %s', (url) => {
    const [file = '', anchor] = url.split('#');
    const target = resolve(dirname(WALKTHROUGH), file);
    expect(existsSync(target)).toBe(true);
    if (anchor) expect(headingsOf(target)).toContain(decodeURIComponent(anchor));
  });
});
