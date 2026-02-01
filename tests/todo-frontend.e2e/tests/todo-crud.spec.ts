import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';

const API_BASE = 'http://localhost:5079/api';
const SQLITE3 = 'C:\\Users\\jharb\\AppData\\Local\\Microsoft\\WinGet\\Links\\sqlite3.exe';
const DB_PATH = path.resolve(__dirname, '../../../src/TodoApi/todo.db');
const TEST_EMAIL = `e2e-crud-api-${Date.now()}@localhost`;

/** Get a JWT by requesting a code, reading it from SQLite, and confirming. */
async function getAuthToken(request: Parameters<Parameters<typeof test>[1]>[0]['request']): Promise<string> {
  await request.post(`${API_BASE}/auth/request-magic-link`, {
    data: { email: TEST_EMAIL },
  });

  const code = execSync(
    `"${SQLITE3}" "${DB_PATH}" "SELECT Token FROM MagicLinkTokens WHERE Email='${TEST_EMAIL}' AND Used=0 ORDER BY Id DESC LIMIT 1;"`
  ).toString().trim();

  const res = await request.post(`${API_BASE}/auth/confirm-magic-link`, {
    data: { token: code },
  });
  const body = await res.json();
  return body.data.token;
}

test.describe('Todo CRUD via API (authenticated)', () => {
  let token: string;
  let createdId: number;

  test.beforeAll(async ({ request }) => {
    token = await getAuthToken(request);
  });

  test('create a todo item', async ({ request }) => {
    const response = await request.post(`${API_BASE}/todo`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { title: 'E2E Test Task', description: 'Created by Playwright' },
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.title).toBe('E2E Test Task');
    expect(body.data.timeHorizon).toBe(0); // Default: Today
    createdId = body.data.id;
  });

  test('create a todo with timeHorizon', async ({ request }) => {
    const response = await request.post(`${API_BASE}/todo`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { title: 'Tomorrow E2E Task', timeHorizon: 1 },
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.data.timeHorizon).toBe(1); // Tomorrow

    // Clean up
    await request.delete(`${API_BASE}/todo/${body.data.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  });

  test('read the created todo', async ({ request }) => {
    const response = await request.get(`${API_BASE}/todo/${createdId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.data.title).toBe('E2E Test Task');
  });

  test('update the todo', async ({ request }) => {
    const response = await request.put(`${API_BASE}/todo/${createdId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { status: 2 },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.data.status).toBe(2);
  });

  test('delete the todo', async ({ request }) => {
    const response = await request.delete(`${API_BASE}/todo/${createdId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.ok()).toBeTruthy();

    const getResponse = await request.get(`${API_BASE}/todo/${createdId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(getResponse.status()).toBe(404);
  });

  test('unauthenticated request returns 401', async ({ request }) => {
    const response = await request.get(`${API_BASE}/todo`);
    expect(response.status()).toBe(401);
  });
});
