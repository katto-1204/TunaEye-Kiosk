# TunaEye Raspberry Pi 5 and Supabase Integration Report

Date: 2026-10-09

## To do

- Connect the tablet to the `TunaRpi` hotspot and validate the real Pi at `10.42.0.1`.
- Confirm the Flask `/grade` multipart fields (`image_type`, `image`) and response against the upgraded backend.
- Validate both TFLite models on physical Sashibo Core and Tail-Cut captures.
- Choose and approve a secure local deployment/gateway for production. Vercel HTTPS cannot reliably load HTTP Pi endpoints because of mixed-content and private-network restrictions.
- Supply the real PostgreSQL password only to a trusted migration tool, then inspect the live schema before applying `supabase/migrations/202610070001_shared_grading_contract.sql`.
- Enable/verify Supabase Anonymous Auth if unattended kiosk sessions will continue using it.
- Replace the local admin PIN/expert-name identity with real Supabase Auth roles if shared cross-device admin visibility is required.
- Add the missing shift/open-shift domain and route guards. This checkout did not contain either implementation to preserve.
- Compare the live schema with the official `TunaEyePhoneLEGIT` repository before applying any migration.

## Done

- Audited routes, camera, inference, local persistence, sync, Supabase client/types/migration, Admin reads, PWA, Vercel config, and Playwright coverage.
- Added `src/piClient.ts` as the single Pi integration point:
  - default API `http://10.42.0.1:5000`;
  - default ustreamer `http://10.42.0.1:8080`;
  - `GET /status`, `GET /snapshot`, `GET /stream`, and `POST /grade`;
  - 8-second timeout, bounded retry/backoff, HTTP/image/result validation;
  - `sashibocore` and `tailcut` model selection;
  - grade mapping and confidence normalization.
- Replaced tablet `getUserMedia()` and the static-image fallback in the grading flow with the Raspberry Pi MJPEG stream and snapshot.
- Added loading/failure recovery through the existing camera surface and a manual Reconnect action.
- Removed timed demo predictions. Analysis now sends the exact IndexedDB evidence blob to Flask and uses only the returned grade.
- Preserved stable local record IDs, captured evidence, fish association, weight, overrides, receipt/print flow, and pending sync state.
- Preserved the canonical `grading_records` table and private `grading-images` bucket; no kiosk-only cloud table or Realtime subscription was added.
- Added an in-flight mutex to prevent manual and reconnect sync jobs from running concurrently.
- Kept capture ID, inference ID, and class scores in local record metadata without inventing unsupported Supabase columns.
- Bypassed Pi-local HTTP requests in the service worker so a failed camera/API request cannot incorrectly return the cached app shell.
- Configured the supplied Supabase project URL and publishable key in the ignored local `.env`; updated `.env.example` with Pi variables. The direct PostgreSQL URL was not placed in frontend code.
- Updated `docs/SHARED_SUPABASE_CONTRACT.md` for TunaEyePhoneLEGIT and the Pi/cloud trust boundary.
- Added a mocked end-to-end browser assertion for snapshot capture, multipart inference, normalized confidence, and persisted backend IDs.

## Verification

- Production build: passed (`tsc -b && vite build`).
- Browser suite: passed 15 tests; one live-credential Supabase test skipped as designed.
- Mock Supabase test validates Auth, private Storage upload, stable-ID upsert, read-back verification, manual sync, reconnect sync, and Admin retrieval when test environment variables are supplied.

## Files created

- `src/piClient.ts`
- `RASPBERRY_PI_SUPABASE_INTEGRATION.md`

## Files modified

- `.env.example`
- `src/App.tsx`
- `src/kioskState.ts`
- `src/gradingRecords.ts`
- `src/cloudSync.ts`
- `src/styles.css`
- `src/vite-env.d.ts`
- `public/sw.js`
- `tests/kiosk.spec.ts`
- `docs/SHARED_SUPABASE_CONTRACT.md`
- `tasks/todo.md`

## Not changed

- No mobile repository was modified.
- No SQL migration was applied to the live project.
- No database password, service-role key, or direct connection string was exposed to Vite/browser code.
- No Supabase Realtime, separate Admin database, eye/gill/freshness/species classification, or fabricated prediction was added.

## Known blockers and risks

The supplied direct connection string contains `[YOUR-PASSWORD]`, so live schema/RLS/Storage deployment cannot be performed. The Pi backend, USB camera, hotspot, and TFLite files are outside this repository and were unavailable for physical verification. The current app also lacks the shift model and production Supabase role login described by the requested architecture; those are larger product/auth changes, not safe details to fabricate during this integration.
