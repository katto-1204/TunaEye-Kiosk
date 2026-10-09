# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kiosk.spec.ts >> QA tablet surfaces fit and remain readable at 800x1280
- Location: tests\kiosk.spec.ts:748:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.boundingBox: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.association-options button').nth(1)
    - locator resolved to visible <button class="">…</button>

```

# Page snapshot

```yaml
- generic [ref=f3e3]:
  - main [ref=f3e4]:
    - generic [ref=f3e5]:
      - generic [ref=f3e6]:
        - generic [ref=f3e7]: Choose your workspace
        - heading "Who's grading?" [level=1] [ref=f3e8]
        - paragraph [ref=f3e9]: Open the tools designed for your role at this station.
      - generic [ref=f3e10]:
        - button "Station control Admin Manage records, people, devices, pricing, and station settings. Open admin console" [ref=f3e11] [cursor=pointer]:
          - generic [ref=f3e12]: Station control
          - generic [ref=f3e23]:
            - strong [ref=f3e24]: Admin
            - generic [ref=f3e25]: Manage records, people, devices, pricing, and station settings.
          - generic [ref=f3e26]: Open admin console
        - button "Expert workflow Expert Grader Capture tuna samples, review AI results, and print grading records. Start grading" [ref=f3e29] [cursor=pointer]:
          - generic [ref=f3e30]: Expert workflow
          - generic [ref=f3e39]:
            - strong [ref=f3e40]: Expert Grader
            - generic [ref=f3e41]: Capture tuna samples, review AI results, and print grading records.
          - generic [ref=f3e42]: Start grading
      - generic [ref=f3e45]:
        - button "Back" [ref=f3e46] [cursor=pointer]
        - button [ref=f3e49] [cursor=pointer]
  - dialog [ref=f3e53]:
    - generic [ref=f3e54]:
      - generic [ref=f3e62]:
        - heading "Session wasn't saved" [level=2] [ref=f3e63]
        - paragraph [ref=f3e64]: Your unfinished grading session was cleared when TunaEye refreshed. Completed records on this device were kept. Choose a role to start again.
      - button "Choose a role" [active] [ref=f3e66] [cursor=pointer]
```

# Test source

```ts
  678 |   const thermalSlip = page.locator('.thermal-print-slip')
  679 |   await expect(thermalSlip).toHaveCount(1)
  680 |   await expect(thermalSlip).toContainText('TUNAEYE')
  681 |   await expect(thermalSlip).toContainText('QUALITY INSPECTION SLIP')
  682 |   await expect(thermalSlip).toContainText('ESC/POS 58MM')
  683 | 
  684 |   // Verify print media emulation displays the physical 58mm slip cleanly
  685 |   await page.emulateMedia({ media: 'print' })
  686 |   await expect(thermalSlip).toBeVisible()
  687 | 
  688 |   const slipStyle = await thermalSlip.evaluate((el) => {
  689 |     const computed = window.getComputedStyle(el)
  690 |     return {
  691 |       display: computed.display,
  692 |       visibility: computed.visibility,
  693 |       position: computed.position
  694 |     }
  695 |   })
  696 |   expect(slipStyle.visibility).toBe('visible')
  697 |   expect(slipStyle.display).toBe('block')
  698 | })
  699 | 
  700 | test('weight entry enforces the 15 to 200 kg range', async ({ page }) => {
  701 |   await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))
  702 |   await page.goto('/kiosk/weight')
  703 |   const input = page.locator('.weight-input input').first()
  704 | 
  705 |   await page.getByRole('button', { name: '0', exact: true }).click()
  706 |   await page.getByRole('button', { name: '8', exact: true }).click()
  707 |   await expect(input).toHaveValue('8')
  708 |   await expect(page.locator('.weight-limit-dialog')).toContainText('minimum is 15 kg')
  709 |   await expect(page.getByRole('button', { name: 'Start capture' })).toBeDisabled()
  710 | 
  711 |   await page.getByRole('button', { name: 'Clear' }).click()
  712 |   for (const digit of ['8', '9', '9']) await page.getByRole('button', { name: digit, exact: true }).click()
  713 |   await expect(input).toHaveValue('899')
  714 |   await expect(page.locator('.weight-limit-dialog')).toContainText('maximum is 200 kg')
  715 |   await expect(page.getByRole('button', { name: 'Start capture' })).toBeDisabled()
  716 |   await expect(page.locator('.weight-input-display')).toHaveClass(/is-error/)
  717 |   await page.screenshot({ path: 'test-results/weight-limit-1280x800.png', fullPage: false })
  718 | 
  719 |   const inputBox = await input.boundingBox()
  720 |   const unitBox = await page.locator('.weight-input-display b').first().boundingBox()
  721 |   expect(unitBox!.x - (inputBox!.x + inputBox!.width)).toBeLessThanOrEqual(12)
  722 | })
  723 | 
  724 | test('completion actions and grader logout return to the kiosk landing', async ({ page }) => {
  725 |   await page.addInitScript(() => {
  726 |     localStorage.setItem('tunaeye-installed', 'true')
  727 |     localStorage.setItem('tunaeye-grader-name', 'Maria Santos')
  728 |   })
  729 |   await page.goto('/kiosk/complete')
  730 |   await expect(page.getByRole('button', { name: 'Grade another' })).toBeVisible()
  731 |   await expect(page.getByRole('button', { name: 'Dashboard' })).toBeVisible()
  732 |   await page.screenshot({ path: 'test-results/completion-actions-1280x800.png', fullPage: false })
  733 |   await page.getByRole('button', { name: 'Logout' }).click()
  734 |   await expect(page.getByRole('button', { name: 'Get started' })).toBeVisible()
  735 |   await expect(page.locator('.welcome-brand-hero__mark')).toHaveCount(0)
  736 |   await expect(page.locator('.welcome-brand-hero__title')).toContainText('TUNAEYE')
  737 |   expect(await page.evaluate(() => localStorage.getItem('tunaeye-grader-name'))).toBeNull()
  738 | })
  739 | 
  740 | for (const viewport of [
  741 |   { width: 1000, height: 650 },
  742 |   { width: 1024, height: 600 },
  743 |   { width: 1280, height: 800 },
  744 |   { width: 1024, height: 768 },
  745 |   { width: 800, height: 1280 },
  746 |   { width: 1366, height: 768 },
  747 | ]) {
  748 |   test(`QA tablet surfaces fit and remain readable at ${viewport.width}x${viewport.height}`, async ({ page }) => {
  749 |     const browserErrors: string[] = []
  750 |     const failedRequests: string[] = []
  751 |     page.on('console', message => { if (message.type() === 'error') browserErrors.push(message.text()) })
  752 |     page.on('pageerror', error => browserErrors.push(error.message))
  753 |     page.on('requestfailed', request => failedRequests.push(`${request.method()} ${request.url()}`))
  754 |     await page.setViewportSize(viewport)
  755 |     await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))
  756 | 
  757 |     const expectNoHorizontalOverflow = async () => {
  758 |       expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  759 |     }
  760 | 
  761 |     await page.goto('/kiosk/select-role')
  762 |     const roleCards = page.locator('.role-card-v2')
  763 |     await expect(roleCards).toHaveCount(2)
  764 |     expect((await roleCards.first().boundingBox())!.height).toBeGreaterThanOrEqual(200)
  765 |     expect((await roleCards.first().boundingBox())!.width).toBeGreaterThanOrEqual(viewport.width < 900 ? 260 : 300)
  766 |     await expectNoHorizontalOverflow()
  767 | 
  768 |     await page.goto('/kiosk/tutorial')
  769 |     await expect(page.locator('.tutorial-stage__number')).toHaveText('01')
  770 |     await expect(page.locator('.tutorial-stage__number')).toBeVisible()
  771 |     await expectNoHorizontalOverflow()
  772 | 
  773 |     await page.goto('/kiosk/sample')
  774 |     await page.getByRole('button', { name: /Tail cut/ }).click()
  775 |     await page.getByRole('button', { name: 'Continue' }).click()
  776 |     const associationCards = page.locator('.association-options button')
  777 |     await expect(associationCards).toHaveCount(2)
> 778 |     const [firstCard, secondCard] = await Promise.all([associationCards.nth(0).boundingBox(), associationCards.nth(1).boundingBox()])
      |                                                                                                                       ^ Error: locator.boundingBox: Test timeout of 30000ms exceeded.
  779 |     expect(Math.abs(firstCard!.height - secondCard!.height)).toBeLessThanOrEqual(1)
  780 |     expect(Math.abs((firstCard!.x + secondCard!.x + secondCard!.width) / 2 - viewport.width / 2)).toBeLessThan(28)
  781 |     await expect(page.getByRole('button', { name: 'Continue' })).toBeInViewport()
  782 |     await expectNoHorizontalOverflow()
  783 | 
  784 |     await page.goto('/kiosk/print')
  785 |     expect((await page.locator('.print-queue > div').first().boundingBox())!.height).toBeGreaterThanOrEqual(viewport.height > viewport.width ? 60 : 68)
  786 |     await expect(page.getByRole('button', { name: 'Skip printing' })).toBeInViewport()
  787 |     const receipt = await page.locator('.receipt-container-v2').boundingBox()
  788 |     const printActions = await page.locator('.screen-stack--print > .bottom-bar').boundingBox()
  789 |     expect(receipt!.y + receipt!.height).toBeLessThanOrEqual(printActions!.y)
  790 |     await expectNoHorizontalOverflow()
  791 |     await page.screenshot({ path: `test-results/print-${viewport.width}x${viewport.height}.png`, fullPage: false })
  792 | 
  793 |     await page.goto('/kiosk/complete')
  794 |     const gradeAnother = await page.getByRole('button', { name: 'Grade another' }).boundingBox()
  795 |     expect(Math.abs(gradeAnother!.x + gradeAnother!.width / 2 - viewport.width / 2)).toBeLessThan(8)
  796 |     const dashboard = await page.getByRole('button', { name: 'Dashboard' }).boundingBox()
  797 |     const logout = await page.getByRole('button', { name: 'Logout' }).boundingBox()
  798 |     expect(Math.abs(dashboard!.y - logout!.y)).toBeLessThanOrEqual(1)
  799 |     await expectNoHorizontalOverflow()
  800 | 
  801 |     await page.goto('/kiosk/admin-dashboard')
  802 |     await expect(page.getByRole('heading', { name: 'Good day, Admin.' })).toBeVisible()
  803 |     expect((await page.getByRole('heading', { name: 'Good day, Admin.' }).boundingBox())!.height).toBeGreaterThanOrEqual(36)
  804 |     await expectNoHorizontalOverflow()
  805 | 
  806 |     await page.screenshot({ path: `test-results/tablet-${viewport.width}x${viewport.height}.png`, fullPage: false })
  807 |     expect(browserErrors).toEqual([])
  808 |     expect(failedRequests).toEqual([])
  809 |   })
  810 | }
  811 | 
```