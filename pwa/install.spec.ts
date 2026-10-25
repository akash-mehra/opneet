import { test, expect } from "@playwright/test";

test("production manifest, Android icons and worker are scoped to the repository", async ({ page }) => {
  await page.goto("./");
  const manifestURL = await page.locator('link[rel="manifest"]').evaluate((link: HTMLLinkElement) => link.href);
  const response = await page.request.get(manifestURL);
  expect(response.ok()).toBe(true);
  const manifest = await response.json();
  for (const key of ["id", "start_url", "scope"]) {
    expect(new URL(manifest[key], manifestURL).pathname).toBe("/opneet/");
  }
  expect(manifest.display).toBe("standalone");
  for (const icon of manifest.icons) {
    const size = await page.evaluate(async (url) => {
      const image = await createImageBitmap(await (await fetch(url)).blob());
      return `${image.width}x${image.height}`;
    }, new URL(icon.src, manifestURL).href);
    expect(size).toBe(icon.sizes);
  }
  const scope = await page.evaluate(async () => (await navigator.serviceWorker.ready).scope);
  expect(new URL(scope).pathname).toBe("/opneet/");
  const cdp = await page.context().newCDPSession(page);
  const result = await cdp.send("Page.getInstallabilityErrors");
  expect(result.installabilityErrors).toEqual([]);
});

test("browser popup has manual steps, recovery guidance and persistent dismissal", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  const prompt = page.getByRole("complementary", { name: "Keep opneet close." });
  await expect(prompt).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("button", { name: "Installation not working?" }).click();
  await expect(page.getByRole("dialog", { name: "Install opneet" })).toBeVisible();
  await expect(page.getByText(/Export your study backup/)).toBeVisible();
  await page.getByRole("button", { name: "Got it", exact: true }).click();
  await page.getByRole("button", { name: "Not now", exact: true }).click();
  await expect(prompt).toHaveCount(0);
  await page.reload();
  await page.waitForTimeout(2200);
  await expect(prompt).toHaveCount(0);
});

test("native install is user initiated; acceptance is not reported as completed installation", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByRole("complementary", { name: "Keep opneet close." })).toBeVisible();
  await page.evaluate(() => {
    const event = new Event("beforeinstallprompt", { cancelable: true });
    Object.assign(event, { prompt: async () => { sessionStorage.setItem("installer-opened", "yes"); }, userChoice: Promise.resolve({ outcome: "accepted" }) });
    window.dispatchEvent(event);
  });
  expect(await page.evaluate(() => sessionStorage.getItem("installer-opened"))).toBeNull();
  await page.getByRole("button", { name: "Install opneet", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText(/Installation requested/);
  await page.evaluate(() => window.dispatchEvent(new Event("appinstalled")));
  await expect(page.getByRole("complementary", { name: "Keep opneet close." })).toHaveCount(0);
});

test("failed installer opens recovery steps without claiming installation", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByRole("complementary", { name: "Keep opneet close." })).toBeVisible();
  await page.evaluate(() => {
    const event = new Event("beforeinstallprompt", { cancelable: true });
    Object.assign(event, { prompt: async () => { throw new Error("Unavailable"); }, userChoice: Promise.resolve({ outcome: "dismissed" }) });
    window.dispatchEvent(event);
  });
  await page.getByRole("button", { name: "Install opneet", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Install opneet" })).toBeVisible();
  await expect(page.getByText(/Installation requested/)).toHaveCount(0);
});

test("installed app mode suppresses all installation UI", async ({ page }) => {
  await page.addInitScript(() => {
    const original = window.matchMedia.bind(window);
    window.matchMedia = (query) => {
      const result = original(query);
      if (query.includes("display-mode")) Object.defineProperty(result, "matches", { value: true });
      return result;
    };
  });
  await page.goto("./");
  await page.waitForTimeout(2200);
  await expect(page.getByRole("complementary", { name: "Keep opneet close." })).toHaveCount(0);
});

test("first offline relaunch restores the app and saved practice", async ({ page, context }) => {
  await page.goto("./");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise<void>(resolve => navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true }));
  });
  await page.getByRole("button", { name: "Start quick practice" }).click();
  await page.getByRole("group", { name: "Answer options" }).getByRole("button").first().click();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { name: "A little breathing room." })).toBeVisible();
  await page.locator(".pause-overlay").getByRole("button", { name: "Resume practice", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Let’s understand why." })).toBeVisible();
});

test("mini-test diagrams reopen offline with the saved exam deadline", async ({ page, context }) => {
  await page.goto("./");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise<void>(resolve => navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true }));
  });
  await page.getByRole("button", { name: "View mini test" }).click();
  await page.getByRole("button", { name: "Begin 110-minute test" }).click();
  const session = await page.evaluate(() => JSON.parse(localStorage.getItem("opneet.study.v1")!).active);
  const index = session.questions.findIndex((q: { id: string }) => q.id === "mini01-p28");
  await page.getByRole("button", { name: `Go to question ${index + 1}`, exact: true }).click();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("img", { name: "Disc with an off-centre circular hole" })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("opneet.study.v1")!).active.deadline)).toBe(session.deadline);
});

test("biology test and its six diagrams work offline and preserve the saved timer", async ({ page, context }) => {
  await page.goto("./");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise<void>(resolve => navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true }));
  });
  await context.setOffline(true);
  await page.reload();
  await page.getByRole("button", { name: "View biology test" }).click();
  await page.getByRole("button", { name: "Begin 90-minute biology test" }).click();
  const session = await page.evaluate(() => JSON.parse(localStorage.getItem("opneet.study.v1")!).active);
  for (const q of session.questions.filter((q: { diagram?: object }) => q.diagram)) {
    const index = session.questions.findIndex((item: { id: string }) => item.id === q.id);
    await page.getByRole("button", { name: `Go to question ${index + 1}`, exact: true }).click();
    await expect(page.getByRole("img", { name: q.diagram.title, exact: true })).toBeVisible();
  }
  await page.reload();
  await expect(page.locator(".question-diagram")).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("opneet.study.v1")!).active.deadline)).toBe(session.deadline);
});
