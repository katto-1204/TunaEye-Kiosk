# TunaEye Kiosk Dashboard Sync & Navbar Refinement — Plan

## Tasks

### 1. Fix Grading Session Dashboard Sync
- [ ] Investigate record saving logic (`localStorage.setItem(RECORDS_KEY, ...)`)
- [ ] Ensure completed samples from grading runs are immediately saved to `loadRecords()` and trigger dashboard reactivity
- [ ] Verify both `AdminDashboard` and `GraderDashboard` reflect newly graded sessions immediately

### 2. Make Navbar Even Smaller
- [ ] Reduce `TopBar` navbar height further (e.g. 40px - 44px on desktop, 36px on mobile)
- [ ] Reduce brand mark icon and text font size for an ultra-compact, sleek topbar

## Verification
- [ ] Test grading flow and verify dashboard updates
- [ ] Run production build (`npm run build`)
- [ ] Run Playwright tests (`npx playwright test`)
