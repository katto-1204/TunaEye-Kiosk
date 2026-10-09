# Combined film application verification

Ran all existing Playwright tests using `combined-playwright.config.ts` and the existing isolated Vite test server on port 4178, separate from Admin capture port 3017. Production application code and existing tests were unchanged. Prior film verification reports were preserved.

Initial full suite: **38 passed, 4 skipped, 1 failed**. The failure was the 1024 by 600 tablet receipt-queue minimum-height assertion: Chromium returned `67.99999237060547` pixels against a 68-pixel minimum. No functional failure was reported. The same exact test passed on an isolated retry: **1 passed** in 11.5 seconds.

This is 39 tests passing across the full run and targeted retry, with 4 skipped. It is not a claim that the initial full suite was clean. The original report and failure trace are retained in `combined-playwright-report.json` and `combined-playwright-results/`; the isolated retry output is in `combined-playwright-retry-results/`.

Admin capture subsequently passed at both 1280 by 800 and 1024 by 600. Each run captured nine actual interface states and reported no unexpected console errors, failed requests, external requests, broken images or overflow. Each fixture run verified one image upload, one stable-ID record upsert, two record readbacks and one byte-identical image readback. Internet recovery itself wrote no records; explicit Sync now initiated upload and verification. Offline DNS failures were intentional fixtures and were recorded separately.

Admin cloud/auth responses remain isolated deterministic fixtures. These checks do not verify hosted Supabase, physical Pi camera/inference, printer, scale or lighting chamber.
