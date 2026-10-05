# TunaEye UI Enhancement Tasks

## Outstanding Items

- [x] 1. **Kiosk topbar → pill shape** — Glassmorphic floating pill navbar matching marketing site design
- [x] 2. **Settings accessible** — Fully functional in Admin sidebar with RPi, Supabase, Convex, and offline toggles
- [x] 3. **Records pagination** — Page-based pagination (10 items per page) added with Previous/Next controls
- [x] 4. **Admin UI upgrade** — Upgraded cards, badging, metrics, and pagination controls
- [x] 5. **Changelog button** — Added a "What's New" version history modal on the landing page
- [x] 6. **Nav dropdown for legal** — Added "About TunaEye" dropdown with Privacy Policy and Terms & Conditions links
- [x] 7. **Team page redesign** — Showcase core project members with roles/tags and dedicated Adviser section

- [x] 8. **Real device diagnostics** — Removed non-existent fake hardware (e.g. receipt scanner) and implemented live empirical Web API health checks for actual TunaEye peripherals (optical cameras, Web Serial/Bluetooth thermal printers, Web Serial scales, Raspberry Pi latency, IndexedDB storage, and network connectivity).

## Review
- `npm run build` completed with zero TypeScript/Vite errors.
- `npx playwright test` ran and 3/3 E2E test suites passed.
