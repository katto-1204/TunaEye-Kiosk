# TunaEye Layout Refinement: Weight Entry, Analysis, & Thermal Receipt Printing

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

