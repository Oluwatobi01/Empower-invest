import { test, expect } from '@playwright/test';

test('test deposit and withdrawal modals', async ({ page }) => {
  await page.goto('/#/connect');
  await page.getByPlaceholder('you@example.com').click();
  await page.getByPlaceholder('you@example.com').fill('user@test.com');
  await page.getByPlaceholder('••••••••').click();
  await page.getByPlaceholder('••••••••').fill('password');
  await page.getByRole('button', { name: 'Log In' }).click();
  await page.waitForURL('/#/tools');

  // Now that we are logged in, navigate to the accounts page
  await page.goto('/#/accounts');

  // Test Deposit Modal
  await page.getByRole('button', { name: 'Deposit' }).click();
  await expect(page.getByText('Deposit BTC')).toBeVisible();
  await expect(page.getByText('bc1q7zddqxvqttrffqdqmr8ft96v6zfwtkz6jdlatf')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();

  // Test Withdrawal Modal
  await page.getByRole('button', { name: 'Withdrawal' }).click();
  await expect(page.getByText('Withdraw Funds')).toBeVisible();
  await page.getByRole('spinbutton').fill('100');
  await page.getByPlaceholder('Enter your BTC address, bank account details, etc.').fill('test-address');
  await page.getByRole('button', { name: 'Withdraw', exact: true }).click();
  await expect(page.getByText('Your withdrawal request has been received and will be processed within 24 hours.')).toBeVisible();
  await page.screenshot({ path: 'withdrawal_success.png' });
});
