import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const dir = '.impeccable/review/biology-test';
await mkdir(dir, { recursive: true });
const browser = await chromium.launch();
const notes = [];
try {
  for (const [device, width, height, theme] of [['desktop',1440,1000,'light'], ['mobile',320,760,'light'], ['tablet',800,1080,'light'], ['dark',390,844,'dark']]) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    // Review captures represent a reader who already dismissed installation.
    await page.addInitScript(() => localStorage.setItem('opneet.install-dismissed-until', String(Date.now() + 86400000)));
    await page.goto('http://127.0.0.1:4178/opneet/');
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
    await page.screenshot({ path: `${dir}/${device}-home.png`, fullPage: true });
    await page.getByRole('button', { name: 'View biology test' }).click();
    await page.screenshot({ path: `${dir}/${device}-preflight.png`, fullPage: true });
    await page.getByRole('button', { name: 'Begin 90-minute biology test' }).click();
    const session = await page.evaluate(() => JSON.parse(localStorage.getItem('opneet.study.v1')).active);
    if (width < 701) await page.getByRole('button', { name: 'Question navigator (0/90 answered)' }).click();
    const diagrams = session.questions.filter(q => q.diagram).sort((a,b) => a.id.localeCompare(b.id));
    for (const q of diagrams) {
      const index = session.questions.findIndex(item => item.id === q.id);
      await page.getByRole('button', { name: `Go to question ${index + 1}`, exact: true }).click();
      await page.locator('.question-diagram').evaluate(async figure => {
        figure.scrollIntoView({ block: 'center', behavior: 'instant' });
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
      const unobstructed = await page.locator('.question-diagram').evaluate(figure => {
        const r = figure.getBoundingClientRect();
        return [r.top + 12, (r.top + r.bottom) / 2, r.bottom - 12].every(y => {
          const node = document.elementFromPoint((r.left + r.right) / 2, y);
          return node && figure.contains(node);
        });
      });
      if (!unobstructed) throw new Error(`Obscured capture: ${device} ${q.id}`);
      await page.locator('.question-diagram').screenshot({ path: `${dir}/${device}-${q.id}.png` });
      notes.push({ device, id: q.id, unobstructed, overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), errors: [...errors] });
    }
    if (width < 701) await page.getByRole('button', { name: 'Question navigator (0/90 answered)' }).click();
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.screenshot({ path: `${dir}/${device}-study.png`, fullPage: true });
    await page.getByRole('button', { name: /^Finish(?: session)?$/ }).click();
    await page.getByRole('button', { name: 'Submit & see results' }).click();
    await page.getByRole('button', { name: 'All', exact: true }).click();
    await page.locator('.result-question-toggle').filter({ hasText: diagrams[0].prompt }).click();
    await page.locator('.result-answer').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${dir}/${device}-review.png` });
    await page.close();
  }
  await writeFile(`${dir}/notes.json`, JSON.stringify(notes, null, 2));
  console.log(JSON.stringify({ diagrams: notes.length, overflow: notes.some(n => n.overflow), errors: notes.flatMap(n => n.errors) }));
} finally { await browser.close(); }
