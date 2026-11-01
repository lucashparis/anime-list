import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = (path) => fileURLToPath(new URL(`../../${path}`, import.meta.url));
const FONT = root('node_modules/@fontsource-variable/mulish/files/mulish-latin-wght-normal.woff2');
const TAGLINE = 'Encontre animes por formato e nome.';
const ICO_SIZES = [32, 48];

function card(width, height) {
  const font = `data:font/woff2;base64,${readFileSync(FONT).toString('base64')}`;
  return `<!doctype html><meta charset="utf-8"><style>
    @font-face { font-family: Mulish; src: url(${font}) format('woff2'); font-weight: 200 1000; }
    * { margin: 0; box-sizing: border-box; }
    body { width: ${width}px; height: ${height}px; display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 32px; background: #6324c6;
      color: #fff; font-family: Mulish, sans-serif; }
    h1 { font-size: 150px; font-weight: 400; text-transform: uppercase; line-height: 1; }
    h1 span { color: #ffb800; }
    p { font-size: 44px; font-weight: 600; }
  </style><h1>Busc<span>Anime</span></h1><p>${TAGLINE}</p>`;
}

function icoFrom(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, png }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size, 0);
    entry.writeUInt8(size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...images.map(({ png }) => png)]);
}

const browser = await chromium.launch();
const svg = readFileSync(root('public/favicon.svg'), 'utf8');

async function render(width, height, html) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ omitBackground: true });
  await page.close();
  return png;
}

function iconHtml(size, { square = false } = {}) {
  const markup = square ? svg.replace('rx="12"', 'rx="0"') : svg;
  return `<body style="margin:0;width:${size}px;height:${size}px">${markup.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body>`;
}

try {
  const images = [];
  for (const size of ICO_SIZES)
    images.push({ size, png: await render(size, size, iconHtml(size)) });
  const outputs = [
    ['public/favicon.ico', icoFrom(images)],
    ['public/apple-touch-icon.png', await render(180, 180, iconHtml(180, { square: true }))],
    ['public/og-image.png', await render(1200, 630, card(1200, 630))],
    ['docs/assets/github-social.png', await render(1280, 640, card(1280, 640))],
  ];
  for (const [path, content] of outputs) writeFileSync(root(path), content);
} finally {
  await browser.close();
}
