# TunaEye kiosk demo storyboard

The final film lasts 90 seconds. The first 85 seconds use recorded interactions with the current repository kiosk UI; the final five seconds are a brand card. Production app code is unchanged. The recording was captured at 1280×800 and verified at both 1280×800 and 1024×600. Inference and camera preview are deterministic Playwright fixtures and are labeled as demonstration data / simulated inference in every UI scene.

| Time | Scene | Actual UI action / content | Editorial treatment |
| --- | --- | --- | --- |
| 00:00–00:06 | Welcome | Installed kiosk welcome; Get started leads to roles. | Blue opening, tablet reveal, TunaEye identity and tagline. |
| 00:06–00:12 | Expert grader | Select Expert Grader; enter Eli; Start grading. | Introduce the human operator before model results. |
| 00:12–00:20 | Samples and fish | Sashibo core and Tail cut selected; Yes, same fish associates both with Fish 1. | Show two samples belonging to one fish, without combining their grades. |
| 00:20–00:27 | Placement and weight | Real three-step tray guide, then touch keypad enters 36.2 kg; Start capture. | Preserve the application's actual order: **weight before camera**. This is manual entry, not a connected scale. |
| 00:27–00:38 | Sashibo image and review | Existing Upload image workflow imports the repository sashibo sample; saved-image review offers Retake / Use Image. | Show source specimen, image framing and deliberate confirmation; do not imply a live chamber capture. |
| 00:38–00:46 | Sashibo analysis and result | Use Image runs current analysis UI; fixture returns Grade A / 96.3% confidence. | Dark processing scene, then native individual result; confidence is a demonstration response, not accuracy. |
| 00:46–00:57 | Tail image and result | Next sample → upload tail image → Use Image → separate analysis and Grade A result. | Keep the tail result separate from the core result. |
| 00:57–01:07 | Expert override and overview | Open Manual override; protected station PIN; choose Grade B; save reason; overview shows both sample records. | Tail A → expert B. Original recommendation / confidence remain in the record. |
| 01:07–01:17 | Receipt and completion | Print separate copies; actual native receipt animation; invoke both print actions; completion. | Describe a printable grading summary and browser print action. Headless `window.print` was intercepted; no paper delivery is claimed. |
| 01:17–01:25 | Local records | Dashboard shows one session and two sample records; open tail record to inspect original grade and override reason. | Establish local traceability and the expert decision. This does not demonstrate successful cloud sync. |
| 01:25–01:30 | TunaEye finale | Repository logo; TunaEye; SEA BEYOND THE CUT.; AI-assisted grading. Expert-led decisions. | Clear closing identity, music resolve and clean fade. |

The touch pulses follow the recorded event timestamps in `src/capture-timeline.json`, which matches `public/captures/edit-timeline.json`. Video clips are retimed to the table's scene durations; UI controls, captions and record content remain native.

## Source and claim boundaries

- The production UI already includes Philippine peso price values on results, overview, records and receipts. They remain native captured content. The film does not introduce a new pricing feature or promise automated selling transactions.
- The native same-fish overview averages confidence; that is not grade fusion or a validated combined accuracy measure. Both sample grades remain individually visible.
- Existing receipt UI and print animation are genuine application behavior. A physical POS-58 printer, Bluetooth connection, ESC/POS delivery and OS print dialog were not verified.
- This recording follows the Upload image path with supplied repository samples and simulated inference. It does not claim live Raspberry Pi processing, a working physical camera/chamber, a connected weighing scale, calibration, or live Supabase synchronization.
- Native default station PIN is visible in the current app. Its use in the demo shows an existing gate, not a security assessment or a production credential recommendation.
- Browser verification found zero console errors and zero failed requests in both captured viewport runs; deployment/hardware checks remain separate.

## Export targets

- Narrated final: `tunaeye-kiosk-demo.mp4`, 90 seconds, 1920×1080, 60 fps, H.264, AAC stereo at 48 kHz.
- No-narration final: `tunaeye-kiosk-demo-no-narration.mp4`, identical visual duration/settings with the music/SFX-only mix.
- Preview: `tunaeye-kiosk-preview.mp4`, 90 seconds, 1280×720, 30 fps, H.264, AAC stereo at 48 kHz.
- Full-length stereo 48 kHz WAV stems: narration, music, SFX and final mix. Mixed audio targets approximately -14 LUFS with no clipping.

Run `rtk proxy node scripts/verify-export.mjs` after all exports exist. The script writes machine-readable and readable reports in `qa/` and returns a pending status when a required export is missing.
