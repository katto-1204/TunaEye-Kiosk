# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kiosk.spec.ts >> QA tablet surfaces fit and remain readable at 1024x600
- Location: tests\kiosk.spec.ts:789:3

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 68
Received:    67.99999237060547
```

# Page snapshot

```yaml
- main [ref=f3e4]:
  - generic [ref=f3e5]:
    - generic [ref=f3e6]:
      - generic [ref=f3e7]:
        - generic [ref=f3e8]: Print 1 of 1
        - heading "Print grading records." [level=1] [ref=f3e9]
        - generic [ref=f3e11]:
          - generic [ref=f3e12]: "1"
          - strong [ref=f3e13]: Sashibo core
          - generic [ref=f3e14]: Ready now
      - region "Payment Receipt Printer" [ref=f3e16]:
        - generic [ref=f3e17]:
          - generic [ref=f3e20]:
            - generic [ref=f3e21]: POS-58
            - generic [ref=f3e28]: ONLINE
          - generic [ref=f3e35]:
            - generic [ref=f3e41]:
              - heading "TunaEye Kiosk" [level=3] [ref=f3e47]
              - paragraph [ref=f3e48]: Certified Quality Inspection
            - generic [ref=f3e49]:
              - generic [ref=f3e50]:
                - generic [ref=f3e51]: "ORDER NO:"
                - generic [ref=f3e52]: "#TE-014"
              - generic [ref=f3e53]:
                - generic [ref=f3e54]: "DATE:"
                - generic [ref=f3e55]: Oct 10, 2026, 07:33 AM
              - generic [ref=f3e56]:
                - generic [ref=f3e57]: "INSPECTOR:"
                - generic [ref=f3e58]: Maria Santos
            - generic [ref=f3e60]:
              - generic [ref=f3e61]:
                - generic [ref=f3e62]: ITEM
                - generic [ref=f3e63]: PRICE
              - generic [ref=f3e64]:
                - generic [ref=f3e65]:
                  - generic [ref=f3e66]: Sashibo core (Fish 1)
                  - generic [ref=f3e67]: —
                - paragraph [ref=f3e68]: 1.0 kg · —/kg · 96% confidence
            - generic [ref=f3e70]:
              - generic [ref=f3e71]: "TOTAL:"
              - generic [ref=f3e72]: —
            - generic [ref=f3e73]: "* TE-014 *"
            - generic [ref=f3e113]:
              - paragraph [ref=f3e114]: Thank you for using TunaEye Kiosk!
              - paragraph [ref=f3e115]: "AUTH #99824 · Tunaeye Ecosystem"
    - generic [ref=f3e119]:
      - button "Back" [ref=f3e121] [cursor=pointer]
      - generic [ref=f3e124]:
        - button "Skip printing" [ref=f3e125] [cursor=pointer]
        - button "Print Sashibo core" [ref=f3e126] [cursor=pointer]
```

# Test source

```ts
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
  800 |     }
  801 | 
  802 |     await page.goto('/kiosk/select-role')
  803 |     const roleCards = page.locator('.role-card-v2')
  804 |     await expect(roleCards).toHaveCount(2)
  805 |     expect((await roleCards.first().boundingBox())!.height).toBeGreaterThanOrEqual(200)
  806 |     expect((await roleCards.first().boundingBox())!.width).toBeGreaterThanOrEqual(viewport.width < 900 ? 260 : 300)
  807 |     await expectNoHorizontalOverflow()
  808 | 
  809 |     await page.goto('/kiosk/tutorial')
  810 |     await expect(page.locator('.tutorial-stage__number')).toHaveText('01')
  811 |     await expect(page.locator('.tutorial-stage__number')).toBeVisible()
  812 |     await expectNoHorizontalOverflow()
  813 | 
  814 |     await page.goto('/kiosk/sample')
  815 |     await page.getByRole('button', { name: /Tail cut/ }).click()
  816 |     await page.getByRole('button', { name: 'Continue' }).click()
  817 |     const associationCards = page.locator('.association-options button')
  818 |     await expect(associationCards).toHaveCount(2)
  819 |     const [firstCard, secondCard] = await Promise.all([associationCards.nth(0).boundingBox(), associationCards.nth(1).boundingBox()])
  820 |     expect(Math.abs(firstCard!.height - secondCard!.height)).toBeLessThanOrEqual(1)
  821 |     expect(Math.abs((firstCard!.x + secondCard!.x + secondCard!.width) / 2 - viewport.width / 2)).toBeLessThan(28)
  822 |     await expect(page.getByRole('button', { name: 'Continue' })).toBeInViewport()
  823 |     await expectNoHorizontalOverflow()
  824 | 
  825 |     await page.goto('/kiosk/print')
> 826 |     expect((await page.locator('.print-queue > div').first().boundingBox())!.height).toBeGreaterThanOrEqual(viewport.height > viewport.width ? 60 : 68)
      |                                                                                      ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
  827 |     await expect(page.getByRole('button', { name: 'Skip printing' })).toBeInViewport()
  828 |     const receipt = await page.locator('.receipt-container-v2').boundingBox()
  829 |     const printActions = await page.locator('.screen-stack--print > .bottom-bar').boundingBox()
  830 |     expect(receipt!.y + receipt!.height).toBeLessThanOrEqual(printActions!.y)
  831 |     await expectNoHorizontalOverflow()
  832 |     await page.screenshot({ path: `test-results/print-${viewport.width}x${viewport.height}.png`, fullPage: false })
  833 | 
  834 |     await page.goto('/kiosk/complete')
  835 |     const gradeAnother = await page.getByRole('button', { name: 'Grade another' }).boundingBox()
  836 |     expect(Math.abs(gradeAnother!.x + gradeAnother!.width / 2 - viewport.width / 2)).toBeLessThan(8)
  837 |     const dashboard = await page.getByRole('button', { name: 'Dashboard' }).boundingBox()
  838 |     const logout = await page.getByRole('button', { name: 'Logout' }).boundingBox()
  839 |     expect(Math.abs(dashboard!.y - logout!.y)).toBeLessThanOrEqual(1)
  840 |     await expectNoHorizontalOverflow()
  841 | 
  842 |     await page.goto('/kiosk/admin-dashboard')
  843 |     await expect(page.getByRole('heading', { name: 'Good day, Admin.' })).toBeVisible()
  844 |     expect((await page.getByRole('heading', { name: 'Good day, Admin.' }).boundingBox())!.height).toBeGreaterThanOrEqual(36)
  845 |     await expectNoHorizontalOverflow()
  846 | 
  847 |     await page.screenshot({ path: `test-results/tablet-${viewport.width}x${viewport.height}.png`, fullPage: false })
  848 |     expect(browserErrors).toEqual([])
  849 |     expect(failedRequests).toEqual([])
  850 |   })
  851 | }
  852 | 
```