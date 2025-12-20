// e2e/homepage.spec.js
import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/JobVerse/);
    await expect(page.locator('h1')).toContainText('Tìm việc làm IT');
  });

  test('should navigate to jobs page from CTA', async ({ page }) => {
    await page.goto('/');

    const ctaButton = page.getByRole('link', { name: /Khám phá ngay/i });
    await ctaButton.click();

    await expect(page).toHaveURL(/\/jobs/);
  });

  test('should show trending jobs section', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('text=Việc làm nổi bật')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');

    const loginLink = page.getByRole('link', { name: /Đăng nhập/i });
    await loginLink.click();

    await expect(page).toHaveURL(/\/login/);
  });
});
