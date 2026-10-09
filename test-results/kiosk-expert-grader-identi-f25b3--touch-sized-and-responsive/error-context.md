# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kiosk.spec.ts >> expert grader identity form is touch-sized and responsive
- Location: tests\kiosk.spec.ts:278:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByLabel('Expert grader name')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByLabel('Expert grader name') with timeout 5000ms
  - waiting for getByLabel('Expert grader name')

```

```yaml
- main:
  - text: Tuna Eye
  - heading "Who is grading today?" [level=1]
  - text: Your name
  - textbox "Your name":
    - /placeholder: Enter your full name
    - text: Maria Santos
  - checkbox "Remember my name" [checked]
  - text: Remember my name
  - button "Terms and Conditions"
  - text: ·
  - button "Privacy Policy"
  - button "Back"
  - button "Start grading"
```

# Test source

```ts
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
  200 |   await expect(page.getByRole('heading', { name: /Enter the fish weight/i })).toBeVisible()
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
> 287 |     await expect(input).toBeVisible()
      |                         ^ Error: expect(locator).toBeVisible() failed
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
  301 |   await page.addInitScript(() => {
  302 |     localStorage.setItem('tunaeye-installed', 'true')
  303 |     localStorage.setItem('tunaeye-grader-name', 'Maria Santos')
  304 |   })
  305 |   await page.goto('/kiosk/grader-dashboard')
  306 |   await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible({ timeout: 5000 })
  307 |   
  308 |   // Verify bento layout container
  309 |   const bento = page.locator('.grader-bento')
  310 |   await expect(bento).toBeVisible()
  311 |   
  312 |   // Left 4 info boxes
  313 |   const infoBoxes = page.locator('.grader-bento__info-grid .grader-info-card')
  314 |   await expect(infoBoxes).toHaveCount(4)
  315 |   
  316 |   // Right hello card
  317 |   const helloCard = page.locator('.grader-bento__hello-card')
  318 |   await expect(helloCard).toBeVisible()
  319 | })
  320 | 
  321 | test('camera help triggers custom notice modal instead of alert', async ({ page }) => {
  322 |   await page.addInitScript(() => localStorage.setItem('tunaeye-installed', 'true'))
  323 |   await page.goto('/kiosk/camera')
  324 |   await expect(page.getByRole('heading', { name: /Align the sample/i })).toBeVisible({ timeout: 5000 })
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
```