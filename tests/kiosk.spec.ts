import { expect, test } from '@playwright/test'

test('uninstalled visitors see the public landing after loading and can scroll', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.pdial')).toBeVisible()
  await expect(page.getByRole('heading', { name: /Clear evidence/i }).first()).toBeVisible({ timeout: 5000 })
  await expect(page.getByRole('button', { name: 'Install kiosk app' })).toBeVisible()
  
  // Verify landing page scrollability
  const isScrollable = await page.evaluate(() => {
    const siteShell = document.querySelector('.site-shell')
    return document.documentElement.scrollHeight > window.innerHeight || (siteShell && siteShell.scrollHeight > window.innerHeight)
  })
  expect(isScrollable).toBe(true)
})

test('installed tablet opens kiosk welcome screen and enters tight workflow screens', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /TUNAEYE/i })).toBeVisible({ timeout: 5000 })
  await expect(page.getByRole('button', { name: 'Install' })).toHaveCount(0)
  
  // Navigate into kiosk workflow (select-role)
  await page.getByRole('button', { name: /Start grading/i }).click()
  await expect(page.getByRole('heading', { name: "Who's grading?" })).toBeVisible()
  
  // Verify interactive kiosk workflow is tight (overflow: hidden, fits viewport)
  const isTight = await page.evaluate(() => {
    const appShell = document.querySelector('.app-shell')
    const htmlOverflow = window.getComputedStyle(document.documentElement).overflowY
    const bodyOverflow = window.getComputedStyle(document.body).overflowY
    return (htmlOverflow === 'hidden' || bodyOverflow === 'hidden') && appShell !== null
  })
  expect(isTight).toBe(true)
})

test('admin OTP opens diagnostics, audit logs, and logout', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))
  await page.goto('/')
  await page.getByRole('button', { name: 'Start grading' }).click()
  await page.getByRole('button', { name: /Admin/ }).click()
  for (const [index, digit] of ['1', '2', '3', '4'].entries()) await page.getByLabel(`PIN digit ${index + 1}`).fill(digit)
  await page.getByRole('button', { name: 'Verify and continue' }).click()
  await expect(page.getByText('Good day, Admin.')).toBeVisible()
  await page.getByRole('button', { name: /Settings/ }).click()
  await expect(page.getByText('Raspberry Pi API URL')).toBeVisible()
  await expect(page.getByText('AI model identifier')).toBeVisible()
  await page.getByRole('button', { name: /Audit logs/ }).click()
  await expect(page.getByRole('heading', { name: 'Audit logs' }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible()
})

test('weight numpad entry and touch keypad interaction', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))
  await page.goto('/kiosk/weight')
  await expect(page.getByRole('heading', { name: /Enter the fish weight/i })).toBeVisible({ timeout: 5000 })
  await expect(page.locator('.numpad-container')).toBeVisible()
  
  // Tap numpad buttons 3, 5, ., 4
  await page.getByRole('button', { name: '3', exact: true }).click()
  await page.getByRole('button', { name: '5', exact: true }).click()
  await page.getByRole('button', { name: '.', exact: true }).click()
  await page.getByRole('button', { name: '4', exact: true }).click()
  
  // Verify weight input has 35.4
  const input = page.locator('.weight-input input').first()
  await expect(input).toHaveValue('35.4')
})

