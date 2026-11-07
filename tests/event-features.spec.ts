import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { demoEventDate, eventTimestamp, remainingTime } from "../src/data/demoEvent";
import { templates } from "../src/data/templates";
const now = new Date("2026-11-08T10:00:00+05:30");
const reference = "RSVP-11111111-1111-4111-8111-111111111111";

test("all demos share the fixed one-month event date and IST counter math handles boundaries", () => {
  expect(demoEventDate).toBe("2026-12-08"); expect(templates.every(t => t.date === demoEventDate)).toBe(true);
  expect(new Date(eventTimestamp(demoEventDate, "12:00 PM IST")).toISOString()).toBe("2026-12-08T06:30:00.000Z");
  expect(new Date(eventTimestamp(demoEventDate, "12:00 AM IST")).toISOString()).toBe("2026-12-07T18:30:00.000Z");
  expect(remainingTime(90061000, 0)).toMatchObject({ days: 1, hours: 1, minutes: 1, seconds: 1, ended: false });
  expect(remainingTime(1000, 1000)).toMatchObject({ days: 0, hours: 0, minutes: 0, seconds: 0, ended: true });
  expect(remainingTime(1000, 2000).seconds).toBe(0);
});

test("countdown ticks from a fixed target, survives reload and closes cleanly at the event", async ({ page }) => {
  await page.clock.install({ time: now }); await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/designs/velvet-overture"); await page.getByRole("button", { name: "Open invitation", exact: true }).click();
  const timer = page.getByRole("timer"); await expect(timer).toBeVisible(); await expect(timer.locator('[data-unit="days"]')).toHaveText("30");
  const before = await timer.locator('[data-unit="seconds"]').textContent(); await page.clock.runFor(1000); expect(await timer.locator('[data-unit="seconds"]').textContent()).not.toBe(before);
  await page.reload(); await page.getByRole("button", { name: "Open invitation", exact: true }).click(); await expect(timer.locator('[data-unit="days"]')).toHaveText("30");
  await page.clock.setSystemTime(new Date(eventTimestamp(demoEventDate, "6:00 PM IST"))); await page.clock.runFor(1000);
  await expect(page.getByRole("heading", { name: "It’s celebration time." })).toBeVisible(); await expect(page.getByText("RSVP has closed because this sample event has started.")).toBeVisible(); await expect(timer).toHaveCount(0);
});

async function fill(page: any) {
  await page.getByLabel("Your name", { exact: true }).fill("Sample Guest"); await page.getByLabel("Email address", { exact: true }).fill("sample@example.com");
  await page.getByRole("radio", { name: "Joyfully accept" }).check(); await page.getByLabel("Number of guests, including you").fill("3");
  await page.locator('#rsvp-privacyConsent').check();
}
async function setup(page: any) {
  await page.clock.install({ time: now }); await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/api/config", (route: any) => route.fulfill({ json: { available: true, mode: "local", siteKey: "test-public-key" } }));
  await page.route("https://challenges.cloudflare.com/turnstile/v0/api.js*", (route: any) => route.fulfill({ contentType: "application/javascript", body: "window.turnstile={render(node,o){window.rsvpWidgetAction=o.action;setTimeout(()=>o.callback('TEST_TOKEN'),0);return 'test'},remove(){}}" }));
  await page.goto("/designs/velvet-overture"); await page.getByRole("button", { name: "Open invitation", exact: true }).click();
}

test("preview RSVP validates, focuses errors and downloads a genuinely unsubmitted draft", async ({ page }) => {
  await page.clock.install({ time: now }); await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/designs/the-garden-edit"); await page.getByRole("button", { name: "Open invitation", exact: true }).click();
  await page.getByRole("button", { name: "Download RSVP draft", exact: true }).click(); await expect(page.locator('.rsvp-errors')).toBeFocused();
  await page.locator('.rsvp-errors').getByRole('link', { name: 'Enter a name between 2 and 100 characters.' }).click(); await expect(page.getByLabel('Your name', { exact: true })).toBeFocused();
  await fill(page); const downloaded = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download RSVP draft', exact: true }).click();
  const file = await downloaded; const draft = JSON.parse(readFileSync((await file.path())!, 'utf8')); expect(draft.status).toBe('unsubmitted-rsvp-draft'); expect(draft.eventDate).toBe(demoEventDate); expect(draft.details.guests).toBe('3'); await expect(page.locator('.rsvp-receipt')).toHaveCount(0);
});

test("RSVP stores through the API with a distinct action and only confirms after success", async ({ page }) => {
  await setup(page); const bodies: any[] = []; await page.route('**/api/rsvps', async route => { bodies.push(route.request().postDataJSON()); await route.fulfill({ status: 201, json: { ok: true, reference, mode: 'local' } }); });
  await fill(page); await page.getByRole('button', { name: 'Save test RSVP locally', exact: true }).click();
  await expect(page.locator('.rsvp-receipt')).toBeFocused(); await expect(page.locator('.rsvp-receipt')).toContainText(reference); expect(bodies).toHaveLength(1); expect(bodies[0].details.guests).toBe('3'); expect(await page.evaluate(() => (window as any).rsvpWidgetAction)).toBe('rsvp_response');
});

test("failed RSVP retries retain details and request id, and declining stores no attending guests", async ({ page }) => {
  await setup(page); const bodies: any[] = []; await page.route('**/api/rsvps', async route => { bodies.push(route.request().postDataJSON()); await route.fulfill(bodies.length === 1 ? { status: 503, json: { ok: false, message: 'Storage unavailable. Retry.' } } : { status: 200, json: { ok: true, reference, mode: 'local', duplicate: true } }); });
  await fill(page); await page.getByRole('radio', { name: 'Regretfully decline' }).check(); await expect(page.getByLabel('Number of guests, including you')).toHaveCount(0);
  await page.getByRole('button', { name: 'Save test RSVP locally', exact: true }).click(); await expect(page.locator('.rsvp-errors')).toBeFocused(); await expect(page.getByLabel('Your name', { exact: true })).toHaveValue('Sample Guest'); await expect(page.locator('.rsvp-receipt')).toHaveCount(0);
  await page.getByRole('button', { name: 'Save test RSVP locally', exact: true }).click(); await expect(page.locator('.rsvp-receipt')).toContainText(reference); expect(bodies[0].requestId).toBe(bodies[1].requestId); expect(bodies[1].details.guests).toBe('0');
});

test("our works embeds the selected invitation and event sections fit 320px", async ({ page, isMobile }) => {
  await page.clock.install({ time: now }); await page.goto('/');
  await expect(page.locator('#our-works')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Our works.' })).toHaveCount(0);
  if (isMobile) await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Our works', exact: true })).toHaveAttribute('href', '/our-works');
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Our works', exact: true }).click();
  await expect(page).toHaveURL(/\/our-works$/);
  await expect(page).toHaveTitle('Our works | Online Invites');
  await expect(page.getByRole('heading', { name: 'Our works.' })).toBeVisible();
  const choice = page.getByRole('group', { name: 'Choose an invitation' }).getByRole('button');
  await choice.click();
  await expect(choice).toHaveAttribute('aria-pressed', 'true');
  const frame = page.locator('#work-preview iframe');
  await expect(frame).toHaveAttribute('srcdoc', /portfolio\/nikah/);
  await expect(page.frameLocator('#work-preview iframe').locator('#enter')).toBeVisible();
  await expect(choice).toHaveText('Invite 1');
  await expect(page.locator('#our-works a[target="_blank"]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Restart invitation preview' })).toHaveCount(0);
  const phone = await page.locator('.work-phone').boundingBox();
  expect(phone!.y + phone!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  if (!isMobile) {
    const listBox = await page.locator('.works-list').boundingBox();
    const previewBox = await page.locator('.work-preview').boundingBox();
    expect(listBox!.x + listBox!.width).toBeLessThan(previewBox!.x);
  }
  await page.setViewportSize({ width: 320, height: 740 });
  expect(await page.locator('html').evaluate(e => e.scrollWidth - e.clientWidth)).toBeLessThanOrEqual(1);

  await page.setViewportSize({ width: 320, height: 740 }); await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const id of ['the-garden-edit', 'velvet-overture']) { await page.goto('/designs/' + id); await page.getByRole('button', { name: 'Open invitation', exact: true }).click(); await expect(page.getByRole('timer')).toHaveCount(id === 'velvet-overture' ? 1 : 0); await expect(page.getByRole('heading', { name: 'Will you join us?' })).toBeVisible(); expect(await page.locator('html').evaluate(e => e.scrollWidth - e.clientWidth)).toBeLessThanOrEqual(1); }
});


test("invitation address defaults to standard and changes only when selected", async ({ page }) => {
  await page.clock.install({ time: now });
  await page.goto('/');
  const address = page.locator('.invitation-address .address-bar');
  const choices = page.getByRole('group', { name: 'Choose a link example' });
  await expect(choices.getByRole('button')).toHaveCount(3);
  await expect(choices.getByRole('button', { name: 'Standard link', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.clock.runFor(8000);
  await expect(address).toContainText('onlineinvites.in/invite/your-story');
  await choices.getByRole('button', { name: 'Personalized subdomain' }).click();
  await expect(address).toContainText('your-story.onlineinvites.in');
  await choices.getByRole('button', { name: 'Custom domain' }).click();
  await expect(address).toContainText('your-story.in');
  await page.reload();
  await expect(address).toContainText('onlineinvites.in/invite/your-story');
});


test("portfolio scrolls manually inside the phone and the page scrolls outside", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 650 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/our-works');
  const phone = page.locator('.work-phone');
  const frame = page.frameLocator('#work-preview iframe');
  await expect(frame.locator('html')).toHaveClass(/js/);
  await expect(frame.locator('#gate')).toHaveCSS('position', 'fixed');
  await frame.locator('#enter').click();
  await expect(frame.locator('#gate')).toBeHidden();
  const scrollPosition = () => frame.locator('html').evaluate((element) => element.ownerDocument.scrollingElement!.scrollTop);
  const box = await phone.boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(650);
  await phone.hover();
  const idle = await scrollPosition();
  await page.waitForTimeout(250);
  expect(await scrollPosition()).toBe(idle);
  const outer = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 300);
  await expect.poll(scrollPosition).toBeGreaterThan(idle + 20);
  expect(await page.evaluate(() => window.scrollY)).toBe(outer);
  await page.getByRole('heading', { name: 'Our works.' }).hover();
  const inside = await scrollPosition();
  await page.mouse.wheel(0, 250);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(outer);
  expect(await scrollPosition()).toBe(inside);
  await expect(frame.locator('form')).toHaveAttribute('inert', '');
});
