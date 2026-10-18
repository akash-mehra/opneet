import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

// Attach to Chrome running inside an Android emulator through an ADB CDP forward.
// This intentionally uses the real Android viewport, without desktop emulation.
const profile = process.env.ANDROID_TEST_PROFILE || 'phone';
const output = new URL('../.impeccable/review/android/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.connectOverCDP('http://127.0.0.1:9223');
const context = browser.contexts()[0];
const page = context.pages().at(-1) || await context.newPage();
await page.bringToFront();
for (const other of context.pages()) if (other !== page) await other.close();
page.setDefaultTimeout(90000);
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const checks = [];
async function resetApp() {
  await page.goto('about:blank');
  const cdp = await context.newCDPSession(page);
  await cdp.send('Storage.clearDataForOrigin', { origin: 'http://localhost:4175', storageTypes: 'local_storage' });
  await cdp.detach();
  await page.goto('http://localhost:4175/');
}
async function capture(name) {
  const metrics = await page.evaluate(() => ({
    width: innerWidth, height: innerHeight, dpr: devicePixelRatio,
    overflow: document.documentElement.scrollWidth > innerWidth,
    userAgent: navigator.userAgent,
  }));
  expect(metrics.overflow).toBe(false);
  checks.push({ name, ...metrics });
  await page.screenshot({ path: new URL(`${profile}-${name}.png`, output).pathname });
}
try {
  await resetApp();
  await expect(page.getByRole('button', { name: 'Start quick practice' })).toBeVisible();
  await capture('overview');
  await page.getByRole('button', { name: 'Start quick practice' }).click();
  await page.getByRole('group', { name: 'Answer options' }).getByRole('button').first().click();
  await page.getByRole('button', { name: 'This is a guess', exact: true }).click();
  await page.getByRole('button', { name: 'Bookmark question', exact: true }).click();
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Let’s understand why.' })).toBeVisible();
  await capture('practice');
  await page.reload();
  await page.locator('.pause-overlay').getByRole('button', { name: 'Resume practice', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Remove bookmark', exact: true })).toBeVisible();
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('opneet.study.v1')));
  const answer = state.active.answers[state.active.questions[0].id];
  expect(answer.firstSelected).toBe(0);
  expect(answer.guessed).toBe(true);
  await page.getByRole('button', { name: /^Finish(?: session)?$/ }).click();
  await page.getByRole('button', { name: 'Submit & see results' }).click();
  await expect(page.getByRole('heading', { name: 'Every answer tells you something.' })).toBeVisible();
  await capture('results');
  await resetApp();
  await page.getByRole('button', { name: 'Choose your mode' }).click();
  await expect(page.getByRole('dialog', { name: 'Build your session' })).toBeVisible();
  await capture('session-builder');
  await page.keyboard.press('Escape');
  // The existing browser suite covers full timed-test logic. Here it runs in Android Chrome too.
  const nav = page.getByRole('navigation').filter({ has: page.getByRole('button', { name: 'Practice & tests', exact: true }) });
  await nav.getByRole('button', { name: 'Practice & tests', exact: true }).click();
  await page.getByRole('button', { name: 'Build a timed test' }).click();
  await page.getByRole('button', { name: 'Begin test' }).click();
  await page.getByRole('group', { name: 'Answer options' }).getByRole('button').first().click();
  await expect(page.getByRole('button', { name: 'Check answer', exact: true })).toHaveCount(0);
  const deadline = await page.evaluate(() => JSON.parse(localStorage.getItem('opneet.study.v1')).active.deadline);
  await page.reload();
  await expect(page.getByRole('group', { name: 'Answer options' })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('opneet.study.v1')).active.deadline)).toBe(deadline);
  await capture('timed-test');
  expect(errors).toEqual([]);
  await writeFile(new URL(`${profile}-report.json`, output), JSON.stringify({ status: 'passed', checks, errors }, null, 2));
  console.log(JSON.stringify({ profile, status: 'passed', checks, errors }));
} finally {
  await browser.close();
}
