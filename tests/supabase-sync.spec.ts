import { expect, test } from '@playwright/test'

test('manual Supabase sync uploads evidence, upserts once, verifies, and marks local data synced', async ({ page }) => {
  test.skip(!process.env.VITE_SUPABASE_URL, 'Run with mock Supabase Vite environment variables.')
  let upserts = 0
  let cloudRecord: Record<string, unknown> | null = null

  await page.route('http://supabase.test/**', async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/auth/v1/signup') {
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ access_token: 'test-token', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: 'test-refresh', user: { id: '11111111-1111-4111-8111-111111111111', aud: 'authenticated', role: 'authenticated', email: '', app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() } }) })
      return
    }
    if (url.pathname.startsWith('/storage/v1/object/grading-images/')) {
      await route.fulfill(route.request().method() === 'GET'
        ? { contentType: 'image/jpeg', body: Buffer.from('jpeg') }
        : { contentType: 'application/json', body: JSON.stringify({ Key: url.pathname }) })
      return
    }
    if (url.pathname === '/rest/v1/grading_records' && route.request().method() === 'POST') {
      upserts += 1
      const payload = route.request().postDataJSON() as Record<string, unknown> | Record<string, unknown>[]
      cloudRecord = Array.isArray(payload) ? payload[0] : payload
      await route.fulfill({ status: 201, contentType: 'application/json', body: '[]' })
      return
    }
    if (url.pathname === '/rest/v1/grading_records') {
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify(url.searchParams.get('select') === '*' ? [cloudRecord] : cloudRecord) })
      return
    }
    await route.fulfill({ status: 404, contentType: 'application/json', body: '{}' })
  })

  await page.addInitScript(() => {
    localStorage.setItem('tunaeye-installed', 'true')
    localStorage.setItem('tunaeye-grader-name', 'Maria Santos')
    localStorage.setItem('tunaeye-records', JSON.stringify([{
      id: 'record-1', sessionId: 'session-1', timestamp: Date.now(), time: 'Now', grader: 'Maria Santos', sample: 'Sashibo core', fish: 'Fish 1', weight: '42 kg', grade: 'A', status: 'Complete', capturedImageId: 'record-1',
      result: { status: 'valid', originalGrade: 'A', originalConfidence: 96, rawConfidence: .96, overrideGrade: 'B', overrideReason: 'Expert review', overrideActor: 'Maria Santos', overrideAt: '2026-10-09T10:00:00.000Z', inferenceId: 'inference-1', captureId: 'capture-1', scores: { GRADE_A: .96, GRADE_B: .02, GRADE_C: .01, INVALID: .01 }, imageType: 'sashibocore', modelSource: 'raspberry-pi' },
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
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('tunaeye-records') ?? '[]')[0].transaction)).toEqual({ currency: 'PHP', amount: null, syncState: 'synced' })
  expect(cloudRecord).toMatchObject({ capture_id: 'capture-1', inference_id: 'inference-1', raw_confidence: .96, scores: { GRADE_A: .96, GRADE_B: .02, GRADE_C: .01, INVALID: .01 }, image_type: 'sashibocore', model_source: 'raspberry-pi', override_grade: 'B', override_reason: 'Expert review', override_actor: 'Maria Santos', override_at: '2026-10-09T10:00:00.000Z' })
  await page.getByRole('button', { name: 'Sync now' }).click()
  await expect(page.getByRole('heading', { name: 'Sync complete' })).toBeVisible()
  await page.getByRole('button', { name: 'Understood' }).click()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('tunaeye-records') ?? '[]')[0].transaction.syncState)).toBe('synced')
  expect(await page.evaluate(async () => await new Promise(resolve => { const open = indexedDB.open('tunaeye-offline', 1); open.onsuccess = () => { const get = open.result.transaction('evidence').objectStore('evidence').get('record-1'); get.onsuccess = () => resolve(get.result.syncState) } }))).toBe('synced')

  await page.getByRole('button', { name: 'Sync now' }).click()
  await expect(page.getByRole('heading', { name: 'Sync complete' })).toBeVisible()
  expect(upserts).toBe(1)
  await page.getByRole('button', { name: 'Understood' }).click()

  await page.evaluate(() => {
    const records = JSON.parse(localStorage.getItem('tunaeye-records') ?? '[]')
    records[0].transaction.syncState = 'pending'
    localStorage.setItem('tunaeye-records', JSON.stringify(records))
    window.dispatchEvent(new Event('online'))
  })
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('tunaeye-records') ?? '[]')[0].transaction.syncState)).toBe('synced')
  expect(upserts).toBe(2)

  await page.evaluate(() => {
    const synced = Array.from({ length: 205 }, (_, index) => ({ id: `synced-${index}`, sessionId: 'retention', timestamp: index, time: 'Now', grader: 'Maria Santos', sample: 'Sashibo core', fish: 'Fish 1', weight: '1 kg', grade: 'A', status: 'Complete', transaction: { currency: 'PHP', amount: null, syncState: 'synced' } }))
    const unsynced = { id: 'must-survive', sessionId: 'retention', timestamp: -1, time: 'Now', grader: 'Maria Santos', sample: 'Sashibo core', fish: 'Fish 1', weight: '1 kg', grade: 'A', status: 'Complete', capturedImageId: 'missing-evidence', transaction: { currency: 'PHP', amount: null, syncState: 'failed' } }
    localStorage.setItem('tunaeye-records', JSON.stringify([...synced, unsynced]))
  })
  await page.getByRole('button', { name: 'Sync now' }).click()
  await expect(page.getByRole('heading', { name: 'Sync completed with errors' })).toBeVisible()
  await page.getByRole('button', { name: 'Understood' }).click()
  const retained = await page.evaluate(() => JSON.parse(localStorage.getItem('tunaeye-records') ?? '[]'))
  expect(retained).toHaveLength(201)
  expect(retained.find((record: { id: string }) => record.id === 'must-survive')?.transaction.syncState).toBe('failed')

  await page.evaluate(() => localStorage.setItem('tunaeye-records', '[]'))
  await page.goto('/admin')
  for (const [index, digit] of ['1', '2', '3', '4'].entries()) await page.getByLabel(`PIN digit ${index + 1}`).fill(digit)
  await page.getByRole('button', { name: 'Verify and continue' }).click()
  await expect(page.getByText('record-1')).toBeVisible()
})
