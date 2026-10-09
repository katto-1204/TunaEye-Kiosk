# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kiosk.spec.ts >> completed grading session remains local and pending until cloud sync
- Location: tests\kiosk.spec.ts:544:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Sync unavailable' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: 'Sync unavailable' }) with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Sync unavailable' })

```

```yaml
- main:
  - heading "Welcome back, Maria." [level=1]
  - button "Start grading"
  - button "Sync now"
  - button "Logout"
  - article:
    - text: Sessions today
    - strong: "1"
    - emphasis: Completed grading runs
  - article:
    - text: Samples graded
    - strong: "1"
    - emphasis: Visible to admin
  - article:
    - text: Station status
    - strong: Online
    - emphasis: Local edge processing
  - article:
    - text: Tutorial status
    - strong: 1 left
    - emphasis: "Sync: 11:52 PM"
  - heading "Recent records" [level=2]
  - paragraph: 1 session total
  - text: Record Sample Weight Grade Status
  - button "8f0e74cb-1fb3-4907-9b75-e08a406b7a78-1 11:52 PM Captured Sashibo core Sashibo core Fish 1 · 96.3% confidence 42 kg A Complete":
    - strong: 8f0e74cb-1fb3-4907-9b75-e08a406b7a78-1
    - text: 11:52 PM
    - img "Captured Sashibo core"
    - strong: Sashibo core
    - text: Fish 1 · 96.3% confidence 42 kg A Complete
  - button "Back"
- dialog "Sync completed with errors":
  - heading "Sync completed with errors" [level=2]
  - paragraph: 0 records synchronized. 1 remain available for retry.
  - button "Understood"
```

# Test source

```ts
  534 |       }
  535 |     }
  536 |   }))
  537 |   expect(evidence.mimeType).toBe('image/png')
  538 |   expect(evidence.storedHash).toBe(evidence.sourceHash)
  539 |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  540 |   expect(browserErrors).toEqual([])
  541 |   expect(failedRequests).toEqual([])
  542 | })
  543 | 
  544 | test('completed grading session remains local and pending until cloud sync', async ({ page }) => {
  545 |   let gradeBody = ''
  546 |   let gradeBytes: Buffer | null = null
  547 |   await page.route('http://10.42.0.1:8080/**', route => route.fulfill({ contentType: 'image/jpeg', body: Buffer.from([0xff, 0xd8, 0xff, 0xd9]) }))
  548 |   await page.route('http://10.42.0.1:5000/grade', async route => {
  549 |     gradeBody = route.request().postData() ?? ''
  550 |     gradeBytes = route.request().postDataBuffer()
  551 |     await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ id: 'grade-1', capture_id: 'capture-1', image_type: 'sashibocore', grade: 'GRADE_A', confidence: 0.963, scores: { GRADE_A: 0.963, GRADE_B: 0.025, GRADE_C: 0.01, INVALID: 0.002 } }) })
  552 |   })
  553 |   await page.addInitScript(() => {
  554 |     localStorage.setItem('tunaeye-installed', 'true')
  555 |     localStorage.setItem('tunaeye-grader-name', 'Maria Santos')
  556 |   })
  557 |   
  558 |   // Complete a simulated grading flow
  559 |   await page.goto('/kiosk/weight')
  560 |   await expect(page.getByRole('heading', { name: /Fish weight/i })).toBeVisible({ timeout: 5000 })
  561 |   await page.getByRole('button', { name: '4', exact: true }).click()
  562 |   await page.getByRole('button', { name: '2', exact: true }).click()
  563 |   await page.getByRole('button', { name: 'Start capture' }).click()
  564 |   
  565 |   // Camera screen
  566 |   await expect(page.getByRole('heading', { name: /Align the sample/i })).toBeVisible()
  567 |   await page.getByRole('button', { name: 'Capture' }).click()
  568 | 
  569 |   // Review screen
  570 |   await expect(page.getByRole('heading', { name: /Use this image/i })).toBeVisible({ timeout: 5000 })
  571 |   const evidence = await page.evaluate(async () => {
  572 |     const database = await new Promise<IDBDatabase>((resolve, reject) => {
  573 |       const request = indexedDB.open('tunaeye-offline', 1)
  574 |       request.onsuccess = () => resolve(request.result)
  575 |       request.onerror = () => reject(request.error)
  576 |     })
  577 |     const records = await new Promise<unknown[]>((resolve, reject) => {
  578 |       const request = database.transaction('evidence').objectStore('evidence').getAll()
  579 |       request.onsuccess = () => resolve(request.result)
  580 |       request.onerror = () => reject(request.error)
  581 |     })
  582 |     database.close()
  583 |     return records
  584 |   })
  585 |   expect(evidence).toHaveLength(1)
  586 |   expect(evidence[0]).toMatchObject({ sample: 'Sashibo core', fishId: 'Fish 1', syncState: 'pending' })
  587 |   await page.getByRole('button', { name: 'Use Image' }).click()
  588 |   
  589 |   // Analysis screen -> Result screen
  590 |   await expect(page.getByRole('heading', { name: /Sashibo core · Grade/i })).toBeVisible({ timeout: 10000 })
  591 |   await page.getByRole('button', { name: 'Manual override' }).click()
  592 |   const override = page.getByRole('dialog', { name: 'Manual override' })
  593 |   await expect(override).toBeVisible()
  594 |   await expect(override.locator('.otp-inputs input')).toHaveCount(4)
  595 |   await expect(override.locator('.pin-key-btn')).toHaveCount(12)
  596 |   const overrideBox = await override.locator('.override-modal').boundingBox()
  597 |   expect(overrideBox!.y + overrideBox!.height).toBeLessThanOrEqual(800)
  598 |   await expect(override.getByRole('button', { name: 'Unlock override' })).toBeInViewport()
  599 |   await override.getByRole('button', { name: 'Cancel' }).click()
  600 |   await page.getByRole('button', { name: 'View results overview' }).click()
  601 |   
  602 |   // Overview screen -> Print
  603 |   await expect(page.getByRole('heading', { name: /Review samples/i })).toBeVisible()
  604 |   await page.getByRole('button', { name: /Print separate copies/i }).click()
  605 |   
  606 |   // Print screen -> Skip printing to complete
  607 |   await expect(page.getByRole('button', { name: 'Skip printing' })).toBeVisible({ timeout: 5000 })
  608 |   await page.getByRole('button', { name: 'Skip printing' }).click()
  609 |   await page.getByRole('dialog', { name: 'Skip printing?' }).getByRole('button', { name: 'Skip receipt' }).click()
  610 |   
  611 |   // Complete screen
  612 |   await expect(page.getByRole('heading', { name: 'Results printed.' })).toBeVisible()
  613 |   
  614 |   // Return to grader dashboard
  615 |   await page.getByRole('button', { name: 'Dashboard' }).click()
  616 |   await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible()
  617 |   
  618 |   // Verify recent grading records contains the newly completed session
  619 |   const records = page.locator('.grader-record-item')
  620 |   expect(await records.count()).toBeGreaterThanOrEqual(1)
  621 |   await expect(records.first()).toContainText('Sashibo core')
  622 |   await expect(records.first().locator('img')).toBeVisible()
  623 |   const savedRecords = await page.evaluate(() => JSON.parse(localStorage.getItem('tunaeye-records') ?? '[]'))
  624 |   expect(savedRecords[0].capturedImageId).toBeTruthy()
  625 |   expect(savedRecords[0].result).toMatchObject({ inferenceId: 'grade-1', captureId: 'capture-1', originalGrade: 'A', originalConfidence: 96.3, rawConfidence: 0.963, imageType: 'sashibocore', modelSource: 'raspberry-pi' })
  626 |   expect(gradeBody).toContain('name="image_type"')
  627 |   expect(gradeBody).toContain('sashibocore')
  628 |   expect(gradeBody).toContain('name="image"; filename="capture.jpg"')
  629 |   expect(gradeBytes?.includes(Buffer.from([0xff, 0xd8, 0xff, 0xd9]))).toBe(true)
  630 |   expect(savedRecords[0].transaction.syncState).toBe('pending')
  631 |   expect(JSON.stringify(savedRecords)).not.toContain('data:image')
  632 | 
  633 |   await page.getByRole('button', { name: 'Sync now' }).click()
> 634 |   await expect(page.getByRole('heading', { name: 'Sync unavailable' })).toBeVisible()
      |                                                                         ^ Error: expect(locator).toBeVisible() failed
  635 |   const afterFailedSync = await page.evaluate(() => JSON.parse(localStorage.getItem('tunaeye-records') ?? '[]'))
  636 |   expect(afterFailedSync[0].transaction.syncState).toBe('pending')
  637 | })
  638 | 
  639 | test('58mm thermal printer receipt preview and print layout', async ({ page }) => {
  640 |   await page.addInitScript(() => {
  641 |     localStorage.setItem('tunaeye-installed', 'true')
  642 |     localStorage.setItem('tunaeye-grader-name', 'Maria Santos')
  643 |   })
  644 |   await page.goto('/kiosk/print')
  645 |   await expect(page.getByRole('heading', { name: /Print grading records|Print the next result/i })).toBeVisible({ timeout: 5000 })
  646 | 
  647 |   // Verify 58mm thermal receipt preview & POS-58 chassis indicator
  648 |   const printerChassis = page.locator('.receipt-container-v2')
  649 |   await expect(printerChassis).toBeVisible()
  650 |   await expect(page.getByText('POS-58')).toBeVisible()
  651 | 
  652 |   // Verify physical 58mm thermal slip exists in DOM with ESC/POS 58MM metadata
  653 |   const thermalSlip = page.locator('.thermal-print-slip')
  654 |   await expect(thermalSlip).toHaveCount(1)
  655 |   await expect(thermalSlip).toContainText('TUNAEYE')
  656 |   await expect(thermalSlip).toContainText('QUALITY INSPECTION SLIP')
  657 |   await expect(thermalSlip).toContainText('ESC/POS 58MM')
  658 | 
  659 |   // Verify print media emulation displays the physical 58mm slip cleanly
  660 |   await page.emulateMedia({ media: 'print' })
  661 |   await expect(thermalSlip).toBeVisible()
  662 | 
  663 |   const slipStyle = await thermalSlip.evaluate((el) => {
  664 |     const computed = window.getComputedStyle(el)
  665 |     return {
  666 |       display: computed.display,
  667 |       visibility: computed.visibility,
  668 |       position: computed.position
  669 |     }
  670 |   })
  671 |   expect(slipStyle.visibility).toBe('visible')
  672 |   expect(slipStyle.display).toBe('block')
  673 | })
  674 | 
  675 | test('weight entry enforces the 15 to 200 kg range', async ({ page }) => {
  676 |   await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))
  677 |   await page.goto('/kiosk/weight')
  678 |   const input = page.locator('.weight-input input').first()
  679 | 
  680 |   await page.getByRole('button', { name: '0', exact: true }).click()
  681 |   await page.getByRole('button', { name: '8', exact: true }).click()
  682 |   await expect(input).toHaveValue('8')
  683 |   await expect(page.locator('.weight-limit-dialog')).toContainText('minimum is 15 kg')
  684 |   await expect(page.getByRole('button', { name: 'Start capture' })).toBeDisabled()
  685 | 
  686 |   await page.getByRole('button', { name: 'Clear' }).click()
  687 |   for (const digit of ['8', '9', '9']) await page.getByRole('button', { name: digit, exact: true }).click()
  688 |   await expect(input).toHaveValue('899')
  689 |   await expect(page.locator('.weight-limit-dialog')).toContainText('maximum is 200 kg')
  690 |   await expect(page.getByRole('button', { name: 'Start capture' })).toBeDisabled()
  691 |   await expect(page.locator('.weight-input-display')).toHaveClass(/is-error/)
  692 |   await page.screenshot({ path: 'test-results/weight-limit-1280x800.png', fullPage: false })
  693 | 
  694 |   const inputBox = await input.boundingBox()
  695 |   const unitBox = await page.locator('.weight-input-display b').first().boundingBox()
  696 |   expect(unitBox!.x - (inputBox!.x + inputBox!.width)).toBeLessThanOrEqual(12)
  697 | })
  698 | 
  699 | test('completion actions and grader logout return to the kiosk landing', async ({ page }) => {
  700 |   await page.addInitScript(() => {
  701 |     localStorage.setItem('tunaeye-installed', 'true')
  702 |     localStorage.setItem('tunaeye-grader-name', 'Maria Santos')
  703 |   })
  704 |   await page.goto('/kiosk/complete')
  705 |   await expect(page.getByRole('button', { name: 'Grade another' })).toBeVisible()
  706 |   await expect(page.getByRole('button', { name: 'Dashboard' })).toBeVisible()
  707 |   await page.screenshot({ path: 'test-results/completion-actions-1280x800.png', fullPage: false })
  708 |   await page.getByRole('button', { name: 'Logout' }).click()
  709 |   await expect(page.getByRole('button', { name: 'Get started' })).toBeVisible()
  710 |   await expect(page.locator('.welcome-brand-hero__mark')).toHaveCount(0)
  711 |   await expect(page.locator('.welcome-brand-hero__title')).toContainText('TUNAEYE')
  712 |   expect(await page.evaluate(() => localStorage.getItem('tunaeye-grader-name'))).toBeNull()
  713 | })
  714 | 
  715 | for (const viewport of [
  716 |   { width: 1024, height: 600 },
  717 |   { width: 1280, height: 800 },
  718 |   { width: 1024, height: 768 },
  719 |   { width: 800, height: 1280 },
  720 |   { width: 1366, height: 768 },
  721 | ]) {
  722 |   test(`QA tablet surfaces fit and remain readable at ${viewport.width}x${viewport.height}`, async ({ page }) => {
  723 |     const browserErrors: string[] = []
  724 |     const failedRequests: string[] = []
  725 |     page.on('console', message => { if (message.type() === 'error') browserErrors.push(message.text()) })
  726 |     page.on('pageerror', error => browserErrors.push(error.message))
  727 |     page.on('requestfailed', request => failedRequests.push(`${request.method()} ${request.url()}`))
  728 |     await page.setViewportSize(viewport)
  729 |     await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))
  730 | 
  731 |     const expectNoHorizontalOverflow = async () => {
  732 |       expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  733 |     }
  734 | 
```