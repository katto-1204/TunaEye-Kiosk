import { defineConfig } from '@playwright/test'
import base from './playwright.config'
export default defineConfig({
  ...base,
  outputDir: 'test-results/sync-fix',
  use: { ...base.use, baseURL: 'http://127.0.0.1:4186' },
  webServer: { command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4186', url: 'http://127.0.0.1:4186', reuseExistingServer: false },
})
