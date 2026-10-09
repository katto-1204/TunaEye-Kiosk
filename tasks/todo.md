# Pi fetch, automatic sync, and tablet control sizing — 2026-10-10

- [x] Trace Pi status, snapshot, and inference URLs separately from Supabase sync.
- [x] Start Supabase synchronization automatically after a completed grading result is saved.
- [x] Keep failed cloud sync records locally available with an explicit retry message.
- [x] Make kiosk welcome buttons equal width.
- [x] Move same-fish association content toward the vertical center on landscape tablets.

### Review

- Pi fetches can still fail on the same hotspot when the page origin is HTTPS or the Pi does not return CORS headers; the browser blocks the request before Flask inference runs.
- Supabase synchronization now starts immediately after completed records are persisted, while manual Sync now remains available for retries.
- The welcome CTA buttons share a 260px width and association heading content is centered lower in the tablet layout.

# Tablet selector overlap fix — 2026-10-10

- [x] Reserve heading space on the sample selector and same-fish screens.
- [x] Center both card rows in the remaining tablet viewport.
- [x] Remove the same-fish heading/card overlap caused by conflicting responsive overrides.

### Review

- Added final tablet landscape rules so the heading occupies its own row and cards are centered below it.
- Kept card dimensions uniform and preserved the existing bottom navigation bar.

# Hosted Supabase visibility and public landing link — 2026-10-10

- [x] Add a “Go to main page” button to the installed kiosk welcome screen.
- [x] Confirm Vercel variables are build-time inputs and require a new deployment after changes.
- [x] Trace hosted record visibility through Supabase Auth and RLS policies.
- [ ] Choose and implement the hosted administrator authentication flow.

### Review

- The Vercel environment screenshot shows the required Supabase variables for Production and Preview, but an existing deployment does not change until Vercel builds it again.
- The kiosk currently uses a local PIN only; it does not create a Supabase admin session.
- Supabase RLS permits `grading_records` reads for the record owner or a Supabase user with `profiles.role = 'admin'`. Anonymous Auth creates a separate owner per browser, so it cannot provide shared hosted admin visibility.

# Kiosk tablet dock and role selector layout — 2026-10-10

- [x] Keep the fullscreen control from exiting fullscreen when pressed repeatedly.
- [x] Remove the role-selector dock controls that can navigate away from kiosk mode.
- [x] Resize role cards so they are not stretched across the viewport.
- [x] Center the role-card contents and verify the tablet workflow.

### Review

- Fullscreen remains enabled once entered; the control is now status-only while fullscreen is active.
- The role selector no longer renders back/tutorial dock controls.
- Role cards use a bounded height with centered icon, copy, and action content.

# Kiosk landing Chrome fullscreen button — 2026-10-10

- [x] Add a small fullscreen control on the kiosk welcome screen.
- [x] Force Chrome Fullscreen API with `navigationUI: 'hide'` (plus webkit fallback).
- [x] Keep the control visible on tablet viewports and verify with Playwright plus browser.

### Review

- Small top-right fullscreen button on the kiosk welcome screen calls `requestFullscreen({ navigationUI: 'hide' })` so Chrome tablet UI hides.
- Playwright confirmed the click sends that Fullscreen API option; the Cursor embedded browser reports fullscreen enabled but does not actually take over the host window.

---

# 1000x650 responsive UI, pricing, and idempotent sync — 2026-10-10

- [x] Audit the selector, review, loading, receipt, grader dashboard, admin tables, and record modal at 1000x650.
- [x] Remove oversized card/panel whitespace and fix missing-image table overlap.
- [x] Shorten and resize the artificial boot loader without changing inference loading.
- [x] Make the receipt responsive and show grade-based fish value.
- [x] Keep record sync idempotent and label grader sync progress/results by name.
- [x] Add pricing fields and a price schedule table through an additive Supabase migration.
- [x] Apply migration `202610100001_grading_prices.sql` to the live project.
- [x] Run final full regression and normal/Pi production builds.

### Review

- Exact 1000x650 Playwright checks pass for the workflow surfaces, seeded grader records, and record review modal.
- Mocked Supabase test passes for timestamp normalization, pricing provenance, retry preservation, and idempotent upsert.
- Live database migration completed successfully; existing rows remain valid with nullable historical price fields.
- Full kiosk regression: 31 passed and 2 environment-gated skipped; the two browser/network flakes passed on isolated rerun.
- Normal and Raspberry Pi TypeScript/Vite builds passed. Existing 500 kB bundle warning remains.

---

# Supabase retry verification fix — 2026-10-10

- [x] Reproduce the all-record sync retry failure.
- [x] Compare PostgreSQL timestamps semantically during cloud verification.
- [x] Show the first actionable record error in the sync result modal.
- [x] Add focused regression coverage for normalized Supabase timestamps.
- [x] Run the sync Playwright flow and production build.

### Review

- PostgREST-style `+00:00` timestamps now verify as the same instant as `Z` timestamps.
- Object-shaped Supabase errors now remain visible instead of becoming `Unknown synchronization error`.
- Focused sync Playwright and production build passed.

---

# Weight, grader shortcut, selector scale, and sync diagnosis — 2026-10-09

- [x] Enforce a 15 kg minimum and 200 kg maximum with clear errors.
- [x] Left-align the weight value inside its input card.
- [x] Enlarge both sample selector images without changing assets.
- [x] Add a small grader history/home shortcut during active workflows.
- [x] Add restrained screen/card/button microtransitions with reduced-motion support.
- [x] Verify live Supabase anonymous Auth is enabled.
- [x] Replace the stale generic Vite-variable sync error with rebuild/redeploy guidance.
- [x] Run final normal/Pi builds and full Playwright regression.

### Review

- Focused Playwright passed: 3 tests covering range validation, alignment, and grader shortcut.
- Live Auth settings now report anonymous users enabled and signups allowed.
- Existing kiosk/PWA records still require a new Vercel deployment before the newly added Vite variables exist in the compiled bundle.
- Full Playwright regression passed: 31 tests; three environment-gated integration tests skipped and were verified separately.
- Normal and Pi TypeScript/Vite builds passed. Existing bundle-size warning remains.

---

# Live Supabase migration and Vercel camera routing — 2026-10-09

- [x] Audit live migration history and table compatibility before cloud writes.
- [x] Apply the shared grading contract and provenance migrations to live Supabase.
- [x] Verify migration versions and provenance columns through live REST schema access.
- [x] Reproduce the Vercel mixed-content camera failure in Chrome.
- [x] Prevent HTTPS deployments from falling back to HTTP Pi endpoints.
- [x] Preserve Pi-hosted same-origin status, stream, snapshot, and grade routes.
- [x] Add authenticated HTTPS gateway configuration and disconnected guidance.
- [x] Add hosted-gateway and Pi-local browser regressions.
- [x] Run the final normal-deployment Playwright suite.
- [ ] Deploy the verified Vercel build after linking/logging in to the existing project.

### Review

- Live Supabase migrations `202610070001` and `202610090002` applied and verified.
- Chrome reproduced mixed-content failures from Vercel to `http://10.42.0.1:8080`; camera permission was not involved because the app does not use `getUserMedia()`.
- Pi-local focused test and build passed; hosted HTTPS gateway focused test passed.
- Final normal regression passed: 30 tests; three environment-gated integration tests skipped and were run separately.
- Vercel deployment is blocked locally: no `.vercel/project.json` and no CLI credentials. No temporary or unrelated project was created.
- Supabase anonymous users are disabled; schema is migrated, but pending kiosk records cannot authenticate until that Auth setting is enabled.

---

# Storage persistence hardening — 2026-10-09

- [x] Audit IndexedDB, localStorage, Supabase schema/RLS, sync verification, and identity ownership.
- [x] Add nullable inference provenance and immutable-original protection through an additive migration.
- [x] Remove the local 200-record write truncation and retain every unsynced record.
- [x] Verify complete cloud rows and private image objects before marking local records synced.
- [x] Prune only older verified records while retaining the newest 200 synced records locally.
- [x] Start guarded synchronization after authenticated online startup and preserve deterministic retries.
- [x] Document a safe station identity migration without changing authentication.
- [x] Run focused sync tests, full Playwright regression, and final production builds.

### Review

- Additive migration prepared; no live Supabase schema was changed from this checkout.
- Focused storage/sync regression passed: 2 tests, including full provenance, byte verification, idempotent retry, retention, and failed-record preservation.
- Full Playwright regression passed: 30 tests; the environment-gated mock Supabase and Pi-local tests skipped as intended.
- Normal and Raspberry Pi TypeScript/Vite production builds passed. Existing bundle-size warning remains.

---

# Raspberry Pi Local Flask Hosting — 2026-10-09

- [x] Audit Pi URL selection, Vite builds, service worker, environment variables, manifest, and Vercel configuration.
- [x] Add a separate same-origin local-hosted mode and keep the normal Vercel build unchanged.
- [x] Route status, snapshot, stream, and grade through Flask port 5000 in local mode.
- [x] Prevent the service worker from caching live Pi endpoints while retaining app-shell/runtime caching.
- [x] Add an HTTP-safe UUID fallback and document secure-context limitations.
- [x] Verify the Pi-mode build, same-origin browser requests, normal regression suite, and final `dist/` output.

### Review

- `npm run build` passed and preserved the existing Vercel configuration.
- Pi-mode Playwright passed and observed only same-origin `/snapshot` and `/grade` requests.
- Full normal-deployment Playwright regression passed: 29 tests; the Pi-mode and live Supabase tests skipped under their intended environment guards.
- Final `npm run build:pi` passed and left 35 files in `dist/`; compiled assets contain no `10.42.0.1:5000` or `:8080` URL.
- Flask routing, transfer commands, endpoint requirements, and HTTP secure-context limitations are documented in `RASPBERRY_PI_LOCAL_HOSTING.md`.

---

# Raspberry Pi Camera, Inference & Synchronization — 2026-10-09

- [x] Audit the Pi client, camera/upload paths, local evidence storage, result records, sync, and tests.
- [x] Add stage-specific snapshot, inference, response, and status diagnostics.
- [x] Preserve exact uploaded and captured image bytes through review, inference, and synchronization.
- [x] Validate model selection, class scores, confidence, response shape, and result provenance.
- [x] Expand mocked integration coverage for healthy and failing Pi flows.
- [x] Run production build and full Playwright regression.
- [x] Record physical Raspberry Pi verification steps and remaining deployment constraints.

### Review

- Direct snapshot navigation and MJPEG preview do not prove browser `fetch()` can read the cross-origin snapshot; current generic handling hides CORS, mixed-content, HTTP, timeout, validation, and persistence stages.
- Preserved exact upload bytes and MIME types; camera snapshots continue through one immutable IndexedDB blob into inference and synchronization.
- Added typed V2 status/result parsing, build-gated demo behavior, raw result provenance, and stage-specific operator diagnostics.
- Prevented evidence-less records from being marked synced and derived cloud image extensions from MIME type.
- Build passed. Full Playwright regression passed: 29 tests; one live Supabase test skipped by its existing environment guard.
- Physical Pi/CORS/mixed-content validation remains documented in `RASPBERRY_PI_INTEGRATION_REPORT.md`.

---

# UI Cleanup — Redundancy, Copy, Loading States

Goal: remove repeated labels, cut verbose copy, add visible loading
indicators. Keep tablet layouts working at 1024x600, 1280x800,
1024x768, 1366x768, 800x1280.

## 1. Remove duplicate "Expert grader" labels

Grader entry screen (`src/App.tsx:675-713`) currently says it 3x in
one view:

- [ ] Drop eyebrow `Expert grader session` (line 679)
- [ ] Drop form-heading card `Expert grader` + its helper line
      (lines 684-690)
- [ ] Field label `Expert grader name` -> `Your name`
- [ ] Keep the `<h1>Who is grading today?</h1>` as the single label

Grader dashboard (`src/App.tsx:613`):

- [ ] Drop eyebrow `Expert grader dashboard`; the `Welcome back,
      {name}.` heading already identifies the screen

## 2. Trim body copy to short phrases

Replace 1-2 sentence explanations with a short phrase or nothing.
Keep all validation and error text unchanged.

- [ ] Grader entry: remove `Enter your name once for this grading
      session.`
- [ ] Weight: `Use the numpad to the right to enter the exact weight
      in kilograms for each fish.` -> remove (numpad is adjacent)
- [ ] Association: shorten the single/multi explanation to one phrase
- [ ] Camera: shorten the two long capture/upload paragraphs
- [ ] Overview: `Original model outputs stay visible next to any
      manual decision...` -> remove
- [ ] Result/recovery screens: shorten to one phrase
- [ ] Admin PIN: shorten `Use the four-digit station code...`

## 3. Visible loading indicators

Existing states are text-only. Reuse the existing `.spinner` class
and `spin` keyframe (already in `styles.css:323`).

- [ ] Add `<Spinner />` to `Button` via a `loading` prop so busy
      buttons show motion, not just changed text
- [ ] Camera capture button: spinner while `busy === 'capture'`
- [ ] Upload button: spinner while `busy === 'upload'`
- [ ] Sync buttons (admin + grader dashboard): spinner while syncing
- [ ] `capture-toast` ring: add spinning ring for capture/print/
      install toasts
- [ ] Verify disabled state still prevents double submission

## 4. Tablet verification

- [ ] Build passes (`tsc -b && vite build`)
- [ ] Playwright suite passes
- [ ] No horizontal overflow at the 5 target viewports
- [ ] No touch target under 44px
- [ ] No console errors
- [ ] Bottom action bars remain visible (not clipped)

## Out of scope

Not touching the 1,177 `!important` declarations or the two competing
`:root` token blocks (`styles.css:308` and `:1554`). That is a real
problem but a separate, higher-risk refactor — noted for later.

## Review

(filled in after implementation)
