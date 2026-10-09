# Cinematic film visual review

Status: **Passed for sampled final-export review and browser playback**. All three completed MP4s passed actual browser playback. Numerical export verification also passed; see `export-verification.json` for exact media and audio measurements.

## Source and workflow evidence

- Separate editable Remotion project; eight acts in the requested order; 7200 frames, 1920 by 1080, 60 fps for the principal composition.
- Authentic repository sample images, logo, Open Runde fonts and actual kiosk screenshots/recordings are used. The 23-second hero montage is a paced recording of real controls, not an invented interface.
- `public/captures/workflow-clips.json` follows Welcome, Expert Grader, name, samples, association, tutorial, manual weight, camera, review and analysis. Tap positions derive from recorded browser coordinates.
- Classification shows separate Sashibo core and Tail cut results, then actual expert override, sample overview, browser receipt animation and local records. Demo inference remains labeled; the conceptual network is labeled as a visualization, not measured feature maps.
- The existing kiosk displays configured price estimates. Commercial text does not claim automatic market pricing, automatic weighing, measured freshness, grade fusion, direct ESC/POS printing or live cloud synchronization.
- MobileNetV3 is the user-supplied architecture. This frontend repository does not independently prove that model or its accuracy. Capture and inference use isolated fixtures; real hardware is not represented as tested.

## Final exported frames and playback

`scripts/playback-check.mjs` played and sought all three real MP4s through an isolated localhost byte-range server in Chrome. Each file passed 20 representative seeks, including the corrected Grade A/B/C/Invalid sequence at 95.55, 96.2, 96.8 and 98.7 seconds. Every seek decoded video, progressed through playback and decoded audio. All three files had zero console errors, console warnings, page errors, HTTP errors or unexpected failed network requests. Chrome aborted some superseded range requests during seeking; those intentional seek aborts are listed separately in the JSON report.

The browser verified 120-second duration and 1920 by 1080 dimensions for both full exports, and 1280 by 720 for the preview. The independent ffprobe/ffmpeg report passed codec, exact frame count, frame rate, 48 kHz stereo audio, loudness and non-clipping requirements.

Manually inspected the final 21-image contact sheet (`final-contact-sheet.jpg`), which combines the 20 actual browser-decoded screenshots and a directly decoded frame at 36 seconds for the question act. Inspected full-size final screenshots at 8, 96.2, 111 and 119.5 seconds. The opening photo is visible without the former compositing seam. Principal typography is readable; the Grade B card is present at its corrected reveal time; sample overview preserves independent grades; demonstration labels fit inside the frame; the final logo and tagline are clear. No destructive text overlap or unintended cropping was observed in those samples. Early grade subtitles are intentionally in their blur-to-clear entrance at the sampled reveal moments.

## Development review history

Inspected the initial 27-frame contact sheet across all eight acts and corrected full-resolution frames 480, 2940, 3150 and 4200, plus expert-control, overview and final-brand frames 6510, 6660 and 7199. Typography, photo panels, result cards and tablet screens show distinct scene layouts and clear principal subjects. The final brand frame is readable and has ample margins.

The initial contact sheet is a development artifact and includes superseded opening/reveal states. Root corrected a 3D compositing seam in the opening photo. A fresh frame 6660 and its pixel-exact badge crop (`qa/recheck/badge-detail.png`) confirmed that the complete demonstration label fits with its intended right margin; an initially suspected clipping issue was display-scale interpretation. The final MP4 checks above supersede that initial development evidence.

## Completed final checks

- Decoded all three completed MP4s; durations/codecs/audio and exact frame counts passed `scripts/verify-export.mjs`.
- Played and sought actual MP4s in isolated Chrome using `scripts/playback-check.mjs`; media errors, console, network and decoded-audio counters passed.
- Reviewed screenshots from the final narrated MP4 and regenerated a contact sheet from the final file.
- Reviewed opening composition, badge placement, computer-vision labels, actual workflow screens, separate results, receipts and final logo.

This is a sampled visual review, not a manual inspection of every one of the 7200 frames. Physical Pi inference, camera, lighting chamber, scale and printer tests remain outside these media checks.
