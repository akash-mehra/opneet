import { test, expect } from "@playwright/test";

test("mini test launches exactly 60 Biology and 40 Physics questions for 110 minutes and restores on reload", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "View mini test" }).click();
  await expect(page.getByRole("dialog", { name: "Mini Test 01", exact: true })).toBeVisible();
  await expect(page.getByText("40 easy, 40 medium and 20 hard.", { exact: false })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("opneet.study.v1")!).active)).toBeNull();
  await page.getByRole("button", { name: "Begin 110-minute test" }).click();
  const session = await page.evaluate(() => JSON.parse(localStorage.getItem("opneet.study.v1")!).active);
  expect(session.questions).toHaveLength(100);
  expect(session.deadline - session.startedAt).toBe(110 * 60_000);
  expect(session.questions.slice(0, 60).every((q: { subject: string }) => q.subject === "Biology")).toBe(true);
  expect(session.questions.slice(60).every((q: { subject: string }) => q.subject === "Physics")).toBe(true);
  const options = page.getByRole("group", { name: "Answer options" }).getByRole("button");
  await options.nth(session.questions[0].correct).click();
  await page.getByRole("button", { name: "Bookmark question", exact: true }).click();
  await expect(page.getByRole("button", { name: "Check answer", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Go to question 61", exact: true }).click();
  await expect(page.locator(".question-tags").getByText("Physics", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Go to question 100", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("group", { name: "Answer options" })).toBeVisible();
  const restored = await page.evaluate(() => JSON.parse(localStorage.getItem("opneet.study.v1")!));
  expect(restored.active.deadline).toBe(session.deadline);
  expect(restored.active.current).toBe(99);
  expect(restored.preferences.bank).toBe("original");
  await page.getByRole("button", { name: /^Finish(?: session)?$/ }).click();
  await page.getByRole("button", { name: "Submit & see results" }).click();
  await expect(page.getByRole("heading", { name: "Every answer tells you something." })).toBeVisible();
  const completed = await page.evaluate(() => JSON.parse(localStorage.getItem("opneet.study.v1")!).sessions[0]);
  expect(completed.questions).toHaveLength(100);
  expect(completed.status).toBe("completed");
  expect(completed.answers[session.questions[0].id].selected).toBe(session.questions[0].correct);
});

test("phone mini-test dialog and 100-question navigator fit and cross subject sections", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("button", { name: "Practice & tests" }).click();
  await page.getByRole("button", { name: "View mini test" }).click();
  expect(await page.getByRole("dialog").evaluate(e => e.scrollWidth <= e.clientWidth)).toBe(true);
  await page.getByRole("button", { name: "Begin 110-minute test" }).click();
  await page.getByRole("button", { name: "Question navigator (0/100 answered)" }).click();
  await page.getByRole("button", { name: "Go to question 61", exact: true }).click();
  await expect(page.locator(".question-tags").getByText("Physics", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
