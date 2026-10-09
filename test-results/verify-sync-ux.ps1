$env:VITE_SUPABASE_URL = 'http://supabase.test'
$env:VITE_SUPABASE_ANON_KEY = 'test-anon-key'
$env:VITE_PI_LOCAL_HOSTED = 'true'
& node node_modules/@playwright/test/cli.js test tests/hotspot-sync.spec.ts tests/supabase-sync.spec.ts tests/offline-cache.spec.ts tests/kiosk.spec.ts --grep 'hotspot DNS failure|manual Supabase sync|internet probes|local Raspberry Pi hosting' --workers=1 --output=test-results/sync-ux-focused
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Remove-Item Env:VITE_SUPABASE_URL,Env:VITE_SUPABASE_ANON_KEY,Env:VITE_PI_LOCAL_HOSTED
& node node_modules/@playwright/test/cli.js test --workers=2 --output=test-results/sync-ux-suite
exit $LASTEXITCODE
