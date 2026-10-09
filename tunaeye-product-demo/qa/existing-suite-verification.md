# Existing kiosk Playwright verification

Date: 2026-10-10 (Asia/Singapore). Current production app was tested without changing application code, existing tests, or production configuration.

## Result

- Full existing suite: **33 passed, 2 failed, 3 skipped** in 3.6 minutes.
- Targeted rerun of both failures: **2 passed** in 15.5 seconds.
- **All 35 eligible existing tests passed across the full run and targeted rerun.** This is not a claim that all 38 tests ran or that the first full-suite invocation was clean.
- No persistent application failure was reproduced. Both failures arose during QA isolation/setup and passed with no production changes.

Evidence: `existing-tests/reporter.log` (full run), `existing-tests/reporter-retry.log` (successful targeted rerun), and `existing-tests/test-results/` (original suite screenshots preserved inside the demo folder).

## Coverage exercised

Existing tests cover public landing and mobile layout; installed kiosk welcome; role navigation; admin PIN, settings, graph and pagination; refresh and local-record preservation; legal dialogs; grader identity/dashboard/record review; camera help and camera failure recovery; Pi response validation and original-result preservation after override; unsynced record retention; print failure/retry and skip confirmation; uploaded-image evidence hashing and inference; completed grading records and offline failed-sync retention; 58mm print media; 15–200 kg weight validation; logout; and tablet layouts at 1000×650, 1024×600, 1280×800, 1024×768, 800×1280 and 1366×768.

Console errors and failed network requests are asserted in tests that explicitly register those listeners. The movie's separately captured flow has its own browser report; these suite results do not substitute for that capture report.

## Isolation corrections and retry evidence

1. The initial sandbox invocation could not start Vite because esbuild received a filesystem access denial. Required escalation was approved and the server was rerun. This occurred before application tests.
2. Generated Playwright trace DOM snapshots initially entered Tailwind automatic source scanning. Vite then attempted to load a removed trace SVG from the stylesheet transform. That initial run was stopped. A QA-only `.gitignore` excludes `existing-tests/` from source scanning; the server was restarted. The stopped run is recorded in `existing-tests/reporter-initial-artifact-interference.log`.
3. During the complete suite, the admin graph/pagination test timed out after its PIN action detached from the DOM and the app returned to role selection. Concurrent development reload is the likely cause, inferred from the navigation and detached-element log. The identical original test passed alone on retry in 4.5 seconds.
4. The upload test uses `public/assets/sashiboCoreFull.png` relative to the runner's cwd. Moving the runner cwd to protect original screenshots therefore required copying that existing fixture to the same relative location inside `existing-tests/`. The identical original test then passed in 4.7 seconds, including saved-image hash verification. This was a fixture-path correction, not an image-upload code fix.

## Conditional skips

| Existing test | Why it skipped |
| --- | --- |
| Manual Supabase sync | Requires mock `VITE_SUPABASE_URL` environment; none supplied to this run. |
| Raspberry Pi same-origin local hosting | Requires `VITE_PI_LOCAL_HOSTED=true`; current dev mode is not that deployment mode. |
| Authenticated HTTPS gateway | Requires mock `VITE_PI_GATEWAY_URL`; none supplied to this run. |

No live Supabase, Raspberry Pi, camera, lighting chamber, scale, Bluetooth/thermal paper delivery, or deployed Android kiosk hardware was checked. Pi responses in passing integration tests were mocked.

## Reproduce

Run from `tunaeye-product-demo/qa/existing-tests`:

```powershell
rtk proxy node ../../../node_modules/@playwright/test/cli.js test --config ../existing-suite.config.ts --workers=2
```

The QA configuration imports the production Playwright configuration and points to the unchanged root `tests/` directory. Port 4178 is used for this suite. Its changed cwd ensures the tests' hardcoded `test-results/*.png` screenshot paths stay within the new demo deliverable.
