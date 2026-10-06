# TunaEye Layout Refinement: Weight Entry, Analysis, & Thermal Receipt Printing

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
