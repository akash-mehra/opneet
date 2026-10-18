import { test, expect } from "@playwright/test";

test("renaming preserves study data saved under the previous app name", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start quick practice" }).click();
  const saved = await page.evaluate(() => localStorage.getItem("opneet.study.v1"));
  await page.goto("about:blank");
  await page.addInitScript((backup) => {
    if (location.origin !== "http://127.0.0.1:5173" || sessionStorage.getItem("migration-seeded")) return;
    localStorage.setItem("recall-ug.study.v1", backup!);
    localStorage.removeItem("opneet.study.v1");
    sessionStorage.setItem("migration-seeded", "yes");
  }, saved);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "A little breathing room." })).toBeVisible();
  await page.locator(".pause-overlay").getByRole("button", { name: "Resume practice", exact: true }).click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("opneet.study.v1")!).active)).not.toBeNull();
});

test("practice, bookmarking, explanations and reload preserve first answer", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start quick practice" }).click();
  await expect(page.getByRole("heading", { name: "Your session" })).toBeVisible();
  await page.getByRole("group", { name: "Answer options" }).getByRole("button").first().click();
  await page.getByRole("button", { name: "This is a guess", exact: true }).click();
  await page.getByRole("button", { name: "Bookmark question", exact: true }).click();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Let’s understand why." })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "A little breathing room." })).toBeVisible();
  await page.locator(".pause-overlay").getByRole("button", { name: "Resume practice", exact: true }).click();
  await expect(page.getByRole("button", { name: "Remove bookmark", exact: true })).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("opneet.study.v1")!));
  const a = saved.active.answers[saved.active.questions[0].id];
  expect(a.firstSelected).toBe(0);
  expect(a.guessed).toBe(true);
  await page.getByRole("button", { name: "Finish session", exact: true }).click();
  await page.getByRole("button", { name: "Submit & see results" }).click();
  await expect(
    page.getByRole("heading", { name: "Every answer tells you something." }),
  ).toBeVisible();
});
test("exam conceals answers and deadline survives reload", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name: "Practice & tests" })
    .click();
  await page.getByRole("button", { name: "Build a timed test" }).click();
  await page.getByRole("button", { name: "Begin test" }).click();
  await page.getByRole("group", { name: "Answer options" }).getByRole("button").first().click();
  await expect(page.getByRole("button", { name: "Check answer", exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Let’s understand why." })).toHaveCount(0);
  const deadline = await page.evaluate(
    () => JSON.parse(localStorage.getItem("opneet.study.v1")!).active.deadline,
  );
  await page.reload();
  await expect(page.getByRole("heading", { name: "Your session" })).toBeVisible();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("opneet.study.v1")!).active.deadline,
    ),
  ).toBe(deadline);
  await page.getByRole("button", { name: "Finish session", exact: true }).click();
  await page.getByRole("button", { name: "Submit & see results" }).click();
  await page.getByRole("button", { name: "All", exact: true }).click();
  await page.locator(".result-question-toggle").first().click();
  await expect(page.getByRole("heading", { name: "Explanation", exact: true })).toBeVisible();
});
test("reviewed bank starts empty and can switch back to demonstrations", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Switch bank" }).click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name: "Question bank" })
    .click();
  await expect(
    page.getByRole("heading", { name: "A clean slate for reviewed PYQs." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Explore with sample questions" }).click();
  await expect(page.getByRole("heading", { name: "Motion in a Straight Line" })).toBeVisible();
});
test("leave and resume practice, plus subject filtering", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Physics Understand/ }).click();
  await expect(page.getByRole("heading", { name: "Chemical Bonding" })).toHaveCount(0);
  await page.getByRole("button", { name: "Practice", exact: true }).first().click();
  await page.getByRole("button", { name: "Leave study session" }).click();
  await page.getByRole("button", { name: "Go to overview" }).click();
  await expect(page.getByRole("heading", { name: "A little clearer, every day." })).toBeVisible();
  await page.getByRole("button", { name: /Pick up where you left off/ }).click();
  await expect(page.getByRole("heading", { name: "Your session" })).toBeVisible();
});
test("expired stored exam completes automatically", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name: "Practice & tests" })
    .click();
  await page.getByRole("button", { name: "Build a timed test" }).click();
  await page.getByRole("button", { name: "Begin test" }).click();
  await page.evaluate(() => {
    const key = "opneet.study.v1";
    const s = JSON.parse(localStorage.getItem(key)!);
    s.active.startedAt = Date.now() - 120000;
    s.active.deadline = Date.now() - 1000;
    s.active.lastActiveAt = s.active.deadline - 1000;
    localStorage.setItem(key, JSON.stringify(s));
  });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Every answer tells you something." }),
  ).toBeVisible();
  await expect(page.getByText(/Time limit reached/)).toBeVisible();
});
test("phone layout fits, mobile navigation and question flow work", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("button", { name: "Start quick practice" }).click();
  await page.getByRole("group", { name: "Answer options" }).getByRole("button").nth(1).click();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Let’s understand why." })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test("tablet navigation stays named and dialogs have accessible titles", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 1000 });
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  for (const label of [
    "Overview",
    "Question bank",
    "Practice & tests",
    "Your revision",
    "Progress",
  ])
    await expect(nav.getByRole("button", { name: label, exact: true })).toBeVisible();
  await nav.getByRole("button", { name: "Overview", exact: true }).click();
  await page.keyboard.press("/");
  await expect(page.getByRole("textbox", { name: "Search your question bank" })).toBeFocused();
  await page.getByRole("button", { name: "Choose your mode" }).click();
  await expect(page.getByRole("dialog", { name: "Build your session" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Choose your mode" })).toBeFocused();
});
test("backup restore is validated and replaces preferences after confirmation", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open personal settings" }).click();
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem("opneet.study.v1")!));
  state.preferences.theme = "sepia";
  state.bookmarks = ["sample-p01"];
  await page
    .getByLabel("Restore a opneet backup")
    .setInputFiles({
      name: "backup.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(state)),
    });
  await expect(page.getByRole("dialog", { name: "Restore this backup?" })).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Restore backup", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "sepia");
  await expect(page.getByText("Backup restored.", { exact: true })).toBeVisible();
});
