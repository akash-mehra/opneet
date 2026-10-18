import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const browser = await chromium.launch();
const dir = '.impeccable/review/mini-test';
await mkdir(dir, { recursive: true });
const notes = [];
try {
  for (const [name, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844], ['tablet', 800, 1080]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:4178/opneet/');
    await page.getByRole('button', { name: 'View mini test' }).waitFor();
    await page.screenshot({ path: `${dir}/${name}-home.png` });
    await page.getByRole('button', { name: 'View mini test' }).click();
    await page.screenshot({ path: `${dir}/${name}-instructions.png` });
    await page.getByRole('button', { name: 'Begin 110-minute test' }).click();
    if (name === 'mobile') await page.getByRole('button', { name: 'Question navigator (0/100 answered)' }).click();
    await page.getByRole('button', { name: 'Go to question 100', exact: true }).click();
    await page.screenshot({ path: `${dir}/${name}-study.png`, fullPage: true });
    notes.push({ name, overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), errors });
    await page.close();
  }
  await writeFile(`${dir}/notes.json`, JSON.stringify(notes, null, 2));
  console.log(JSON.stringify(notes));
} finally { await browser.close(); }
