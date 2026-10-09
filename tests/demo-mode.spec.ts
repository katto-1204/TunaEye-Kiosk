import {readFileSync} from 'node:fs'
import {expect, test} from '@playwright/test'

test.beforeEach(async ({page}) => {
  await page.route('**/auth/v1/health', route => route.fulfill({contentType: 'application/json', body: '{"name":"GoTrue"}'}))
})

for (const setup of [
  {name: 'saved demo flag', stored: true, query: ''},
  {name: 'demo URL', stored: false, query: '?demo=1'},
  {name: 'saved flag and demo URL', stored: true, query: '?demo=1'},
]) {
  test(`disabled demo mode ignores ${setup.name} and uses Pi capture and inference`, async ({page}) => {
    test.skip(process.env.VITE_DEMO_MODE === 'true', 'Regression targets demo-disabled builds.')
    const errors: string[] = []
    const failures: string[] = []
    const calls: string[] = []
    const image = readFileSync('public/DEMO_SAMPLES/SASHIBOCORE_A.png')
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => {if (message.type() === 'error') errors.push(message.text())})
    page.on('requestfailed', request => failures.push(request.url()))
    await page.addInitScript(stored => {
      localStorage.setItem('tunaeye-installed', 'true')
      if (stored) localStorage.setItem('tunaeye-demo-mode', '1')
    }, setup.stored)
    await page.route('**/stream', route => route.fulfill({contentType: 'image/png', body: image}))
    await page.route('**/snapshot', route => {
      calls.push('snapshot')
      return route.fulfill({contentType: 'image/png', body: image})
    })
    await page.route('**/grade', route => {
      calls.push('grade')
      expect(route.request().method()).toBe('POST')
      expect(route.request().postData()).toContain('sashibocore')
      return route.fulfill({contentType: 'application/json', body: JSON.stringify({id: 'pi-regression-result', capture_id: 'pi-regression-capture', image_type: 'sashibocore', grade: 'GRADE_C', confidence: .882, scores: {GRADE_A: .04, GRADE_B: .07, GRADE_C: .882, INVALID: .008}})})
    })
    await page.goto(`/kiosk/camera${setup.query}`)
    await expect(page.getByRole('img', {name: 'Live Raspberry Pi USB camera preview'})).toBeVisible()
    await expect(page.locator('.camera-demo-badge')).toHaveCount(0)
    expect(await page.evaluate(() => localStorage.getItem('tunaeye-demo-mode'))).toBeNull()
    await page.getByRole('button', {name: 'Capture', exact: true}).click()
    await expect(page.getByRole('heading', {name: 'Use this image?'})).toBeVisible()
    await page.getByRole('button', {name: 'Use Image', exact: true}).click()
    await expect(page.getByRole('heading', {name: 'Sashibo core · Grade C'})).toBeVisible()
    await expect(page.locator('.confidence')).toContainText('88.2%')
    expect(calls).toEqual(['snapshot', 'grade'])
    expect(errors).toEqual([])
    expect(failures).toEqual([])
  })
}
