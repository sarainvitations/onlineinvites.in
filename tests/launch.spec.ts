import { test, expect } from "@playwright/test";
import { readFileSync, existsSync } from "node:fs";
import { templates } from "../src/data/templates";
import { json } from "../server/types";
import { site } from "../src/config/site";
const pages: { path: string; title: string; index: boolean }[] = JSON.parse(readFileSync("src/data/sitePages.json", "utf8"));

test("all four approved policies are readable and connected", async ({ page }) => {
  for (const [slug, title] of [["privacy", "Privacy policy"], ["terms", "Terms & conditions"], ["refunds", "Refund & cancellation policy"], ["hosting", "Hosting & expiration policy"]]) {
    await page.goto(`/policies/${slug}`);
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
    await expect(page.getByText("Draft · owner review required", { exact: true })).toHaveCount(0);
    await expect(page.getByText(`Last updated: ${site.policyUpdated}`, { exact: true })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index, follow");
    await expect(page.getByRole("navigation", { name: "Policy pages" }).getByRole("link")).toHaveCount(4);
    await expect(page.getByRole("navigation", { name: "Policy pages" }).locator('[aria-current="page"]')).toHaveCount(1);
    expect(await page.locator("html").evaluate((e) => e.scrollWidth - e.clientWidth)).toBeLessThanOrEqual(1);
  }
});

test("contact page uses the brand and quote entry remains available", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.getByRole("heading", { name: "Online Invites", exact: true })).toBeVisible();
  await expect(page.locator(".contact-card")).toContainText("Public contact details are not available yet.");
  await expect(page.locator(".contact-card")).toContainText("Delhi, India");
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
  await expect(page).toHaveTitle("Contact Online Invites | Online Invites");
  await page.locator("main").getByRole("link", { name: "Request a Free Quote", exact: true }).click();
  await expect(page).toHaveURL(/\/request-quote$/);
});

test("client navigation resets indexing and sharing metadata", async ({ page, isMobile }) => {
  await page.goto("/request-quote");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, follow");
  if (isMobile) await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Our designs" }).click();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index, follow");
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", `${site.origin}/designs`);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${site.origin}/designs`);
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute("content", `${site.origin}/social-card.png`);
});

test("unknown policies and demos show recovery and do not inherit indexed metadata", async ({ page }) => {
  await page.goto("/policies/unknown");
  await expect(page.getByRole("heading", { name: "That policy isn’t here." })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, follow");
  await page.goto("/designs/not-a-template");
  await expect(page.getByRole("link", { name: "Back to designs" })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, follow");
});

test("production HTML provides per-route metadata before JavaScript and sitemap follows indexing settings", () => {
  const routes = [...pages, ...templates.map((t) => ({ path: `/designs/${t.id}`, title: t.name, index: true }))];
  const sitemap = readFileSync("dist/sitemap.xml", "utf8");
  for (const route of routes) {
    const html = readFileSync(route.path === "/" ? "dist/index.html" : `dist${route.path}/index.html`, "utf8");
    expect(html).toContain(`<link rel="canonical" href="${site.origin}${route.path}">`);
    expect(html).toContain('<meta property="og:image" content="https://onlineinvites.in/social-card.png">');
    expect(html).toContain(`<meta name="robots" content="${route.index ? "index, follow" : "noindex, follow"}">`);
    expect(html.match(/<title>/g)).toHaveLength(1);
    expect(html.match(/<meta name="description"/g)).toHaveLength(1);
    expect(sitemap.includes(`<loc>${site.origin}${route.path}</loc>`)).toBe(route.index);
  }
  expect(existsSync("dist/social-card.png")).toBe(true);
  expect(readFileSync("dist/404.html", "utf8")).toContain('content="noindex, follow"');
  expect(readFileSync("dist/robots.txt", "utf8")).toContain(`Sitemap: ${site.origin}/sitemap.xml`);
});

test("static and API security policies protect scripts, framing and private responses", () => {
  const staticHeaders = readFileSync("dist/_headers", "utf8");
  const response = json({ available: false }, 503);
  for (const headers of [staticHeaders, [...response.headers].map(([k, v]) => `${k}: ${v}`).join("\n")]) {
    expect(headers).toContain("frame-ancestors 'none'");
    expect(headers).toContain("frame-src 'self' https://challenges.cloudflare.com https://nikah.fahed.in");
    expect(headers).toContain("object-src 'none'");
    expect(headers).toContain("script-src 'self' https://challenges.cloudflare.com");
    expect(headers).not.toContain("'unsafe-eval'");
    expect(headers).not.toContain("script-src 'self' 'unsafe-inline'");
  }
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
  expect(response.status).toBe(503);
});
