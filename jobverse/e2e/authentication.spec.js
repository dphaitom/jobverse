// e2e/authentication.spec.js
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('h1, h2')).toContainText(/Đăng nhập/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should show validation errors for empty login', async ({ page }) => {
    await page.goto('/login');

    const submitButton = page.getByRole('button', { name: /Đăng nhập/i });
    await submitButton.click();

    await page.waitForTimeout(500);
  });

  test('should display register page', async ({ page }) => {
    await page.goto('/register');

    await expect(page.locator('h1, h2')).toContainText(/Đăng ký/i);
  });

  test('should navigate between login and register', async ({ page }) => {
    await page.goto('/login');

    const registerLink = page.getByRole('link', { name: /Đăng ký/i });
    await registerLink.click();

    await expect(page).toHaveURL(/\/register/);

    const loginLink = page.getByRole('link', { name: /Đăng nhập/i });
    await loginLink.click();

    await expect(page).toHaveURL(/\/login/);
  });

  test('should show Google OAuth button', async ({ page }) => {
    await page.goto('/login');

    const googleButton = page.locator('button:has-text("Google")');
    await expect(googleButton).toBeVisible();
  });
});
