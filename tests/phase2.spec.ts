import { test, expect } from "@playwright/test";
import { templates } from "../src/data/templates";
let runtimeErrors: string[] = [];
test.beforeEach(async ({ page }) => {
  runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
});
test.afterEach(async () => {
  expect(runtimeErrors).toEqual([]);
});
const demos = templates.map((template) => template.id);
test("gallery search, occasion filters, empty state and URL state", async ({
  page,
}) => {
  await page.goto("/designs");
  await expect(page.getByRole("status")).toHaveText("18 designs to discover");
  await page.getByRole("searchbox").fill("BOTANICAL");
  await expect(page.getByRole("status")).toHaveText("1 design to discover");
  await expect(
    page.getByRole("heading", { name: "The Garden Edit" }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByRole("searchbox")).toHaveValue("BOTANICAL");
  await page.getByRole("button", { name: "Clear search" }).click();
  await page.getByRole("button", { name: "Nikah", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Under the Stars" }),
  ).toBeVisible();
  await expect(page.getByRole("status")).toHaveText("2 designs to discover");
  await page.getByRole("button", { name: "Aqiqah", exact: true }).click();
  await page.getByRole("searchbox").fill("no-matching-invitation");
  await expect(
    page.getByRole("heading", { name: "A story still to be designed." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Explore all designs" }).click();
  await expect(page.getByRole("status")).toHaveText("18 designs to discover");
  await expect(page.locator("html")).toHaveJSProperty(
    "scrollWidth",
    await page.locator("html").evaluate((e) => e.clientWidth),
  );
});
for (const id of demos)
  test(`invitation ${id}: opening, venue, replay and selected-design handoff`, async ({
    page,
  }) => {
    await page.goto(`/designs/${id}`);
    await expect(
      page.getByRole("button", {
        name: /Open invitation|Let’s celebrate|Come on in/,
      }),
    ).toBeVisible();
    await page
      .getByRole("button", {
        name: /Open invitation|Let’s celebrate|Come on in/,
      })
      .click();
    const heading = page.locator(".demo-hero h1, .premium-names");
    await expect(heading).toBeVisible();
    await expect(heading).toBeFocused();
    await expect(
      page.getByRole("heading", {
        name: "The celebration",
        exact: true,
        level: 2,
      }),
    ).toBeVisible();
    const map = page.getByRole("link", { name: "View sample map" });
    await expect(map).toHaveAttribute(
      "href",
      /^https:\/\/www.google.com\/maps\/search\/\?api=1&query=/,
    );
    await expect(page.locator("html")).toHaveJSProperty(
      "scrollWidth",
      await page.locator("html").evaluate((e) => e.clientWidth),
    );
    await page.getByRole("button", { name: "Replay opening" }).click();
    await expect(
      page.getByRole("button", {
        name: /Open invitation|Let’s celebrate|Come on in/,
      }),
    ).toBeFocused();
    await page
      .getByRole("link", { name: "Request Similar Design", exact: true })
      .click();
    await expect(page).toHaveURL(
      (url) =>
        url.pathname === "/request-quote" &&
        url.searchParams.get("template") === id,
    );
    await expect(page.locator(".quote-starting-point")).toBeVisible();
  });
test("pricing shows package scope, hosting and all domain choices", async ({
  page,
}) => {
  await page.goto("/pricing");
  for (const name of ["Basic", "Premium", "Custom"])
    await expect(
      page.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
  await expect(page.getByText("₹499", { exact: true })).toBeVisible();
  await expect(page.getByText("₹1,499", { exact: true })).toBeVisible();
  await expect(page.getByText("₹2,999", { exact: true })).toBeVisible();
  for (const name of [
    "Standard invitation URL",
    "Personalized subdomain",
    "Your existing domain",
    "A new custom domain",
  ])
    await expect(
      page.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
  await page
    .getByRole("link", { name: "Request a Free Quote", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/request-quote\?package=basic/);
  await expect(page.locator(".quote-package-note")).toContainText("Basic");
});
test("navigation works on mobile and desktop", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile)
    await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Our designs" })
    .click();
  await expect(page).toHaveURL(/\/designs$/);
  if (isMobile) {
    await expect(
      page.getByRole("button", { name: "Open navigation" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Open navigation" }).click();
  }
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Pricing", exact: true })
    .click();
  await expect(page).toHaveURL(/\/pricing$/);
});
test("reduced motion retains an operable invitation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/designs/the-garden-edit");
  await page.getByRole("button", { name: "Open invitation" }).click();
  await expect(page.locator(".demo-hero h1, .premium-names")).toBeFocused();
});

test("unknown invitation has a recovery link", async ({ page }) => {
  await page.goto("/designs/not-a-real-design");
  await expect(
    page.getByRole("heading", { name: "This invitation hasn’t been written." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Back to designs" }).click();
  await expect(page.getByRole("status")).toHaveText("18 designs to discover");
});
test("layouts fit a narrow 320px screen", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const path of [
    "/",
    "/pricing",
    "/designs",
    ...demos.map((id) => `/designs/${id}`),
  ]) {
    await page.goto(path);
    if (demos.some((id) => path === `/designs/${id}`)) {
      await page
        .getByRole("button", {
          name: /Open invitation|Let’s celebrate|Come on in/,
        })
        .click();
      await expect(page.locator(".demo-hero h1, .premium-names")).toBeVisible();
    } else await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.locator("html").evaluate((e) => e.scrollWidth - e.clientWidth),
      path,
    ).toBeLessThanOrEqual(1);
  }
});
test("mobile navigation returns focus on Escape", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Open navigation" });
  await toggle.click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Our designs" })
    .focus();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
});

test("premium collection is distinct and the basic collection remains", async ({
  page,
}) => {
  await page.goto("/designs?collection=Premium");
  await expect(page.getByRole("status")).toHaveText("12 designs to discover");
  await expect(
    page.getByRole("heading", { name: "Velvet Overture" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "The Garden Edit" }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Basic collection 6", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("6 designs to discover");
  await expect(
    page.getByRole("heading", { name: "The Garden Edit" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Basic collection 6", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});
test("premium animation can be skipped, replayed and activated once", async ({
  page,
}) => {
  await page.goto("/designs/velvet-overture");
  const open = page.getByRole("button", {
    name: "Open invitation",
    exact: true,
  });
  await open.click();
  await expect(open).toBeDisabled();
  await page.getByRole("button", { name: "Skip animation" }).click();
  await expect(page.locator(".premium-names")).toBeFocused();
  await expect(page.locator(".premium-experience")).not.toHaveAttribute(
    "inert",
  );
  await page.getByRole("button", { name: "Replay opening" }).click();
  await expect(open).toBeFocused();
  await open.press("Enter");
  await expect(page.locator(".premium-names")).toBeFocused();
});
test("all premium scenes open immediately with reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const template of templates.filter((template) => template.premium)) {
    await page.goto(`/designs/${template.id}`);
    await page
      .getByRole("button", { name: "Open invitation", exact: true })
      .click();
    await expect(page.locator(".premium-names")).toBeFocused();
    await expect(
      page.getByRole("button", { name: "Skip animation" }),
    ).toHaveCount(0);
  }
});
