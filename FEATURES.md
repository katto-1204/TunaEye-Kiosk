# TunaEye Kiosk Features

## Entry experiences

- Branded loading screen before the public website.
- Public marketing landing page for uninstalled browser visits.
- Installed PWA detection with direct entry to the kiosk landing.
- Three swipeable kiosk onboarding cards.
- Install action hidden after installation.
- Fullscreen PWA manifest with landscape orientation and safe-area support.

## Grading workflow

- Expert-grader name entry without suggested names.
- Sashibo core and tail-cut multi-selection.
- Same-fish or different-fish association.
- Guided three-step placement tutorial using supplied assets.
- Tutorial bypass after two sessions by the same grader within 30 minutes.
- Manual weight entry capped at 200 kg.
- Real browser camera permission, preview, camera switching, and image capture.
- Captured image reused in review, result, and receipt workflows.
- Per-sample result, confidence, fish association, and protected manual override.
- Separate printable 80 mm receipts and system print dialog.
- Grade Another starts a fresh grading procedure for the current grader.

## Dashboards and administration

- Grader dashboard with activity metrics, recent records, manual sync, and logout.
- Admin dashboard with records, prices, grader profiles, devices, settings, and audit logs.
- Four-cell OTP-style administrator PIN entry.
- Shared local record store between grader and admin dashboards.
- Manual Sync Now control with last-sync timestamp.
- Raspberry Pi health check and configured AI model display.
- Supabase project URL and Convex deployment URL configuration.
- Local audit trail for authentication, sync, settings, connection checks, and grading activity.

## PWA and device support

- Installable Vite PWA with service-worker application-shell caching.
- Offline-ready kiosk shell.
- Responsive 16:10 tablet layouts for landscape and portrait.
- Safe-area handling and viewport-locked kiosk screens.
- Vercel SPA routing configuration.

## Integration status

The user interface and connection settings are implemented. Live Raspberry Pi inference, Supabase persistence, and Convex cross-device synchronization require their corresponding deployed services, API contracts, credentials, and environment configuration.
