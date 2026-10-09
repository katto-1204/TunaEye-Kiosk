import base from './playwright.config';
import {defineConfig} from '@playwright/test';

export default defineConfig({
  ...base,
  outputDir: './qa/combined-playwright-results',
  reporter: [['line'], ['json', {outputFile: './qa/combined-playwright-report.json'}]],
});
