import { test, expect } from '@playwright/test';

test.describe('Health Check', () => {
  test('frontend page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/todo/i);
  });

  test('API health endpoint responds', async ({ request }) => {
    const response = await request.get('http://localhost:5079/api/health');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });
});
