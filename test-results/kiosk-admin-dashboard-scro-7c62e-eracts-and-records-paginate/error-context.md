# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kiosk.spec.ts >> admin dashboard scrolls, graph interacts, and records paginate
- Location: tests\kiosk.spec.ts:156:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByLabel('PIN digit 2')
    - locator resolved to <input value="" maxlength="1" type="password" inputmode="numeric" aria-label="PIN digit 2"/>
    - fill("2")
  - attempting fill action
    - waiting for element to be visible, enabled and editable
  - element was detached from the DOM, retrying

```

# Page snapshot

```yaml
- main [ref=f1e4]:
  - generic [ref=f1e5]:
    - generic [ref=f1e6]:
      - generic [ref=f1e7]: Choose your workspace
      - heading "Who's grading?" [level=1] [ref=f1e8]
    - generic [ref=f1e9]:
      - button "Station control Admin Open admin console" [ref=f1e10] [cursor=pointer]:
        - generic [ref=f1e11]: Station control
        - strong [ref=f1e23]: Admin
        - generic [ref=f1e24]: Open admin console
      - button "Expert workflow Expert Grader Start grading" [ref=f1e27] [cursor=pointer]:
        - generic [ref=f1e28]: Expert workflow
        - strong [ref=f1e38]: Expert Grader
        - generic [ref=f1e39]: Start grading
    - button "Back" [ref=f1e44] [cursor=pointer]
```

# Test source

```ts
  78  |   await page.getByRole('button', { name: /Get started/i }).click()
  79  |   await expect(page.getByRole('heading', { name: "Who's grading?" })).toBeVisible()
  80  |   
  81  |   // Verify interactive kiosk workflow is tight (overflow: hidden, fits viewport)
  82  |   const isTight = await page.evaluate(() => {
  83  |     const appShell = document.querySelector('.app-shell')
  84  |     const htmlOverflow = window.getComputedStyle(document.documentElement).overflowY
  85  |     const bodyOverflow = window.getComputedStyle(document.body).overflowY
  86  |     return (htmlOverflow === 'hidden' || bodyOverflow === 'hidden') && appShell !== null
  87  |   })
  88  |   expect(isTight).toBe(true)
  89  | })
  90  | 
  91  | test('stale kiosk refresh returns to the kiosk landing route', async ({ page }) => {
  92  |   await page.addInitScript(() => {
  93  |     localStorage.setItem('tunaeye-installed', 'true')
  94  |     localStorage.setItem('tunaeye-last-activity', String(Date.now() - 31 * 60 * 1000))
  95  |   })
  96  |   await page.goto('/kiosk/review')
  97  |   await page.reload()
  98  |   await expect(page).toHaveURL(/\/kiosk\/$/)
  99  |   await expect(page.getByRole('heading', { name: /TUNAEYE/i })).toBeVisible({ timeout: 5000 })
  100 | })
  101 | 
  102 | test('kiosk landing fullscreen button forces Chrome fullscreen', async ({ page }) => {
  103 |   await page.setViewportSize({ width: 1280, height: 800 })
  104 |   await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))
  105 |   await page.goto('/')
  106 |   const enter = page.getByRole('button', { name: 'Enter fullscreen' })
  107 |   await expect(enter).toBeVisible()
  108 |   await page.evaluate(() => {
  109 |     HTMLElement.prototype.requestFullscreen = async function (options?: FullscreenOptions) {
  110 |       ;(window as Window & { __fullscreenOptions?: FullscreenOptions }).__fullscreenOptions = options
  111 |       Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: () => this })
  112 |       document.dispatchEvent(new Event('fullscreenchange'))
  113 |     }
  114 |   })
  115 |   await enter.click()
  116 |   await expect.poll(() => page.evaluate(() => (window as Window & { __fullscreenOptions?: FullscreenOptions }).__fullscreenOptions)).toEqual({ navigationUI: 'hide' })
  117 |   await expect(page.getByRole('button', { name: 'Exit fullscreen' })).toBeVisible()
  118 | })
  119 | 
  120 | test('role selector uses distinct role icons, focus states, and destinations', async ({ page }) => {
  121 |   await page.setViewportSize({ width: 1024, height: 600 })
  122 |   await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))
  123 |   await page.goto('/select-role')
  124 |   const admin = page.getByRole('button', { name: /Admin/ })
  125 |   const grader = page.getByRole('button', { name: /Expert Grader/ })
  126 |   await expect(admin).toBeVisible()
  127 |   await expect(grader).toBeVisible()
  128 |   expect(await admin.locator('.role-card-v2__icon').innerHTML()).not.toBe(await grader.locator('.role-card-v2__icon').innerHTML())
  129 |   await admin.focus()
  130 |   await expect(admin).toBeFocused()
  131 |   expect(await grader.evaluate(element => getComputedStyle(element).backgroundImage)).toContain('linear-gradient')
  132 |   await page.screenshot({ path: 'test-results/role-selector-1024x600.png' })
  133 |   await grader.click()
  134 |   await expect(page).toHaveURL(/\/kiosk\/grader$/)
  135 |   await page.goto('/select-role')
  136 |   await page.getByRole('button', { name: /Admin/ }).click()
  137 |   await expect(page).toHaveURL(/\/admin$/)
  138 | })
  139 | 
  140 | test('admin OTP opens diagnostics, audit logs, and logout', async ({ page }) => {
  141 |   await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))
  142 |   await page.goto('/')
  143 |   await page.getByRole('button', { name: 'Get started' }).click()
  144 |   await page.getByRole('button', { name: /Admin/ }).click()
  145 |   for (const [index, digit] of ['1', '2', '3', '4'].entries()) await page.getByLabel(`PIN digit ${index + 1}`).fill(digit)
  146 |   await page.getByRole('button', { name: 'Verify and continue' }).click()
  147 |   await expect(page.getByText('Good day, Admin.')).toBeVisible()
  148 |   await page.getByRole('button', { name: /Settings/ }).click()
  149 |   await expect(page.getByText('Raspberry Pi API URL')).toBeVisible()
  150 |   await expect(page.getByText('AI model identifier')).toBeVisible()
  151 |   await page.getByRole('button', { name: /Audit logs/ }).click()
  152 |   await expect(page.getByRole('heading', { name: 'Audit logs' }).first()).toBeVisible()
  153 |   await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible()
  154 | })
  155 | 
  156 | test('admin dashboard scrolls, graph interacts, and records paginate', async ({ page }) => {
  157 |   const browserErrors: string[] = []
  158 |   page.on('console', message => { if (message.type() === 'error') browserErrors.push(message.text()) })
  159 |   page.on('pageerror', error => browserErrors.push(error.message))
  160 |   await page.setViewportSize({ width: 1024, height: 600 })
  161 |   await page.addInitScript(() => {
  162 |     localStorage.setItem('tunaeye-installed', 'true')
  163 |     const now = Date.now()
  164 |     localStorage.setItem('tunaeye-records', JSON.stringify(Array.from({ length: 19 }, (_, index) => ({
  165 |       id: `TE-QA-${String(index + 1).padStart(3, '0')}`,
  166 |       sessionId: `QA-${index + 1}`,
  167 |       timestamp: now - (index % 7) * 86_400_000,
  168 |       time: 'Today, 10:00 AM',
  169 |       grader: index % 2 ? 'Maria Santos' : 'Jose Dela Cruz',
  170 |       sample: index % 2 ? 'Sashibo core' : 'Tail cut',
  171 |       fish: 'Fish 1', weight: `${20 + index} kg`, grade: index % 3 === 0 ? 'A' : 'B', status: 'Model result',
  172 |       transaction: { currency: 'PHP', amount: null, syncState: 'synced' },
  173 |     }))))
  174 |   })
  175 |   await page.goto('/')
  176 |   await page.getByRole('button', { name: 'Get started' }).click()
  177 |   await page.getByRole('button', { name: /Admin/ }).click()
> 178 |   for (const [index, digit] of ['1', '2', '3', '4'].entries()) await page.getByLabel(`PIN digit ${index + 1}`).fill(digit)
      |                                                                                                                ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  179 |   await page.getByRole('button', { name: 'Verify and continue' }).click()
  180 | 
  181 |   const adminContent = page.locator('.admin-content')
  182 |   await expect(page.getByTestId('admin-simple-graph')).toBeVisible()
  183 |   await page.getByRole('button', { name: /samples/ }).last().focus()
  184 |   await expect(page.locator('.admin-trend__tooltip')).toBeVisible()
  185 |   expect(await adminContent.evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true)
  186 |   await page.screenshot({ path: 'test-results/admin-graph-1024x600.png', fullPage: false })
  187 | 
  188 |   await page.getByRole('button', { name: /Records/ }).click()
  189 |   await expect(page.getByText('Showing 1–8 of 19')).toBeVisible()
  190 |   await expect(page.getByRole('button', { name: 'Previous' })).toBeDisabled()
  191 |   await page.getByRole('button', { name: 'Next' }).click()
  192 |   await expect(page.getByText('Showing 9–16 of 19')).toBeVisible()
  193 |   await expect(page.getByText('TE-QA-009')).toBeVisible()
  194 |   await adminContent.evaluate(element => { element.scrollTop = element.scrollHeight })
  195 |   expect(await adminContent.evaluate(element => element.scrollTop)).toBeGreaterThan(0)
  196 |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  197 |   expect(browserErrors).toEqual([])
  198 |   await page.screenshot({ path: 'test-results/admin-records-pagination-1024x600.png', fullPage: false })
  199 | })
  200 | 
  201 | test('weight numpad entry and touch keypad interaction', async ({ page }) => {
  202 |   await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))
  203 |   await page.goto('/kiosk/weight')
  204 |   await expect(page.getByRole('heading', { name: /Fish weight/i })).toBeVisible({ timeout: 5000 })
  205 |   await expect(page.locator('.numpad-container')).toBeVisible()
  206 |   
  207 |   // Tap numpad buttons 3, 5, ., 4
  208 |   await page.getByRole('button', { name: '3', exact: true }).click()
  209 |   await page.getByRole('button', { name: '5', exact: true }).click()
  210 |   await page.getByRole('button', { name: '.', exact: true }).click()
  211 |   await page.getByRole('button', { name: '4', exact: true }).click()
  212 |   
  213 |   // Verify weight input has 35.4
  214 |   const input = page.locator('.weight-input input').first()
  215 |   await expect(input).toHaveValue('35.4')
  216 |   const inputBox = await input.boundingBox()
  217 |   const displayBox = await page.locator('.weight-input-display').first().boundingBox()
  218 |   expect(inputBox!.x - displayBox!.x).toBeLessThanOrEqual(32)
  219 | })
  220 | 
  221 | test('grader workflow has a small history shortcut', async ({ page }) => {
  222 |   await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))
  223 |   await page.goto('/kiosk/select-role')
  224 |   await page.getByRole('button', { name: /Grader/ }).click()
  225 |   await page.getByLabel('Your name').fill('Maria Santos')
  226 |   await page.getByRole('button', { name: 'Start grading' }).click()
  227 |   const shortcut = page.getByRole('button', { name: 'View grading history' })
  228 |   await expect(shortcut).toBeVisible()
  229 |   expect((await shortcut.boundingBox())!.width).toBeLessThanOrEqual(44)
  230 |   await shortcut.click()
  231 |   await expect(page.getByRole('dialog', { name: 'Leave grading session?' })).toBeVisible()
  232 |   await expect(page.getByRole('dialog').getByText('Continue grading?')).toBeVisible()
  233 |   await page.getByRole('dialog').getByRole('button', { name: 'Leave session' }).click()
  234 |   await expect(page).toHaveURL(/\/kiosk\/grader-dashboard$/)
  235 |   await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible()
  236 | })
  237 | 
  238 | test('kiosk navbar is removed and contextual navigation remains', async ({ page }) => {
  239 |   await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))
  240 |   await page.goto('/kiosk/select-role')
  241 |   await expect(page.getByRole('heading', { name: "Who's grading?" })).toBeVisible({ timeout: 5000 })
  242 |   await expect(page.locator('.topbar, .topbar-wrapper')).toHaveCount(0)
  243 |   await expect(page.getByRole('button', { name: 'Back' })).toBeVisible()
  244 |   expect((await page.locator('.app-main').boundingBox())!.y).toBe(0)
  245 | })
  246 | 
  247 | test('refresh clears unfinished session, preserves completed records, and returns to role selection', async ({ page }) => {
  248 |   await page.setViewportSize({ width: 1024, height: 600 })
  249 |   await page.addInitScript(() => {
  250 |     localStorage.setItem('tunaeye-installed', 'true')
  251 |     localStorage.setItem('tunaeye-records', JSON.stringify([{ id: 'saved-record', sessionId: 'saved-session', timestamp: Date.now(), time: 'Now', grader: 'Maria Santos', sample: 'Sashibo core', fish: 'Fish 1', weight: '42 kg', grade: 'A', status: 'Complete' }]))
  252 |   })
  253 |   await page.goto('/kiosk/weight')
  254 |   await expect(page.getByRole('heading', { name: /Fish weight/i })).toBeVisible()
  255 |   await page.reload()
  256 | 
  257 |   await expect(page).toHaveURL(/\/select-role$/)
  258 |   await expect(page.getByRole('heading', { name: "Who's grading?" })).toBeVisible({ timeout: 5000 })
  259 |   const dialog = page.getByRole('dialog', { name: "Session wasn't saved" })
  260 |   await expect(dialog).toBeVisible()
  261 |   await expect(dialog).toContainText('unfinished grading session was cleared')
  262 |   const modalBox = await dialog.locator('.modal-card--notice').boundingBox()
  263 |   expect(modalBox!.x).toBeGreaterThanOrEqual(16)
  264 |   expect(modalBox!.y).toBeGreaterThanOrEqual(16)
  265 |   expect(modalBox!.x + modalBox!.width).toBeLessThanOrEqual(1008)
  266 |   expect(modalBox!.y + modalBox!.height).toBeLessThanOrEqual(584)
  267 |   const action = dialog.getByRole('button', { name: 'Choose a role' })
  268 |   await expect(action).toBeFocused()
  269 |   await action.click()
  270 |   await expect(dialog).toHaveCount(0)
  271 |   expect(await page.evaluate(() => JSON.parse(localStorage.getItem('tunaeye-records') ?? '[]')[0]?.id)).toBe('saved-record')
  272 | })
  273 | 
  274 | test('refresh always returns to role selection but only unfinished work shows the warning', async ({ page }) => {
  275 |   await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))
  276 |   await page.goto('/kiosk/complete')
  277 |   await page.reload()
  278 |   await expect(page).toHaveURL(/\/select-role$/)
```