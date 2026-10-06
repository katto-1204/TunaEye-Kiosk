# TunaEye Layout Refinement: Weight Entry, Analysis, & Thermal Receipt Printing

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
