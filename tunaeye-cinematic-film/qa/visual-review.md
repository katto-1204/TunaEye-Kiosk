# Cinematic film visual review

Status: **Final-export review pending**. The final MP4s must be decoded and reviewed before this becomes complete.

## Source and workflow evidence

- Separate editable Remotion project; eight acts in the requested order; 7200 frames, 1920 by 1080, 60 fps for the principal composition.
- Authentic repository sample images, logo, Open Runde fonts and actual kiosk screenshots/recordings are used. The 23-second hero montage is a paced recording of real controls, not an invented interface.
- `public/captures/workflow-clips.json` follows Welcome, Expert Grader, name, samples, association, tutorial, manual weight, camera, review and analysis. Tap positions derive from recorded browser coordinates.
- Classification shows separate Sashibo core and Tail cut results, then actual expert override, sample overview, browser receipt animation and local records. Demo inference remains labeled; the conceptual network is labeled as a visualization, not measured feature maps.
- The existing kiosk displays configured price estimates. Commercial text does not claim automatic market pricing, automatic weighing, measured freshness, grade fusion, direct ESC/POS printing or live cloud synchronization.
- MobileNetV3 is the user-supplied architecture. This frontend repository does not independently prove that model or its accuracy. Capture and inference use isolated fixtures; real hardware is not represented as tested.

## Still-frame review

Inspected the initial 27-frame contact sheet across all eight acts and corrected full-resolution frames 480, 2940, 3150 and 4200, plus expert-control, overview and final-brand frames 6510, 6660 and 7199. Typography, photo panels, result cards and tablet screens show distinct scene layouts and clear principal subjects. The final brand frame is readable and has ample margins.

The initial contact sheet is a development artifact and includes superseded opening/reveal states. Root is correcting a 3D compositing seam in the opening photo. A fresh frame 6660 and its pixel-exact badge crop (`qa/recheck/badge-detail.png`) confirm that the complete demonstration label fits with its intended right margin; an initially suspected clipping issue was display-scale interpretation. The updated opening and final media remain pending until the exported files are checked.

## Required final checks

- Decode all three completed MP4s, confirm durations/codecs/audio and exact frame counts with `scripts/verify-export.mjs`.
- Play and seek actual MP4s in isolated Chrome using `scripts/playback-check.mjs`; inspect media errors, console, network and decoded-audio counters.
- Review screenshots from the final narrated MP4 and regenerate a contact sheet from the final file.
- Review opening composition, badge placement, computer-vision labels, actual workflow screens, separate results, receipts and final logo.

This is a sampled visual review, not a manual inspection of every one of the 7200 frames. Physical Pi inference, camera, lighting chamber, scale and printer tests remain outside these media checks.
