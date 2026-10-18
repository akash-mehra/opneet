import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const dir = new URL("../.impeccable/review/", import.meta.url);
await mkdir(dir, { recursive: true });
const browser = await chromium.launch();
const notes = [];
for (const [name, width, height] of [
  ["desktop", 1440, 1000],
  ["mobile", 390, 844],
]) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:5173/");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: new URL(`${name}.png`, dir).pathname, fullPage: true });
  notes.push({
    screen: name,
    overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
    errors,
  });
  await page.getByRole("button", { name: "Start quick practice" }).click();
  await page.getByRole("group", { name: "Answer options" }).getByRole("button").first().click();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: new URL(`${name}-study.png`, dir).pathname, fullPage: true });
  notes.push({
    screen: `${name}-study`,
    overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
    errors,
  });
  await page.close();
}
const dark = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await dark.goto("http://127.0.0.1:5173/");
await dark.getByRole("button", { name: "Settings & data" }).click();
await dark.getByRole("button", { name: "Dark", exact: true }).click();
await dark
  .getByRole("navigation", { name: "Main navigation" })
  .getByRole("button", { name: "Overview", exact: true })
  .click();
await dark.screenshot({ path: new URL("desktop-dark.png", dir).pathname, fullPage: true });
await browser.close();
await writeFile(new URL("browser-notes.json", dir), JSON.stringify(notes, null, 2));
console.log(JSON.stringify(notes));
