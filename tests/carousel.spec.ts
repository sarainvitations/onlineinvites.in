import { test, expect } from "@playwright/test";

test("carousel arrows, keyboard boundaries and native scroll stay in one row", async ({
  page,
  isMobile,
}) => {
  await page.goto("/designs?collection=Premium");
  const carousel = page.getByRole("region", {
    name: "Invitation designs",
    exact: true,
  });
  const track = page.locator("#design-carousel-track");
  await carousel.scrollIntoViewIfNeeded();
  await expect(
    carousel.getByRole("button", { name: "Previous designs" }),
  ).toBeDisabled();
  await carousel.getByRole("button", { name: "Next designs" }).click();
  await expect(page).toHaveURL(/slide=lunar-nocturne/);
  await expect(
    carousel.getByRole("button", { name: "Previous designs" }),
  ).toBeEnabled();
  expect(await track.evaluate((e) => e.scrollLeft)).toBeGreaterThan(0);
  const rows = await track
    .locator("article")
    .evaluateAll(
      (cards) =>
        new Set(
          cards.map((card) => Math.round((card as HTMLElement).offsetTop)),
        ).size,
    );
  expect(rows).toBe(1);
  await track.focus();
  await page.keyboard.press("End");
  await expect(
    carousel.getByRole("button", { name: "Next designs" }),
  ).toBeDisabled();
  await page.keyboard.press("Home");
  await expect(
    carousel.getByRole("button", { name: "Previous designs" }),
  ).toBeDisabled();
  await track.evaluate((e) =>
    e.scrollTo({ left: e.clientWidth, behavior: "instant" }),
  );
  await expect(
    carousel.getByRole("button", { name: "Previous designs" }),
  ).toBeEnabled();
  expect(
    await carousel.evaluate((e) => e.getBoundingClientRect().height),
  ).toBeLessThan(isMobile ? 680 : 650);
  expect(
    await page.locator("html").evaluate((e) => e.scrollWidth - e.clientWidth),
  ).toBeLessThanOrEqual(1);
});

test("return from premium invitation restores filters, slide, vertical position and focus", async ({
  page,
}) => {
  await page.goto("/designs?collection=Premium&q=gold");
  const track = page.locator("#design-carousel-track");
  await track.focus();
  await page.keyboard.press("End");
  const last = track.locator("article").last();
  const preview = last.locator("a").first();
  const target = await preview.getAttribute("href");
  await preview.click();
  await expect(page).toHaveURL(new RegExp(`${target}$`));
  await page
    .getByRole("button", { name: "Open invitation", exact: true })
    .click();
  await expect(page.locator(".premium-names")).toBeFocused();
  await page.getByRole("link", { name: "All designs", exact: true }).click();
  await expect(page).toHaveURL(
    /collection=Premium&q=gold&slide=.*#design-carousel/,
  );
  await expect(page.getByRole("searchbox")).toHaveValue("gold");
  const restored = page
    .locator("#design-carousel-track")
    .locator(`a[href="${target}"]`)
    .first();
  await expect(restored).toBeFocused();
  await expect(restored).toBeInViewport();
  expect(
    await page.locator("#design-carousel-track").evaluate((e) => e.scrollLeft),
  ).toBeGreaterThan(0);
  const top = await page
    .locator("#design-carousel")
    .evaluate((e) => e.getBoundingClientRect().top);
  expect(top).toBeGreaterThanOrEqual(0);
  expect(top).toBeLessThan(160);
  await page.reload();
  await expect(restored).toBeInViewport();
});

test("direct original demo links return to their place in the full carousel", async ({
  page,
}) => {
  await page.goto("/designs/marigold-mornings");
  await page.getByRole("link", { name: "All designs", exact: true }).click();
  await expect(page).toHaveURL(/slide=marigold-mornings#design-carousel/);
  await expect(
    page.getByRole("link", { name: "Preview Marigold Mornings", exact: true }),
  ).toBeInViewport();
});

test("homepage demo returns to the featured carousel", async ({ page }) => {
  await page.goto("/");
  const carousel = page.getByRole("region", {
    name: "Featured invitation designs",
  });
  await carousel.scrollIntoViewIfNeeded();
  await carousel
    .getByRole("link", { name: "Preview The Garden Edit", exact: true })
    .click();
  await page.getByRole("link", { name: "All designs", exact: true }).click();
  await expect(page).toHaveURL(/\/?slide=the-garden-edit#designs/);
  await expect(
    page.getByRole("link", { name: "Preview The Garden Edit", exact: true }),
  ).toBeFocused();
  await expect(carousel).toBeInViewport();
});

test("browser Back preserves a settled carousel position; changing filters resets it", async ({
  page,
}) => {
  await page.goto("/designs?collection=Premium");
  await page.getByRole("button", { name: "Next designs", exact: true }).click();
  await expect(page).toHaveURL(/slide=lunar-nocturne/);
  await page
    .getByRole("link", { name: "Preview Lunar Nocturne", exact: true })
    .click();
  await page.goBack();
  await expect(page).toHaveURL(/slide=lunar-nocturne/);
  expect(
    await page.locator("#design-carousel-track").evaluate((e) => e.scrollLeft),
  ).toBeGreaterThan(0);
  await expect(
    page.getByRole("link", { name: "Preview Lunar Nocturne", exact: true }),
  ).toBeInViewport();
  await page.getByRole("button", { name: "Wedding", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("2 designs to discover");
  expect(
    await page.locator("#design-carousel-track").evaluate((e) => e.scrollLeft),
  ).toBe(0);
});


test("homepage features three Basic and three Premium cards", async ({ page }) => {
  await page.goto('/');
  const carousel = page.getByRole('region', { name: 'Featured invitation designs' });
  await expect(carousel.locator('article')).toHaveCount(6);
  await expect(carousel.locator('.premium-card-badge').filter({ hasText: /^Basic$/ })).toHaveCount(3);
  await expect(carousel.locator('.premium-card-badge').filter({ hasText: /^Premium$/ })).toHaveCount(3);
  await expect(page.getByRole('link', { name: 'Explore all cards', exact: true })).toHaveAttribute('href', '/designs');
  await expect(carousel.getByRole('button', { name: 'Next designs' })).toBeEnabled();
});
