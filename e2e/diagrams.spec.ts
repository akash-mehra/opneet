import { test, expect } from "@playwright/test";

async function begin(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "View mini test" }).click();
  await page.getByRole("button", { name: "Begin 110-minute test" }).click();
  return page.evaluate(() => JSON.parse(localStorage.getItem("opneet.study.v1")!).active);
}

test("only the ten selected Physics setups have labelled diagrams", async ({ page }) => {
  const session = await begin(page);
  const illustrated = session.questions.filter((q: { diagram?: object }) => q.diagram);
  expect(illustrated).toHaveLength(10);
  expect(illustrated.every((q: { subject: string }) => q.subject === "Physics")).toBe(true);
  await expect(page.locator(".question-diagram")).toHaveCount(0);
  for (const q of illustrated) {
    const index = session.questions.findIndex((item: { id: string }) => item.id === q.id);
    await page.getByRole("button", { name: `Go to question ${index + 1}`, exact: true }).click();
    await expect(page.getByRole("img", { name: q.diagram.title, exact: true })).toBeVisible();
    await expect(page.getByRole("img")).toHaveAttribute("aria-describedby", /desc$/);
    expect(await page.locator(".question-diagram svg text").evaluateAll(nodes => nodes.every(node => {
      const b = node.getBoundingClientRect();
      const svg = (node as SVGGraphicsElement).ownerSVGElement!.getBoundingClientRect();
      return b.left >= svg.left - 1 && b.top >= svg.top - 1 && b.right <= svg.right + 1 && b.bottom <= svg.bottom + 1;
    }))).toBe(true);
  }
});

test("unchanged older attempts gain diagrams without resetting answers or deadline, including results", async ({ page }) => {
  const session = await begin(page);
  const index = session.questions.findIndex((q: { id: string }) => q.id === "mini01-p28");
  await page.getByRole("button", { name: `Go to question ${index + 1}`, exact: true }).click();
  await page.getByRole("group", { name: "Answer options" }).getByRole("button").first().click();
  await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem("opneet.study.v1")!);
    for (const q of state.active.questions) { delete q.diagram; q.revision = 1; }
    localStorage.setItem("opneet.study.v1", JSON.stringify(state));
  });
  await page.reload();
  await expect(page.getByRole("img", { name: "Disc with an off-centre circular hole" })).toBeVisible();
  const restored = await page.evaluate(() => JSON.parse(localStorage.getItem("opneet.study.v1")!).active);
  expect(restored.deadline).toBe(session.deadline);
  expect(restored.answers["mini01-p28"].selected).toBe(0);
  expect(restored.questions[index].revision).toBe(1);
  expect(restored.questions[index].diagram).toBeUndefined();
  await page.getByRole("button", { name: /^Finish(?: session)?$/ }).click();
  await page.getByRole("button", { name: "Submit & see results" }).click();
  await page.getByRole("button", { name: "All", exact: true }).click();
  await page.locator(".result-question-toggle").filter({ hasText: session.questions[index].prompt }).click();
  await expect(page.getByRole("img", { name: "Disc with an off-centre circular hole" })).toBeVisible();
});

test("all diagrams fit a narrow phone and remain readable in dark mode", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  const session = await begin(page);
  await page.evaluate(() => document.documentElement.dataset.theme = "dark");
  await page.getByRole("button", { name: "Question navigator (0/100 answered)" }).click();
  for (const q of session.questions.filter((q: { diagram?: object }) => q.diagram)) {
    const index = session.questions.findIndex((item: { id: string }) => item.id === q.id);
    await page.getByRole("button", { name: `Go to question ${index + 1}`, exact: true }).click();
    await expect(page.getByRole("img", { name: q.diagram.title, exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const colors = await page.locator(".question-diagram svg text").first().evaluate(node => ({
      fill: getComputedStyle(node).fill,
      ink: getComputedStyle(document.documentElement).getPropertyValue("--ink").trim(),
    }));
    expect(colors.fill).not.toBe("none");
    expect(colors.ink).not.toBe("");
  }
});
