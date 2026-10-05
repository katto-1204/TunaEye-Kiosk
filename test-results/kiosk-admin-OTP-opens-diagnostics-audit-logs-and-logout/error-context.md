# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kiosk.spec.ts >> admin OTP opens diagnostics, audit logs, and logout
- Location: tests\kiosk.spec.ts:20:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Audit logs' })
Expected: visible
Error: strict mode violation: getByRole('heading', { name: 'Audit logs' }) resolved to 2 elements:
    1) <h1>Audit logs</h1> aka locator('h1')
    2) <h2>Audit logs</h2> aka locator('h2')

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: 'Audit logs' }) with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Audit logs' })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic "TunaEye" [ref=e5]
    - generic [ref=e9]: Admin console
    - generic [ref=e11]:
      - generic [ref=e12]: Device ready
      - button "Return to home" [ref=e14] [cursor=pointer]
  - main [ref=e19]:
    - generic [ref=e20]:
      - complementary [ref=e21]:
        - generic "TunaEye" [ref=e22]
        - navigation [ref=e26]:
          - button "Overview" [ref=e27] [cursor=pointer]
          - button "Records" [ref=e33] [cursor=pointer]
          - button "Price schedule" [ref=e39] [cursor=pointer]
          - button "Expert graders" [ref=e43] [cursor=pointer]
          - button "Devices" [ref=e50] [cursor=pointer]
          - button "Audit logs" [active] [ref=e55] [cursor=pointer]
          - button "Settings" [ref=e60] [cursor=pointer]
        - generic [ref=e65]:
          - generic [ref=e66]: System online
          - button "Logout" [ref=e68] [cursor=pointer]
      - generic [ref=e72]:
        - generic [ref=e73]:
          - generic [ref=e74]:
            - generic [ref=e75]: TunaEye Station 01 · Admin console
            - heading "Audit logs" [level=1] [ref=e76]
          - generic [ref=e77]:
            - button "Sync now" [ref=e78] [cursor=pointer]
            - button "Start grading" [ref=e84] [cursor=pointer]
            - generic [ref=e88]: AD
        - generic [ref=e89]:
          - generic [ref=e90]:
            - generic [ref=e91]:
              - heading "Audit logs" [level=2] [ref=e92]
              - paragraph [ref=e93]: Navigation, grading, overrides, connections, sync, and administrator activity.
            - generic [ref=e94]: 1 events
          - article [ref=e96]:
            - generic [ref=e101]:
              - strong [ref=e102]: Login
              - generic [ref=e103]: Admin · Administrator authenticated at the kiosk
            - time [ref=e104]: 10/6/2026, 2:35:23 AM
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test'
  2  | 
  3  | test('uninstalled visitors see the public landing after loading', async ({ page }) => {
  4  |   await page.goto('/')
  5  |   await expect(page.getByText('Preparing TunaEye')).toBeVisible()
  6  |   await expect(page.getByRole('heading', { name: /See the sample/i })).toBeVisible({ timeout: 5000 })
  7  |   await expect(page.getByRole('button', { name: 'Install kiosk app' })).toBeVisible()
  8  | })
  9  | 
  10 | test('installed tablet opens kiosk, hides install, and fits the viewport', async ({ page }) => {
  11 |   await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))
  12 |   await page.goto('/')
  13 |   await expect(page.getByRole('heading', { name: /Clear evidence/i })).toBeVisible({ timeout: 5000 })
  14 |   await expect(page.getByRole('button', { name: 'Install app' })).toHaveCount(0)
  15 |   await expect(page.getByText('Capture with confidence')).toBeVisible()
  16 |   const overflow = await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight || document.documentElement.scrollWidth > window.innerWidth)
  17 |   expect(overflow).toBeFalsy()
  18 | })
  19 | 
  20 | test('admin OTP opens diagnostics, audit logs, and logout', async ({ page }) => {
  21 |   await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))
  22 |   await page.goto('/')
  23 |   await page.getByRole('button', { name: 'Start grading' }).click()
  24 |   await page.getByRole('button', { name: /Admin/ }).click()
  25 |   for (const [index, digit] of ['1', '2', '3', '4'].entries()) await page.getByLabel(`PIN digit ${index + 1}`).fill(digit)
  26 |   await page.getByRole('button', { name: 'Verify and continue' }).click()
  27 |   await expect(page.getByText('Good day, Admin.')).toBeVisible()
  28 |   await page.getByRole('button', { name: /Settings/ }).click()
  29 |   await expect(page.getByText('Raspberry Pi API URL')).toBeVisible()
  30 |   await expect(page.getByText('AI model identifier')).toBeVisible()
  31 |   await page.getByRole('button', { name: /Audit logs/ }).click()
> 32 |   await expect(page.getByRole('heading', { name: 'Audit logs' })).toBeVisible()
     |                                                                   ^ Error: expect(locator).toBeVisible() failed
  33 |   await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible()
  34 | })
  35 | 
```