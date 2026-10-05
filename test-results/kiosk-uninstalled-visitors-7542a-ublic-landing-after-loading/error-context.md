# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kiosk.spec.ts >> uninstalled visitors see the public landing after loading
- Location: tests\kiosk.spec.ts:3:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /See the sample/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: /See the sample/i }) with timeout 5000ms
  - waiting for getByRole('heading', { name: /See the sample/i })

```

```yaml
- banner:
  - strong: TunaEye
  - navigation:
    - button "Home"
    - button "Features"
    - button "About TunaEye"
    - button "Team"
    - button "FAQ"
  - button "Install kiosk"
- main:
  - text: Yellowfin tuna visual grading
  - heading "Clear evidence. Confident decisions." [level=1]:
    - text: Clear evidence.
    - emphasis: Confident decisions.
  - paragraph: Connect guided sample capture, Raspberry Pi edge inference, and accountable cloud records in one focused station workflow.
  - button "Install kiosk"
  - button "Open workflow"
  - text: Edge AI Offline-ready Auditable Built for 10.1″ tablets
  - img "TunaEye grading station interface"
  - complementary:
    - text: Station status
    - strong: Ready to grade
    - text: Camera · Edge · Sync
  - text: Capture Infer Review Synchronize Why TunaEye
  - heading "One sample should tell one complete story." [level=2]
  - paragraph: Visual grading is only useful when the evidence remains linked to the right fish, operator, weight, model result, and final decision.
  - paragraph: TunaEye guides the physical workflow while preserving every decision for review, printing, and multi-station operations.
  - button "Read our approach"
  - text: Workflow at a glance
  - heading "From tray to traceable result." [level=2]
  - article:
    - text: "01"
    - heading "Prepare" [level=3]
    - paragraph: Select the sample and follow the chamber guide.
  - article:
    - text: "02"
    - heading "Capture" [level=3]
    - paragraph: Use the actual tablet, USB, or station camera.
  - article:
    - text: "03"
    - heading "Infer" [level=3]
    - paragraph: Send evidence to the configured Raspberry Pi model.
  - article:
    - text: "04"
    - heading "Confirm" [level=3]
    - paragraph: Review confidence or apply a protected override.
  - article:
    - text: "05"
    - heading "Sync" [level=3]
    - paragraph: Store and distribute records through cloud services.
  - text: Evidence stays visible
  - heading "Sashibo core" [level=2]
  - paragraph: Center-cut evidence with its own fish, weight, inference, and receipt.
  - button "Previous sample": ←
  - text: 1 / 2
  - button "Next sample": →
  - text: Captured sample evidence
  - img "Sashibo core"
  - article:
    - strong: "2"
    - text: Supported sample types
  - article:
    - strong: 200 kg
    - text: Maximum fish weight
  - article:
    - strong: 1:1
    - text: Fish-to-record traceability
  - article:
    - strong: 24/7
    - text: Offline kiosk availability
  - text: Connected by design
  - heading "Local speed. Cloud visibility." [level=2]
  - paragraph: The tablet controls the operator experience. Raspberry Pi handles model inference at the edge. Supabase PostgreSQL preserves durable records, while Convex distributes live updates to authorized admins.
  - button "Explore every feature"
  - article:
    - text: "01"
    - strong: Tablet kiosk
    - text: Capture and review
  - text: ↔
  - article:
    - text: "02"
    - strong: Raspberry Pi
    - text: Model inference
  - text: ↔
  - article:
    - text: "03"
    - strong: Cloud
    - text: Store and synchronize
  - text: Frequently asked
  - heading "Before TunaEye reaches your station." [level=2]
  - group:
    - text: Who is TunaEye for?
    - paragraph: Fish ports, buying stations, processors, trained graders, and quality-control teams.
  - group: Does it work without internet?
  - group: Where does grading happen?
  - button "View all questions"
  - text: Ready for the grading floor?
  - heading "Turn every sample into clear, connected evidence." [level=2]
  - paragraph: Install the kiosk or explore the operator workflow in your browser.
  - button "Install TunaEye"
  - button "Open workflow"
- contentinfo:
  - strong: TunaEye
  - paragraph: Evidence-first yellowfin tuna grading, built for connected stations.
  - strong: Explore
  - button "Home"
  - button "Features"
  - button "About TunaEye"
  - button "Team"
  - button "FAQ"
  - strong: Legal
  - button "Terms"
  - button "Privacy policy"
  - strong: Contact
  - link "hello@tunaeye.app":
    - /url: mailto:hello@tunaeye.app
  - text: Philippines © 2026 TunaEye. All rights reserved.
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test'
  2  | 
  3  | test('uninstalled visitors see the public landing after loading', async ({ page }) => {
  4  |   await page.goto('/')
  5  |   await expect(page.getByText('Preparing TunaEye')).toBeVisible()
> 6  |   await expect(page.getByRole('heading', { name: /See the sample/i })).toBeVisible({ timeout: 5000 })
     |                                                                        ^ Error: expect(locator).toBeVisible() failed
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
  32 |   await expect(page.getByRole('heading', { name: 'Audit logs' })).toBeVisible()
  33 |   await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible()
  34 | })
  35 | 
```