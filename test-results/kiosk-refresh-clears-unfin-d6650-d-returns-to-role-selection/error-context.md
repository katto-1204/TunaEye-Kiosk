# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kiosk.spec.ts >> refresh clears unfinished session, preserves completed records, and returns to role selection
- Location: tests\kiosk.spec.ts:193:1

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
  100 |   await expect(page).toHaveURL(/\/kiosk\/grader$/)
  101 |   await page.goto('/select-role')
  102 |   await page.getByRole('button', { name: /Admin/ }).click()
  103 |   await expect(page).toHaveURL(/\/admin$/)
  104 | })
  105 | 
  106 | test('admin OTP opens diagnostics, audit logs, and logout', async ({ page }) => {
  107 |   await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))
  108 |   await page.goto('/')
  109 |   await page.getByRole('button', { name: 'Get started' }).click()
  110 |   await page.getByRole('button', { name: /Admin/ }).click()
  111 |   for (const [index, digit] of ['1', '2', '3', '4'].entries()) await page.getByLabel(`PIN digit ${index + 1}`).fill(digit)
  112 |   await page.getByRole('button', { name: 'Verify and continue' }).click()
  113 |   await expect(page.getByText('Good day, Admin.')).toBeVisible()
  114 |   await page.getByRole('button', { name: /Settings/ }).click()
  115 |   await expect(page.getByText('Raspberry Pi API URL')).toBeVisible()
  116 |   await expect(page.getByText('AI model identifier')).toBeVisible()
  117 |   await page.getByRole('button', { name: /Audit logs/ }).click()
  118 |   await expect(page.getByRole('heading', { name: 'Audit logs' }).first()).toBeVisible()
  119 |   await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible()
  120 | })
  121 | 
  122 | test('admin dashboard scrolls, graph interacts, and records paginate', async ({ page }) => {
  123 |   const browserErrors: string[] = []
  124 |   page.on('console', message => { if (message.type() === 'error') browserErrors.push(message.text()) })
  125 |   page.on('pageerror', error => browserErrors.push(error.message))
  126 |   await page.setViewportSize({ width: 1024, height: 600 })
  127 |   await page.addInitScript(() => {
  128 |     localStorage.setItem('tunaeye-installed', 'true')
  129 |     const now = Date.now()
  130 |     localStorage.setItem('tunaeye-records', JSON.stringify(Array.from({ length: 19 }, (_, index) => ({
  131 |       id: `TE-QA-${String(index + 1).padStart(3, '0')}`,
  132 |       sessionId: `QA-${index + 1}`,
  133 |       timestamp: now - (index % 7) * 86_400_000,
  134 |       time: 'Today, 10:00 AM',
  135 |       grader: index % 2 ? 'Maria Santos' : 'Jose Dela Cruz',
  136 |       sample: index % 2 ? 'Sashibo core' : 'Tail cut',
  137 |       fish: 'Fish 1', weight: `${20 + index} kg`, grade: index % 3 === 0 ? 'A' : 'B', status: 'Model result',
  138 |       transaction: { currency: 'PHP', amount: null, syncState: 'synced' },
  139 |     }))))
  140 |   })
  141 |   await page.goto('/')
  142 |   await page.getByRole('button', { name: 'Get started' }).click()
  143 |   await page.getByRole('button', { name: /Admin/ }).click()
  144 |   for (const [index, digit] of ['1', '2', '3', '4'].entries()) await page.getByLabel(`PIN digit ${index + 1}`).fill(digit)
  145 |   await page.getByRole('button', { name: 'Verify and continue' }).click()
  146 | 
  147 |   const adminContent = page.locator('.admin-content')
  148 |   await expect(page.getByTestId('admin-simple-graph')).toBeVisible()
  149 |   await page.getByRole('button', { name: /samples/ }).last().focus()
  150 |   await expect(page.locator('.admin-trend__tooltip')).toBeVisible()
  151 |   expect(await adminContent.evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true)
  152 |   await page.screenshot({ path: 'test-results/admin-graph-1024x600.png', fullPage: false })
  153 | 
  154 |   await page.getByRole('button', { name: /Records/ }).click()
  155 |   await expect(page.getByText('Showing 1–8 of 19')).toBeVisible()
  156 |   await expect(page.getByRole('button', { name: 'Previous' })).toBeDisabled()
  157 |   await page.getByRole('button', { name: 'Next' }).click()
  158 |   await expect(page.getByText('Showing 9–16 of 19')).toBeVisible()
  159 |   await expect(page.getByText('TE-QA-009')).toBeVisible()
  160 |   await adminContent.evaluate(element => { element.scrollTop = element.scrollHeight })
  161 |   expect(await adminContent.evaluate(element => element.scrollTop)).toBeGreaterThan(0)
  162 |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  163 |   expect(browserErrors).toEqual([])
  164 |   await page.screenshot({ path: 'test-results/admin-records-pagination-1024x600.png', fullPage: false })
  165 | })
  166 | 
  167 | test('weight numpad entry and touch keypad interaction', async ({ page }) => {
  168 |   await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))
  169 |   await page.goto('/kiosk/weight')
  170 |   await expect(page.getByRole('heading', { name: /Enter the fish weight/i })).toBeVisible({ timeout: 5000 })
  171 |   await expect(page.locator('.numpad-container')).toBeVisible()
  172 |   
  173 |   // Tap numpad buttons 3, 5, ., 4
  174 |   await page.getByRole('button', { name: '3', exact: true }).click()
  175 |   await page.getByRole('button', { name: '5', exact: true }).click()
  176 |   await page.getByRole('button', { name: '.', exact: true }).click()
  177 |   await page.getByRole('button', { name: '4', exact: true }).click()
  178 |   
  179 |   // Verify weight input has 35.4
  180 |   const input = page.locator('.weight-input input').first()
  181 |   await expect(input).toHaveValue('35.4')
  182 | })
  183 | 
  184 | test('kiosk navbar is removed and contextual navigation remains', async ({ page }) => {
  185 |   await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))
  186 |   await page.goto('/kiosk/select-role')
  187 |   await expect(page.getByRole('heading', { name: "Who's grading?" })).toBeVisible({ timeout: 5000 })
  188 |   await expect(page.locator('.topbar, .topbar-wrapper')).toHaveCount(0)
  189 |   await expect(page.getByRole('button', { name: 'Back' })).toBeVisible()
  190 |   expect((await page.locator('.app-main').boundingBox())!.y).toBe(0)
  191 | })
  192 | 
  193 | test('refresh clears unfinished session, preserves completed records, and returns to role selection', async ({ page }) => {
  194 |   await page.setViewportSize({ width: 1024, height: 600 })
  195 |   await page.addInitScript(() => {
  196 |     localStorage.setItem('tunaeye-installed', 'true')
  197 |     localStorage.setItem('tunaeye-records', JSON.stringify([{ id: 'saved-record', sessionId: 'saved-session', timestamp: Date.now(), time: 'Now', grader: 'Maria Santos', sample: 'Sashibo core', fish: 'Fish 1', weight: '42 kg', grade: 'A', status: 'Complete' }]))
  198 |   })
  199 |   await page.goto('/kiosk/weight')
> 200 |   await expect(page.getByRole('heading', { name: /Enter the fish weight/i })).toBeVisible()
      |                                                                               ^ Error: expect(locator).toBeVisible() failed
  201 |   await page.reload()
  202 | 
  203 |   await expect(page).toHaveURL(/\/select-role$/)
  204 |   await expect(page.getByRole('heading', { name: "Who's grading?" })).toBeVisible({ timeout: 5000 })
  205 |   const dialog = page.getByRole('dialog', { name: "Session wasn't saved" })
  206 |   await expect(dialog).toBeVisible()
  207 |   await expect(dialog).toContainText('unfinished grading session was cleared')
  208 |   const modalBox = await dialog.locator('.modal-card--notice').boundingBox()
  209 |   expect(modalBox!.x).toBeGreaterThanOrEqual(16)
  210 |   expect(modalBox!.y).toBeGreaterThanOrEqual(16)
  211 |   expect(modalBox!.x + modalBox!.width).toBeLessThanOrEqual(1008)
  212 |   expect(modalBox!.y + modalBox!.height).toBeLessThanOrEqual(584)
  213 |   const action = dialog.getByRole('button', { name: 'Choose a role' })
  214 |   await expect(action).toBeFocused()
  215 |   await action.click()
  216 |   await expect(dialog).toHaveCount(0)
  217 |   expect(await page.evaluate(() => JSON.parse(localStorage.getItem('tunaeye-records') ?? '[]')[0]?.id)).toBe('saved-record')
  218 | })
  219 | 
  220 | test('refresh always returns to role selection but only unfinished work shows the warning', async ({ page }) => {
  221 |   await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))
  222 |   await page.goto('/kiosk/complete')
  223 |   await page.reload()
  224 |   await expect(page).toHaveURL(/\/select-role$/)
  225 |   await expect(page.getByRole('heading', { name: "Who's grading?" })).toBeVisible({ timeout: 5000 })
  226 |   await expect(page.getByRole('dialog')).toHaveCount(0)
  227 | })
  228 | 
  229 | for (const viewport of [{ width: 1024, height: 600 }, { width: 800, height: 1280 }]) {
  230 |   test(`critical kiosk panels never overlap contextual actions at ${viewport.width}x${viewport.height}`, async ({ page }) => {
  231 |     await page.setViewportSize(viewport)
  232 |     await page.route('http://10.42.0.1:8080/**', route => route.fulfill({ contentType: 'image/jpeg', body: Buffer.from([0xff, 0xd8, 0xff, 0xd9]) }))
  233 |     await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))
  234 | 
  235 |     const cases = [
  236 |       ['/kiosk/sample', '.sample-options'],
  237 |       ['/kiosk/association', '.association-options, .single-fish-card'],
  238 |       ['/kiosk/tutorial', '.tutorial-stage'],
  239 |       ['/kiosk/weight', '.weight-split'],
  240 |       ['/kiosk/camera', '.camera-layout'],
  241 |       ['/kiosk/review', '.review-layout'],
  242 |       ['/kiosk/print', '.print-layout'],
  243 |     ] as const
  244 | 
  245 |     for (const [route, contentSelector] of cases) {
  246 |       await page.goto(route)
  247 |       const content = page.locator(contentSelector)
  248 |       const actions = page.locator('.screen-stack > .bottom-bar')
  249 |       await expect(content).toBeVisible()
  250 |       await expect(actions).toBeVisible()
  251 |       const [contentBox, actionsBox] = await Promise.all([content.boundingBox(), actions.boundingBox()])
  252 |       expect(contentBox!.y + contentBox!.height, `${route} content overlaps actions`).toBeLessThanOrEqual(actionsBox!.y + 1)
  253 |       expect(actionsBox!.y + actionsBox!.height, `${route} actions leave viewport`).toBeLessThanOrEqual(viewport.height)
  254 |       expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} overflows horizontally`).toBe(true)
  255 |     }
  256 |   })
  257 | }
  258 | 
  259 | test('legal dialogs share safe tablet sizing and visible actions', async ({ page }) => {
  260 |   await page.setViewportSize({ width: 1024, height: 600 })
  261 |   await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))
  262 |   await page.goto('/kiosk/grader')
  263 |   for (const name of ['Terms and Conditions', 'Privacy Policy']) {
  264 |     await page.getByRole('button', { name }).click()
  265 |     const dialog = page.getByRole('dialog')
  266 |     await expect(dialog).toBeVisible()
  267 |     const box = await dialog.locator('.legal-modal').boundingBox()
  268 |     expect(box!.x).toBeGreaterThanOrEqual(16)
  269 |     expect(box!.y).toBeGreaterThanOrEqual(16)
  270 |     expect(box!.x + box!.width).toBeLessThanOrEqual(1008)
  271 |     expect(box!.y + box!.height).toBeLessThanOrEqual(584)
  272 |     const closeAction = dialog.locator('.legal-modal__actions').getByRole('button', { name: 'Close' })
  273 |     await expect(closeAction).toBeInViewport()
  274 |     await closeAction.click()
  275 |   }
  276 | })
  277 | 
  278 | test('expert grader identity form is touch-sized and responsive', async ({ page }) => {
  279 |   await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))
  280 | 
  281 |   for (const viewport of [{ width: 1024, height: 600 }, { width: 800, height: 1280 }]) {
  282 |     await page.setViewportSize(viewport)
  283 |     await page.goto('/kiosk/grader')
  284 |     const input = page.getByLabel('Expert grader name')
  285 |     const checkbox = page.getByRole('checkbox', { name: 'Remember my name for this session' })
  286 |     const form = page.locator('.grader-entry__form')
  287 |     await expect(input).toBeVisible()
  288 |     await expect(form).toBeInViewport()
  289 |     expect((await input.boundingBox())!.height).toBeGreaterThanOrEqual(64)
  290 |     expect((await checkbox.boundingBox())!.width).toBeGreaterThanOrEqual(26)
  291 |     expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  292 |   }
  293 | 
  294 |   await page.getByLabel('Expert grader name').fill('Maria Santos')
  295 |   await page.getByRole('button', { name: 'Start grading' }).click()
  296 |   await expect(page).toHaveURL(/\/kiosk\/sample$/)
  297 | })
  298 | 
  299 | test('tablet viewport renders expert grader dashboard in bento layout', async ({ page }) => {
  300 |   await page.setViewportSize({ width: 1024, height: 768 })
```