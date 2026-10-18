import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const profile = process.env.ANDROID_TEST_PROFILE || 'landscape';
const output = new URL('../.impeccable/review/android/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.connectOverCDP('http://127.0.0.1:9223');
try {
  const page = browser.contexts()[0].pages().find(p => p.url().includes('localhost:4175'));
  if (!page) throw new Error('Open opneet in Android Chrome first.');
  await page.bringToFront();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const metrics = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, dpr: devicePixelRatio, overflow: document.documentElement.scrollWidth > innerWidth }));
  expect(metrics.overflow).toBe(false);
  await expect(page.getByRole('group', { name: 'Answer options' })).toBeVisible();
  const guess = page.getByRole('button', { name: 'This is a guess', exact: true });
  await guess.scrollIntoViewIfNeeded();
  const box = await guess.boundingBox();
  if (!box) throw new Error('Guess control is outside the Android viewport.');
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: box.x + box.width / 2, y: box.y + box.height / 2 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(page.getByRole('button', { name: 'Marked as a guess', exact: true })).toBeVisible();
  await cdp.detach();
  await page.screenshot({ path: new URL(`${profile}-study.png`, output).pathname });
  await writeFile(new URL(`${profile}-layout.json`, output), JSON.stringify({ status: 'passed', touchGuess: true, metrics, errors }, null, 2));
  console.log(JSON.stringify({ profile, touchGuess: true, metrics, errors }));
} finally {
  await browser.close();
}
