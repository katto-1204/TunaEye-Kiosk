# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kiosk.spec.ts >> 58mm thermal printer receipt preview and print layout
- Location: tests\kiosk.spec.ts:503:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /Print separate grading records|Print the next result/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: /Print separate grading records|Print the next result/i }) with timeout 5000ms
  - waiting for getByRole('heading', { name: /Print separate grading records|Print the next result/i })

```

```yaml
- main:
  - text: Print 1 of 1
  - heading "Print grading records." [level=1]
  - text: "1"
  - strong: Sashibo core
  - text: Ready now
  - region "Payment Receipt Printer":
    - heading "Grading Complete" [level=4]
    - paragraph: 58mm thermal slip ready to print
    - text: Ready POS-58 ONLINE
    - img
    - heading "TunaEye Kiosk" [level=3]
    - paragraph: Certified Quality Inspection
    - text: "ORDER NO: #TE-014 DATE: Oct 9, 2026, 04:30 PM INSPECTOR: Maria Santos ITEM WEIGHT Sashibo core (Fish 1) 1.0 kg"
    - paragraph: "Confidence: 96%"
    - text: "TOTAL: Grade A"
    - img
    - text: "* TE-014 *"
    - paragraph: Thank you for using TunaEye Kiosk!
    - paragraph: "AUTH #99824 · Tunaeye Ecosystem"
    - img
  - button "Back"
  - button "Skip printing"
  - button "Print Sashibo core"
```

# Test source

```ts
  409 | })
  410 | 
  411 | test('completed grading session remains local and pending until cloud sync', async ({ page }) => {
  412 |   let gradeBody = ''
  413 |   await page.route('http://10.42.0.1:8080/**', route => route.fulfill({ contentType: 'image/jpeg', body: Buffer.from([0xff, 0xd8, 0xff, 0xd9]) }))
  414 |   await page.route('http://10.42.0.1:5000/grade', async route => {
  415 |     gradeBody = route.request().postData() ?? ''
  416 |     await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ id: 'grade-1', capture_id: 'capture-1', image_type: 'sashibocore', grade: 'GRADE_A', confidence: 0.963, scores: { GRADE_A: 0.963, GRADE_B: 0.025, GRADE_C: 0.01, INVALID: 0.002 } }) })
  417 |   })
  418 |   await page.addInitScript(() => {
  419 |     localStorage.setItem('tunaeye-installed', 'true')
  420 |     localStorage.setItem('tunaeye-grader-name', 'Maria Santos')
  421 |   })
  422 |   
  423 |   // Complete a simulated grading flow
  424 |   await page.goto('/kiosk/weight')
  425 |   await expect(page.getByRole('heading', { name: /Enter the fish weight/i })).toBeVisible({ timeout: 5000 })
  426 |   await page.getByRole('button', { name: '4', exact: true }).click()
  427 |   await page.getByRole('button', { name: '2', exact: true }).click()
  428 |   await page.getByRole('button', { name: 'Start capture' }).click()
  429 |   
  430 |   // Camera screen
  431 |   await expect(page.getByRole('heading', { name: /Align the sample/i })).toBeVisible()
  432 |   await page.getByRole('button', { name: 'Capture' }).click()
  433 | 
  434 |   // Review screen
  435 |   await expect(page.getByRole('heading', { name: /Use this image/i })).toBeVisible({ timeout: 5000 })
  436 |   const evidence = await page.evaluate(async () => {
  437 |     const database = await new Promise<IDBDatabase>((resolve, reject) => {
  438 |       const request = indexedDB.open('tunaeye-offline', 1)
  439 |       request.onsuccess = () => resolve(request.result)
  440 |       request.onerror = () => reject(request.error)
  441 |     })
  442 |     const records = await new Promise<unknown[]>((resolve, reject) => {
  443 |       const request = database.transaction('evidence').objectStore('evidence').getAll()
  444 |       request.onsuccess = () => resolve(request.result)
  445 |       request.onerror = () => reject(request.error)
  446 |     })
  447 |     database.close()
  448 |     return records
  449 |   })
  450 |   expect(evidence).toHaveLength(1)
  451 |   expect(evidence[0]).toMatchObject({ sample: 'Sashibo core', fishId: 'Fish 1', syncState: 'pending' })
  452 |   await page.getByRole('button', { name: 'Use Image' }).click()
  453 |   
  454 |   // Analysis screen -> Result screen
  455 |   await expect(page.getByRole('heading', { name: /Sashibo core · Grade/i })).toBeVisible({ timeout: 10000 })
  456 |   await page.getByRole('button', { name: 'Manual override' }).click()
  457 |   const override = page.getByRole('dialog', { name: 'Manual override' })
  458 |   await expect(override).toBeVisible()
  459 |   await expect(override.locator('.otp-inputs input')).toHaveCount(4)
  460 |   await expect(override.locator('.pin-key-btn')).toHaveCount(12)
  461 |   const overrideBox = await override.locator('.override-modal').boundingBox()
  462 |   expect(overrideBox!.y + overrideBox!.height).toBeLessThanOrEqual(800)
  463 |   await expect(override.getByRole('button', { name: 'Unlock override' })).toBeInViewport()
  464 |   await override.getByRole('button', { name: 'Cancel' }).click()
  465 |   await page.getByRole('button', { name: 'View results overview' }).click()
  466 |   
  467 |   // Overview screen -> Print
  468 |   await expect(page.getByRole('heading', { name: /Review every sample/i })).toBeVisible()
  469 |   await page.getByRole('button', { name: /Print separate copies/i }).click()
  470 |   
  471 |   // Print screen -> Skip printing to complete
  472 |   await expect(page.getByRole('button', { name: 'Skip printing' })).toBeVisible({ timeout: 5000 })
  473 |   await page.getByRole('button', { name: 'Skip printing' }).click()
  474 |   await page.getByRole('dialog', { name: 'Skip printing?' }).getByRole('button', { name: 'Skip receipt' }).click()
  475 |   
  476 |   // Complete screen
  477 |   await expect(page.getByRole('heading', { name: 'Results printed.' })).toBeVisible()
  478 |   
  479 |   // Return to grader dashboard
  480 |   await page.getByRole('button', { name: 'Dashboard' }).click()
  481 |   await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible()
  482 |   
  483 |   // Verify recent grading records contains the newly completed session
  484 |   const records = page.locator('.grader-record-item')
  485 |   expect(await records.count()).toBeGreaterThanOrEqual(1)
  486 |   await expect(records.first()).toContainText('Sashibo core')
  487 |   await expect(records.first().locator('img')).toBeVisible()
  488 |   const savedRecords = await page.evaluate(() => JSON.parse(localStorage.getItem('tunaeye-records') ?? '[]'))
  489 |   expect(savedRecords[0].capturedImageId).toBeTruthy()
  490 |   expect(savedRecords[0].result).toMatchObject({ inferenceId: 'grade-1', captureId: 'capture-1', originalGrade: 'A', originalConfidence: 96.3 })
  491 |   expect(gradeBody).toContain('name="image_type"')
  492 |   expect(gradeBody).toContain('sashibocore')
  493 |   expect(gradeBody).toContain('name="image"; filename="capture.jpg"')
  494 |   expect(savedRecords[0].transaction.syncState).toBe('pending')
  495 |   expect(JSON.stringify(savedRecords)).not.toContain('data:image')
  496 | 
  497 |   await page.getByRole('button', { name: 'Sync now' }).click()
  498 |   await expect(page.getByRole('heading', { name: 'Sync unavailable' })).toBeVisible()
  499 |   const afterFailedSync = await page.evaluate(() => JSON.parse(localStorage.getItem('tunaeye-records') ?? '[]'))
  500 |   expect(afterFailedSync[0].transaction.syncState).toBe('pending')
  501 | })
  502 | 
  503 | test('58mm thermal printer receipt preview and print layout', async ({ page }) => {
  504 |   await page.addInitScript(() => {
  505 |     localStorage.setItem('tunaeye-installed', 'true')
  506 |     localStorage.setItem('tunaeye-grader-name', 'Maria Santos')
  507 |   })
  508 |   await page.goto('/kiosk/print')
> 509 |   await expect(page.getByRole('heading', { name: /Print separate grading records|Print the next result/i })).toBeVisible({ timeout: 5000 })
      |                                                                                                              ^ Error: expect(locator).toBeVisible() failed
  510 | 
  511 |   // Verify 58mm thermal receipt preview & POS-58 chassis indicator
  512 |   const printerChassis = page.locator('.receipt-container-v2')
  513 |   await expect(printerChassis).toBeVisible()
  514 |   await expect(page.getByText('POS-58')).toBeVisible()
  515 | 
  516 |   // Verify physical 58mm thermal slip exists in DOM with ESC/POS 58MM metadata
  517 |   const thermalSlip = page.locator('.thermal-print-slip')
  518 |   await expect(thermalSlip).toHaveCount(1)
  519 |   await expect(thermalSlip).toContainText('TUNAEYE')
  520 |   await expect(thermalSlip).toContainText('QUALITY INSPECTION SLIP')
  521 |   await expect(thermalSlip).toContainText('ESC/POS 58MM')
  522 | 
  523 |   // Verify print media emulation displays the physical 58mm slip cleanly
  524 |   await page.emulateMedia({ media: 'print' })
  525 |   await expect(thermalSlip).toBeVisible()
  526 | 
  527 |   const slipStyle = await thermalSlip.evaluate((el) => {
  528 |     const computed = window.getComputedStyle(el)
  529 |     return {
  530 |       display: computed.display,
  531 |       visibility: computed.visibility,
  532 |       position: computed.position
  533 |     }
  534 |   })
  535 |   expect(slipStyle.visibility).toBe('visible')
  536 |   expect(slipStyle.display).toBe('block')
  537 | })
  538 | 
  539 | test('weight entry normalizes leading zero and explains values above 200 kg', async ({ page }) => {
  540 |   await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))
  541 |   await page.goto('/kiosk/weight')
  542 |   const input = page.locator('.weight-input input').first()
  543 | 
  544 |   await page.getByRole('button', { name: '0', exact: true }).click()
  545 |   await page.getByRole('button', { name: '8', exact: true }).click()
  546 |   await expect(input).toHaveValue('8')
  547 | 
  548 |   await page.getByRole('button', { name: 'Clear' }).click()
  549 |   for (const digit of ['8', '9', '9']) await page.getByRole('button', { name: digit, exact: true }).click()
  550 |   await expect(input).toHaveValue('899')
  551 |   await expect(page.locator('.weight-limit-dialog')).toContainText('Weight exceeds the limit')
  552 |   await expect(page.getByRole('button', { name: 'Start capture' })).toBeDisabled()
  553 |   await expect(page.locator('.weight-input-display')).toHaveClass(/is-error/)
  554 |   await page.screenshot({ path: 'test-results/weight-limit-1280x800.png', fullPage: false })
  555 | 
  556 |   const inputBox = await input.boundingBox()
  557 |   const unitBox = await page.locator('.weight-input-display b').first().boundingBox()
  558 |   expect(unitBox!.x - (inputBox!.x + inputBox!.width)).toBeLessThanOrEqual(12)
  559 | })
  560 | 
  561 | test('completion actions and grader logout return to the kiosk landing', async ({ page }) => {
  562 |   await page.addInitScript(() => {
  563 |     localStorage.setItem('tunaeye-installed', 'true')
  564 |     localStorage.setItem('tunaeye-grader-name', 'Maria Santos')
  565 |   })
  566 |   await page.goto('/kiosk/complete')
  567 |   await expect(page.getByRole('button', { name: 'Grade another' })).toBeVisible()
  568 |   await expect(page.getByRole('button', { name: 'Dashboard' })).toBeVisible()
  569 |   await page.screenshot({ path: 'test-results/completion-actions-1280x800.png', fullPage: false })
  570 |   await page.getByRole('button', { name: 'Logout' }).click()
  571 |   await expect(page.getByRole('button', { name: 'Get started' })).toBeVisible()
  572 |   await expect(page.locator('.welcome-brand-hero__mark')).toHaveCount(0)
  573 |   await expect(page.locator('.welcome-brand-hero__title')).toContainText('TUNAEYE')
  574 |   expect(await page.evaluate(() => localStorage.getItem('tunaeye-grader-name'))).toBeNull()
  575 | })
  576 | 
  577 | for (const viewport of [
  578 |   { width: 1024, height: 600 },
  579 |   { width: 1280, height: 800 },
  580 |   { width: 1024, height: 768 },
  581 |   { width: 800, height: 1280 },
  582 |   { width: 1366, height: 768 },
  583 | ]) {
  584 |   test(`QA tablet surfaces fit and remain readable at ${viewport.width}x${viewport.height}`, async ({ page }) => {
  585 |     const browserErrors: string[] = []
  586 |     const failedRequests: string[] = []
  587 |     page.on('console', message => { if (message.type() === 'error') browserErrors.push(message.text()) })
  588 |     page.on('pageerror', error => browserErrors.push(error.message))
  589 |     page.on('requestfailed', request => failedRequests.push(`${request.method()} ${request.url()}`))
  590 |     await page.setViewportSize(viewport)
  591 |     await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))
  592 | 
  593 |     const expectNoHorizontalOverflow = async () => {
  594 |       expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  595 |     }
  596 | 
  597 |     await page.goto('/kiosk/select-role')
  598 |     const roleCards = page.locator('.role-card-v2')
  599 |     await expect(roleCards).toHaveCount(2)
  600 |     expect((await roleCards.first().boundingBox())!.height).toBeGreaterThanOrEqual(200)
  601 |     expect((await roleCards.first().boundingBox())!.width).toBeGreaterThanOrEqual(viewport.width < 900 ? 260 : 300)
  602 |     await expectNoHorizontalOverflow()
  603 | 
  604 |     await page.goto('/kiosk/tutorial')
  605 |     await expect(page.locator('.tutorial-stage__number')).toHaveText('01')
  606 |     await expect(page.locator('.tutorial-stage__number')).toBeVisible()
  607 |     await expectNoHorizontalOverflow()
  608 | 
  609 |     await page.goto('/kiosk/sample')
```