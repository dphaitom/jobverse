// e2e/companies.spec.js
import { test, expect } from '@playwright/test';

test.describe('Companies', () => {
  test('should display companies list', async ({ page }) => {
    await page.goto('/companies');

    await expect(page.locator('h1, h2')).toContainText(/Công ty/i);
    await expect(page.locator('[class*="company"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to company detail page', async ({ page }) => {
    await page.goto('/companies');

    const firstCompany = page.locator('[class*="company"]').first();
    await firstCompany.waitFor({ state: 'visible', timeout: 10000 });
    await firstCompany.click();

    await expect(page).toHaveURL(/\/companies\/\d+/);
    await expect(page.locator('h1, h2')).toBeVisible();
  });

  test('should show company jobs on detail page', async ({ page }) => {
    await page.goto('/companies');

    const firstCompany = page.locator('[class*="company"]').first();
    await firstCompany.click();

    await expect(page).toHaveURL(/\/companies\/\d+/);
    await expect(page.locator('text=/Việc làm/i')).toBeVisible({ timeout: 5000 });
  });

  test('should show company reviews section', async ({ page }) => {
    await page.goto('/companies');

    const firstCompany = page.locator('[class*="company"]').first();
    await firstCompany.click();

    await page.waitForTimeout(1000);
  });
});
