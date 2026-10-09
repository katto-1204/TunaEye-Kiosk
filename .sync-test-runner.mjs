import { spawnSync } from 'node:child_process'
process.env.VITE_SUPABASE_URL = 'http://supabase.test'
process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key'
const result = spawnSync(process.execPath, ['node_modules/@playwright/test/cli.js', 'test', '--config=.sync-playwright.config.ts', '--reporter=line', '--workers=1', ...process.argv.slice(2)], { env: process.env, stdio: 'inherit' })
process.exit(result.status ?? 1)
