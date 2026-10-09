# Authentic Admin + simulated manual sync

- 1280x800: passed; 9 screenshots; 0 unexpected console errors; 0 unexpected failed requests.
- 1024x600: passed; 9 screenshots; 0 unexpected console errors; 0 unexpected failed requests.

Actual local PIN login, admin overview/records, offline waiting, confirmed health-probe recovery, explicit manual sync, one image upload, one stable-ID upsert, full row and byte-identical image readback, then verified synced metadata and IndexedDB image state passed. No write occurred at startup, during offline waiting, or on internet recovery. The previous model result and expert override were preserved.

Seven moving UI clips compose the exact 14-second / 840-frame hero-admin.mp4. Tap times/positions are in admin-clips.json; full endpoint counters and checkpoints are in admin-manifest.json.

Required onscreen label: DEMO CLOUD · SIMULATED SYNC. Cloud/auth/DNS responses are isolated Playwright fixtures. Expected DNS failures are recorded separately; no live Supabase, Pi, physical camera, printer or scale was accessed. Production source and previous demo were not edited.
