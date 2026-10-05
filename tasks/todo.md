# TunaEye UI Enhancement Tasks

## Completed
- [x] 1. **Kiosk topbar → pill shape** — Glassmorphic floating pill navbar matching marketing site design
- [x] 2. **Settings accessible** — Fully functional in Admin sidebar with RPi, Supabase, Convex, and offline toggles
- [x] 3. **Records pagination** — Page-based pagination (10 items per page) added with Previous/Next controls
- [x] 4. **Admin UI upgrade** — Upgraded cards, badging, metrics, and pagination controls
- [x] 5. **Changelog button** — Added a "What's New" version history modal on the landing page
- [x] 6. **Nav dropdown for legal** — Added "About TunaEye" dropdown with Privacy Policy and Terms & Conditions links
- [x] 7. **Team page redesign** — Showcase core project members with roles/tags and dedicated Adviser section
- [x] 8. **Real device diagnostics** — Removed non-existent fake hardware and implemented live Web API health checks

- [x] 9. **Hide "Install app" when already installed** — Conditionally remove the Install App button in WelcomeScreen when `installed` is true
- [x] 10. **TunaEye navbar → link to landing page** — Clicking TunaEye brand in kiosk TopBar or Admin sidebar navigates to the main landing/marketing page at '/'
- [x] 11. **Fix navbar in Grader and Admin** — Standardized pill-shaped TopBar with brand link navigation across all kiosk and admin screens

## Review
- `npm run build` completed with zero TypeScript/Vite errors.
- All brand marks in kiosk TopBar and Admin sidebar are styled as unstyled, accessible button links pointing to `/`.
- Conditional Install App button is hidden when app installation criteria are met (`installed = true`).

