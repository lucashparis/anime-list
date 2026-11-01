import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const PRODUCTION_URL = 'https://anime-list-silk.vercel.app/';
const html = readFileSync('index.html', 'utf8');
const document = new DOMParser().parseFromString(html, 'text/html');

function meta(selector: string) {
  return document.head.querySelector(selector)?.getAttribute('content') ?? null;
}

function pngSize(path: string) {
  const bytes = readFileSync(path);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

describe('index.html', () => {
  it('describes the link preview with absolute https URLs', () => {
    expect(meta('meta[property="og:url"]')).toBe(PRODUCTION_URL);
    expect(meta('meta[property="og:image"]')).toBe(`${PRODUCTION_URL}og-image.png`);
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      PRODUCTION_URL,
    );
    expect(meta('meta[property="og:title"]')).toBe(document.title);
    expect(meta('meta[property="og:description"]')).toBe(meta('meta[name="description"]'));
    expect(meta('meta[property="og:locale"]')).toBe('pt_BR');
    expect(meta('meta[property="og:image:alt"]')).toBeTruthy();
    expect(meta('meta[name="twitter:card"]')).toBe('summary_large_image');
    expect(meta('meta[name="theme-color"]')).toBe('#6324c6');
  });

  it('links the icons that exist in public', () => {
    const hrefs = [...document.head.querySelectorAll('link[rel*="icon"]')].map((link) =>
      link.getAttribute('href'),
    );
    expect(hrefs).toEqual(['/favicon.svg', '/favicon.ico', '/apple-touch-icon.png']);
    for (const href of hrefs) {
      expect(() => readFileSync(`public${href ?? ''}`)).not.toThrow();
    }
  });

  it('keeps the page free of inline scripts and styles', () => {
    expect(document.querySelectorAll('style, script:not([src])')).toHaveLength(0);
    expect(document.querySelectorAll('[style]')).toHaveLength(0);
  });
});

describe('brand images', () => {
  it('has the exact size of each preview', () => {
    expect(pngSize('public/og-image.png')).toEqual({ width: 1200, height: 630 });
    expect(pngSize('docs/assets/github-social.png')).toEqual({ width: 1280, height: 640 });
    expect(pngSize('public/apple-touch-icon.png')).toEqual({ width: 180, height: 180 });
  });
});
