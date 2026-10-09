# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kiosk.spec.ts >> completed grading session remains local and pending until cloud sync
- Location: tests\kiosk.spec.ts:608:1

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
    - emphasis: "Sync: Just now"
  - heading "Recent records" [level=2]
  - paragraph: 1 session total
  - text: Record Sample Weight Grade Status
  - button "f6021249-8eb5-49db-9c1b-d75b36dc47d5-1 6:39 AM Captured Sashibo core Sashibo core Fish 1 · 96.3% confidence Saved locally 42 kg A Complete":
    - strong: f6021249-8eb5-49db-9c1b-d75b36dc47d5-1
    - text: 6:39 AM
    - img "Captured Sashibo core"
    - strong: Sashibo core
    - text: Fish 1 · 96.3% confidence Saved locally 42 kg A Complete
  - button "Back"
- dialog "Waiting for internet":
  - heading "Waiting for internet" [level=2]
  - paragraph: Sync is waiting for internet. Tuna RPi Wi-Fi can provide camera and grading access without internet. Your captured images and records are saved on this device. Use Sync now when internet is available.
  - button "Understood"
```

# Test source

```ts
  599 |     }
  600 |   }))
  601 |   expect(evidence.mimeType).toBe('image/png')
  602 |   expect(evidence.storedHash).toBe(evidence.sourceHash)
  603 |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  604 |   expect(browserErrors).toEqual([])
  605 |   expect(failedRequests).toEqual([])
  606 | })
  607 | 
  608 | test('completed grading session remains local and pending until cloud sync', async ({ page }) => {
  609 |   let gradeBody = ''
  610 |   let gradeBytes: Buffer | null = null
  611 |   await page.route('http://10.42.0.1:8080/**', route => route.fulfill({ contentType: 'image/jpeg', body: Buffer.from([0xff, 0xd8, 0xff, 0xd9]) }))
  612 |   await page.route('http://10.42.0.1:5000/grade', async route => {
  613 |     gradeBody = route.request().postData() ?? ''
  614 |     gradeBytes = route.request().postDataBuffer()
  615 |     await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ id: 'grade-1', capture_id: 'capture-1', image_type: 'sashibocore', grade: 'GRADE_A', confidence: 0.963, scores: { GRADE_A: 0.963, GRADE_B: 0.025, GRADE_C: 0.01, INVALID: 0.002 } }) })
  616 |   })
  617 |   await page.addInitScript(() => {
  618 |     localStorage.setItem('tunaeye-installed', 'true')
  619 |     localStorage.setItem('tunaeye-grader-name', 'Maria Santos')
  620 |   })
  621 |   
  622 |   // Complete a simulated grading flow
  623 |   await page.goto('/kiosk/weight')
  624 |   await expect(page.getByRole('heading', { name: /Fish weight/i })).toBeVisible({ timeout: 5000 })
  625 |   await page.getByRole('button', { name: '4', exact: true }).click()
  626 |   await page.getByRole('button', { name: '2', exact: true }).click()
  627 |   await page.getByRole('button', { name: 'Start capture' }).click()
  628 |   
  629 |   // Camera screen
  630 |   await expect(page.getByRole('heading', { name: /Align the sample/i })).toBeVisible()
  631 |   await page.getByRole('button', { name: 'Capture' }).click()
  632 | 
  633 |   // Review screen
  634 |   await expect(page.getByRole('heading', { name: /Use this image/i })).toBeVisible({ timeout: 5000 })
  635 |   const evidence = await page.evaluate(async () => {
  636 |     const database = await new Promise<IDBDatabase>((resolve, reject) => {
  637 |       const request = indexedDB.open('tunaeye-offline', 1)
  638 |       request.onsuccess = () => resolve(request.result)
  639 |       request.onerror = () => reject(request.error)
  640 |     })
  641 |     const records = await new Promise<unknown[]>((resolve, reject) => {
  642 |       const request = database.transaction('evidence').objectStore('evidence').getAll()
  643 |       request.onsuccess = () => resolve(request.result)
  644 |       request.onerror = () => reject(request.error)
  645 |     })
  646 |     database.close()
  647 |     return records
  648 |   })
  649 |   expect(evidence).toHaveLength(1)
  650 |   expect(evidence[0]).toMatchObject({ sample: 'Sashibo core', fishId: 'Fish 1', syncState: 'pending' })
  651 |   await page.getByRole('button', { name: 'Use Image' }).click()
  652 |   
  653 |   // Analysis screen -> Result screen
  654 |   await expect(page.getByRole('heading', { name: /Sashibo core · Grade/i })).toBeVisible({ timeout: 10000 })
  655 |   await page.getByRole('button', { name: 'Manual override' }).click()
  656 |   const override = page.getByRole('dialog', { name: 'Manual override' })
  657 |   await expect(override).toBeVisible()
  658 |   await expect(override.locator('.otp-inputs input')).toHaveCount(4)
  659 |   await expect(override.locator('.pin-key-btn')).toHaveCount(12)
  660 |   const overrideBox = await override.locator('.override-modal').boundingBox()
  661 |   expect(overrideBox!.y + overrideBox!.height).toBeLessThanOrEqual(800)
  662 |   await expect(override.getByRole('button', { name: 'Unlock override' })).toBeInViewport()
  663 |   await override.getByRole('button', { name: 'Cancel' }).click()
  664 |   await page.getByRole('button', { name: 'View results overview' }).click()
  665 |   
  666 |   // Overview screen -> Print
  667 |   await expect(page.getByRole('heading', { name: /Review samples/i })).toBeVisible()
  668 |   await page.getByRole('button', { name: /Print separate copies/i }).click()
  669 |   
  670 |   // Print screen -> Skip printing to complete
  671 |   await expect(page.getByRole('button', { name: 'Skip printing' })).toBeVisible({ timeout: 5000 })
  672 |   await page.getByRole('button', { name: 'Skip printing' }).click()
  673 |   await page.getByRole('dialog', { name: 'Skip printing?' }).getByRole('button', { name: 'Skip receipt' }).click()
  674 |   
  675 |   // Complete screen
  676 |   await expect(page.getByRole('heading', { name: 'Results printed.' })).toBeVisible()
  677 |   
  678 |   // Return to grader dashboard
  679 |   await page.getByRole('button', { name: 'Dashboard' }).click()
  680 |   await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible()
  681 |   
  682 |   // Verify recent grading records contains the newly completed session
  683 |   const records = page.locator('.grader-record-item')
  684 |   expect(await records.count()).toBeGreaterThanOrEqual(1)
  685 |   await expect(records.first()).toContainText('Sashibo core')
  686 |   await expect(records.first().locator('img')).toBeVisible()
  687 |   const savedRecords = await page.evaluate(() => JSON.parse(localStorage.getItem('tunaeye-records') ?? '[]'))
  688 |   expect(savedRecords[0].capturedImageId).toBeTruthy()
  689 |   expect(savedRecords[0].result).toMatchObject({ inferenceId: 'grade-1', captureId: 'capture-1', originalGrade: 'A', originalConfidence: 96.3, rawConfidence: 0.963, imageType: 'sashibocore', modelSource: 'raspberry-pi' })
  690 |   expect(gradeBody).toContain('name="image_type"')
  691 |   expect(gradeBody).toContain('sashibocore')
  692 |   expect(gradeBody).toContain('name="image"; filename="capture.jpg"')
  693 |   expect(gradeBytes?.includes(Buffer.from([0xff, 0xd8, 0xff, 0xd9]))).toBe(true)
  694 |   expect(savedRecords[0].transaction.syncState).toBe('pending')
  695 |   expect(JSON.stringify(savedRecords)).not.toContain('data:image')
  696 | 
  697 |   await page.context().setOffline(true)
  698 |   await page.getByRole('button', { name: 'Sync now' }).click()
> 699 |   await expect(page.getByRole('heading', { name: 'Sync unavailable' })).toBeVisible()
      |                                                                         ^ Error: expect(locator).toBeVisible() failed
  700 |   const afterFailedSync = await page.evaluate(() => JSON.parse(localStorage.getItem('tunaeye-records') ?? '[]'))
  701 |   expect(afterFailedSync[0].transaction.syncState).toBe('pending')
  702 |   await page.context().setOffline(false)
  703 | })
  704 | 
  705 | test('58mm thermal printer receipt preview and print layout', async ({ page }) => {
  706 |   await page.addInitScript(() => {
  707 |     localStorage.setItem('tunaeye-installed', 'true')
  708 |     localStorage.setItem('tunaeye-grader-name', 'Maria Santos')
  709 |   })
  710 |   await page.goto('/kiosk/print')
  711 |   await expect(page.getByRole('heading', { name: /Print grading records|Print the next result/i })).toBeVisible({ timeout: 5000 })
  712 | 
  713 |   // Verify 58mm thermal receipt preview & POS-58 chassis indicator
  714 |   const printerChassis = page.locator('.receipt-container-v2')
  715 |   await expect(printerChassis).toBeVisible()
  716 |   await expect(page.getByText('POS-58')).toBeVisible()
  717 | 
  718 |   // Verify physical 58mm thermal slip exists in DOM with ESC/POS 58MM metadata
  719 |   const thermalSlip = page.locator('.thermal-print-slip')
  720 |   await expect(thermalSlip).toHaveCount(1)
  721 |   await expect(thermalSlip).toContainText('TUNAEYE')
  722 |   await expect(thermalSlip).toContainText('QUALITY INSPECTION SLIP')
  723 |   await expect(thermalSlip).toContainText('ESC/POS 58MM')
  724 | 
  725 |   // Verify print media emulation displays the physical 58mm slip cleanly
  726 |   await page.emulateMedia({ media: 'print' })
  727 |   await expect(thermalSlip).toBeVisible()
  728 | 
  729 |   const slipStyle = await thermalSlip.evaluate((el) => {
  730 |     const computed = window.getComputedStyle(el)
  731 |     return {
  732 |       display: computed.display,
  733 |       visibility: computed.visibility,
  734 |       position: computed.position
  735 |     }
  736 |   })
  737 |   expect(slipStyle.visibility).toBe('visible')
  738 |   expect(slipStyle.display).toBe('block')
  739 | })
  740 | 
  741 | test('weight entry enforces the 15 to 200 kg range', async ({ page }) => {
  742 |   await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))
  743 |   await page.goto('/kiosk/weight')
  744 |   const input = page.locator('.weight-input input').first()
  745 | 
  746 |   await page.getByRole('button', { name: '0', exact: true }).click()
  747 |   await page.getByRole('button', { name: '8', exact: true }).click()
  748 |   await expect(input).toHaveValue('8')
  749 |   await expect(page.locator('.weight-limit-dialog')).toContainText('minimum is 15 kg')
  750 |   await expect(page.getByRole('button', { name: 'Start capture' })).toBeDisabled()
  751 | 
  752 |   await page.getByRole('button', { name: 'Clear' }).click()
  753 |   for (const digit of ['8', '9', '9']) await page.getByRole('button', { name: digit, exact: true }).click()
  754 |   await expect(input).toHaveValue('899')
  755 |   await expect(page.locator('.weight-limit-dialog')).toContainText('maximum is 200 kg')
  756 |   await expect(page.getByRole('button', { name: 'Start capture' })).toBeDisabled()
  757 |   await expect(page.locator('.weight-input-display')).toHaveClass(/is-error/)
  758 |   await page.screenshot({ path: 'test-results/weight-limit-1280x800.png', fullPage: false })
  759 | 
  760 |   const inputBox = await input.boundingBox()
  761 |   const unitBox = await page.locator('.weight-input-display b').first().boundingBox()
  762 |   expect(unitBox!.x - (inputBox!.x + inputBox!.width)).toBeLessThanOrEqual(12)
  763 | })
  764 | 
  765 | test('completion actions and grader logout return to the kiosk landing', async ({ page }) => {
  766 |   await page.addInitScript(() => {
  767 |     localStorage.setItem('tunaeye-installed', 'true')
  768 |     localStorage.setItem('tunaeye-grader-name', 'Maria Santos')
  769 |   })
  770 |   await page.goto('/kiosk/complete')
  771 |   await expect(page.getByRole('button', { name: 'Grade another' })).toBeVisible()
  772 |   await expect(page.getByRole('button', { name: 'Dashboard' })).toBeVisible()
  773 |   await page.screenshot({ path: 'test-results/completion-actions-1280x800.png', fullPage: false })
  774 |   await page.getByRole('button', { name: 'Logout' }).click()
  775 |   await expect(page.getByRole('button', { name: 'Get started' })).toBeVisible()
  776 |   await expect(page.locator('.welcome-brand-hero__mark')).toHaveCount(0)
  777 |   await expect(page.locator('.welcome-brand-hero__title')).toContainText('TUNAEYE')
  778 |   expect(await page.evaluate(() => localStorage.getItem('tunaeye-grader-name'))).toBeNull()
  779 | })
  780 | 
  781 | for (const viewport of [
  782 |   { width: 1000, height: 650 },
  783 |   { width: 1024, height: 600 },
  784 |   { width: 1280, height: 800 },
  785 |   { width: 1024, height: 768 },
  786 |   { width: 800, height: 1280 },
  787 |   { width: 1366, height: 768 },
  788 | ]) {
  789 |   test(`QA tablet surfaces fit and remain readable at ${viewport.width}x${viewport.height}`, async ({ page }) => {
  790 |     const browserErrors: string[] = []
  791 |     const failedRequests: string[] = []
  792 |     page.on('console', message => { if (message.type() === 'error') browserErrors.push(message.text()) })
  793 |     page.on('pageerror', error => browserErrors.push(error.message))
  794 |     page.on('requestfailed', request => failedRequests.push(`${request.method()} ${request.url()}`))
  795 |     await page.setViewportSize(viewport)
  796 |     await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))
  797 | 
  798 |     const expectNoHorizontalOverflow = async () => {
  799 |       expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
```