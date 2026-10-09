# Plan

## Internet recovery and captured image sync labels (2026-10-10)
- [x] Add bounded cloud reachability checks and friendly waiting states for both sync entry points.
- [x] Show verified Synced / saved-local labels on captured images and current record review.
- [x] Show one dismissible Internet is back toast after confirmed recovery; preserve manual sync.
- [ ] Verify hotspot, recovery, partial disconnect and image labels in Playwright; run existing suite and Pi build.

Scope: existing cloud modules, shared records UI, existing toast style and focused tests. Keep all grading data and cloud verification requirements.

- [x] Inspect the persistence and sync flow that marks records as syncing before manual sync is requested.
- [x] Remove the unintended automatic sync trigger during kiosk startup/reconnect handling.
- [x] Validate the affected Playwright scenario for pending local records.

## Pi hotspot cloud failure (2026-10-10)
- [x] Reproduce DNS failure and unintended reconnect sync with browser tests.
- [x] Keep sync manual, explain cloud connectivity failures, and correct network readiness copy.
- [x] Verify offline preservation and manual cloud retry; run kiosk suite and rebuild Pi assets.

Scope: cloud authentication error, remaining automatic reconnect trigger, network status wording, regression tests. Keep local records and evidence.

### Hotspot cloud fix review
- Reproduced unwanted cloud authentication after an online event before the fix. Removed the remaining reconnect sync; only the two explicit Sync now handlers call record sync.
- Authentication network failures now explain Pi Wi-Fi versus internet access. Pending record data stays unchanged; an empty queue avoids unnecessary cloud authentication. Devices reports network connectivity without claiming internet/cloud readiness.
- Browser DNS-failure regression verifies zero reconnect requests, a clear manual sync failure, unchanged pending financial data, continued grading navigation, and corrected Devices status. Mocked cloud test verifies manual upload/readback, retry, evidence retention and price sync; both passed in Pi mode.
- Standard suite: 37 passed, 4 environment-specific skipped, 1 route test initially landed on role selection. Isolated retry passed; all 38 eligible checks verified. Pi build and diff whitespace checks passed.
- Current workstation DNS resolves the configured Supabase hostname and a no-key health request reaches its gateway (401 expected). This workstation is outside the Pi hotspot subnet. User-device DNS/internet, live cloud data writes, extension behavior and deployment were not tested; updated Pi assets are in dist/.

## Cinematic kiosk product demo (2026-10-10)
- [x] Inspect current real kiosk screens and preserve production source.
- [x] Capture ordered same-fish, two-sample flow; verify 1280x800 and 1024x600.
- [x] Build 90-second 1920x1080/60fps Remotion source; lint/typecheck and key frame QA.
- [x] Verify all 35 eligible existing kiosk tests; 3 deployment-specific skips.
- [x] Finish neural narration, original music and synchronized effects.
- [x] Finish final, no-narration and preview renders.
- [x] Verify export metadata/audio levels and document delivery.

Scope: tunaeye-product-demo only plus task tracking. Keep unrelated ongoing app and task edits.

### Product demo review

- Delivered all three MP4s and four requested WAV stems with complete isolated Remotion source, capture/audio/render scripts, storyboard and README.
- Full versions: exactly 90 seconds, 5,400 decoded frames, 1920x1080/60fps, H.264 yuv420p BT.709, AAC stereo 48kHz. Preview: 90 seconds, 1280x720/30fps.
- Final mix: -14.0 LUFS / -1.5 dBTP. Narration-free MP4: -13.5 LUFS / -1.1 dBTP. No clipping detected; every stem exactly 90 seconds, stereo 48kHz PCM.
- Real ordered flow passed at 1280x800 and 1024x600; all 35 eligible existing tests passed across full run plus isolated retries, 3 deployment-specific skips. Final MP4 playback/seek passed in Chrome across all 11 scenes. Lint and TypeScript pass.
- Pi inference/camera preview were isolated fixtures and visibly labelled. Physical hardware, OS print dialog/paper output and live cloud sync were not tested. Production application files were not edited by the demo work.
- Reports: tunaeye-product-demo/qa/export-verification.md, playback-verification.json, source-audit.md, existing-suite-verification.md.

## Demo mode override bug (2026-10-10)
- [x] Trace shared demo initialization and verify effective Vite flags.
- [x] Reproduce stale storage / URL overriding disabled demo mode in Playwright.
- [x] Enforce the build flag and clear stale demo activation.
- [x] Verify Pi capture/review/inference path and existing kiosk tests; build standard and Pi outputs.

Scope: shared demoMode initializer, focused regression tests, task notes. Preserve all unrelated changes and grading records.

### Demo mode fix review

- Root cause: saved browser activation and `?demo=1` bypassed `VITE_DEMO_MODE=false`. The shared initializer now treats the build flag as an absolute gate and removes stale activation.
- All three browser regression cases failed before the fix and passed after it, exercising capture, image review and Pi inference request paths with isolated API fixtures.
- Existing suite plus new regressions: 38 eligible tests passed across full run and retry; 3 deployment-specific checks skipped. The sole initial failure was a tablet height measured as 67.999992px against a 68px threshold and passed on retry.
- Pi-mode run: all 4 checks passed, including same-origin API/camera routing. Standard production and Pi builds passed; `dist/` now contains the Pi build.
- Live Pi `/status` timed out from this workstation. Physical camera/inference and deployment were not verified; the running or installed app must load the rebuilt assets to receive the fix.
