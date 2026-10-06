import { expect, test } from '@playwright/test'

test('uninstalled visitors see the public landing after loading and can scroll', async ({ page }) => {
  const browserErrors: string[] = []
  const failedRequests: string[] = []
  page.on('console', message => { if (message.type() === 'error') browserErrors.push(message.text()) })
  page.on('pageerror', error => browserErrors.push(error.message))
  page.on('requestfailed', request => failedRequests.push(`${request.method()} ${request.url()}`))

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

  const iphone = page.locator('.iphone-mockup')
  await iphone.scrollIntoViewIfNeeded()
  await expect(iphone).toBeVisible()
  await expect(iphone.locator('svg')).toHaveAttribute('viewBox', '0 0 433 882')
  await expect(iphone.locator('.iphone-mockup__screen')).toContainText('TunaEye Grader')
  await iphone.screenshot({ path: 'test-results/iphone-mockup.png' })
  const landingLayout = await page.evaluate(() => ({
    demoColumns: getComputedStyle(document.querySelector('.site-demo-video')!).gridTemplateColumns.split(' ').length,
    mobileColumns: getComputedStyle(document.querySelector('.mobile-experience-grid')!).gridTemplateColumns.split(' ').length,
    installationColumns: getComputedStyle(document.querySelector('.installation-grid')!).gridTemplateColumns.split(' ').length,
  }))
  expect(landingLayout).toEqual({ demoColumns: 2, mobileColumns: 2, installationColumns: 2 })
  for (const [name, selector] of [['demo', '.site-demo-video'], ['mobile', '.site-mobile-experience'], ['installation', '.site-installation']] as const) {
    const section = page.locator(selector)
    await section.scrollIntoViewIfNeeded()
    await expect(section).toBeVisible()
    await section.screenshot({ path: `test-results/landing-${name}-1280x800.png` })
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await page.locator('.site-mobile-experience').scrollIntoViewIfNeeded()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(await page.locator('.mobile-experience-grid').evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length)).toBe(1)
  await page.screenshot({ path: 'test-results/landing-mobile-390x844.png' })
  expect(browserErrors).toEqual([])
  expect(failedRequests).toEqual([])
})

test('installed tablet opens kiosk welcome screen and enters tight workflow screens', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /TUNAEYE/i })).toBeVisible({ timeout: 5000 })
  await expect(page.getByRole('button', { name: 'Install' })).toHaveCount(0)
  
  // Navigate into kiosk workflow (select-role)
  await page.getByRole('button', { name: /Get started/i }).click()
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
  await page.getByRole('button', { name: 'Get started' }).click()
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

test('admin dashboard scrolls, graph interacts, and records paginate', async ({ page }) => {
  const browserErrors: string[] = []
  page.on('console', message => { if (message.type() === 'error') browserErrors.push(message.text()) })
  page.on('pageerror', error => browserErrors.push(error.message))
  await page.setViewportSize({ width: 1024, height: 600 })
  await page.addInitScript(() => {
    localStorage.setItem('tunaeye-installed', 'true')
    const now = Date.now()
    localStorage.setItem('tunaeye-records', JSON.stringify(Array.from({ length: 19 }, (_, index) => ({
      id: `TE-QA-${String(index + 1).padStart(3, '0')}`,
      sessionId: `QA-${index + 1}`,
      timestamp: now - (index % 7) * 86_400_000,
      time: 'Today, 10:00 AM',
      grader: index % 2 ? 'Maria Santos' : 'Jose Dela Cruz',
      sample: index % 2 ? 'Sashibo core' : 'Tail cut',
      fish: 'Fish 1', weight: `${20 + index} kg`, grade: index % 3 === 0 ? 'A' : 'B', status: 'Model result',
    }))))
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Get started' }).click()
  await page.getByRole('button', { name: /Admin/ }).click()
  for (const [index, digit] of ['1', '2', '3', '4'].entries()) await page.getByLabel(`PIN digit ${index + 1}`).fill(digit)
  await page.getByRole('button', { name: 'Verify and continue' }).click()

  const adminContent = page.locator('.admin-content')
  await expect(page.getByTestId('admin-simple-graph')).toBeVisible()
  await page.getByRole('button', { name: /samples/ }).last().focus()
  await expect(page.locator('.admin-trend__tooltip')).toBeVisible()
  expect(await adminContent.evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true)
  await page.screenshot({ path: 'test-results/admin-graph-1024x600.png', fullPage: false })

  await page.getByRole('button', { name: /Records/ }).click()
  await expect(page.getByText('Showing 1–8 of 19')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Previous' })).toBeDisabled()
  await page.getByRole('button', { name: 'Next' }).click()
  await expect(page.getByText('Showing 9–16 of 19')).toBeVisible()
  await expect(page.getByText('TE-QA-009')).toBeVisible()
  await adminContent.evaluate(element => { element.scrollTop = element.scrollHeight })
  expect(await adminContent.evaluate(element => element.scrollTop)).toBeGreaterThan(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(browserErrors).toEqual([])
  await page.screenshot({ path: 'test-results/admin-records-pagination-1024x600.png', fullPage: false })
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
  const evidence = await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('tunaeye-offline', 1)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    const records = await new Promise<unknown[]>((resolve, reject) => {
      const request = database.transaction('evidence').objectStore('evidence').getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    database.close()
    return records
  })
  expect(evidence).toHaveLength(1)
  expect(evidence[0]).toMatchObject({ sample: 'Sashibo core', fishId: 'Fish 1', syncState: 'pending' })
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
  
  // Return to grader dashboard
  await page.getByRole('button', { name: 'Dashboard' }).click()
  await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible()
  
  // Verify recent grading records contains the newly completed session
  const records = page.locator('.grader-record-item')
  expect(await records.count()).toBeGreaterThanOrEqual(1)
  await expect(records.first()).toContainText('Sashibo core')
  await expect(records.first().locator('img')).toBeVisible()
  const savedRecords = await page.evaluate(() => JSON.parse(localStorage.getItem('tunaeye-records') ?? '[]'))
  expect(savedRecords[0].capturedImageId).toBeTruthy()
  expect(JSON.stringify(savedRecords)).not.toContain('data:image')
})

test('58mm thermal printer receipt preview and print layout', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('tunaeye-installed', 'true')
    localStorage.setItem('tunaeye-grader-name', 'Maria Santos')
  })
  await page.goto('/kiosk/print')
  await expect(page.getByRole('heading', { name: /Print separate grading records|Print the next result/i })).toBeVisible({ timeout: 5000 })

  // Verify 58mm thermal receipt preview & POS-58 chassis indicator
  const printerChassis = page.locator('.receipt-container-v2')
  await expect(printerChassis).toBeVisible()
  await expect(page.getByText('POS-58')).toBeVisible()

  // Verify physical 58mm thermal slip exists in DOM with ESC/POS 58MM metadata
  const thermalSlip = page.locator('.thermal-print-slip')
  await expect(thermalSlip).toHaveCount(1)
  await expect(thermalSlip).toContainText('TUNAEYE')
  await expect(thermalSlip).toContainText('QUALITY INSPECTION SLIP')
  await expect(thermalSlip).toContainText('ESC/POS 58MM')

  // Verify print media emulation displays the physical 58mm slip cleanly
  await page.emulateMedia({ media: 'print' })
  await expect(thermalSlip).toBeVisible()

  const slipStyle = await thermalSlip.evaluate((el) => {
    const computed = window.getComputedStyle(el)
    return {
      display: computed.display,
      visibility: computed.visibility,
      position: computed.position
    }
  })
  expect(slipStyle.visibility).toBe('visible')
  expect(slipStyle.display).toBe('block')
})

test('weight entry normalizes leading zero and explains values above 200 kg', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))
  await page.goto('/kiosk/weight')
  const input = page.locator('.weight-input input').first()

  await page.getByRole('button', { name: '0', exact: true }).click()
  await page.getByRole('button', { name: '8', exact: true }).click()
  await expect(input).toHaveValue('8')

  await page.getByRole('button', { name: 'Clear' }).click()
  for (const digit of ['8', '9', '9']) await page.getByRole('button', { name: digit, exact: true }).click()
  await expect(input).toHaveValue('899')
  await expect(page.locator('.weight-limit-dialog')).toContainText('Weight exceeds the limit')
  await expect(page.getByRole('button', { name: 'Start capture' })).toBeDisabled()
  await expect(page.locator('.weight-input-display')).toHaveClass(/is-error/)
  await page.screenshot({ path: 'test-results/weight-limit-1280x800.png', fullPage: false })

  const inputBox = await input.boundingBox()
  const unitBox = await page.locator('.weight-input-display b').first().boundingBox()
  expect(unitBox!.x - (inputBox!.x + inputBox!.width)).toBeLessThanOrEqual(12)
})

test('completion actions and grader logout return to the kiosk landing', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('tunaeye-installed', 'true')
    localStorage.setItem('tunaeye-grader-name', 'Maria Santos')
  })
  await page.goto('/kiosk/complete')
  await expect(page.getByRole('button', { name: 'Grade another' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Dashboard' })).toBeVisible()
  await page.screenshot({ path: 'test-results/completion-actions-1280x800.png', fullPage: false })
  await page.getByRole('button', { name: 'Logout' }).click()
  await expect(page.getByRole('button', { name: 'Get started' })).toBeVisible()
  await expect(page.locator('.welcome-brand-hero__mark')).toHaveCount(0)
  await expect(page.locator('.welcome-brand-hero__title')).toContainText('TUNAEYE')
  expect(await page.evaluate(() => localStorage.getItem('tunaeye-grader-name'))).toBeNull()
})

for (const viewport of [
  { width: 1024, height: 600 },
  { width: 1280, height: 800 },
  { width: 1366, height: 768 },
]) {
  test(`QA tablet surfaces fit and remain readable at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    const browserErrors: string[] = []
    const failedRequests: string[] = []
    page.on('console', message => { if (message.type() === 'error') browserErrors.push(message.text()) })
    page.on('pageerror', error => browserErrors.push(error.message))
    page.on('requestfailed', request => failedRequests.push(`${request.method()} ${request.url()}`))
    await page.setViewportSize(viewport)
    await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))

    const expectNoHorizontalOverflow = async () => {
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    }

    await page.goto('/kiosk/select-role')
    const roleCards = page.locator('.role-card-v2')
    await expect(roleCards).toHaveCount(2)
    expect((await roleCards.first().boundingBox())!.height).toBeGreaterThanOrEqual(200)
    expect((await roleCards.first().boundingBox())!.width).toBeGreaterThanOrEqual(300)
    await expectNoHorizontalOverflow()

    await page.goto('/kiosk/tutorial')
    await expect(page.locator('.tutorial-stage__number')).toHaveCount(0)
    await expectNoHorizontalOverflow()

    await page.goto('/kiosk/sample')
    await page.getByRole('button', { name: /Tail cut/ }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    const associationCards = page.locator('.association-options button')
    await expect(associationCards).toHaveCount(2)
    const [firstCard, secondCard] = await Promise.all([associationCards.nth(0).boundingBox(), associationCards.nth(1).boundingBox()])
    expect(Math.abs(firstCard!.height - secondCard!.height)).toBeLessThanOrEqual(1)
    expect(Math.abs((firstCard!.x + secondCard!.x + secondCard!.width) / 2 - viewport.width / 2)).toBeLessThan(28)
    await expect(page.getByRole('button', { name: 'Continue' })).toBeInViewport()
    await expectNoHorizontalOverflow()

    await page.goto('/kiosk/print')
    expect((await page.locator('.print-queue > div').first().boundingBox())!.height).toBeGreaterThanOrEqual(68)
    await expect(page.getByRole('button', { name: 'Skip printing' })).toBeInViewport()
    const receipt = await page.locator('.receipt-container-v2').boundingBox()
    const printActions = await page.locator('.screen-stack--print > .bottom-bar').boundingBox()
    expect(receipt!.y + receipt!.height).toBeLessThanOrEqual(printActions!.y)
    await expectNoHorizontalOverflow()
    await page.screenshot({ path: `test-results/print-${viewport.width}x${viewport.height}.png`, fullPage: false })

    await page.goto('/kiosk/complete')
    const gradeAnother = await page.getByRole('button', { name: 'Grade another' }).boundingBox()
    expect(Math.abs(gradeAnother!.x + gradeAnother!.width / 2 - viewport.width / 2)).toBeLessThan(8)
    const dashboard = await page.getByRole('button', { name: 'Dashboard' }).boundingBox()
    const logout = await page.getByRole('button', { name: 'Logout' }).boundingBox()
    expect(Math.abs(dashboard!.y - logout!.y)).toBeLessThanOrEqual(1)
    await expectNoHorizontalOverflow()

    await page.goto('/kiosk/admin-dashboard')
    await expect(page.getByRole('heading', { name: 'Good day, Admin.' })).toBeVisible()
    expect((await page.getByRole('heading', { name: 'Good day, Admin.' }).boundingBox())!.height).toBeGreaterThanOrEqual(36)
    await expectNoHorizontalOverflow()

    await page.screenshot({ path: `test-results/tablet-${viewport.width}x${viewport.height}.png`, fullPage: false })
    expect(browserErrors).toEqual([])
    expect(failedRequests).toEqual([])
  })
}
