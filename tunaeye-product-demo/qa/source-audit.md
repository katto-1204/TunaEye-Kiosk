# TunaEye current application source audit

Audit date: 2026-10-10 (Asia/Singapore). Production application source was read only.

## Actual screen sequence

`src/App.tsx:1397–1412` renders the current kiosk flow: Welcome → role selection → Expert Grader identity → sample selection → association when two samples are selected → three tutorial steps → fish weight → camera → image review → analysis → individual result → next selected sample → overview → separate receipt copies → completion.

| Screen | Existing source | Observable behavior and demo implication |
| --- | --- | --- |
| Welcome / roles | `WelcomeScreen`, `SelectRoleScreen` | Installed kiosk starts with Get started and offers Admin / Expert Grader. Public landing is a separate surface. |
| Identity | `GraderEntryScreen` (`src/App.tsx:739`) | Your name field and Start grading action; empty name disables continuation. |
| Sample selection | `SampleScreen` (`src/App.tsx:778`) | Sashibo core and Tail cut can both be selected; neither selected disables continuation. |
| Fish association | `AssociationScreen` (`src/App.tsx:779`) | Same fish associates both samples with Fish 1; different fish keeps Fish 1 / Fish 2 independent. One sample skips association in the normal flow. |
| Tutorial | `TutorialScreen` (`src/App.tsx:780`) | Pull out tray → place sample flat → push in and capture. Final action is Enter weight. Tutorial can be skipped after two recent sessions. |
| Weight | `WeightScreen` (`src/App.tsx:781`) | Manual touch keypad; 15–200 kg inclusive. Start capture stays disabled outside this range. **Weight precedes camera**, even if storyboard prose suggests otherwise. |
| Camera / review | `CameraScreen`, `ReviewScreen` (`src/App.tsx:874,914`) | Capture image → review saved image → Retake or Use Image. Camera integration uses Raspberry Pi HTTP snapshot rather than browser `getUserMedia`. |
| Processing | `AnalysisScreen` (`src/App.tsx:915`) | Existing staged visual processing; `gradePiImage` supplies the result. |
| Individual result | `IndividualResultScreen` (`src/App.tsx:936`) | Grade, original confidence, sample, fish, weight, price/kg, fish value; Manual override; Next sample or View results overview. |
| Overview | `OverviewScreen` (`src/App.tsx:937`) | Both selected samples appear separately. Same-fish summary averages confidence; different fish remain independent. |
| Receipt | `PrintScreen` (`src/App.tsx:1056`) | Each sample has a separate queue item and 58mm POS-58 preview. Native receipt includes weight, confidence, price/kg, fish value, final grade, inspector and date/time. |
| Completion / records | `CompleteScreen`, `GraderDashboard`, `AdminRecords` | Grade another / Dashboard / Logout; saved records support evidence review, original prediction, override reason and sync state. |

## Results, override and saved evidence

- `src/kioskState.ts:153–181`: `finishAnalysis` stores results by sample type, including fish association, weight, original grade/confidence and inference metadata. `nextSample` advances to the second camera screen. Both results remain available in the session.
- `src/App.tsx:938–1054`: `OverrideModal` requests a four-digit station PIN before enabling grade selection. Current default is `1234` (`src/App.tsx:14`). A reason is optional in the existing app. Do not expose the PIN as an editorial security guarantee.
- `src/kioskState.ts:188–192`: `setOverride` retains original model values and records the override grade, reason, actor and timestamp. The App result persistence effect (`src/App.tsx:1327–1339`) saves both originals and overrides.
- `src/gradingRecords.ts`: grading metadata is stored under `tunaeye-records` in localStorage. `src/evidenceStorage.ts` stores image blobs in IndexedDB `tunaeye-offline`. This browser demo does not prove SQLite or any external hardware database.
- `src/pricing.ts`: existing default PHP rates are A=420/kg, B=350/kg, C=280/kg. `priceSnapshot` multiplies the applicable grade rate by kilograms and rounds to two decimals. Prices are already present in the production UI and should remain visible in genuine screenshots.
- Individual results, overview, record review, and receipt already display money values. No additional selling-price feature was introduced for the film. Avoid adding valuation claims outside those native screenshots.

## Honest integration boundary

- `src/demoMode.ts` is an existing explicit demo path. Sample index 0 produces A / 96.3% and index 1 produces B / 91.2%; `gradeDemoImage` sets `modelSource: 'demo'`. These are deterministic demo outcomes, not measured model accuracy or live Pi inference.
- `src/piClient.ts` uses `/snapshot`, `/status` and `/grade`, with validation, timeout and retries. Existing Playwright integration tests intercept Pi HTTP endpoints; passing them proves browser handling, not a connected Raspberry Pi or camera.
- Browser online/offline state is not proof of cloud sync. The Supabase test uses intercepted mock endpoints and explicitly skips unless a mock Vite Supabase environment is provided.
- `src/App.tsx:1344` begins the existing print path. It eventually calls `window.print()`. Preview animation, a browser print event, or a completion screen cannot prove paper delivery, Bluetooth connectivity or an ESC/POS device response.
- The completion heading says “Results printed.” even after Skip printing. Any filmed skip path must be labeled as a saved local record / receipt preview, not physical printing.
- Camera, weighing scale, lighting chamber, physical image quality, printer delivery, live Supabase and deployed Android kiosk behavior require separate hardware/integration checks.

## Verification isolation

The existing Playwright configuration is imported by `qa/existing-suite.config.ts`. Original `tests/`, production files and original configuration are unchanged. The runner uses port 4178 and runs with current working directory `qa/existing-tests`, so the suite's hardcoded `test-results/*.png` writes stay within this deliverable. Reporter logs are retained there; configured failure traces also write there, and Playwright clears its artifact output between runs.

Suite outcome is recorded in `qa/existing-tests/reporter.log` and the accompanying verification report. An initial sandbox denial starting Vite was retried with approved escalation; this was environment setup, not an application test failure.
