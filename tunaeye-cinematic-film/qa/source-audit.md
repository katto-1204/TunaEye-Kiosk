# Source audit and authenticity boundary

The film captures the repository's current kiosk UI without changes to production source or the prior `tunaeye-product-demo`. The new capture harness runs a separate Vite server on port 3016 with cloud configuration empty and built-in demo mode disabled. Playwright isolates all external endpoints.

## Verified browser behavior

- 1280x800 and 1024x600: actual Welcome -> Expert Grader -> Eli identity -> both sample types -> Same fish -> three placement tutorial pages -> 36.2 kg keypad -> Capture -> review -> Use Image -> independent inference/results -> PIN override -> overview -> two receipt animations -> completion -> local dashboard -> record detail.
- Real `Capture` invokes `capturePiImage` (`src/App.tsx:950`), whose implementation fetches **GET /snapshot**, not `/capture` (`src/piClient.ts:108`). Both captured PNG fixtures are persisted through the real IndexedDB evidence path.
- Real `Use Image` invokes multipart **POST /grade** with separate `sashibocore` and `tailcut` inputs (`src/piClient.ts:116`). The response must retain inference ID, capture ID, matching image type, four class scores and valid confidence.
- Demonstration responses: Sashibo core Grade A / 96.3%, Tail cut Grade A / 94.1%. Expert Eli then overrides Tail cut to Grade B with reason `Texture reviewed by Eli.` while preserving the original Grade A result and confidence.
- Two records remain associated with Fish 1, 36.2 kg, Eli and `pending` sync; two actual receipt animations invoke intercepted `window.print` exactly twice.
- Each viewport produced 24 fresh screenshots. Every tapped control was fully inside the viewport; captured screens had no horizontal overflow or broken images; no console errors, failed network requests or unexpected external requests occurred.
- Fresh paced raw browser video, 11 actual moving UI clips, and a 23-second workflow montage are available. `public/captures/workflow-clips.json` maps montage times and tap positions for cinematic overlays.

## Marketing claim limits

- Repository search found no MobileNetV3 implementation or model artifact (`.tflite`, `.onnx`, `.pt`, `.pth`, `.h5`) outside excluded dependencies/video outputs. `src/App.tsx:23` defaults a configurable display identifier to `TFLite edge model`. MobileNetV3 is user-supplied architecture, not independently proven by this frontend audit or simulated inference. Neural-network diagrams must be identified as architecture visualization.
- `src/App.tsx:1000` displays arithmetic average confidence for the same fish. It retains separate sample grades and predictions; that display does not prove grade fusion. Film copy should describe independent specimen results.
- `src/pricing.ts` calculates monetary values from a configurable grade schedule and entered weight. Actual UI contains those values; the film must not promise automatic market pricing or transaction settlement.
- `src/cloudSync.ts` implements manual, verified upload/upsert/readback. This recording intentionally leaves data local and pending. No live cloud upload is represented.
- No physical Raspberry Pi, model quality/accuracy, camera/lighting chamber, scale, Bluetooth printer or hosted/cloud service was tested. Camera PNGs and model responses are isolated deterministic fixtures. Receipt footage shows the authentic browser animation, not a physical printed receipt.

## Test isolation

The first default-suite attempt was interrupted after evidence written under the watched repository triggered HMR navigation loops. The final suite uses `tunaeye-cinematic-film/playwright.config.ts`, preserving all existing tests while ignoring both video projects and test output in the independent test server. No production test or application files were changed.
