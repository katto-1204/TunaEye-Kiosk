import { expect, test } from '@playwright/test'

test('manual Supabase sync uploads evidence, upserts once, verifies, and marks local data synced', async ({ page }) => {
  test.skip(!process.env.VITE_SUPABASE_URL, 'Run with mock Supabase Vite environment variables.')
  let upserts = 0

  await page.route('http://supabase.test/**', async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/auth/v1/signup') {
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ access_token: 'test-token', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: 'test-refresh', user: { id: '11111111-1111-4111-8111-111111111111', aud: 'authenticated', role: 'authenticated', email: '', app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() } }) })
      return
    }
    if (url.pathname.startsWith('/storage/v1/object/grading-images/')) {
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ Key: url.pathname }) })
      return
    }
    if (url.pathname === '/rest/v1/grading_records' && route.request().method() === 'POST') {
      upserts += 1
      await route.fulfill({ status: 201, contentType: 'application/json', body: '[]' })
      return
    }
    if (url.pathname === '/rest/v1/grading_records') {
      const record = { id: 'record-1', user_id: '11111111-1111-4111-8111-111111111111', source: 'kiosk', station_id: 'TunaEye Station 01', session_id: 'session-1', grader_name: 'Maria Santos', sample_type: 'sashibo_core', fish_id: 'Fish 1', weight_kg: 42, grade: 'A', confidence: 96, result_status: 'valid', original_grade: 'A', override_grade: null, override_reason: null, image_path: '11111111-1111-4111-8111-111111111111/record-1/sashibo_core.jpg', gradcam_path: null, captured_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify(url.searchParams.get('select') === 'id' ? [{ id: record.id }] : [record]) })
      return
    }
    await route.fulfill({ status: 404, contentType: 'application/json', body: '{}' })
  })

  await page.addInitScript(() => {
    localStorage.setItem('tunaeye-installed', 'true')
    localStorage.setItem('tunaeye-grader-name', 'Maria Santos')
    localStorage.setItem('tunaeye-records', JSON.stringify([{
      id: 'record-1', sessionId: 'session-1', timestamp: Date.now(), time: 'Now', grader: 'Maria Santos', sample: 'Sashibo core', fish: 'Fish 1', weight: '42 kg', grade: 'A', status: 'Complete', capturedImageId: 'record-1',
      result: { status: 'valid', originalGrade: 'A', originalConfidence: 96, overrideGrade: null, overrideReason: '' },
      transaction: { currency: 'PHP', amount: null, syncState: 'pending' },
    }]))
    const request = indexedDB.open('tunaeye-offline', 1)
    request.onupgradeneeded = () => { const store = request.result.createObjectStore('evidence', { keyPath: 'id' }); store.createIndex('syncState', 'syncState'); store.createIndex('sessionId', 'sessionId') }
    request.onsuccess = () => {
      const blob = new Blob(['jpeg'], { type: 'image/jpeg' })
      request.result.transaction('evidence', 'readwrite').objectStore('evidence').put({ id: 'record-1', sessionId: 'session-1', sample: 'Sashibo core', fishId: 'Fish 1', capturedAt: Date.now(), mimeType: 'image/jpeg', blob, syncState: 'pending' })
    }
  })

  await page.goto('/kiosk/grader-dashboard')
  await page.getByRole('button', { name: 'Sync now' }).click()
  await expect(page.getByRole('heading', { name: 'Sync complete' })).toBeVisible()
  await page.getByRole('button', { name: 'Understood' }).click()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('tunaeye-records') ?? '[]')[0].transaction.syncState)).toBe('synced')
  expect(await page.evaluate(async () => await new Promise(resolve => { const open = indexedDB.open('tunaeye-offline', 1); open.onsuccess = () => { const get = open.result.transaction('evidence').objectStore('evidence').get('record-1'); get.onsuccess = () => resolve(get.result.syncState) } }))).toBe('synced')

  await page.getByRole('button', { name: 'Sync now' }).click()
  await expect(page.getByRole('heading', { name: 'Sync complete' })).toBeVisible()
  expect(upserts).toBe(1)

  await page.evaluate(() => {
    const records = JSON.parse(localStorage.getItem('tunaeye-records') ?? '[]')
    records[0].transaction.syncState = 'pending'
    localStorage.setItem('tunaeye-records', JSON.stringify(records))
    window.dispatchEvent(new Event('online'))
  })
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('tunaeye-records') ?? '[]')[0].transaction.syncState)).toBe('synced')
  expect(upserts).toBe(2)

  await page.evaluate(() => localStorage.setItem('tunaeye-records', '[]'))
  await page.goto('/admin')
  for (const [index, digit] of ['1', '2', '3', '4'].entries()) await page.getByLabel(`PIN digit ${index + 1}`).fill(digit)
  await page.getByRole('button', { name: 'Verify and continue' }).click()
  await expect(page.getByText('record-1')).toBeVisible()
})
