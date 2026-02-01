import { test, expect, type Page, type APIRequestContext } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';

const API_BASE = 'http://localhost:5079/api';
const SQLITE3 = 'C:\\Users\\jharb\\AppData\\Local\\Microsoft\\WinGet\\Links\\sqlite3.exe';
const DB_PATH = path.resolve(__dirname, '../../../src/TodoApi/todo.db');

/**
 * Helper: authenticate via API and inject JWT into browser localStorage.
 */
async function authenticateViaApi(
  request: APIRequestContext,
  page: Page,
  email: string
): Promise<string> {
  // 1. Request a login code
  const reqRes = await request.post(`${API_BASE}/auth/request-magic-link`, {
    data: { email },
  });
  expect(reqRes.ok()).toBeTruthy();

  // 2. Read the code from SQLite
  const code = execSync(
    `"${SQLITE3}" "${DB_PATH}" "SELECT Token FROM MagicLinkTokens WHERE Email='${email}' AND Used=0 ORDER BY Id DESC LIMIT 1;"`
  ).toString().trim();
  expect(code).toMatch(/^\d{6}$/);

  // 3. Confirm the code to get a JWT
  const confirmRes = await request.post(`${API_BASE}/auth/confirm-magic-link`, {
    data: { token: code },
  });
  expect(confirmRes.ok()).toBeTruthy();
  const body = await confirmRes.json();
  const jwt = body.data.token;
  expect(jwt).toBeTruthy();

  // 4. Inject token into browser localStorage
  await page.evaluate(({ token, userEmail }) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_email', userEmail);
  }, { token: jwt, userEmail: email });

  return jwt;
}

test.describe('Primary Flow: anonymous → sign in → persist', () => {
  test('anonymous user can create todos in localStorage', async ({ page }) => {
    await page.goto('/');

    // Should see the "Sign in to save" button (not authenticated)
    await expect(page.getByRole('button', { name: /sign in to save/i })).toBeVisible();

    // Add a todo
    await page.getByPlaceholder('Add a todo...').fill('Local Todo 1');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Local Todo 1')).toBeVisible();

    // Should see the local storage info alert after adding a todo
    await expect(page.getByText(/stored locally/i)).toBeVisible();

    // Add another
    await page.getByPlaceholder('Add a todo...').fill('Local Todo 2');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Local Todo 2')).toBeVisible();
  });

  test('anonymous user can select time horizon chips and complete todos', async ({ page }) => {
    await page.goto('/');

    // Time horizon toggle buttons should be visible
    const todayBtn = page.getByRole('button', { name: 'Today' }).first();
    const tomorrowBtn = page.getByRole('button', { name: 'Tomorrow' }).first();
    const somedayBtn = page.getByRole('button', { name: 'Someday' }).first();
    await expect(todayBtn).toBeVisible();
    await expect(tomorrowBtn).toBeVisible();
    await expect(somedayBtn).toBeVisible();

    // Select Tomorrow horizon and add a todo
    await tomorrowBtn.click();
    await page.getByPlaceholder('Add a todo...').fill('Tomorrow Task');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Tomorrow Task')).toBeVisible();
    // Should show "Tomorrow" chip on the card
    await expect(page.getByText('Tomorrow').first()).toBeVisible();

    // Add a Today task
    await todayBtn.click();
    await page.getByPlaceholder('Add a todo...').fill('Today Task');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Today Task')).toBeVisible();

    // Complete a todo via checkbox
    const checkbox = page.getByRole('checkbox').first();
    await checkbox.click();
    await expect(checkbox).toBeChecked();
  });

  test('sign in shows authenticated state and todos persist across sessions', async ({ page, request }) => {
    const email = `e2e-persist-${Date.now()}@localhost`;

    // --- Step 1: Authenticate ---
    await page.goto('/');
    await authenticateViaApi(request, page, email);
    await page.goto('/');

    // Should be authenticated — see email and Sign out button
    await expect(page.getByText(email)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();

    // Local storage alert should be gone
    await expect(page.getByText(/stored locally/i)).not.toBeVisible();

    // --- Step 2: Create a todo while authenticated ---
    await page.getByPlaceholder('Add a todo...').fill('Authenticated Todo');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Authenticated Todo')).toBeVisible();

    // --- Step 3: Sign out ---
    await page.getByRole('button', { name: /sign out/i }).click();

    // After logout, the 401 interceptor may redirect to /login.
    // Navigate to home to verify anonymous state.
    await page.goto('/');
    await expect(page.getByRole('button', { name: /sign in to save/i })).toBeVisible();

    // --- Step 4: Sign back in — todos should persist ---
    await authenticateViaApi(request, page, email);
    await page.goto('/');

    await expect(page.getByText(email)).toBeVisible();
    await expect(page.getByText('Authenticated Todo')).toBeVisible();
  });

  test('login page UI flow works', async ({ page }) => {
    await page.goto('/login');

    // Step 1: Email entry visible
    await expect(page.getByRole('textbox')).toBeVisible();
    await expect(page.getByRole('button', { name: /send login code/i })).toBeVisible();

    // Back button goes home
    await page.getByRole('button', { name: /back/i }).click();
    await expect(page).toHaveURL('/');

    // Go back to login
    await page.goto('/login');
    await page.getByRole('textbox').fill('test@localhost');
    await page.getByRole('button', { name: /send login code/i }).click();

    // Step 2: Should show code entry
    await expect(page.getByText(/we sent a 6-digit code/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /verify code/i })).toBeVisible();
  });

  test('authenticated user can add and delete todos', async ({ page, request }) => {
    const email = `e2e-crud-${Date.now()}@localhost`;

    await page.goto('/');
    await authenticateViaApi(request, page, email);
    await page.goto('/');

    // Add a todo (defaults to Today)
    await page.getByPlaceholder('Add a todo...').fill('Delete Me');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Delete Me')).toBeVisible();

    // Delete via the delete icon button on the TodoCard
    const deleteButton = page.getByText('Delete Me').locator('..').getByRole('button').last();
    await deleteButton.click();

    // Should be gone
    await expect(page.getByText('Delete Me')).not.toBeVisible();
    await expect(page.getByText(/no today todos/i)).toBeVisible();
  });

  test('authenticated user sees time horizon tabs and can filter', async ({ page, request }) => {
    const email = `e2e-tabs-${Date.now()}@localhost`;

    await page.goto('/');
    await authenticateViaApi(request, page, email);
    await page.goto('/');

    // Tab bar should exist
    await expect(page.getByRole('tab', { name: /today/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /tomorrow/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /someday/i })).toBeVisible();

    // Add a Today task
    await page.getByPlaceholder('Add a todo...').fill('Today Task');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Today Task')).toBeVisible();

    // Switch horizon toggle to Tomorrow, add task
    await page.getByRole('button', { name: 'Tomorrow' }).first();
    // Click the toggle button for Tomorrow (in the ToggleButtonGroup, not the tab)
    const toggleButtons = page.locator('button[value="1"]');
    await toggleButtons.first().click();
    await page.getByPlaceholder('Add a todo...').fill('Tomorrow Task');
    await page.getByRole('button', { name: 'Add' }).click();

    // Switch to Tomorrow tab to see it
    await page.getByRole('tab', { name: /tomorrow/i }).click();
    await expect(page.getByText('Tomorrow Task')).toBeVisible();
    // Today task should not be in Tomorrow tab
    await expect(page.getByText('Today Task')).not.toBeVisible();

    // Switch back to Today tab
    await page.getByRole('tab', { name: /today/i }).click();
    await expect(page.getByText('Today Task')).toBeVisible();
  });

  test('anonymous user can change time horizon via chip menu', async ({ page }) => {
    await page.goto('/');

    // Add a Today task
    await page.getByPlaceholder('Add a todo...').fill('Move Me');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Move Me')).toBeVisible();

    // Click the horizon chip (second chip) on the card to open the menu
    const card = page.getByText('Move Me').locator('..');
    const chips = card.locator('.MuiChip-root');
    const horizonChip = chips.nth(1);
    await expect(horizonChip).toHaveText('Today');
    await horizonChip.click();

    // Menu should appear with three options
    await expect(page.getByRole('menuitem', { name: 'Tomorrow' })).toBeVisible();
    await page.getByRole('menuitem', { name: 'Tomorrow' }).click();

    // Chip should now say Tomorrow
    await expect(horizonChip).toHaveText('Tomorrow');
  });

  test('authenticated user can move task between time horizon tabs', async ({ page, request }) => {
    const email = `e2e-horizon-${Date.now()}@localhost`;

    await page.goto('/');
    await authenticateViaApi(request, page, email);
    await page.goto('/');

    // Add a Today task
    await page.getByPlaceholder('Add a todo...').fill('Horizon Task');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Horizon Task')).toBeVisible();

    // Click the horizon chip (second chip) on the card
    const card = page.getByText('Horizon Task').locator('..');
    const horizonChip = card.locator('.MuiChip-root').nth(1);
    await horizonChip.click();

    // Select Tomorrow from the menu
    await page.getByRole('menuitem', { name: 'Tomorrow' }).click();

    // Task should disappear from Today tab
    await expect(page.getByText('Horizon Task')).not.toBeVisible();

    // Switch to Tomorrow tab — task should be there
    await page.getByRole('tab', { name: /tomorrow/i }).click();
    await expect(page.getByText('Horizon Task')).toBeVisible();
  });

  test('authenticated user can toggle todo completion', async ({ page, request }) => {
    const email = `e2e-complete-${Date.now()}@localhost`;

    await page.goto('/');
    await authenticateViaApi(request, page, email);
    await page.goto('/');

    // Add a task
    await page.getByPlaceholder('Add a todo...').fill('Complete Me');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Complete Me')).toBeVisible();

    // Check the checkbox to complete
    const checkbox = page.getByRole('checkbox').first();
    await expect(checkbox).not.toBeChecked();
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    // Uncheck to uncomplete
    await checkbox.click();
    await expect(checkbox).not.toBeChecked();
  });
});
