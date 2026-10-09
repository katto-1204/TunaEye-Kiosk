import { defineConfig } from '@playwright/test'
import original from '../../playwright.config'
import path from 'node:path'

const root = path.resolve(process.cwd(), '../../..')

export default defineConfig({
  ...original,
  testDir: path.join(root, 'tests'),
  outputDir: path.join(root, 'tunaeye-product-demo/qa/existing-tests/artifacts'),
  reporter: [['list']],
  webServer: { ...original.webServer, cwd: root },
})
