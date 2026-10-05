# TunaEye Landing Page Enhancements & Pill Navbar Plan

- [x] Turn top navbar into a floating glassmorphic pill shape (`.site-nav`).
- [x] Update primary buttons on landing page: main button becomes "Start Grading" (triggers `onOpen`), keeping "Install kiosk app" in top navbar.
- [x] Change all "Open workflow" references to "Start Grading".
- [x] Add rich, comprehensive info about TunaEye: Hardware specs, Sashibo/Tail Cut grading criteria, HACCP compliance, Dual-cloud sync architecture, and station capabilities.
- [x] Make ONLY the landing pages scrollable (`.site-shell`, `.marketing-landing`, `.welcome-screen`).
- [x] Keep all interactive kiosk screens viewport-locked and tight (`.app-shell` default `overflow: hidden; max-height: 100vh`).
- [x] Update Playwright tests in `tests/kiosk.spec.ts` to reflect updated button text and structure.
- [x] Run build (`npm run build`) and Playwright tests to verify UI and workflow integrity.

## Review

All landing pages are scrollable, and all interactive kiosk screens remain viewport-locked and tight. Verified with Playwright tests passing 3/3.




