import base from '../playwright.config';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  ...base,
  testDir: '../tests',
  outputDir: './qa/playwright-results',
  reporter: [['line'], ['json', { outputFile: './qa/playwright-report.json' }]],
  webServer: {
    command: 'node tunaeye-cinematic-film/scripts/test-server.mjs',
    cwd: process.cwd(),
    url: 'http://127.0.0.1:4178',
    reuseExistingServer: false,
  },
});
