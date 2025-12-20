// e2e/job-application.spec.js
import { test, expect } from '@playwright/test';

test.describe('Job Application Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/jobs');
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    const firstJobCard = page.locator('[class*="job-card"]').first();
    await firstJobCard.waitFor({ state: 'visible', timeout: 10000 });
    await firstJobCard.click();

    await expect(page).toHaveURL(/\/jobs\/\d+/);

    const applyButton = page.getByRole('button', { name: /Ứng tuyển ngay/i });
    await applyButton.click();

    await expect(page).toHaveURL(/\/login/);
  });

  test('should show apply modal for authenticated users', async ({ page }) => {
    // This test requires authentication setup
    // Skip for now - would need login flow
    test.skip();
  });

  test('should show Quick Apply button on job detail page', async ({ page }) => {
    const firstJobCard = page.locator('[class*="job-card"]').first();
    await firstJobCard.waitFor({ state: 'visible', timeout: 10000 });
    await firstJobCard.click();

    await expect(page).toHaveURL(/\/jobs\/\d+/);

    const quickApplyButton = page.getByRole('button', { name: /Ứng tuyển nhanh/i });
    await expect(quickApplyButton).toBeVisible();
  });

  test('should display job details correctly', async ({ page }) => {
    const firstJobCard = page.locator('[class*="job-card"]').first();
    await firstJobCard.click();

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=/Mô tả công việc/i')).toBeVisible();
    await expect(page.locator('text=/Yêu cầu/i')).toBeVisible();
  });
});
