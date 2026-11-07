import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { todayInIndia } from "../src/features/quote/model";
const dateAfter = (days: number) =>
  new Date(new Date(`${todayInIndia()}T00:00:00Z`).getTime() + days * 86400000)
    .toISOString()
    .slice(0, 10);
async function contact(page: Page) {
  await page.getByLabel("Full name").fill("Ananya Rao");
  await page.getByLabel("Email address").fill("ananya@example.com");
}
async function next(page: Page) {
  await page.getByRole("button", { name: "Continue", exact: true }).click();
}
async function event(page: Page) {
  await page.getByLabel("Occasion", { exact: false }).selectOption("Wedding");
  await page.getByLabel("Event date", { exact: false }).fill(dateAfter(90));
  await page.getByLabel("Preferred publication date").fill(dateAfter(60));
}
async function toHosting(page: Page) {
  await contact(page);
  await next(page);
  await event(page);
  await next(page);
  await next(page);
  await next(page);
  await expect(
    page.getByRole("heading", {
      name: "A home for your invitation",
      exact: true,
    }),
  ).toBeVisible();
}
async function toReview(page: Page) {
  await toHosting(page);
  await next(page);
  await expect(
    page.getByRole("heading", { name: "Review your story", exact: true }),
  ).toBeVisible();
}
let errors: string[] = [];
test.beforeEach(async ({ page }) => {
  errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
});
test.afterEach(() => expect(errors).toEqual([]));

test("required contact validation focuses the error summary and links focus controls", async ({
  page,
}) => {
  await page.goto("/request-quote");
  await next(page);
  await expect(page.getByRole("alert")).toBeFocused();
  await expect(page.getByRole("alert")).toContainText(
    "Please enter your full name.",
  );
  await page
    .getByRole("alert")
    .getByRole("link", { name: "Please enter your full name." })
    .click();
  await expect(page.getByLabel("Full name")).toBeFocused();
  await contact(page);
  await next(page);
  await expect(
    page.getByRole("heading", { name: "Your celebration", exact: true }),
  ).toBeFocused();
});
test("WhatsApp preference requires a country-code number", async ({ page }) => {
  await page.goto("/request-quote");
  await contact(page);
  await page.getByRole("radio", { name: "WhatsApp", exact: true }).check();
  await next(page);
  await expect(page.getByRole("alert")).toContainText("Add a WhatsApp number");
  await page.getByLabel("WhatsApp number").fill("9876543210");
  await next(page);
  await expect(page.getByRole("alert")).toContainText("Include a country code");
  await page.getByLabel("WhatsApp number").fill("+91 98765 43210");
  await next(page);
  await expect(
    page.getByRole("heading", { name: "Your celebration", exact: true }),
  ).toBeVisible();
});
test("event dates, languages and conditional inputs are validated", async ({
  page,
}) => {
  await page.goto("/request-quote");
  await contact(page);
  await next(page);
  await event(page);
  await page.getByLabel("Preferred publication date").fill(dateAfter(100));
  await next(page);
  await expect(page.getByRole("alert")).toContainText(
    "Publication must be on or before",
  );
  await page.getByLabel("Preferred publication date").fill(dateAfter(60));
  await page.getByRole("checkbox", { name: "English", exact: true }).uncheck();
  await next(page);
  await expect(page.getByRole("alert")).toContainText(
    "Choose at least one language",
  );
  await page.getByRole("checkbox", { name: "Other", exact: true }).check();
  await next(page);
  await expect(page.getByRole("alert")).toContainText(
    "Tell us which other languages",
  );
  await page.getByLabel("Other languages").fill("French");
  await next(page);
  await expect(
    page.getByRole("heading", { name: "Your design", exact: true }),
  ).toBeVisible();
});
test("selected design/package prefill and invalid query parameters", async ({
  page,
}) => {
  await page.goto("/request-quote?template=velvet-overture&package=premium");
  await expect(page.locator(".quote-starting-point")).toContainText(
    "Velvet Overture",
  );
  await expect(page.locator(".quote-package-note")).toContainText("Premium");
  await contact(page);
  await next(page);
  await expect(page.getByLabel("Occasion")).toHaveValue("Wedding");
  await event(page);
  await next(page);
  await expect(page.getByLabel("Selected design / inspiration")).toHaveValue(
    "velvet-overture",
  );
  await expect(page.getByLabel("Package preference")).toHaveValue("premium");
  await page.goto("/request-quote?template=missing&package=missing");
  await expect(page.locator(".quote-starting-point")).toHaveCount(0);
  await expect(page.locator(".quote-package-note")).toHaveCount(0);
});
test("hex colors and reference links show actionable validation", async ({
  page,
}) => {
  await page.goto("/request-quote");
  await contact(page);
  await next(page);
  await event(page);
  await next(page);
  await page.getByLabel("Hex color values").fill("bad");
  await page.getByLabel("Reference links").fill("javascript:alert(1)");
  await next(page);
  await expect(page.getByRole("alert")).toContainText("Use hex colors");
  await expect(page.getByRole("alert")).toContainText("Add valid http://");
  await page.getByLabel("Hex color values").fill("#abc, #D4B879");
  await page.getByLabel("Reference links").fill("https://example.com/design");
  await next(page);
  await expect(
    page.getByRole("heading", { name: "The little extras", exact: true }),
  ).toBeVisible();
});
test("optional features and other requirements can be selected and retained", async ({
  page,
}) => {
  await page.goto("/request-quote");
  await contact(page);
  await next(page);
  await event(page);
  await next(page);
  await next(page);
  await page
    .getByRole("checkbox", { name: "Photo gallery", exact: true })
    .check();
  await page
    .getByRole("checkbox", { name: "Other custom requirements", exact: true })
    .check();
  await next(page);
  await expect(page.getByRole("alert")).toContainText(
    "Tell us about the other features",
  );
  await page
    .getByLabel("Other feature requirements")
    .fill("An illustrated timeline.");
  await next(page);
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(
    page.getByRole("checkbox", { name: "Photo gallery", exact: true }),
  ).toBeChecked();
  await expect(page.getByLabel("Other feature requirements")).toHaveValue(
    "An illustrated timeline.",
  );
});
test("hosting estimate, integer validation and conditional domains", async ({
  page,
}) => {
  await page.goto("/request-quote");
  await toHosting(page);
  await expect(page.locator(".hosting-estimate strong")).toHaveText("₹0");
  await page.getByLabel("Requested hosting duration").fill("45");
  await expect(page.locator(".hosting-estimate strong")).toHaveText("₹75");
  await page.getByLabel("Requested hosting duration").fill("1.5");
  await expect(page.locator(".hosting-estimate strong")).toHaveText("—");
  await next(page);
  await expect(page.getByRole("alert")).toContainText("whole number of days");
  await page.getByLabel("Requested hosting duration").fill("45");
  await page.getByRole("radio", { name: /Personalized subdomain/ }).check();
  await page.getByLabel("Preferred subdomain").fill("-bad");
  await next(page);
  await expect(page.getByRole("alert")).toContainText("Use 1–63 letters");
  await page.getByLabel("Preferred subdomain").fill("our-story");
  await expect(page.locator(".quote-address")).toContainText(
    "our-story.onlineinvites.in",
  );
  await page.getByRole("radio", { name: /My existing custom domain/ }).check();
  await page.getByLabel("Your existing domain").fill("https://ourday.in");
  await next(page);
  await expect(page.getByRole("alert")).toContainText("Enter a domain");
  await page.getByLabel("Your existing domain").fill("ourday.in");
  await next(page);
  await expect(
    page.getByRole("heading", { name: "Review your story", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("₹75 (15 extra days × ₹5/day)", { exact: true }),
  ).toBeVisible();
});
test("review edits retain fields and require consent before local export; no submission occurs", async ({
  page,
}) => {
  const submissions: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST" || request.url().includes("/api/enquiries"))
      submissions.push(request.url());
  });
  await page.goto("/request-quote?template=the-garden-edit");
  await toReview(page);
  await page.getByRole("button", { name: "Edit contact details" }).click();
  await expect(page.getByLabel("Full name")).toHaveValue("Ananya Rao");
  await page.getByLabel("Full name").fill("Ananya Shah");
  await page
    .getByRole("button", { name: "Return to requirements review" })
    .click();
  await expect(page.getByText("Ananya Shah", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Check my requirements" }).click();
  await expect(page.getByRole("alert")).toContainText("confirm your consent");
  await page.getByRole("checkbox", { name: /I consent/ }).check();
  await page.getByRole("button", { name: "Check my requirements" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Nothing has been submitted.",
  );
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download requirements", exact: true })
    .click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("online-invites-requirements.json");
  const path = await download.path();
  const output = JSON.parse(readFileSync(path!, "utf8"));
  expect(output.status).toBe("local-requirements-draft");
  expect(output.requirements.fullName).toBe("Ananya Shah");
  expect(output.selectedDesignName).toBe("The Garden Edit");
  expect(output).not.toHaveProperty("id");
  expect(submissions).toEqual([]);
  expect(
    await page.evaluate(() => localStorage.length + sessionStorage.length),
  ).toBe(0);
});
test("values survive back/forward steps but refresh and explicit clear remove personal details", async ({
  page,
}) => {
  await page.goto("/request-quote");
  await contact(page);
  await next(page);
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.getByLabel("Full name")).toHaveValue("Ananya Rao");
  await page.getByText("Clear this form", { exact: true }).click();
  await page.getByRole("button", { name: "Clear entered details" }).click();
  await expect(page.getByLabel("Full name")).toHaveValue("");
  await contact(page);
  await page.reload();
  await expect(page.getByLabel("Full name")).toHaveValue("");
});
test("form steps and review fit a 320px screen with reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/request-quote?template=palace-of-promises");
  const fits = async () =>
    expect(
      await page
        .locator("html")
        .evaluate((element) => element.scrollWidth - element.clientWidth),
    ).toBeLessThanOrEqual(1);
  await fits();
  await contact(page);
  await next(page);
  await fits();
  await event(page);
  await next(page);
  await fits();
  await next(page);
  await fits();
  await next(page);
  await fits();
  await next(page);
  await fits();
  await page.getByRole("checkbox", { name: /I consent/ }).check();
  await page.getByRole("button", { name: "Check my requirements" }).click();
  await fits();
  await expect(page.getByRole("status")).toContainText(
    "Requirements checked locally.",
  );
});
