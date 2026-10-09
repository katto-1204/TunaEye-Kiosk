# TunaEye Refresh Recovery and UI/UX Audit

Date: 2026-10-09

## Done

- Detect installed-kiosk browser reloads.
- Immediately return reloads to `/select-role` without replaying the startup splash.
- Clear unfinished in-memory grading state and captured preview URLs only.
- Preserve completed local grading records and stored evidence.
- Show an accessible **Session wasn't saved** modal only when the refreshed route contained unfinished work.
- Focus the modal action automatically and support closing it with Escape.
- Keep completed-session and role-selector refreshes free of false warning dialogs.
- Fix the public demo-video overlap by rendering the modal at the document root and keeping its close button inside the panel.
- Add automated overlap checks for sample selection, fish association, tutorial, weight, camera, review, and printing.

## UI/UX Coverage

- Compact landscape: 1024×600
- Standard landscape: 1024×768, 1280×800, 1366×768
- Tablet portrait: 800×1280
- Modal bounds, action visibility, horizontal overflow, action-bar overlap, navigation, forms, upload, camera errors, printing, Admin, and the full grading workflow

## Verification

- Refresh recovery and overlap tests: 4 passed.
- Full Playwright regression: 22 passed; 1 live Supabase test skipped as designed. The landing test exposed two stale copy assertions and a real demo-modal stacking issue; after those corrections, the focused landing test passed.
- Production build: passed (`tsc -b && vite build`).
- Build note: Vite reports the existing main JavaScript chunk is larger than 500 kB; this is a performance warning, not a build failure.

## Error, Loading, and Modal Follow-up

- Capture and uploaded-image controls expose progress and stay locked until the evidence is safely stored.
- Camera, inference, installation, cloud, stored-evidence, synchronization, and printing failures now retain the recoverable state and explain the next action.
- Printing errors no longer mark a receipt as printed or advance the workflow.
- Skipping a receipt and removing a grader require confirmation.
- Application dialogs are rendered by priority to prevent overlapping modal layers.
- Final browser regression: 26 passed; one live Supabase test skipped as designed.

## Palette Correction

- Removed the retained legacy navy tier from text, shadows, device details, fallbacks, and the thermal dial.
- Ordinary text now uses neutral charcoal instead of blue-black.
- Brand surfaces use the supplied electric-blue-to-cobalt gradient, including the Admin sidebar, workflow bands, active tabs, CTA sections, and marketing visuals.
- Focused visual verification passed across landing, Admin, kiosk, and five responsive tablet viewports.

## Role Selector Redesign

- Replaced the generic shield and sparkle with a control-console icon for Admin and an inspection-eye icon for Expert Grader.
- Rebuilt the cards with role labels, descriptive copy, destination cues, keyboard focus, touch feedback, and reduced-motion behavior.
- Preserved the existing Admin and Expert Grader routes.
- Verified the selector at 1024×600, 1280×800, 1024×768, 800×1280, and 1366×768 without overflow or action overlap.

## Not Hardware-Verified

- Raspberry Pi camera and inference service
- Bluetooth thermal printer
- Physical scale and lighting chamber
- Live Supabase sync credentials

These require the real station hardware or live credentials and are outside browser-only UI verification.
# Expert Grader Identity Follow-up — 2026-10-09

## Done

- Enlarged the Expert grader name input to a 76 px touch target on roomy displays and 64 px on short landscape tablets.
- Added a clear identity-card hierarchy with a distinct grader icon and concise record-use guidance.
- Increased the remember-name checkbox to 26 px and improved label, focus, spacing, and privacy-link readability.
- Balanced the two-column landscape composition and retained a centered single-column form in portrait.
- Preserved the existing validation, local name persistence, legal dialogs, Back action, and Start grading flow.

## Verification

- Focused Playwright: identity form and legal dialogs passed at 1024×600 and 800×1280.
- Visual inspection: no clipping, overlap, horizontal overflow, or hidden bottom actions at 1024×600.
- Full Playwright suite with Pi demo mode disabled for mocked hardware tests: 28 passed; one live Supabase test skipped by design.
- Production build: passed; Vite continues to report the existing large-chunk advisory.

---
# Landing Mobile App Preview Follow-up — 2026-10-09

## Done

- Replaced the placeholder iPhone content in the installation section with the five supplied mobile app screenshots.
- Kept the supplied order and automatically advances the preview every two seconds.
- Preloads every screenshot and cleans up the rotation timer when leaving the landing page.
- Preserved the existing iPhone SVG frame, QR card, installation instructions, and responsive section layout.

## Verification

- Desktop and 390 px mobile Playwright layout checks passed with no browser errors or failed image requests.
- Visual capture confirms the portrait screenshots fill and remain clipped inside the phone display.
- Full Playwright suite: 28 passed; one live Supabase test skipped by design.
- Production build passed with the existing Vite large-chunk advisory.

---
