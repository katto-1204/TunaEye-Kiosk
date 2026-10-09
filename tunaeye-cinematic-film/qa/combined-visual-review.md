# Combined 120-second film review

Status: **Final instrumental render pending; revised narration awaits user approval**. Instrumental export properties and browser playback must pass before those files are delivered. Full narrated deliverables remain separately pending.

## Authentic source and continuity

The new feature manifest uses actual kiosk recordings from both the previous 90-second product demo and the accepted cinematic film. Both source capture scripts retain Eli, Fish 1, 36.2 kg, separate Sashibo core and Tail cut Grade A predictions at 96.3% and 94.1%, and the subsequent Tail cut Grade B expert override. Workflow clips total 30 seconds; result clips total 11 seconds. No production application code was changed for film capture.

The current Admin manifest passes two viewport runs with nine screenshots each, verified offline-to-recovery-to-explicit-sync behavior, no writes on recovery, and validated image/record readback before Synced labels. These are explicitly simulated cloud fixtures, not live synchronization.

## Source review findings sent for correction

Independently extracted 20 representative frames from the new workflow, result, override, receipt and record MP4 source groups; see `combined-source-contact-sheet.jpg` and `combined-source-frames/`.

- Initial workflow Welcome center was blank. Role center had already transitioned into name entry. Meaningful Welcome and role states need visible holds.
- Initial guide center displayed weight-entry validation, contradicting the GUIDED PLACEMENT caption. The manifest itself included weight key presses in the tutorial segment. Root is correcting clip limits/timing.
- Initial tail-capture and tail-review centers had progressed to review fade and analysis respectively. Root is checking source clock alignment and clip limits.
- Initial second-receipt sample showed the completion screen. Root is revising receipt segmentation to retain both printed sample sequences.
- Core and Tail result centers correctly displayed their independent Grade A predictions. PIN, reason entry, Grade B override and subsequent overview were present in the override sequence. Local record detail preserved saved imagery and the expert Grade B result.

These are development findings, not accepted final defects. They must be resolved or rechecked against corrected source and the completed MP4.

## Corrected source recheck

Measured first visible Get started button changes in decoded raw video at 6.600 seconds for the accepted film versus its 7.122-second manifest event, and 6.400 seconds for the previous demo versus its 6.908-second event. Root applied approximately 0.52/0.51-second source clock corrections. This measures visible transition onset with source-frame/dispatch uncertainty; it does not establish the exact click dispatch timestamp. Evidence is in `combined-clock-offset/`.

The corrected source montage now shows an authentic Welcome hold, role cards, Eli entry, actual placement tutorial, manual weight typing, core camera capture, image review, analysis, second camera and correct Tail cut review. The guide/weight-caption mismatch and premature tail analysis were resolved in the rechecked samples (`combined-source-recheck.jpg`). Setup frames combine authentic stills with actual footage; this is not represented as entirely continuous moving footage.

The second camera initially inherited a long sashibo live-preview fixture while its selected specimen label said Tail cut. Root replaced that source with a fresh isolated actual camera capture. The locked source at 26.75 seconds (`combined-source-frames/final-tail-camera.png`) now shows the correct Tail cut photograph, Capture 2 of 2, and real Saving image/Capturing state. Tail review, result and saved evidence use the corresponding tail photograph. This issue is resolved in source and will also be checked in final media.

Reviewed 21 full-resolution Remotion samples in `combined-review-frames/`, assembled into `combined-review-contact-sheet.jpg`. Principal headings, demo badges, sample results, PIN dialog, second receipt, local records and Admin evidence are readable without destructive text overlap. The earlier guide sample at frame 2640 precedes the final source clock correction and is superseded by the corrected source check above.

## Final verification prepared

`combined-verify-export.mjs` requires all three final MP4s, four combined root stems and five composition source WAVs. Full exports must be exactly 120 seconds, 1920 by 1080, 60 fps and 7200 frames; preview is 1280 by 720, 30 fps and 3600 frames. H.264, stereo AAC at 48 kHz, approximately -14 LUFS for mixed audio, and no sample/true-peak clipping are required. Missing source WAVs cannot be silently omitted.

`combined-playback-check.mjs` verifies actual final MP4 decoding and 29 representative seeks per export, covering every source workflow segment, both sample results, override, receipts, records and six Admin points. It records console warnings/errors, page errors, network failures, HTTP errors and audio/video decode counters. Both verifier self-checks passed; no final media success is claimed yet.

Both scripts also provide `--instrumental-only`, requiring the actual no-narration full export and `tunaeye-combined-preview-instrumental.mp4` plus music/SFX/no-narration root and source stems. This mode writes separate `combined-instrumental-*` reports and explicitly records that revised narration awaits user approval. Full and instrumental self-checks all passed; instrumental checks cannot falsely mark the narrated scope complete.

Review is sampled rather than a manual inspection of all 7200 frames. Browser audio decoding does not prove subjective narration intelligibility or physical hardware operation.
