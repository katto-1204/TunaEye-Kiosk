import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { expect, test } from '@playwright/test'

test('internet probes bypass offline cached responses', async () => {
  const handlers = new Map<string, (event: unknown) => void>()
  const responses: Promise<unknown>[] = []
  runInNewContext(readFileSync('public/sw.js', 'utf8'), {
    self: { addEventListener: (type: string, handler: (event: unknown) => void) => handlers.set(type, handler) },
    URL,
    fetch: async () => ({ status: 503 }),
  })
  const fetchHandler = handlers.get('fetch')!
  fetchHandler({ request: new Request('https://supabase.test/auth/v1/health', { cache: 'no-store' }), respondWith: (response: Promise<unknown>) => responses.push(response) })
  expect(responses).toHaveLength(0)
  fetchHandler({ request: new Request('https://kiosk.test/assets/app.js'), respondWith: (response: Promise<unknown>) => responses.push(response) })
  expect(responses).toHaveLength(1)
  await Promise.all(responses)
})
