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
