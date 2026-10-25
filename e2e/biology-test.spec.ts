import { test, expect } from "@playwright/test";
import type { Session } from "../src/domain/types";

async function begin(page: import("@playwright/test").Page): Promise<Session> {
  await page.goto("/");
  await page.getByRole("button", { name: "View biology test" }).click();
  await expect(page.getByRole("dialog", { name: "Mini Test 02 · Biology", exact: true })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("opneet.study.v1")!).active)).toBeNull();
  await page.getByRole("button", { name: "Begin 90-minute biology test" }).click();
  return page.evaluate(() => JSON.parse(localStorage.getItem("opneet.study.v1")!).active);
}

test("90-question biology exam restores its timer and answer, then shows diagrams in review without metadata tags", async ({ page }) => {
  const session = await begin(page);
  expect(session.questions).toHaveLength(90);
  expect(session.deadline! - session.startedAt).toBe(90 * 60_000);
  expect(session.questions.every(q => q.subject === "Biology")).toBe(true);
  expect(session.questions.filter(q => q.id.startsWith("mini01-b"))).toHaveLength(12);
  expect(session.questions.filter(q => q.diagram)).toHaveLength(6);
  expect(session.questions.every(q => q.topic && q.difficulty)).toBe(true);
  await expect(page.locator(".question-tags")).toHaveText("Biology");
  await expect(page.getByRole("button", { name: "Check answer", exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Let’s understand why." })).toHaveCount(0);
  await page.getByRole("group", { name: "Answer options" }).getByRole("button").nth(session.questions[0].correct).click();
  const illustrated = session.questions.filter(q => q.diagram);
  for (const q of illustrated) {
    await page.getByRole("button", { name: `Go to question ${session.questions.findIndex(item => item.id === q.id) + 1}`, exact: true }).click();
    await expect(page.getByRole("img", { name: q.diagram!.title, exact: true })).toBeVisible();
    await expect(page.locator(".question-tags")).toHaveText("Biology");
  }
  await page.reload();
  await expect(page.getByRole("group", { name: "Answer options" })).toBeVisible();
  const restored: Session = await page.evaluate(() => JSON.parse(localStorage.getItem("opneet.study.v1")!).active);
  expect(restored.deadline).toBe(session.deadline);
  expect(restored.answers[session.questions[0].id].selected).toBe(session.questions[0].correct);
  await page.getByRole("button", { name: /^Finish(?: session)?$/ }).click();
  await page.getByRole("button", { name: "Submit & see results" }).click();
  await page.getByRole("button", { name: "All", exact: true }).click();
  await expect(page.locator(".result-question-toggle")).toHaveCount(90);
  expect(await page.locator(".result-question-toggle small").allTextContents()).toEqual(Array(90).fill("Biology"));
  for (const q of illustrated) {
    await page.locator(".result-question-toggle").filter({ hasText: q.prompt }).click();
    await expect(page.getByRole("img", { name: q.diagram!.title, exact: true })).toBeVisible();
    await expect(page.locator(".result-answer")).toContainText(q.explanation);
  }
});

test("biology preflight and all six diagrams fit narrow phones, with readable labels in dark mode", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await page.goto("/");
  await page.getByRole("button", { name: "View biology test" }).click();
  expect(await page.getByRole("dialog").evaluate(e => e.scrollWidth <= e.clientWidth)).toBe(true);
  await page.getByRole("button", { name: "Not now", exact: true }).click();
  await expect(page.getByRole("button", { name: "View biology test" })).toBeFocused();
  const session = await begin(page);
  await page.evaluate(() => document.documentElement.dataset.theme = "dark");
  await page.getByRole("button", { name: "Question navigator (0/90 answered)" }).click();
  for (const q of session.questions.filter(q => q.diagram)) {
    await page.getByRole("button", { name: `Go to question ${session.questions.findIndex(item => item.id === q.id) + 1}`, exact: true }).click();
    await expect(page.getByRole("img", { name: q.diagram!.title, exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.locator(".question-diagram svg text").evaluateAll(nodes => nodes.every(node => {
      const b = node.getBoundingClientRect();
      const svg = (node as SVGGraphicsElement).ownerSVGElement!.getBoundingClientRect();
      return b.left >= svg.left - 1 && b.top >= svg.top - 1 && b.right <= svg.right + 1 && b.bottom <= svg.bottom + 1;
    }))).toBe(true);
  }
});
