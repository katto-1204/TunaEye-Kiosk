# TunaEye combined cinematic product demo

One 120-second marketing edit combines the accepted cinematic film's brand/sample imagery with authentic feature footage from both accepted recordings. The earlier exports remain available. Main features occupy 82 seconds; the brand story and computer vision introduction occupy 38 seconds. Speech uses the revised +8% neural voice rate; the original 136 BPM score supplies a stronger pulse and bright final resolution.

| Time | Picture and feature | Narration intent |
| --- | --- | --- |
| 0-8 | Cinematic sample macro, moving light, quality/freshness/value typography | Every tuna tells a story; see beyond the cut |
| 8-16 | Real sashibo and tail-cut sample imagery, expert-centered framing | Human judgment stays central |
| 16-23 | Cobalt brand reveal and real kiosk welcome | Meet TunaEye and the guided workflow |
| 23-32 | Conceptual classifier, authentic samples, spoken category highlights | Visual color/clarity; A, B, C, Invalid |
| 32-42 | Welcome, role, grader identity, selected samples and same-fish association | Samples and their fish stay connected |
| 42-52 | Placement guide, manual weight, actual capture | Guided preparation and review |
| 52-62 | Core image review/analysis, tail capture and review | Move smoothly through both samples |
| 62-73 | Actual individual core A/96.3% and tail A/94.1% results | Separate grades and confidence for interpretation |
| 73-85 | Protected override, Grade B selection, reason, preserved original A, overview | Expert control and documented decisions |
| 85-93 | Actual individual receipt and printing animation | Each sample's result documented separately |
| 93-100 | Eli's locally saved records and image/review detail | Local records and evidence |
| 100-114 | Actual Admin login/overview/records, offline waiting, recovery, explicit Sync now, verified sync and local image state | Manual offline-first sync when ready |
| 114-120 | Brand and expert-eye tagline | Guided grading, expert control, connected records |

Each feature is its own authored Sequence in `src/Combined.tsx`; source media cuts and click timings are retained in `public/combined/feature-clips.json` and `admin-clips.json`. `CombinedFeatures` in Studio exposes individual editable feature compositions. Kiosk footage is muted; frame-timed tap/shutter/paper/sync effects are mixed with the score and speech.

Camera/inference are isolated fixtures and are labeled **DEMO DATA · SIMULATED INFERENCE**. Cloud/auth/DNS responses are intercepted fixtures and Admin footage is labeled **DEMO CLOUD · SIMULATED SYNC**. Records are only marked synced after actual frontend verification of the intercepted cloud row and image bytes. No live cloud upload, physical printer, Pi camera/model or hardware test is represented.

The neural narration script, word metadata and audio mix scripts are separate from the accepted film's audio, so a regeneration does not replace its stems. Final verification reports and any existing app limitations are documented in `combined-README.md` and `qa/combined-*`.
