import { test, expect, type Page, type APIRequestContext } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';

const API_BASE = 'http://localhost:5079/api';
const SQLITE3 = 'C:\\Users\\jharb\\AppData\\Local\\Microsoft\\WinGet\\Links\\sqlite3.exe';
const DB_PATH = path.resolve(__dirname, '../../../src/TodoApi/todo.db');

async function authenticateViaApi(
  request: APIRequestContext,
  page: Page,
  email: string
): Promise<string> {
  const reqRes = await request.post(`${API_BASE}/auth/request-magic-link`, {
    data: { email },
  });
  expect(reqRes.ok()).toBeTruthy();

  const code = execSync(
    `"${SQLITE3}" "${DB_PATH}" "SELECT Token FROM MagicLinkTokens WHERE Email='${email}' AND Used=0 ORDER BY Id DESC LIMIT 1;"`
  ).toString().trim();
  expect(code).toMatch(/^\d{6}$/);

  const confirmRes = await request.post(`${API_BASE}/auth/confirm-magic-link`, {
    data: { token: code },
  });
  expect(confirmRes.ok()).toBeTruthy();
  const body = await confirmRes.json();
  const jwt = body.data.token;
  expect(jwt).toBeTruthy();

  await page.evaluate(({ token, userEmail }) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_email', userEmail);
  }, { token: jwt, userEmail: email });

  return jwt;
}

test.describe('Card Features: Done tab, inline edit, priority, expand', () => {
  test('Done tab shows completed tasks', async ({ page, request }) => {
    const email = `e2e-done-${Date.now()}@localhost`;
    await page.goto('/');
    await authenticateViaApi(request, page, email);
    await page.goto('/');

    // Add and complete a task
    await page.getByPlaceholder('Add a todo...').fill('Done Task');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Done Task')).toBeVisible();

    // Complete it
    await page.getByRole('checkbox').first().click();
    await expect(page.getByRole('checkbox').first()).toBeChecked();

    // Switch to Done tab
    await page.getByRole('tab', { name: /done/i }).click();
    await expect(page.getByText('Done Task')).toBeVisible();

    // Switch back to Today — completed task should still be visible (completed today)
    await page.getByRole('tab', { name: /today/i }).click();
    await expect(page.getByText('Done Task')).toBeVisible();
  });

  test('inline title editing saves on Enter', async ({ page, request }) => {
    const email = `e2e-edit-${Date.now()}@localhost`;
    await page.goto('/');
    await authenticateViaApi(request, page, email);
    await page.goto('/');

    // Add a task
    await page.getByPlaceholder('Add a todo...').fill('Edit Me');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Edit Me')).toBeVisible();

    // Click the title text to enter edit mode
    await page.getByText('Edit Me').click();

    // Should show an input field — find it within the card row
    const input = page.getByRole('textbox').filter({ hasText: '' }).last();
    await expect(input).toBeVisible();

    // Clear and type new title
    await input.fill('Edited Title');
    await input.press('Enter');

    // Should show the new title
    await expect(page.getByText('Edited Title')).toBeVisible();
    await expect(page.getByText('Edit Me')).not.toBeVisible();
  });

  test('inline title editing cancels on Escape', async ({ page, request }) => {
    const email = `e2e-editesc-${Date.now()}@localhost`;
    await page.goto('/');
    await authenticateViaApi(request, page, email);
    await page.goto('/');

    await page.getByPlaceholder('Add a todo...').fill('Keep Me');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Keep Me')).toBeVisible();

    // Click to edit
    await page.getByText('Keep Me').click();
    const input = page.getByRole('textbox').filter({ hasText: '' }).last();
    await expect(input).toBeVisible();
    await input.fill('Changed');
    await input.press('Escape');

    // Original title should remain
    await expect(page.getByText('Keep Me')).toBeVisible();
  });

  test('priority dropdown changes priority', async ({ page, request }) => {
    const email = `e2e-prio-${Date.now()}@localhost`;
    await page.goto('/');
    await authenticateViaApi(request, page, email);
    await page.goto('/');

    await page.getByPlaceholder('Add a todo...').fill('Priority Task');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Priority Task')).toBeVisible();

    // Default priority is Medium — click the priority chip
    const card = page.getByText('Priority Task').locator('..');
    const priorityChip = card.locator('.MuiChip-root').first();
    await expect(priorityChip).toHaveText('Medium');
    await priorityChip.click();

    // Select High from dropdown
    await page.getByRole('menuitem', { name: 'High' }).click();

    // Chip should now say High
    await expect(priorityChip).toHaveText('High');
  });

  test('expand/collapse shows description area', async ({ page, request }) => {
    const email = `e2e-expand-${Date.now()}@localhost`;
    await page.goto('/');
    await authenticateViaApi(request, page, email);
    await page.goto('/');

    await page.getByPlaceholder('Add a todo...').fill('Expand Task');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Expand Task')).toBeVisible();

    // Description area should not be visible initially
    await expect(page.getByText('Add a description...')).not.toBeVisible();

    // Click expand button (ExpandMore icon)
    const card = page.getByText('Expand Task').locator('..');
    const expandBtn = card.getByRole('button').filter({ has: page.locator('[data-testid="ExpandMoreIcon"]') });
    await expandBtn.click();

    // Description placeholder should now be visible
    await expect(page.getByText('Add a description...')).toBeVisible();
  });

  test('Done tab has no horizon chip interaction', async ({ page, request }) => {
    const email = `e2e-donechip-${Date.now()}@localhost`;
    await page.goto('/');
    await authenticateViaApi(request, page, email);
    await page.goto('/');

    // Add and complete a task
    await page.getByPlaceholder('Add a todo...').fill('No Edit Done');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByRole('checkbox').first().click();

    // Go to Done tab
    await page.getByRole('tab', { name: /done/i }).click();
    await expect(page.getByText('No Edit Done')).toBeVisible();

    // Click the horizon chip — should NOT open a menu
    const card = page.getByText('No Edit Done').locator('..');
    const horizonChips = card.locator('.MuiChip-root');
    // The horizon chip is the second chip (first is priority)
    const horizonChip = horizonChips.nth(1);
    await horizonChip.click();

    // No menu should appear
    await expect(page.getByRole('menuitem', { name: 'Tomorrow' })).not.toBeVisible();
  });

  test('all four tabs are accessible via scrollable tabs', async ({ page, request }) => {
    const email = `e2e-tabs4-${Date.now()}@localhost`;
    await page.goto('/');
    await authenticateViaApi(request, page, email);
    await page.goto('/');

    // All four tabs should exist in DOM
    await expect(page.getByRole('tab', { name: /today/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /tomorrow/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /someday/i })).toBeAttached();
    await expect(page.getByRole('tab', { name: /done/i })).toBeAttached();
  });
});
