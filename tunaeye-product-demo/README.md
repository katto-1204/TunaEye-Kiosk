# TunaEye cinematic kiosk product demo

An isolated Remotion / React / TypeScript film of the **current repository's real kiosk UI**. The application source was preserved. Every workflow screen comes from a Playwright screen recording; the editorial tablet frame, labels and tap rings are animated by Remotion frames.

## Deliverables

| File | Content |
| --- | --- |
| `tunaeye-kiosk-demo.mp4` | 90-second narrated final, 1920×1080 / 60 fps, H.264 + AAC stereo |
| `tunaeye-kiosk-demo-no-narration.mp4` | Same visuals with original music and synchronized effects |
| `tunaeye-kiosk-preview.mp4` | Full 90-second preview, 1280×720 / 30 fps |
| `narration.wav`, `music.wav`, `sfx.wav`, `final_mix.wav` | Full-length 48 kHz stereo PCM stems and mastered mix |
| `storyboard.md` | Timings, actual UI actions and claim boundaries |
| `src/`, `scripts/`, `public/` | Complete editable source, captured footage, assets and generation scripts |
| `qa/` | Browser test logs, rendered checks, source audit and export validation |

The UI depicts Eli grading Sashibo core and Tail cut from the same 36.2 kg fish. The sashibo fixture returns A / 96.3%; tail returns A / 94.1%, then Eli overrides tail to B with a recorded reason. Original predictions remain visible. Both sample records persist locally.

**Demonstration data / simulated inference is labelled in every UI scene.** Camera previews and Pi responses are intercepted only in the isolated recording browser. Upload Image uses `public/DEMO_SAMPLES/SASHIBOCORE_A.png` and `TAILCUT_A.png`. There is no live hardware claim.

The real app already displays peso values and averaged confidence in some screens. These are preserved native UI, without introducing pricing or fused-grade claims. The genuine receipt animation runs and the two browser print calls are counted, but headless `window.print()` is intercepted; physical paper delivery and the OS print dialog are not demonstrated.

## Preview and rebuild

Requires Node.js, npm, FFmpeg / FFprobe on PATH, and installed Google Chrome on Windows. Dependencies are pinned to Remotion 4.0.534. Run from this directory:

```powershell
rtk npm install
rtk proxy npm run dev -- --no-open --port=3020
```

Open `http://localhost:3020/TunaEyeKioskDemo`. All eleven scenes can also be inspected individually under Scenes. The narration-free composition is `TunaEyeNoNarration`.

Capture again only when updating the kiosk footage:

```powershell
rtk proxy npm run capture
rtk proxy npm run prepare
```

Capture imports the parent app's existing Vite dependencies, starts a dedicated server with HMR disabled, blocks external services, and seeds a disposable browser context. It never changes production settings or records. The 1280×800 recording is followed by a complete 1024×600 responsive rehearsal. `prepare` trims the recording's initial overhead and produces ten exact-duration 60 fps clips plus the click timeline.

Generate or rebuild audio, then render and verify:

```powershell
rtk proxy npm run lint
rtk proxy npm run audio:offline
rtk proxy npm run narrate
rtk proxy npm run mix
rtk proxy npm run render
rtk proxy npm run verify
```

Set `REMOTION_BROWSER_EXECUTABLE` when Chrome is installed elsewhere. The render script renders one Remotion visual master, converts its full-range capture encoding to standard BT.709 `yuv420p`, then muxes the mastered audio with FFmpeg. The no-narration version reuses that exact visual stream. `node scripts/render.mjs --mux-only` reuses an already rendered `qa/visual-master.mp4` after audio-only changes. The preview is downsampled from the final master.

Narration uses Microsoft's `en-US-GuyNeural` through `@andresaya/edge-tts`. Generating uncached voice clips requires an online Microsoft speech request; existing clips are reused without network access. `public/audio/narration-manifest.json` contains all eleven lines, timings and minor tempo adjustments. The original music is 124 BPM. Narration keys 6:1 sidechain music ducking with a 25 ms attack and 450 ms release; the final mix is mastered with measured two-pass loudness normalization to approximately -14 LUFS / -1.5 dBTP. The TTS utility has its own GPL-3.0 license; retain dependency license notices if distributing its source.

## Verification and limits

- Complete actual two-sample workflow passed at 1280×800 and 1024×600, including fully visible controls, uploads, reviews, individual results, override, receipt, completion and saved record details. Both runs reported zero console errors/warnings and zero failed HTTP requests.
- The existing kiosk suite verified all 35 eligible tests: 33 passed on the full run and two passed on retry after QA isolation corrections. Three deployment-dependent tests skipped. Logs remain in `qa/existing-tests/`; see `qa/existing-suite-verification.md`.
- Remotion lint and TypeScript checks pass. Rendered result, override, receipt and brand frames were inspected. `qa/export-verification.md` records final duration, decoded frame count, codecs, dimensions, audio format, loudness and clipping checks; its status is authoritative for the delivered exports.
- Final export verification **passed** for every video and stem. The narrated MP4 measures -14.0 LUFS / -1.5 dBTP; narration-free MP4 -13.5 LUFS / -1.1 dBTP. Full versions contain exactly 5,400 decoded frames. Chrome playback and seeking passed at representative points in all eleven scenes, with no console errors; see `qa/playback-verification.json` and `qa/export-contact-sheet.png`.
- The export validator has an assert-based self-check: `node scripts/verify-export.mjs --self-check`. It reports missing files as pending, never as passed.
- Live Raspberry Pi inference/camera, lighting chamber, weighing scale, physical printer, live Supabase sync and Android hardware were not tested.

The local development lint toolchain has a transitive `braces` denial-of-service advisory. The production/render dependency audit reported zero advisories. Audit evidence is in `qa/`; no production application dependencies were changed.

Music and effects are original procedural compositions. The font and logo are copied from the supplied repository. [Remotion rendering documentation](https://www.remotion.dev/docs/cli/render) describes the render CLI; [Remotion's license](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md) applies to the toolkit.
