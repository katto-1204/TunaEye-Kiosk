# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kiosk.spec.ts >> QA tablet surfaces fit and remain readable at 1366x768
- Location: tests\kiosk.spec.ts:584:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.boundingBox: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.print-queue > div').first()

```

# Page snapshot

```yaml
- main [ref=f5e4]:
  - generic [ref=f5e5]:
    - generic [ref=f5e6]:
      - generic [ref=f5e7]: Choose your workspace
      - heading "Who's grading?" [level=1] [ref=f5e8]
      - paragraph [ref=f5e9]: Open the tools designed for your role at this station.
    - generic [ref=f5e10]:
      - button "Station control Admin Manage records, people, devices, pricing, and station settings. Open admin console" [ref=f5e11] [cursor=pointer]:
        - generic [ref=f5e12]: Station control
        - generic [ref=f5e23]:
          - strong [ref=f5e24]: Admin
          - generic [ref=f5e25]: Manage records, people, devices, pricing, and station settings.
        - generic [ref=f5e26]: Open admin console
      - button "Expert workflow Expert Grader Capture tuna samples, review AI results, and print grading records. Start grading" [ref=f5e29] [cursor=pointer]:
        - generic [ref=f5e30]: Expert workflow
        - generic [ref=f5e39]:
          - strong [ref=f5e40]: Expert Grader
          - generic [ref=f5e41]: Capture tuna samples, review AI results, and print grading records.
        - generic [ref=f5e42]: Start grading
    - generic [ref=f5e45]:
      - button "Back" [ref=f5e46] [cursor=pointer]
      - button [ref=f5e49] [cursor=pointer]
```

# Test source

```ts
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
  610 |     await page.getByRole('button', { name: /Tail cut/ }).click()
  611 |     await page.getByRole('button', { name: 'Continue' }).click()
  612 |     const associationCards = page.locator('.association-options button')
  613 |     await expect(associationCards).toHaveCount(2)
  614 |     const [firstCard, secondCard] = await Promise.all([associationCards.nth(0).boundingBox(), associationCards.nth(1).boundingBox()])
  615 |     expect(Math.abs(firstCard!.height - secondCard!.height)).toBeLessThanOrEqual(1)
  616 |     expect(Math.abs((firstCard!.x + secondCard!.x + secondCard!.width) / 2 - viewport.width / 2)).toBeLessThan(28)
  617 |     await expect(page.getByRole('button', { name: 'Continue' })).toBeInViewport()
  618 |     await expectNoHorizontalOverflow()
  619 | 
  620 |     await page.goto('/kiosk/print')
> 621 |     expect((await page.locator('.print-queue > div').first().boundingBox())!.height).toBeGreaterThanOrEqual(viewport.height > viewport.width ? 60 : 68)
      |                                                              ^ Error: locator.boundingBox: Test timeout of 30000ms exceeded.
  622 |     await expect(page.getByRole('button', { name: 'Skip printing' })).toBeInViewport()
  623 |     const receipt = await page.locator('.receipt-container-v2').boundingBox()
  624 |     const printActions = await page.locator('.screen-stack--print > .bottom-bar').boundingBox()
  625 |     expect(receipt!.y + receipt!.height).toBeLessThanOrEqual(printActions!.y)
  626 |     await expectNoHorizontalOverflow()
  627 |     await page.screenshot({ path: `test-results/print-${viewport.width}x${viewport.height}.png`, fullPage: false })
  628 | 
  629 |     await page.goto('/kiosk/complete')
  630 |     const gradeAnother = await page.getByRole('button', { name: 'Grade another' }).boundingBox()
  631 |     expect(Math.abs(gradeAnother!.x + gradeAnother!.width / 2 - viewport.width / 2)).toBeLessThan(8)
  632 |     const dashboard = await page.getByRole('button', { name: 'Dashboard' }).boundingBox()
  633 |     const logout = await page.getByRole('button', { name: 'Logout' }).boundingBox()
  634 |     expect(Math.abs(dashboard!.y - logout!.y)).toBeLessThanOrEqual(1)
  635 |     await expectNoHorizontalOverflow()
  636 | 
  637 |     await page.goto('/kiosk/admin-dashboard')
  638 |     await expect(page.getByRole('heading', { name: 'Good day, Admin.' })).toBeVisible()
  639 |     expect((await page.getByRole('heading', { name: 'Good day, Admin.' }).boundingBox())!.height).toBeGreaterThanOrEqual(36)
  640 |     await expectNoHorizontalOverflow()
  641 | 
  642 |     await page.screenshot({ path: `test-results/tablet-${viewport.width}x${viewport.height}.png`, fullPage: false })
  643 |     expect(browserErrors).toEqual([])
  644 |     expect(failedRequests).toEqual([])
  645 |   })
  646 | }
  647 | 
```