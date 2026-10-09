# Combined cinematic product demo

A new 120-second marketing cut combines the strongest material from the previous 90-second product demo and the accepted cinematic launch film. It keeps the cinematic brand/sample scenes, expands the actual feature demonstration, adds Admin-controlled sync, and uses a livelier 136 BPM original soundtrack. The earlier videos and their audio are preserved.

## Delivery status

Visual edit, source footage, Admin capture, music and effects are prepared. New neural narration and the narrated export await explicit permission to send the revised narration script to Microsoft's neural voice service. Automatic approval review rejected that external disclosure; it has not been retried. Final media should only be treated as verified when the matching `qa/combined-*` export/playback reports pass.

| Planned output | Content |
| --- | --- |
| `tunaeye-combined-product-demo.mp4` | Narrated 120 seconds, 1920x1080, 60fps, H.264/AAC stereo 48kHz |
| `tunaeye-combined-product-demo-no-narration.mp4` | Identical visuals, original music and effects |
| `tunaeye-combined-preview.mp4` | Full-length lightweight narrated 1280x720/30fps preview |
| `tunaeye-combined-preview-instrumental.mp4` | Full-length music/effects preview while narration approval is pending |
| `combined-narration.wav`, `combined-music.wav`, `combined-sfx.wav`, `combined-final_mix.wav` | Full-length stereo 48kHz audio stems/master |
| `combined-storyboard.md` | Eleven scenes, feature timing and claim boundaries |
| `src/Combined*.tsx`, `scripts/combined-*.mjs`, `public/combined/` | Editable source and separate new audio/media assets |

## What the edit shows

Sample selection and same-fish association; guided placement; manual weight; actual Capture and image review; individual sashibo/tail results and confidence; PIN-protected expert override with original prediction preserved; individual receipt animation; local records and image evidence; Admin login/overview/records; offline waiting; confirmed internet recovery; explicit manual sync; verified record/image state.

The feature edit mixes authentic recordings from both accepted projects with short, authentic Welcome/role/placement-guide screenshot holds. Calibrated source video offsets (0.52s cinematic capture, 0.51s earlier demo capture) align visible actions with recorded tap coordinates. Source durations, offsets and tap timings are retained in `public/combined/feature-clips.json`. The 14-second Admin segment is newly recorded actual UI; its seven clips and actions are in `admin-clips.json`.

## Preview and regenerate

From this project directory, using the existing pinned dependencies:

```powershell
rtk proxy npm run dev -- --port=3021
rtk npm run lint
rtk proxy node scripts/combined-clips.mjs
rtk proxy node scripts/capture-admin.mjs
rtk proxy node scripts/combined-narration.mjs
rtk proxy node scripts/combined-soundtrack.mjs
rtk proxy node scripts/combined-mix-audio.mjs
rtk proxy node scripts/combined-verify-audio.mjs
rtk proxy node scripts/combined-render.mjs
rtk proxy node scripts/combined-verify-export.mjs
rtk proxy node scripts/combined-playback-check.mjs
```

Open `http://localhost:3021/TunaEyeCombinedVisual` to review visuals, or `/TunaEyeCombined` for the narrated composition after audio is generated. Individual functional scenes appear under `CombinedFeatures`. `combined-render.mjs --visual-only` renders independently of narration; `--mux-only` reuses the current visual master for audio-only changes. Regenerating uncached speech sends the script to Microsoft's online TTS service and requires the pending external disclosure approval in this session.

New narration also updates the A/B/C/Invalid visual cue timestamps. After approving and generating that speech, rerender the visuals before muxing; the current instrumental master uses provisional category timings that match its own effects.

The revised voice plan uses `en-US-GuyNeural` at +8% rate and neutral pitch. Music is original deterministic synthesis with a stronger pulse, compressed introduction and bright major finale. Real montage interactions drive the sound effects. Voice-keyed ducking and two-pass loudness mastering target approximately -14 LUFS and an unclipped output.

The completed instrumental mix passed at -13.93 LUFS / -1.30 dBTP: exactly 120 seconds, stereo 48kHz, 24-bit PCM, no clipping and 88 audible synchronized effects. Its audio report explicitly marks narration unverified. To regenerate independent music/effects exports while narration is pending, run the mix, audio verifier, render, export verifier and playback checker with `--instrumental-only`.

## Verification and boundaries

Admin flow passed at 1280x800 and 1024x600: nine screenshots per size, no unexpected console/network errors, no automatic write at startup/offline/recovery, one image upload, one stable-ID upsert, two row readbacks and byte-identical image readback. See `qa/combined-admin-report.md` and the full `public/combined/admin-manifest.json`.

Camera/inference fixtures remain labeled **DEMO DATA · SIMULATED INFERENCE**. Intercepted cloud/auth/DNS fixtures remain labeled **DEMO CLOUD · SIMULATED SYNC**. The classifier illustration is conceptual. Physical hardware, live Supabase writes and physical paper output are not tested or represented as verified.

The current Admin cloud detail has an existing captured-image mapping limitation. Directly syncing while its record thumbnails are mounted can also leave a revoked image URL. The film's actual capture uses the Audit logs section for Sync now, then shows the verified image in the real local Grader record. It does not claim the Admin cloud detail displays that image. Production code is preserved; the limitation and reproduction are documented in `qa/combined-admin-image-limit.md`.

The existing browser suite had 38 passes, four environment skips and one fractional-pixel layout assertion failure; the exact affected test passed on isolated retry. `qa/combined-suite-review.md` retains both runs. Source lint/typecheck passes. Final sampled visuals and media checks do not imply manual inspection of all 7200 frames or subjective listening on the intended playback system.
