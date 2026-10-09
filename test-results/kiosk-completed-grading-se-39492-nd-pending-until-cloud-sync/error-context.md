# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kiosk.spec.ts >> completed grading session remains local and pending until cloud sync
- Location: tests\kiosk.spec.ts:411:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /Enter the fish weight/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: /Enter the fish weight/i }) with timeout 5000ms
  - waiting for getByRole('heading', { name: /Enter the fish weight/i })

```

```yaml
- main:
  - heading "Fish weight" [level=1]
  - strong: Fish 1
  - text: Sashibo core Enter a weight greater than zero
  - textbox "0.0"
  - text: kg
  - button "1"
  - button "2"
  - button "3"
  - button "4"
  - button "5"
  - button "6"
  - button "7"
  - button "8"
  - button "9"
  - button "."
  - button "0"
  - button "⌫"
  - button "Clear"
  - button "Back"
  - button "Start capture" [disabled]
```

# Test source

```ts
  325 |   
  326 |   // Click Help button
  327 |   await page.getByRole('button', { name: 'Help' }).click()
  328 |   
  329 |   // Verify custom notice modal appears
  330 |   const modal = page.locator('.modal-card--notice')
  331 |   await expect(modal).toBeVisible()
  332 |   await expect(modal.getByRole('heading', { name: 'Camera Alignment Guide' })).toBeVisible()
  333 |   
  334 |   // Close modal
  335 |   await page.getByRole('button', { name: 'Understood' }).click()
  336 |   await expect(modal).not.toBeVisible()
  337 | })
  338 | 
  339 | test('camera capture shows progress and recovers from Pi failure', async ({ page }) => {
  340 |   await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))
  341 |   await page.route('http://10.42.0.1:8080/**', async route => {
  342 |     await new Promise(resolve => setTimeout(resolve, 250))
  343 |     await route.fulfill({ status: 503, body: 'Camera unavailable' })
  344 |   })
  345 |   await page.goto('/kiosk/camera')
  346 |   await page.getByRole('button', { name: 'Capture' }).click()
  347 |   await expect(page.getByRole('button', { name: 'Capturing…' })).toBeDisabled()
  348 |   await expect(page.getByRole('alert')).toContainText('Camera capture failed')
  349 |   await expect(page.getByRole('button', { name: 'Capture' })).toBeEnabled()
  350 | })
  351 | 
  352 | test('printing failure stays on receipt and offers retry', async ({ page }) => {
  353 |   await page.addInitScript(() => {
  354 |     localStorage.setItem('tunaeye-installed', 'true')
  355 |     window.print = () => { throw new Error('Printer unavailable') }
  356 |   })
  357 |   await page.goto('/kiosk/print')
  358 |   await page.getByRole('button', { name: /Print Sashibo core/ }).click()
  359 |   await expect(page.getByRole('dialog', { name: 'Printing failed' })).toBeVisible()
  360 |   await expect(page).toHaveURL(/\/kiosk\/print$/)
  361 |   await expect(page.getByRole('button', { name: 'Try again' })).toBeFocused()
  362 | })
  363 | 
  364 | test('skipping a receipt requires confirmation', async ({ page }) => {
  365 |   await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))
  366 |   await page.goto('/kiosk/print')
  367 |   await page.getByRole('button', { name: 'Skip printing' }).click()
  368 |   const dialog = page.getByRole('dialog', { name: 'Skip printing?' })
  369 |   await expect(dialog).toBeVisible()
  370 |   await dialog.getByRole('button', { name: 'Keep printing' }).click()
  371 |   await expect(page).toHaveURL(/\/kiosk\/print$/)
  372 | })
  373 | 
  374 | test('uploaded image uses the same saved-evidence and Pi inference flow', async ({ page }) => {
  375 |   let gradeBody = ''
  376 |   const browserErrors: string[] = []
  377 |   const failedRequests: string[] = []
  378 |   page.on('console', message => { if (message.type() === 'error') browserErrors.push(message.text()) })
  379 |   page.on('pageerror', error => browserErrors.push(error.message))
  380 |   page.on('requestfailed', request => failedRequests.push(`${request.method()} ${request.url()}`))
  381 |   await page.setViewportSize({ width: 1024, height: 600 })
  382 |   await page.route('http://10.42.0.1:8080/**', route => route.fulfill({ contentType: 'image/jpeg', body: Buffer.from([0xff, 0xd8, 0xff, 0xd9]) }))
  383 |   await page.route('http://10.42.0.1:5000/grade', async route => {
  384 |     gradeBody = route.request().postData() ?? ''
  385 |     await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ id: 'upload-grade', capture_id: 'upload-capture', grade: 'GRADE_B', confidence: 0.91, scores: { GRADE_A: 0.05, GRADE_B: 0.91, GRADE_C: 0.03, INVALID: 0.01 } }) })
  386 |   })
  387 |   await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))
  388 |   await page.goto('/kiosk/camera')
  389 |   await expect(page.getByRole('button', { name: 'Upload image' })).toBeInViewport()
  390 |   await page.getByLabel('Upload specimen image').setInputFiles('public/assets/sashiboCoreFull.png')
  391 |   await expect(page.getByRole('heading', { name: 'Use this image?' })).toBeVisible()
  392 |   await page.getByRole('button', { name: 'Use Image' }).click()
  393 |   await expect(page.getByRole('heading', { name: 'Sashibo core · Grade B' })).toBeVisible()
  394 |   expect(gradeBody).toContain('sashibocore')
  395 |   expect(gradeBody).toContain('name="image"; filename="capture.jpg"')
  396 |   const evidenceType = await page.evaluate(async () => await new Promise<string | undefined>((resolve, reject) => {
  397 |     const open = indexedDB.open('tunaeye-offline', 1)
  398 |     open.onerror = () => reject(open.error)
  399 |     open.onsuccess = () => {
  400 |       const get = open.result.transaction('evidence').objectStore('evidence').getAll()
  401 |       get.onerror = () => reject(get.error)
  402 |       get.onsuccess = () => resolve(get.result[0]?.mimeType)
  403 |     }
  404 |   }))
  405 |   expect(evidenceType).toBe('image/jpeg')
  406 |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  407 |   expect(browserErrors).toEqual([])
  408 |   expect(failedRequests).toEqual([])
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
> 425 |   await expect(page.getByRole('heading', { name: /Enter the fish weight/i })).toBeVisible({ timeout: 5000 })
      |                                                                               ^ Error: expect(locator).toBeVisible() failed
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
  509 |   await expect(page.getByRole('heading', { name: /Print separate grading records|Print the next result/i })).toBeVisible({ timeout: 5000 })
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
```