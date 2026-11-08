import { test, expect } from '@playwright/test';
test('personal Diwali invitation opens, shares details and replays', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/invite/varun-priyanka-diwali');
  await expect(page).toHaveTitle(/Diwali with Varun & Priyanka/);
  await expect(page.getByRole('navigation')).toHaveCount(0);
  await page.getByRole('button', { name: 'Open your invitation' }).click();
  await expect(page.getByRole('heading', { name: 'Diwali', exact: true })).toBeFocused();
  await expect(page.getByRole('contentinfo')).toHaveCount(0);
  await expect(page.getByText('Made with love at')).toBeVisible();
  await expect(page.getByRole('link', { name: 'onlineinvites.in', exact: true })).toHaveAttribute('href', 'https://onlineinvites.in');
  await expect(page.getByText('7 PM onwards', { exact: true })).toBeVisible();
  await expect(page.getByText('UER Heights', { exact: true })).toBeVisible();
  await expect(page.getByText('H-Tower', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Download invitation' })).toHaveAttribute('href', '/invitations/varun-priyanka-diwali.png');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /invitations\/varun-priyanka-diwali.png$/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Replay opening' }).click();
  await expect(page.getByRole('button', { name: 'Open your invitation' })).toBeFocused();
  expect(errors).toEqual([]);
});

test('curtains part from the centre and can be skipped', async ({ page }) => {
  await page.goto('/invite/varun-priyanka-diwali');
  await expect(page.locator('.curtain-left')).toBeVisible();
  await expect(page.locator('.curtain-right')).toBeVisible();
  await page.getByRole('button', { name: 'Open your invitation' }).click();
  await expect(page.locator('.diwali-curtains')).toHaveClass(/parting/);
  await expect(page.locator('.diwali-content')).toHaveAttribute('inert', '');
  await page.getByRole('button', { name: 'Skip animation' }).click();
  await expect(page.locator('.diwali-curtains')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Diwali', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Replay opening' }).click();
  await expect(page.locator('.curtain-left')).toBeVisible();
});

test('reduced motion opens directly without the curtain transition', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/invite/varun-priyanka-diwali');
  await page.getByRole('button', { name: 'Open your invitation' }).click();
  await expect(page.locator('.diwali-curtains')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Diwali', exact: true })).toBeFocused();
});
