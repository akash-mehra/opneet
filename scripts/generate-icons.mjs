import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

// Code-drawn brand geometry: opaque forest background, paper ring and pale dot.
// The artwork remains inside Android's maskable-icon safe zone.
await mkdir('public/icons', { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  for (const size of [180, 192, 512]) {
    const png = await page.evaluate(size => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const c = canvas.getContext('2d');
      c.scale(size / 64, size / 64);
      c.fillStyle = '#214d3b'; c.fillRect(0, 0, 64, 64);
      c.strokeStyle = '#f7f8f2'; c.lineWidth = 6;
      c.beginPath(); c.arc(29, 32, 12, 0, Math.PI * 2); c.stroke();
      c.fillStyle = '#e7ebc8'; c.beginPath(); c.arc(48, 43, 3, 0, Math.PI * 2); c.fill();
      return canvas.toDataURL('image/png').split(',')[1];
    }, size);
    await writeFile(`public/icons/icon-${size}.png`, Buffer.from(png, 'base64'));
  }
} finally { await browser.close(); }
