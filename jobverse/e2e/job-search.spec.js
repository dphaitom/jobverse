// e2e/job-search.spec.js
import { test, expect } from '@playwright/test';

test.describe('Job Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/jobs');
  });

  test('should display jobs list', async ({ page }) => {
    await expect(page.locator('[class*="job-card"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should search jobs by keyword', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Tìm kiếm"]');
    await searchInput.fill('Backend Developer');

    await page.waitForTimeout(1000);

    await expect(page.locator('text=Backend')).toBeVisible({ timeout: 5000 });
  });

  test('should filter by location', async ({ page }) => {
    const locationFilter = page.locator('select').first();
    await locationFilter.selectOption('Hồ Chí Minh');

    await page.waitForTimeout(1000);

    const jobCards = page.locator('[class*="job-card"]');
    await expect(jobCards.first()).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to job detail page', async ({ page }) => {
    const firstJobCard = page.locator('[class*="job-card"]').first();
    await firstJobCard.waitFor({ state: 'visible', timeout: 10000 });
    await firstJobCard.click();

    await expect(page).toHaveURL(/\/jobs\/\d+/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should show job categories', async ({ page }) => {
    const categoryButtons = page.locator('button:has-text("Backend")');
    await expect(categoryButtons.first()).toBeVisible({ timeout: 5000 });
  });
});
