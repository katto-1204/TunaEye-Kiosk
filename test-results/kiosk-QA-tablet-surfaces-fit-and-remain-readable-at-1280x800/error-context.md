# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kiosk.spec.ts >> QA tablet surfaces fit and remain readable at 1280x800
- Location: tests\kiosk.spec.ts:785:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /Tail cut/ })
    - waiting for navigation to finish...
    - navigated to "http://127.0.0.1:4178/kiosk/sample"

```

# Page snapshot

```yaml
- main [ref=f7e4]:
  - generic [ref=f7e5]:
    - generic [ref=f7e6]:
      - generic [ref=f7e7]: Choose your workspace
      - heading "Who's grading?" [level=1] [ref=f7e8]
      - paragraph [ref=f7e9]: Open the tools designed for your role at this station.
    - generic [ref=f7e10]:
      - button "Station control Admin Open admin console" [ref=f7e11] [cursor=pointer]:
        - generic [ref=f7e12]: Station control
        - strong [ref=f7e24]: Admin
        - generic [ref=f7e25]: Open admin console
      - button "Expert workflow Expert Grader Start grading" [ref=f7e28] [cursor=pointer]:
        - generic [ref=f7e29]: Expert workflow
        - strong [ref=f7e39]: Expert Grader
        - generic [ref=f7e40]: Start grading
    - button "Back" [ref=f7e45] [cursor=pointer]
```

# Test source

```ts
  711 |   await expect(printerChassis).toBeVisible()
  712 |   await expect(page.getByText('POS-58')).toBeVisible()
  713 | 
  714 |   // Verify physical 58mm thermal slip exists in DOM with ESC/POS 58MM metadata
  715 |   const thermalSlip = page.locator('.thermal-print-slip')
  716 |   await expect(thermalSlip).toHaveCount(1)
  717 |   await expect(thermalSlip).toContainText('TUNAEYE')
  718 |   await expect(thermalSlip).toContainText('QUALITY INSPECTION SLIP')
  719 |   await expect(thermalSlip).toContainText('ESC/POS 58MM')
  720 | 
  721 |   // Verify print media emulation displays the physical 58mm slip cleanly
  722 |   await page.emulateMedia({ media: 'print' })
  723 |   await expect(thermalSlip).toBeVisible()
  724 | 
  725 |   const slipStyle = await thermalSlip.evaluate((el) => {
  726 |     const computed = window.getComputedStyle(el)
  727 |     return {
  728 |       display: computed.display,
  729 |       visibility: computed.visibility,
  730 |       position: computed.position
  731 |     }
  732 |   })
  733 |   expect(slipStyle.visibility).toBe('visible')
  734 |   expect(slipStyle.display).toBe('block')
  735 | })
  736 | 
  737 | test('weight entry enforces the 15 to 200 kg range', async ({ page }) => {
  738 |   await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))
  739 |   await page.goto('/kiosk/weight')
  740 |   const input = page.locator('.weight-input input').first()
  741 | 
  742 |   await page.getByRole('button', { name: '0', exact: true }).click()
  743 |   await page.getByRole('button', { name: '8', exact: true }).click()
  744 |   await expect(input).toHaveValue('8')
  745 |   await expect(page.locator('.weight-limit-dialog')).toContainText('minimum is 15 kg')
  746 |   await expect(page.getByRole('button', { name: 'Start capture' })).toBeDisabled()
  747 | 
  748 |   await page.getByRole('button', { name: 'Clear' }).click()
  749 |   for (const digit of ['8', '9', '9']) await page.getByRole('button', { name: digit, exact: true }).click()
  750 |   await expect(input).toHaveValue('899')
  751 |   await expect(page.locator('.weight-limit-dialog')).toContainText('maximum is 200 kg')
  752 |   await expect(page.getByRole('button', { name: 'Start capture' })).toBeDisabled()
  753 |   await expect(page.locator('.weight-input-display')).toHaveClass(/is-error/)
  754 |   await page.screenshot({ path: 'test-results/weight-limit-1280x800.png', fullPage: false })
  755 | 
  756 |   const inputBox = await input.boundingBox()
  757 |   const unitBox = await page.locator('.weight-input-display b').first().boundingBox()
  758 |   expect(unitBox!.x - (inputBox!.x + inputBox!.width)).toBeLessThanOrEqual(12)
  759 | })
  760 | 
  761 | test('completion actions and grader logout return to the kiosk landing', async ({ page }) => {
  762 |   await page.addInitScript(() => {
  763 |     localStorage.setItem('tunaeye-installed', 'true')
  764 |     localStorage.setItem('tunaeye-grader-name', 'Maria Santos')
  765 |   })
  766 |   await page.goto('/kiosk/complete')
  767 |   await expect(page.getByRole('button', { name: 'Grade another' })).toBeVisible()
  768 |   await expect(page.getByRole('button', { name: 'Dashboard' })).toBeVisible()
  769 |   await page.screenshot({ path: 'test-results/completion-actions-1280x800.png', fullPage: false })
  770 |   await page.getByRole('button', { name: 'Logout' }).click()
  771 |   await expect(page.getByRole('button', { name: 'Get started' })).toBeVisible()
  772 |   await expect(page.locator('.welcome-brand-hero__mark')).toHaveCount(0)
  773 |   await expect(page.locator('.welcome-brand-hero__title')).toContainText('TUNAEYE')
  774 |   expect(await page.evaluate(() => localStorage.getItem('tunaeye-grader-name'))).toBeNull()
  775 | })
  776 | 
  777 | for (const viewport of [
  778 |   { width: 1000, height: 650 },
  779 |   { width: 1024, height: 600 },
  780 |   { width: 1280, height: 800 },
  781 |   { width: 1024, height: 768 },
  782 |   { width: 800, height: 1280 },
  783 |   { width: 1366, height: 768 },
  784 | ]) {
  785 |   test(`QA tablet surfaces fit and remain readable at ${viewport.width}x${viewport.height}`, async ({ page }) => {
  786 |     const browserErrors: string[] = []
  787 |     const failedRequests: string[] = []
  788 |     page.on('console', message => { if (message.type() === 'error') browserErrors.push(message.text()) })
  789 |     page.on('pageerror', error => browserErrors.push(error.message))
  790 |     page.on('requestfailed', request => failedRequests.push(`${request.method()} ${request.url()}`))
  791 |     await page.setViewportSize(viewport)
  792 |     await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))
  793 | 
  794 |     const expectNoHorizontalOverflow = async () => {
  795 |       expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  796 |     }
  797 | 
  798 |     await page.goto('/kiosk/select-role')
  799 |     const roleCards = page.locator('.role-card-v2')
  800 |     await expect(roleCards).toHaveCount(2)
  801 |     expect((await roleCards.first().boundingBox())!.height).toBeGreaterThanOrEqual(200)
  802 |     expect((await roleCards.first().boundingBox())!.width).toBeGreaterThanOrEqual(viewport.width < 900 ? 260 : 300)
  803 |     await expectNoHorizontalOverflow()
  804 | 
  805 |     await page.goto('/kiosk/tutorial')
  806 |     await expect(page.locator('.tutorial-stage__number')).toHaveText('01')
  807 |     await expect(page.locator('.tutorial-stage__number')).toBeVisible()
  808 |     await expectNoHorizontalOverflow()
  809 | 
  810 |     await page.goto('/kiosk/sample')
> 811 |     await page.getByRole('button', { name: /Tail cut/ }).click()
      |                                                          ^ Error: locator.click: Test timeout of 30000ms exceeded.
  812 |     await page.getByRole('button', { name: 'Continue' }).click()
  813 |     const associationCards = page.locator('.association-options button')
  814 |     await expect(associationCards).toHaveCount(2)
  815 |     const [firstCard, secondCard] = await Promise.all([associationCards.nth(0).boundingBox(), associationCards.nth(1).boundingBox()])
  816 |     expect(Math.abs(firstCard!.height - secondCard!.height)).toBeLessThanOrEqual(1)
  817 |     expect(Math.abs((firstCard!.x + secondCard!.x + secondCard!.width) / 2 - viewport.width / 2)).toBeLessThan(28)
  818 |     await expect(page.getByRole('button', { name: 'Continue' })).toBeInViewport()
  819 |     await expectNoHorizontalOverflow()
  820 | 
  821 |     await page.goto('/kiosk/print')
  822 |     expect((await page.locator('.print-queue > div').first().boundingBox())!.height).toBeGreaterThanOrEqual(viewport.height > viewport.width ? 60 : 68)
  823 |     await expect(page.getByRole('button', { name: 'Skip printing' })).toBeInViewport()
  824 |     const receipt = await page.locator('.receipt-container-v2').boundingBox()
  825 |     const printActions = await page.locator('.screen-stack--print > .bottom-bar').boundingBox()
  826 |     expect(receipt!.y + receipt!.height).toBeLessThanOrEqual(printActions!.y)
  827 |     await expectNoHorizontalOverflow()
  828 |     await page.screenshot({ path: `test-results/print-${viewport.width}x${viewport.height}.png`, fullPage: false })
  829 | 
  830 |     await page.goto('/kiosk/complete')
  831 |     const gradeAnother = await page.getByRole('button', { name: 'Grade another' }).boundingBox()
  832 |     expect(Math.abs(gradeAnother!.x + gradeAnother!.width / 2 - viewport.width / 2)).toBeLessThan(8)
  833 |     const dashboard = await page.getByRole('button', { name: 'Dashboard' }).boundingBox()
  834 |     const logout = await page.getByRole('button', { name: 'Logout' }).boundingBox()
  835 |     expect(Math.abs(dashboard!.y - logout!.y)).toBeLessThanOrEqual(1)
  836 |     await expectNoHorizontalOverflow()
  837 | 
  838 |     await page.goto('/kiosk/admin-dashboard')
  839 |     await expect(page.getByRole('heading', { name: 'Good day, Admin.' })).toBeVisible()
  840 |     expect((await page.getByRole('heading', { name: 'Good day, Admin.' }).boundingBox())!.height).toBeGreaterThanOrEqual(36)
  841 |     await expectNoHorizontalOverflow()
  842 | 
  843 |     await page.screenshot({ path: `test-results/tablet-${viewport.width}x${viewport.height}.png`, fullPage: false })
  844 |     expect(browserErrors).toEqual([])
  845 |     expect(failedRequests).toEqual([])
  846 |   })
  847 | }
  848 | 
```