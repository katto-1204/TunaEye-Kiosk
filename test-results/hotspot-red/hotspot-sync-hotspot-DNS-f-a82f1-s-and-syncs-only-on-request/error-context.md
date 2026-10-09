# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: hotspot-sync.spec.ts >> hotspot DNS failure preserves pending records and syncs only on request
- Location: tests\hotspot-sync.spec.ts:3:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 0
Received: 1
```

# Page snapshot

```yaml
- main [ref=e4]:
  - generic [ref=e5]:
    - generic [ref=e6]:
      - generic [ref=e7]:
        - generic [ref=e8]:
          - heading "Welcome back, Maria." [level=1] [ref=e10]
          - generic [ref=e11]:
            - button "Start grading" [ref=e12] [cursor=pointer]
            - generic [ref=e15]:
              - button "Sync now" [ref=e16] [cursor=pointer]
              - button "Logout" [ref=e22] [cursor=pointer]
        - generic [ref=e25]:
          - article [ref=e26]:
            - generic [ref=e32]:
              - generic [ref=e33]: Sessions today
              - strong [ref=e34]: "1"
              - emphasis [ref=e35]: Completed grading runs
          - article [ref=e36]:
            - generic [ref=e40]:
              - generic [ref=e41]: Samples graded
              - strong [ref=e42]: "1"
              - emphasis [ref=e43]: Visible to admin
          - article [ref=e44]:
            - generic [ref=e49]:
              - generic [ref=e50]: Station status
              - strong [ref=e51]: Online
              - emphasis [ref=e52]: Local edge processing
          - article [ref=e53]:
            - generic [ref=e58]:
              - generic [ref=e59]: Tutorial status
              - strong [ref=e60]: 1 left
              - emphasis [ref=e61]: "Sync: Just now"
      - generic [ref=e63]:
        - generic [ref=e65]:
          - heading "Recent records" [level=2] [ref=e66]
          - paragraph [ref=e67]: 1 session total
        - generic [ref=e68]:
          - generic [ref=e69]:
            - generic [ref=e70]: Record
            - generic [ref=e71]: Sample
            - generic [ref=e72]: Weight
            - generic [ref=e73]: Grade
            - generic [ref=e74]: Status
          - button "hotspot-record Now Sashibo core Fish 1 · Result saved 42 kg A Complete" [ref=e75] [cursor=pointer]:
            - generic [ref=e76]:
              - strong [ref=e77]: hotspot-record
              - generic [ref=e78]: Now
            - generic [ref=e79]:
              - status [ref=e80]: Image unavailable
              - strong [ref=e81]: Sashibo core
              - generic [ref=e82]: Fish 1 · Result saved
            - generic [ref=e83]: 42 kg
            - generic [ref=e84]: A
            - generic [ref=e85]: Complete
    - button "Back" [ref=e88] [cursor=pointer]
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test'
  2  | 
  3  | test('hotspot DNS failure preserves pending records and syncs only on request', async ({ page }) => {
  4  |   test.skip(!process.env.VITE_SUPABASE_URL, 'Run with mock Supabase Vite environment variables.')
  5  |   let requests = 0
  6  |   const errors: string[] = []
  7  |   page.on('pageerror', error => errors.push(error.message))
  8  |   await page.route('http://supabase.test/**', route => {
  9  |     requests += 1
  10 |     return route.abort('namenotresolved')
  11 |   })
  12 |   await page.addInitScript(() => {
  13 |     localStorage.setItem('tunaeye-installed', 'true')
  14 |     localStorage.setItem('tunaeye-grader-name', 'Maria Santos')
  15 |     localStorage.setItem('tunaeye-records', JSON.stringify([{
  16 |       id: 'hotspot-record', sessionId: 'hotspot-session', timestamp: Date.now(), time: 'Now', grader: 'Maria Santos', sample: 'Sashibo core', fish: 'Fish 1', weight: '42 kg', grade: 'A', status: 'Complete',
  17 |       transaction: { currency: 'PHP', unitRatePerKg: 420, amount: 17640, syncState: 'pending' },
  18 |     }]))
  19 |   })
  20 |   await page.goto('/kiosk/grader-dashboard')
  21 |   await expect(page.getByRole('button', { name: 'Sync now' })).toBeVisible()
  22 |   const original = await page.evaluate(() => localStorage.getItem('tunaeye-records'))
  23 |   await page.evaluate(() => window.dispatchEvent(new Event('online')))
  24 |   // Allow any unintended reconnect handler's authentication request to begin.
  25 |   await page.waitForTimeout(300)
> 26 |   expect(requests).toBe(0)
     |                    ^ Error: expect(received).toBe(expected) // Object.is equality
  27 |   await page.getByRole('button', { name: 'Sync now' }).click()
  28 |   await expect(page.getByText(/Cloud is unreachable/)).toBeVisible()
  29 |   await expect(page.getByText(/Pi Wi-Fi can work without internet/)).toBeVisible()
  30 |   expect(requests).toBeGreaterThan(0)
  31 |   expect(await page.evaluate(() => localStorage.getItem('tunaeye-records'))).toBe(original)
  32 |   expect(errors).toEqual([])
  33 |   await page.getByRole('button', { name: 'Understood' }).click()
  34 |   await page.getByRole('button', { name: 'Start grading', exact: true }).click()
  35 |   await expect(page.getByRole('heading', { name: 'Select specimens' })).toBeVisible()
  36 | })
  37 | 
```