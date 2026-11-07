import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
const reference = "OI-11111111-1111-4111-8111-111111111111";
async function setup(page: Page, mode: "local" | "production" = "local") {
  await page.route("**/api/config", (route) =>
    route.fulfill({
      json: { available: true, mode, siteKey: "test-public-key" },
    }),
  );
  await page.route(
    "https://challenges.cloudflare.com/turnstile/v0/api.js*",
    (route) =>
      route.fulfill({
        contentType: "application/javascript",
        body: `let count=0;window.turnstile={render(node,options){window.widgetOptions=options;window.widgetSize=options.size;const field=document.createElement('input');field.name='cf-turnstile-response';field.type='hidden';node.append(field);setTimeout(()=>{field.value='TEST_TOKEN_'+(++count);options.callback(field.value)},0);return 'test-widget'},remove(){}};`,
      }),
  );
}
async function review(page: Page) {
  await page.goto("/request-quote?template=velvet-overture");
  await page.getByLabel("Full name").fill("Submission Test");
  await page.getByLabel("Email address").fill("submission@example.com");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Event date").fill("2099-12-18");
  await page.getByLabel("Preferred publication date").fill("2099-12-01");
  for (let i = 0; i < 4; i++)
    await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("checkbox", { name: /I agree|I consent/ }).check();
}
const save = (page: Page) =>
  page.getByRole("button", {
    name: /Save test enquiry locally|Send quotation request/,
  });
test("local submission confirms a returned reference and downloadable stored copy only after success", async ({
  page,
}) => {
  await setup(page);
  const bodies: any[] = [];
  await page.route("**/api/enquiries", async (route) => {
    bodies.push(route.request().postDataJSON());
    await route.fulfill({
      status: 201,
      json: { ok: true, reference, mode: "local", duplicate: false },
    });
  });
  await review(page);
  await save(page).click();
  await expect(page.getByRole("status")).toContainText(
    "Test enquiry stored locally.",
  );
  await expect(page.getByRole("status")).toBeFocused();
  await expect(page.getByRole("status")).toContainText(reference);
  expect(bodies).toHaveLength(1);
  expect(bodies[0].requirements.privacyConsent).toBe(true);
  expect(bodies[0].requestId).toMatch(/^[0-9a-f-]{36}$/);
  expect(bodies[0].turnstileToken).toMatch(/^TEST_TOKEN_/);
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download your copy", exact: true })
    .click();
  const download = await downloadPromise;
  const saved = JSON.parse(readFileSync((await download.path())!, "utf8"));
  expect(saved.status).toBe("local-test-enquiry");
  expect(saved.reference).toBe(reference);
  await page.getByRole("button", { name: "Start a new request" }).click();
  await expect(page.getByLabel("Full name")).toHaveValue("");
});
test("production mode uses request-received copy and does not promise an email or accepted quote", async ({
  page,
}) => {
  await setup(page, "production");
  await page.route("**/api/enquiries", (route) =>
    route.fulfill({
      status: 201,
      json: { ok: true, reference, mode: "production" },
    }),
  );
  await review(page);
  await save(page).click();
  await expect(page.getByRole("status")).toContainText(
    "Your quotation request is received.",
  );
  await expect(page.getByRole("status")).toContainText(
    "not quotation acceptance or payment",
  );
});
test("expired verification resets and retries keep a stable request identifier", async ({
  page,
}) => {
  await setup(page);
  const bodies: any[] = [];
  await page.route("**/api/enquiries", async (route) => {
    bodies.push(route.request().postDataJSON());
    await route.fulfill(
      bodies.length === 1
        ? {
            status: 400,
            json: {
              ok: false,
              code: "VERIFICATION_EXPIRED",
              message: "Complete spam verification again, then retry.",
            },
          }
        : { status: 201, json: { ok: true, reference, mode: "local" } },
    );
  });
  await review(page);
  await save(page).click();
  await expect(page.getByRole("alert")).toContainText(
    "Complete spam verification again",
  );
  await expect(
    page.getByText("Submission Test", { exact: true }),
  ).toBeVisible();
  await save(page).click();
  await expect(page.getByRole("status")).toContainText(reference);
  expect(bodies[0].requestId).toBe(bodies[1].requestId);
  expect(bodies[0].turnstileToken).not.toBe(bodies[1].turnstileToken);
});
test("uncertain network outcome preserves details and retry recovers the same request safely", async ({
  page,
}) => {
  await setup(page);
  const ids: string[] = [];
  await page.route("**/api/enquiries", async (route) => {
    ids.push(route.request().postDataJSON().requestId);
    if (ids.length === 1) await route.abort("failed");
    else
      await route.fulfill({
        status: 200,
        json: { ok: true, reference, mode: "local", duplicate: true },
      });
  });
  await review(page);
  await save(page).click();
  await expect(page.getByRole("alert")).toContainText(
    "could not confirm whether",
  );
  await save(page).click();
  await expect(page.getByRole("status")).toContainText(
    "existing reference has been recovered",
  );
  expect(ids[0]).toBe(ids[1]);
});
test("pending submission locks edits, navigation and repeat submission", async ({
  page,
}) => {
  await setup(page);
  let finish: () => void = () => {};
  const gate = new Promise<void>((resolve) => {
    finish = resolve;
  });
  let count = 0;
  await page.route("**/api/enquiries", async (route) => {
    count++;
    await gate;
    await route.fulfill({
      status: 201,
      json: { ok: true, reference, mode: "local" },
    });
  });
  await review(page);
  await save(page).click();
  await expect(
    page.getByRole("button", { name: "Saving your request…" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Back", exact: true }),
  ).toBeDisabled();
  await expect(page.getByRole("checkbox", { name: /I agree/ })).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Step 1: Contact" }),
  ).toBeDisabled();
  finish();
  await expect(page.getByRole("status")).toContainText(reference);
  expect(count).toBe(1);
});
test("server field errors return to the right step without discarding input", async ({
  page,
}) => {
  await setup(page);
  await page.route("**/api/enquiries", (route) =>
    route.fulfill({
      status: 400,
      json: {
        ok: false,
        code: "VALIDATION_FAILED",
        message: "Review your requirements.",
        errors: { email: "Please correct this email." },
      },
    }),
  );
  await review(page);
  await save(page).click();
  await expect(
    page.getByRole("heading", { name: "About you", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Full name")).toHaveValue("Submission Test");
  await expect(page.getByRole("alert")).toContainText(
    "Please correct this email.",
  );
});
test("rate-limit and storage failures keep the review and never show a receipt", async ({
  page,
}) => {
  await setup(page);
  let calls = 0;
  await page.route("**/api/enquiries", (route) => {
    calls++;
    return route.fulfill(
      calls === 1
        ? {
            status: 429,
            json: {
              ok: false,
              code: "RATE_LIMITED",
              message: "Too many attempts.",
            },
          }
        : {
            status: 503,
            json: {
              ok: false,
              code: "STORAGE_UNAVAILABLE",
              message: "We could not save your enquiry.",
            },
          },
    );
  });
  await review(page);
  await save(page).click();
  await expect(page.getByRole("alert")).toContainText("wait");
  await expect(page.locator(".quote-submission-receipt")).toHaveCount(0);
  await save(page).click();
  await expect(page.getByRole("alert")).toContainText("could not save");
  await expect(
    page.getByText("Submission Test", { exact: true }),
  ).toBeVisible();
});
test("expired widget cannot submit; 320px mode uses compact verification", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await setup(page);
  let calls = 0;
  await page.route("**/api/enquiries", (route) => {
    calls++;
    return route.fulfill({
      status: 201,
      json: { ok: true, reference, mode: "local" },
    });
  });
  await review(page);
  expect(await page.evaluate(() => (window as any).widgetSize)).toBe("compact");
  await page.evaluate(() =>
    (window as any).widgetOptions["expired-callback"](),
  );
  await save(page).click();
  await expect(page.getByRole("alert")).toContainText(
    "Complete spam verification",
  );
  expect(calls).toBe(0);
  expect(
    await page
      .locator("html")
      .evaluate((element) => element.scrollWidth - element.clientWidth),
  ).toBeLessThanOrEqual(1);
});

test("blocked verification script shows a recoverable error and never silently bypasses verification", async ({
  page,
}) => {
  await setup(page);
  const blocked = async (route: any) => route.abort("failed");
  await page.route(
    "https://challenges.cloudflare.com/turnstile/v0/api.js*",
    blocked,
  );
  let calls = 0;
  await page.route("**/api/enquiries", (route) => {
    calls++;
    return route.fulfill({
      status: 201,
      json: { ok: true, reference, mode: "local" },
    });
  });
  await review(page);
  await expect(page.locator('.quote-turnstile [role="alert"]')).toContainText(
    "could not load",
  );
  await save(page).click();
  expect(calls).toBe(0);
  await page.unroute(
    "https://challenges.cloudflare.com/turnstile/v0/api.js*",
    blocked,
  );
  await page.getByRole("button", { name: "try verification again" }).click();
  await save(page).click();
  await expect(page.getByRole("status")).toContainText(reference);
  expect(calls).toBe(1);
});
