import { test, expect } from '@playwright/test';

// These tests use the seeded users, so run `npm run seed` first.
async function login(page, email, password = 'Password123!') {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();
}

test('dispatcher logs in and lands on Jobs', async ({ page }) => {
  await login(page, 'dispatcher@conezone.test');
  await expect(page).toHaveURL(/\/jobs$/);
  await expect(page.getByRole('heading', { name: 'Jobs', exact: true })).toBeVisible();
});

test('wrong password shows an error', async ({ page }) => {
  await login(page, 'dispatcher@conezone.test', 'not-the-password');
  await expect(page.getByText('Email or password is incorrect.')).toBeVisible();
});

test('field worker cannot open the New Job page', async ({ page }) => {
  await login(page, 'worker@conezone.test');
  await expect(page).toHaveURL(/\/my-jobs$/);
  await page.goto('/jobs/new');
  await expect(page.getByRole('heading', { name: 'Access denied' })).toBeVisible();
});

test('dispatcher creates a job', async ({ page }) => {
  await login(page, 'dispatcher@conezone.test');
  await expect(page).toHaveURL(/\/jobs$/);
  await page.goto('/jobs/new');
  await page.waitForLoadState('networkidle');

  const title = `E2E job ${Date.now()}`;
  await page.getByLabel('Title').fill(title);
  await page.getByLabel('Address').fill('1 Test St');
  await page.getByLabel('Start time').fill('08:00');
  await page.getByLabel('End time').fill('16:00');
  await page.getByRole('button', { name: 'Create job' }).click();

  await expect(page.getByRole('heading', { name: title })).toBeVisible();
});

test('a job with no title shows an error', async ({ page }) => {
  await login(page, 'dispatcher@conezone.test');
  await expect(page).toHaveURL(/\/jobs$/);
  await page.goto('/jobs/new');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Create job' }).click();
  await expect(page.getByText('Enter a title')).toBeVisible();
});