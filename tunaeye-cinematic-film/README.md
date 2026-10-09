# TunaEye cinematic product launch film

A separate editable Remotion / React / TypeScript project. Eight authored cinematic acts combine authentic sample photography, kinetic typography, perspective framing, temporal motion trails, an explicitly conceptual classifier visualization and freshly recorded real kiosk interactions. Production application source and the existing 90-second demo were preserved.

## Deliverables

| File | Content |
| --- | --- |
| `tunaeye-cinematic-product-film.mp4` | 120-second narrated film; 1920×1080,60fps,H.264 with AAC stereo48kHz |
| `tunaeye-cinematic-product-film-no-narration.mp4` | Identical visuals with original music and synchronized effects |
| `tunaeye-preview.mp4` | Full120-second lightweight preview,1280×720 at30fps |
| `narration.wav`, `music.wav`, `sfx.wav`, `final_mix.wav` | Full-length48kHz stereo24-bit PCM stems/master |
| `src/`, `scripts/`, `public/` | Editable scenes, generation/capture/render tools, all fonts/photos/voice clips/UI media |
| `storyboard.md` | Timing, narration and claim boundaries |
| `qa/` | Browser workflow evidence, numerical audio checks, source audit, sampled visual review and export validation |

The final delivery status is recorded in `qa/export-verification.md` and `qa/playback-verification.json`. Those reports must pass before the outputs are treated as verified. Each act also has its own composition in the Studio sidebar.

## Preview and render

Requires Node.js, FFmpeg/FFprobe on PATH and Chrome on Windows. The render dependencies are pinned to Remotion4.0.534. All assets needed for rendering are local.

From this directory:

```powershell
rtk npm ci
rtk proxy npm run dev -- --no-open --port=3021
```

Open `http://localhost:3021/TunaEyeCinematic` for the narrated film or `/TunaEyeNoNarration` for the instrumental version. `/TunaEyeVisual` is the visual master. All eight acts are independently editable under Acts.

```powershell
rtk npm run lint
rtk proxy npm run render
rtk proxy npm run verify
rtk proxy node scripts/playback-check.mjs
```

Set `REMOTION_BROWSER_EXECUTABLE` if Chrome is installed elsewhere. Rendering produces one full7200-frame visual master, converts it to standard BT.709 limited-range yuv420p, and muxes both versions from the same stream. The preview comes from the final narrated master. `node scripts/render.mjs --mux-only` reuses an existing master after audio-only edits.

The [Remotion rendering documentation](https://www.remotion.dev/docs/cli/render), [spring documentation](https://www.remotion.dev/docs/spring) and [temporal trail documentation](https://www.remotion.dev/docs/motion-blur/trail) describe the APIs used. Remotion's own license applies.

## Rebuild audio

```powershell
rtk proxy npm run narrate
rtk proxy npm run audio:offline
rtk proxy npm run mix
rtk proxy node scripts/verify-audio.mjs
```

Narration contains eight actual spoken clips from Microsoft's `en-US-GuyNeural`. Existing clips are cached; regenerating absent clips requires an online neural TTS request. The full narration manifest retains the text, pronunciation adaptations, onset and duration. None of the eight acts needed speech acceleration.

Music and effects are original deterministic synthesis:128BPM, D-minor harmonic development and a D-major brand resolution, detuned layered pads, melodic mallets, syncopated arpeggios, bass, percussion, stereo sweeps, impacts, shutter and paper textures. No stock soundtrack or fabricated field recording is used. Sound events are rounded to exact60fps frames and include real montage interaction timings. `public/audio/sound-events.json` is the cue sheet.

The score automatically ducks under narration through a5:1 sidechain compressor with18ms attack and450ms release. Two-pass loudness mastering targets approximately−14LUFS with a−1.5dBTP ceiling. Numerical tests verify speech in all acts, audible cues, ducking, stem duration and unclipped samples. These checks do not substitute for subjective listening on the intended playback system.

The TTS utility dependency carries GPL-3.0 terms; retain the appropriate dependency notices when distributing its source. The fonts and branding come from the supplied repository.

## Capture again

The current film includes all recorded media. Recapturing requires the parent TunaEye app and its existing Vite/Playwright dependencies:

```powershell
rtk proxy npm run capture
rtk proxy npm run prepare
```

The harness runs an isolated server on3016, disables cloud/demo configuration, seeds a disposable browser context and intercepts external camera/inference endpoints. It follows the actual Camera Capture→snapshot→review→Use Image path. Both1280×800 and1024×600 workflows passed, with24screenshots each, zero console errors and zero failed requests. The original app and stored user data are not edited.

The existing suite was run from the parent repository using:

```powershell
rtk proxy node node_modules/@playwright/test/cli.js test --config=tunaeye-cinematic-film/playwright.config.ts --workers=1
```

Result:39passed,4environment-gated skips,0failures and0flaky tests. `qa/playwright-report.json` retains the evidence. The isolated test server ignores video/output directories to prevent evidence writes from triggering HMR navigation.

## Product boundaries

The camera sample images and Pi grading responses are isolated demonstration fixtures, visibly labeled during classification and functional UI footage. They prove the frontend workflow, not live model accuracy. Sashibo returns A/96.3%; tail returns A/94.1% and is then overridden to B by Eli. Original predictions and individual records are preserved. A/B/C/Invalid typography illustrates the supported categories rather than pretending four real inference runs occurred.

The native UI retains its configured peso estimates and same-fish averaged confidence. The commercial does not claim automatic market pricing, automatic weighing, measured freshness or fused grades. MobileNetV3 is supplied architecture, not independently verified by an included model artifact. The network is expressly conceptual.

The genuine receipt animation ran and two browser print calls were intercepted. Physical paper output, OS print dialog, live Raspberry Pi/model/camera, lighting chamber, scale, Bluetooth printer, Android hardware and live Supabase sync were not tested. Records stay local/pending in the recording.

Verification covers sampled visual frames and decoded metadata/audio/browser playback; it does not imply manual inspection of every frame. Full-resolution sample source files are limited to the imagery supplied in this checkout.
