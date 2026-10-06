# TunaEye Grading Kiosk

TunaEye is a touch-friendly progressive web application for capturing and grading yellowfin tuna samples. It supports Sashibo core and tail-cut samples, real camera capture, per-fish weight tracking, expert review, result printing, offline use, and station administration.

## Requirements

- Node.js 20 or newer
- npm or pnpm
- Chrome, Edge, or another modern browser with camera and PWA support
- HTTPS or `localhost` for camera access and PWA installation

## Run locally

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

For a production build:

```powershell
npm run build
npm run preview
```

## Deploy to Vercel

Import this repository into Vercel or deploy it from the project folder:

```powershell
npx vercel
```

Vercel uses `pnpm build`, publishes `dist`, serves the app over HTTPS, and redirects client-side kiosk routes to `index.html` through `vercel.json`.

## Grading workflow

1. Start grading and select **Expert grader**.
2. Enter or select the grader name.
3. Select **Sashibo core**, **Tail cut**, or both cards.
4. When both samples are selected, choose whether they belong to the same fish.
5. Follow the three-step placement tutorial.
6. Enter each fish weight. The maximum accepted value is **200 kg**.
7. Select an available camera, align the sample, and capture the image.
8. Review the captured image and send it to the configured Raspberry Pi inference service.
9. Review or override the result, then print the grading receipt.

Each selected sample keeps its own captured image, fish association, weight, grade, confidence, expert decision, and receipt.

After two completed grading sessions by the same grader within 30 minutes, TunaEye skips the placement tutorial for the next grading run. **Grade another** keeps the current grader and returns directly to the sample selector.

## Camera access

The capture screen requests browser camera permission and lists every camera exposed by the device, including front, rear, USB, and virtual cameras.

If camera access is blocked:

1. Open the browser's site permissions.
2. Allow camera access for TunaEye.
3. Reload the capture screen.

Camera access normally fails on plain HTTP addresses other than `localhost`. Use HTTPS when opening the kiosk from another device on the network.

## Install as a PWA

Use **Install app** on the welcome screen. If the native prompt is unavailable, open the browser menu and choose **Install app** or **Add to Home Screen**.

The PWA includes:

- Standalone kiosk display
- 192px and 512px install icons
- Safe-area support for tablets and phones
- Offline application-shell caching
- Responsive layouts for portrait and landscape screens

After changing the service worker, refresh once so the browser can activate the new cache version.

## Admin dashboard

Choose **Admin** and enter the station PIN:

```text
1234
```

The dashboard includes station analytics, grading records, price schedules, grader profiles, device diagnostics, local station settings, and a **Start grading** action. Grader and admin dashboards read the same records stored in the current browser.

## Expert review

An uncertain result can be sent to **Expert review**. Manual overrides require the admin PIN before the grader can select the accepted grade and record a reason. TunaEye preserves the original model confidence while marking the final record as expert reviewed.

## Printing receipts

The print action opens the operating system print dialog and isolates an 80 mm thermal-receipt layout. Select the connected receipt printer or save the receipt as PDF.

Browsers cannot silently print without user confirmation unless the device is configured with a managed kiosk-printing policy.

## Project structure

```text
public/                 PWA manifest, service worker, icons, and tutorial assets
src/App.tsx             Screens and application workflow
src/kioskState.ts       Session state and reducer
src/styles.css          Responsive kiosk, safe-area, and print styles
src/main.tsx            React entry point and service-worker registration
vite.config.ts          Vite development server configuration
```

## Integration notes

- Camera capture uses the real browser camera stream.
- Captured evidence is stored as JPEG blobs in IndexedDB; lightweight grading metadata remains in `localStorage`.
- Raspberry Pi inference requires the edge service described in `ARCHITECTURE.md`.
- Supabase PostgreSQL and Storage synchronization require the migration under `supabase/migrations` and the environment variables in `.env.example`.
- Without cloud configuration or connectivity, evidence and grading records remain local with a retryable sync state.
- TunaEyePhone must follow `docs/SHARED_SUPABASE_CONTRACT.md` and use the same Supabase project.
