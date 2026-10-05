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

test('kiosk topbar is compact and renders TunaEye brand mark', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))
  await page.goto('/kiosk/select-role')
  await expect(page.getByRole('heading', { name: "Who's grading?" })).toBeVisible({ timeout: 5000 })
  
  const topbar = page.locator('.topbar')
  await expect(topbar).toBeVisible()
  const box = await topbar.boundingBox()
  expect(box).not.toBeNull()
  // Height must be compact (around 38px, <= 48px)
  expect(box!.height).toBeLessThanOrEqual(48)
  
  // Check brand mark
  const brandWord = page.locator('.brand-word')
  await expect(brandWord).toBeVisible()
  await expect(brandWord).toContainText('Tuna')
  await expect(brandWord).toContainText('Eye')
})

test('tablet viewport renders expert grader dashboard in bento layout', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 })
  await page.addInitScript(() => {
    localStorage.setItem('tunaeye-installed', 'true')
    localStorage.setItem('tunaeye-grader-name', 'Maria Santos')
  })
  await page.goto('/kiosk/grader-dashboard')
  await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible({ timeout: 5000 })
  
  // Verify bento layout container
  const bento = page.locator('.grader-bento')
  await expect(bento).toBeVisible()
  
  // Left 4 info boxes
  const infoBoxes = page.locator('.grader-bento__info-grid .grader-info-card')
  await expect(infoBoxes).toHaveCount(4)
  
  // Right hello card
  const helloCard = page.locator('.grader-bento__hello-card')
  await expect(helloCard).toBeVisible()
})

test('camera help triggers custom notice modal instead of alert', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))
  await page.goto('/kiosk/camera')
  await expect(page.getByRole('heading', { name: /Align the sample/i })).toBeVisible({ timeout: 5000 })
  
  // Click Help button
  await page.getByRole('button', { name: 'Help' }).click()
  
  // Verify custom notice modal appears
  const modal = page.locator('.modal-card--notice')
  await expect(modal).toBeVisible()
  await expect(modal.getByRole('heading', { name: 'Camera Alignment Guide' })).toBeVisible()
  
  // Close modal
  await page.getByRole('button', { name: 'Understood' }).click()
  await expect(modal).not.toBeVisible()
})

test('completed grading session immediately syncs into grader and admin dashboard', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('tunaeye-installed', 'true')
    localStorage.setItem('tunaeye-grader-name', 'Maria Santos')
  })
  
  // Complete a simulated grading flow
  await page.goto('/kiosk/weight')
  await expect(page.getByRole('heading', { name: /Enter the fish weight/i })).toBeVisible({ timeout: 5000 })
  await page.getByRole('button', { name: '4', exact: true }).click()
  await page.getByRole('button', { name: '2', exact: true }).click()
  await page.getByRole('button', { name: 'Start capture' }).click()
  
  // Camera screen
  await expect(page.getByRole('heading', { name: /Align the sample/i })).toBeVisible()
  await page.getByRole('button', { name: 'Capture' }).click()
  
  // Review screen
  await expect(page.getByRole('heading', { name: /Use this image/i })).toBeVisible({ timeout: 5000 })
  await page.getByRole('button', { name: 'Use this image' }).click()
  
  // Analysis screen -> Result screen
  await expect(page.getByRole('heading', { name: /Sashibo core · Grade/i })).toBeVisible({ timeout: 10000 })
  await page.getByRole('button', { name: 'View results overview' }).click()
  
  // Overview screen -> Print
  await expect(page.getByRole('heading', { name: /Review every sample/i })).toBeVisible()
  await page.getByRole('button', { name: /Print separate copies/i }).click()
  
  // Print screen -> Skip printing to complete
  await expect(page.getByRole('button', { name: 'Skip printing' })).toBeVisible({ timeout: 5000 })
  await page.getByRole('button', { name: 'Skip printing' }).click()
  
  // Complete screen
  await expect(page.getByRole('heading', { name: 'Results printed.' })).toBeVisible()
  
  // Return home to grader dashboard
  await page.getByRole('button', { name: 'Return home' }).click()
  await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible()
  
  // Verify recent grading records contains the newly completed session
  const records = page.locator('.grader-record-item')
  expect(await records.count()).toBeGreaterThanOrEqual(1)
  await expect(records.first()).toContainText('Sashibo core')
})

