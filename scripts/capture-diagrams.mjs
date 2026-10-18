import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const dir = '.impeccable/review/diagrams';
await mkdir(dir, { recursive: true });
const browser = await chromium.launch();
const notes = [];
try {
  for (const [device, width, height, theme] of [['desktop', 1440, 1000, 'light'], ['mobile', 320, 760, 'light'], ['tablet', 800, 1080, 'light'], ['dark', 390, 844, 'dark']]) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:4178/opneet/');
    await page.getByRole('button', { name: 'View mini test' }).click();
    await page.getByRole('button', { name: 'Begin 110-minute test' }).click();
    const session = await page.evaluate(() => JSON.parse(localStorage.getItem('opneet.study.v1')).active);
    if (theme === 'dark') await page.evaluate(() => document.documentElement.dataset.theme = 'dark');
    if (width < 701) await page.getByRole('button', { name: 'Question navigator (0/100 answered)' }).click();
    const questions = session.questions.filter(q => q.diagram && (device === 'desktop' || device === 'mobile' || ['mini01-p12', 'mini01-p28', 'mini01-p35'].includes(q.id)));
    for (const q of questions) {
      const index = session.questions.findIndex(item => item.id === q.id);
      await page.getByRole('button', { name: `Go to question ${index + 1}`, exact: true }).click();
      await page.locator('.question-diagram').evaluate(async figure => {
        await document.fonts.ready;
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
      if (!unobstructed) throw new Error(`Diagram obscured during capture: ${device} ${q.id}`);
      await page.locator('.question-diagram').screenshot({ path: `${dir}/${device}-${q.id}.png` });
      if (q.id === 'mini01-p28') await page.screenshot({ path: `${dir}/${device}-context.png`, fullPage: true });
      notes.push({ device, id: q.id, unobstructed, overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), errors: [...errors] });
    }
    await page.close();
  }
  await writeFile(`${dir}/notes.json`, JSON.stringify(notes, null, 2));
  console.log(JSON.stringify({ captures: notes.length, overflow: notes.some(n => n.overflow), errors: notes.flatMap(n => n.errors) }));
} finally { await browser.close(); }
