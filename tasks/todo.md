# Landing Mobile App Screenshot Carousel — 2026-10-09

- [x] Inspect the existing iPhone mockup and all five supplied app screenshots.
- [x] Replace the placeholder phone content with the supplied images in the requested order.
- [x] Rotate the phone image every two seconds and clean up the timer when the landing page unmounts.
- [x] Verify image loading, rotation, desktop/mobile layout, and production build.

### Review

- All five supplied 908×2048 screenshots now fill the existing iPhone mockup in the requested order and advance every two seconds.
- Images preload before their turn; the interval is removed when the Home page unmounts.
- Playwright verified image loading and URL rotation, desktop two-column layout, 390 px mobile stacking, no failed requests, and no browser errors.
- Visual captures confirm the screenshots remain clipped inside the rounded iPhone display and Dynamic Island.
- Production build passed. Full Playwright regression passed: 28 tests; one live Supabase test skipped as designed.

---

# Expert Grader Identity UI — 2026-10-09

- [x] Inspect the grader-name screen and effective responsive styles.
- [x] Enlarge and visually prioritize the grader identity form without changing the flow.
- [x] Verify entry, legal modals, and responsive tablet layouts in Playwright.
- [x] Run the production build and record results.

### Review

- Rebuilt the identity area as a clear, elevated form card with a dedicated grader icon, supporting record copy, a 76 px name field, and a 26 px touch checkbox.
- Verified 1024×600 and 800×1280 layouts, legal dialogs, name entry, and Start grading navigation with a focused Playwright test.
- Visually inspected the 1024×600 capture: content and actions remain fully visible with no overlap or horizontal overflow.
- Production build passed. Full Playwright regression passed with `VITE_DEMO_MODE=false`: 28 passed, one live Supabase test skipped as designed.

---

# Error Handling, Loading States, and Modals — 2026-10-09

- [x] Audit async grading, storage, hardware, install, print, Admin, and cloud operations.
- [x] Prevent failed printing from being recorded as successful and provide retry feedback.
- [x] Keep capture/upload controls locked until evidence is stored and show explicit progress.
- [x] Add install prompt failure/cancellation handling and visible progress.
- [x] Surface Admin cloud loading/fallback state and stored-evidence loading/errors.
- [x] Add confirmations for skipping receipts and removing graders; prevent modal stacking.
- [ ] Verify focused error/loading/modal flows, full Playwright regression, and production build.

### Review

- Implementation complete; browser verification in progress.

---

# Electric Blue Palette Overhaul — 2026-10-09

- [x] Inventory every shared blue token and direct blue used by marketing, kiosk, Admin, charts, device previews, and the weight dial.
- [x] Replace the current mixed cyan/navy palette with the supplied electric-blue-to-deep-cobalt system.
- [x] Verify contrast, selected states, dialogs, charts, and responsive layouts in the browser.
- [x] Run the full Playwright suite and production build.

### Review

- Replaced shared theme variables and direct legacy royal/cyan/navy values with the supplied reference family: electric `#176BFF`, saturated `#0B45E5`, deep `#061EAE`, plus accessible pale tints for light surfaces.
- Applied the system across public marketing, kiosk screens, Admin, charts, SVG/logo accents, device previews, and the thermal weight dial.
- Visually inspected the landing footer, Admin overview/chart, and responsive tablet captures; the footer now closely matches the supplied bright-to-deep blue reference.
- Legacy primary-color scan returned no old royal/cyan matches.
- Full Playwright suite passed: 23 tests; one live Supabase test skipped as designed. Production build passed with the existing large-chunk warning.

---

# Landing brand voice + visual README — 2026-10-09

- [x] Rewrite README around Sea Beyond the Cut, expert-extend positioning, and operator essentials.
- [x] Shorten landing hero/demo/install/story copy; keep CNN as assist, not replacement.
- [x] Use `public/assets/mobile app qr.png` in the install section.
- [x] Verify landing hero, install QR, and About copy in the browser.

### Review

- Hero now uses Sea Beyond the Cut plus the short expert-extend lines; install QR loads from `public/assets/mobile app qr.png`.
- About page states CNN assist, expert-annotated data, and the replacement limit.
- README rewritten as a visual product overview with run, grade, and station essentials.

---

# TunaEye Layout Refinement: Weight Entry, Analysis, & Thermal Receipt Printing

## Interrupted Refresh Recovery + Full UI Audit — 2026-10-09

- [x] Detect a true browser/software reload on an unfinished grading route.
- [x] Reset only the unfinished in-memory session, replace the URL with the role selector, and preserve completed local records/evidence.
- [x] Show an immediate accessible notice explaining that the unfinished session was not saved.
- [x] Verify normal first navigation, completed screens, Admin routes, and browser history are not incorrectly redirected.
- [x] Re-run every kiosk UI/UX viewport check, modal bound check, workflow regression, and production build.

### Review

- Reload recovery now skips the splash, clears only transient grading state, replaces the URL with `/select-role`, and warns only when the previous route represented unfinished work.
- Completed local records remain intact; completed and role-selection refreshes return to role selection without a false warning.
- Critical sample, association, tutorial, weight, camera, review, and print panels stay above their action bars at 1024×600 and 800×1280 with no horizontal overflow.
- The public video dialog was moved to the document root and its close control anchored inside the panel, eliminating overlap with the floating changelog trigger and hero layers.
- Playwright coverage passed across the 22-test full regression run plus corrected focused recovery/overlap/landing reruns; one live Supabase test remained skipped as designed. Production build passed.

## Master Kiosk UI/UX QA + Branding Overhaul — 2026-10-09

- [x] Audit shared kiosk layout, branding tokens, affected screens, dialogs, and current responsive tests.
- [x] Remove the kiosk navbar and its reserved height while preserving contextual navigation.
- [x] Apply the royal-blue/white design system without changing public marketing or admin behavior unnecessarily.
- [x] Fix role selection, legal dialogs, manual override, fish association, weight entry, and image review layouts.
- [x] Add bounding-box, overflow, modal, and workflow assertions at 1280×800, 1024×600, 1024×768, and 800×1280.
- [x] Visually inspect captured screenshots, repair regressions, run the full Playwright suite, and run the production build.

### Review

- Removed the kiosk TopBar component and all rendered navbar footprint; contextual Back, Help, Retake, Use Image, completion, and Admin navigation remain available.
- Applied the requested royal-blue, deep-blue, navy, white, soft-blue, light-background, and border tokens using restrained gradients.
- Legal dialogs now use one shared viewport-bounded layout with an internally scrollable body and always-visible Close action.
- Role cards, association cards, weight display/keypad, review decision panel, and override PIN/keypad were balanced for tablet use.
- Visual inspection passed for 1024×600 print, 1280×800 weight validation, and 800×1280 Admin; a clipped chart tooltip found during inspection was fixed and retested.
- Full Playwright suite passed: 19 tests; one live-credential Supabase test skipped as designed.
- Final focused portrait/Admin verification passed: 2/2 tests.
- Production build passed (`tsc -b && vite build`). No lint script exists.

## Image Upload Option + Raspberry Pi V2 Audit — 2026-10-09

- [x] Audit the supplied Pi V2 requirements against the locally available kiosk contract and record unavailable Pi evidence honestly.
- [x] Add a validated image-upload option to the existing camera screen without duplicating capture, review, inference, persistence, or sync logic.
- [x] Verify an uploaded Sashibo Core image uses the selected model contract and retains normalized JPEG evidence; existing sample routing supplies `tailcut` for Tail-Cut.
- [x] Treat the supplied PostgreSQL password as a server-side audit credential only; never commit or expose it to Vite.
- [x] Create a dedicated Markdown audit report with findings, severity, required Pi changes, and PASS/FAIL/UNVERIFIED checklist.
- [x] Run focused Playwright upload verification, full browser suite, and production build.

### Review

- Upload flow passed at 1024×600 with no console errors, failed requests, or horizontal overflow.
- Uploaded PNG evidence was decoded and stored as JPEG, then sent through the existing multipart Pi inference path.
- Full Playwright suite passed: 16 tests; one live-credential Supabase test skipped as designed.
- Production build passed (`tsc -b && vite build`).
- Physical Pi/backend/model/hotspot findings remain UNVERIFIED because `/home/tunarpi/rpi-cam-demo/` was not available in this workspace.

## Raspberry Pi 5 + Shared Supabase Integration — 2026-10-09

- [x] Audit camera, inference, persistence, sync, schema, admin, PWA, and tests.
- [x] Add one reusable Pi client for health, stream, snapshot/capture, and grading with timeout/retry validation.
- [x] Replace tablet camera/demo inference with the Pi USB camera and exact captured-frame grading flow.
- [x] Preserve local records, stable IDs, receipt/QR flow, and manual/automatic Supabase sync.
- [x] Configure the supplied publishable Supabase project values without exposing database credentials.
- [x] Update the shared contract and create a complete implementation report (`to do`, `done`, and remaining blockers).
- [x] Run typecheck/build and Playwright user-flow verification, including console/network checks and tablet viewports.

### Review

- Production build passed (`tsc -b && vite build`).
- Full Playwright suite passed: 15 tests; the live-credential Supabase test was skipped as designed.
- Focused Pi browser flow passed with mocked ustreamer snapshot and Flask inference, including multipart model selection and saved backend IDs.
- Real Pi camera/models, live Supabase schema/RLS, and HTTPS-to-local-network behavior remain hardware/deployment verification items documented in `RASPBERRY_PI_SUPABASE_INTEGRATION.md`.

## Landscape Tablet QA Fixes — 2026-10-07

- [x] Move the role help control to the right with a 48px target.
- [x] Restore readable tutorial numbers for every slide.
- [x] Shift the weight keypad group slightly left.
- [x] Normalize Sync now spacing and touch size.
- [x] Balance sample images without changing cards.
- [ ] Verify 1024x600, 1280x800, 1366x768, suite, and build.

### Review

- Pending verification.

## Shared Supabase Connectivity — 2026-10-07

- [x] Audit existing local persistence, sync controls, admin reads, auth, and schema files.
- [x] Add one typed Supabase client and canonical grading record contract.
- [x] Add private Storage upload, authenticated upsert, verification, and retry states.
- [x] Wire manual sync and connectivity-based reconnect sync without Realtime.
- [x] Add SQL schema, indexes, Auth profile trigger, RLS, and Storage policies.
- [x] Document the exact TunaEyePhone integration contract.
- [x] Validate typecheck, offline behavior, mocked cloud sync, browser suite, and build.

### Review

- Production build/typecheck passed.
- Mocked Supabase browser test passed: Auth, Storage upload, idempotent upsert, read-back verification, reconnect sync, and Admin cloud retrieval.
- Full default Playwright run passed: 15 tests, with the credential-gated Supabase test skipped as designed.
- No lint script exists in `package.json`; no live Supabase project credentials were available, so the migration was not applied remotely.

## Weight Placeholder Clipping — 2026-10-07

- [x] Match the empty input width to the three-character `0.0` placeholder.
- [x] Verify the weight display at tablet size.

### Review

- Empty weight inputs now reserve enough width for the full `0.0` placeholder.
- Focused Playwright weight test and production build passed.

## Combined Mobile Download Section — 2026-10-07

- [x] Merge the phone experience and installation guide into one section.
- [x] Replace the phone experience copy with the setup guide.
- [x] Verify the combined desktop and mobile layout.

### Review

- Phone mockup, QR area, and setup guide now share one two-column section with no duplicate lower block.
- The superseded experience copy, diagram, divider, and download CTA were removed.
- Focused Playwright landing test and production build passed.

## Landing Demo CTA and Footer — 2026-10-07

- [x] Add the supplied Hero Video Dialog interaction.
- [x] Change the demo CTA to `View Demo`.
- [x] Route the mobile CTA to the download section.
- [x] Rebuild the footer as the supplied two-panel layout.
- [x] Verify dialog, download navigation, responsive footer, suite, and build.

### Review

- `View Demo` opens the accessible modal and closes cleanly; `Download App` scrolls to installation.
- Desktop and 390px footer layouts pass browser checks with no console or request failures.
- Full Playwright suite passed: 15/15 tests.
- Production build passed (`tsc -b && vite build`).

## Landing Device Mockups — 2026-10-07

- [x] Add the supplied MacBook Pro component under `src/components/ui`.
- [x] Add the supplied iPhone 16 Pro component under `src/components/ui`.
- [x] Use the MacBook frame for the demo walkthrough poster.
- [x] Use the iPhone 16 Pro frame for the mobile TunaEye preview.
- [x] Remove the superseded phone component.
- [x] Run full browser verification and final production build.

### Review

- Production build passed (`tsc -b && vite build`).
- Full Playwright suite passed: 15/15 tests.
- Desktop screenshots confirm the MacBook demo and iPhone 16 Pro mobile preview.
- Mobile landing remains single-column with no horizontal overflow at 390×844.

## Offline Evidence and Landing Repair — 2026-10-07

- [x] Trace capture data loss and duplicate record persistence.
- [x] Store captured JPEG blobs in IndexedDB with stable evidence IDs.
- [x] Keep record metadata lightweight and cloud-sync ready.
- [x] Document the future kiosk/mobile Supabase contract without implementing cloud sync.
- [x] Restore desktop grids, spacing, and responsive behavior for new landing sections.
- [x] Verify persistence, landing visuals, full browser suite, and production build.

### Review

- Captured JPEG evidence persists in IndexedDB and reloads in dashboard records.
- Record metadata stores only the stable evidence ID and remains `pending` for future sync.
- Desktop landing sections render as two-column layouts; 390px collapses without horizontal overflow.
- Production build passed and the full Playwright suite passed: 15/15 tests.
- Screenshots saved under `test-results/landing-*-1280x800.png` and `test-results/landing-mobile-390x844.png`.

## iPhone Mockup Replacement — 2026-10-07

- [x] Replace the placeholder device shell with the supplied 433×882 iPhone SVG.
- [x] Preserve the existing TunaEye screen content inside the new frame.
- [x] Verify the production build and landing page in-browser.

### Review

- Production build passed (`tsc -b && vite build`).
- Full Playwright suite passed: 15/15 tests.
- Landing regression check confirms the 433×882 SVG, preserved screen content, zero browser errors, and zero failed requests.
- Visual screenshot saved at `test-results/iphone-mockup.png`.

## Landing Render Crash and Weight Screen Cutoff — 2026-10-07

- [x] Replace the undefined video placeholder icon with an inline play symbol.
- [x] Remove fixed-height pressure from the weight information panel so the bottom action remains visible.
- [x] Add reusable Ponytail and Caveman response hooks.
- [ ] Verify production build and landing/weight flows in the browser.

### Review

- Pending verification.

## Admin Records and Analytics Upgrade — 2026-10-07

- [ ] Allow scoped vertical scrolling throughout the admin workspace.
- [ ] Make pagination visible and usable on every full records view.
- [ ] Upgrade the dashboard chart to an interactive animated line graph.
- [ ] Improve admin cards, table hierarchy, spacing, and tablet responsiveness.
- [ ] Configure/install the licensed React Bits Pro Simple Graph when `REACTBITS_LICENSE_KEY` is available.
- [ ] Verify scrolling, pagination, chart interaction, and all tablet viewports with Playwright.

## Kiosk Input, Print, and Completion QA — 2026-10-07

- [x] Remove the remaining tutorial number and grader-landing star.
- [x] Rename the grader landing CTA to `Get started` and enlarge TunaEye.
- [x] Normalize leading-zero weight entry without silently clamping values.
- [x] Show an accessible 200 kg maximum error state and block continuation.
- [x] Keep the receipt preview and print actions separated at tablet sizes.
- [x] Center `Grade another`; place `Dashboard` and `Logout` side by side below it.
- [x] Route logout to the grader landing screen and clear the saved grader.
- [x] Verify all changed flows at 1024x600, 1280x800, and 1366x768.

### Review

- Production build passed.
- Full Playwright suite passed: 14/14 tests.
- Tablet collision checks passed at 1024x600, 1280x800, and 1366x768 with no horizontal overflow, browser errors, failed requests, or receipt/action overlap.
- Visual screenshots confirm the weight error, centered completion controls, and responsive receipt preview.

## QA Tablet UI Feedback — 2026-10-06

- [x] Map the QA checklist to existing shared layout classes.
- [x] Make role selection the dominant, touch-friendly tablet content.
- [x] Increase print queue readability and action touch areas.
- [x] Raise tutorial step-number contrast.
- [x] Center the same-fish decision group with equal cards.
- [x] Improve admin header hierarchy and spacing.
- [x] Verify 1024x600, 1280x800, and 1366x768 with Playwright.
- [x] Run the production build and full browser suite.

### Review

- Production build passed (`tsc -b && vite build`).
- Full Playwright suite passed: 12/12 tests.
- Focused QA viewport suite passed again with zero console errors, page errors, failed requests, or horizontal overflow: 3/3 tests.
- Screenshots saved under `test-results/tablet-1024x600.png`, `tablet-1280x800.png`, and `tablet-1366x768.png`.

## Tasks

### 1. Weight Entry Screen (`WeightScreen`) Redesign (2-Column Side-by-Side)
- [x] On the Left:
  - Eyebrow: `Step 4 · Weight entry`
  - Heading: `Enter the fish weight.`
  - Subtext/description explaining weight relevance to yield and pricing
  - Validation status (`Ready to start capture` / `Enter a weight greater than zero`)
- [x] On the Right:
  - Active fish weight card(s) (`Fish 1`, input with `kg`)
  - Direct touch numpad (`0-9`, `.`, `⌫`, `Clear`) placed cleanly below the input
- [x] Ensure responsive tablet/desktop side-by-side flex/grid layout without vertical cutoff or viewport overflow

### 2. Analysis Screen (`AnalysisScreen`) Redesign (Image on Left, Texts on Right)
- [x] On the Left:
  - `EvidenceFrame` with subtle pulse/scanner animation
- [x] On the Right:
  - Eyebrow: `Raspberry Pi edge inference`
  - Heading: `Reading {sample.toLowerCase()}`
  - Subtext: `Sending the captured evidence to the configured model and preserving the returned result.`
  - StepRail (`Capture`, `Analyze`, `Result`)
  - Inference status spinner (`Waiting for inference result`)
- [x] Ensure clean 2-column layout that fits comfortably on kiosk and tablet screens

### 3. Receipt Printer Integration (`PaymentReceiptPrinter`)
- [x] Auto-extrude ("release") thermal receipt upon navigating to print screen
- [x] Smooth progress timer handling when user clicks "Print" button

### 4. Verification & Testing
- [x] Update and run Playwright test suite (`npx playwright test`)
- [x] Run production build (`npm run build`)
- [x] Verify visual elegance and responsiveness
- [x] Add a real toggleable admin sidebar with an icon-only collapsed state.
- [x] Apply QA tablet sizing to role selection, print queue, placement number, association cards, and admin header.
- [ ] Complete live browser screenshots at 1024x600, 1280x800, and 1366x768 after the OneDrive node_modules EPERM lock is cleared.
# Role Selector Card Redesign — 2026-10-09

- [x] Audit the selector structure, duplicate responsive rules, touch sizing, and current icons.
- [x] Replace generic shield/spark artwork with control-console and inspection-eye role icons.
- [x] Redesign both cards with clearer hierarchy, destination cues, focus, hover, active, and reduced-motion states.
- [x] Verify Admin/Grader routing and card layout at landscape, portrait, and mobile viewports.
- [x] Run the full browser suite and production build.

### Review

- Admin now uses a control-console/sliders icon and the Expert Grader uses an inspection-eye/crosshair icon.
- Cards have clearer role labels, descriptive copy, destination actions, keyboard focus, hover/touch feedback, and reduced-motion handling.
- The Admin card remains a clean white management surface; Expert Grader uses the electric-blue/cobalt brand treatment without the removed navy.
- Focused role/routing/responsive verification passed 7/7, and the 1024×600 render was visually inspected with no overlap.
- Full Playwright suite passed 27 tests with one live Supabase test skipped as designed. Production build passed.

---
