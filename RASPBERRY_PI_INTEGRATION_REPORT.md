# TunaEye V2 Raspberry Pi Integration Report

Date: 2026-10-09

## Root cause

The frontend collapsed every camera failure into one Wi-Fi-oriented message. The live preview uses a cross-origin `<img>`, while Capture uses browser `fetch()` against `http://10.42.0.1:8080/snapshot`. A preview and direct browser navigation can work even when JavaScript fetch is blocked by CORS or HTTPS mixed-content rules. Without the physical tablet network log, CORS/mixed content is the strongest evidence-backed cause, not a confirmed disconnection.

Additional confirmed defects:

- Uploaded JPEG/PNG/WebP files were re-encoded as JPEG quality 0.92 instead of preserving the original bytes.
- Live Pi responses did not validate IDs, confidence, all four score keys, or returned capture type.
- Demo mode could persist client-generated results without a build-level gate.
- Missing IndexedDB evidence could still produce a cloud row marked synchronized.
- Cloud object keys always used `.jpg`, even for preserved PNG/WebP evidence.

## Files changed

- `src/piClient.ts`
- `src/App.tsx`
- `src/demoMode.ts`
- `src/kioskState.ts`
- `src/gradingRecords.ts`
- `src/cloudSync.ts`
- `tests/kiosk.spec.ts`
- `tasks/todo.md`

No Raspberry Pi `app.py`, TFLite model, dataset, dependency, or Supabase schema was changed.

## Before and after

Before: Capture displayed a generic connection message; uploads were converted to JPEG; malformed predictions could be accepted; live result provenance was incomplete.

After:

- Snapshot, status, inference HTTP, timeout, network/CORS, invalid-image, and malformed-response failures are distinguished.
- Technical errors are logged; concise stage-specific messages are shown.
- Camera snapshots are saved first, then the same IndexedDB blob is graded and synchronized.
- Original uploaded files are decoded only for validation, then their exact bytes and MIME type are saved, graded, reviewed, and synchronized.
- Demo behavior is available only when `VITE_DEMO_MODE=true` at build time.
- Original raw confidence, display confidence, capture ID, result ID, four scores, selected image type, and model source are retained locally.
- Missing local evidence leaves synchronization failed/pending instead of falsely successful.

## API contract

`POST http://10.42.0.1:5000/grade`

Multipart form fields:

- `image_type`: `sashibocore` or `tailcut`
- `image`: exact selected blob, named `capture.jpg`, `capture.png`, or `capture.webp` from its MIME type

Required live response fields:

```json
{
  "id": "result-id",
  "capture_id": "capture-id",
  "image_type": "sashibocore",
  "grade": "GRADE_A",
  "confidence": 0.963,
  "scores": {
    "GRADE_A": 0.963,
    "GRADE_B": 0.02,
    "GRADE_C": 0.01,
    "INVALID": 0.007
  }
}
```

`image_type` remains optional in the response for backward compatibility, but if present it must match the request. Grades accepted are `GRADE_A`, `GRADE_B`, `GRADE_C`, and `INVALID` (legacy `A`, `B`, `C` remain accepted). Confidence may be a 0–1 fraction or 0–100 percentage. IDs must be non-empty and all four score values must be finite numbers.

`GET /status` accepts the observed V2 object with `status`, `service`, `version`, `models`, and `classes`. The Admin UI now reads the `models` map instead of only the obsolete singular `model` field.

## Storage and synchronization

One deterministic local evidence ID links fish, sample, captured time, exact blob, result, and sync state. Normal retries remain idempotent through deterministic record IDs, Supabase `upsert(..., { onConflict: 'id' })`, deterministic object paths, and the existing single active-sync guard.

The deployed shared Supabase schema has no columns for inference ID, capture ID, four-class scores, raw confidence, or model source. These remain preserved locally but cannot be round-tripped through cloud records without an approved shared-schema migration. No incompatible schema change was introduced silently.

## Automated validation

- Production TypeScript/Vite build: passed.
- Full Playwright regression with live demo mode disabled: 29 passed.
- Live Supabase test: skipped by its existing environment guard.
- Mocked checks cover status parsing, snapshot HTTP diagnostics, exact camera bytes in multipart inference, exact uploaded-file hash preservation, Sashibo/Tail-Cut mapping, all four classes, raw/display confidence, four scores, malformed prediction rejection, local pending storage, original prediction retention, and tablet regressions.

## Physical Raspberry Pi verification

1. Build with `VITE_DEMO_MODE=false` and clear any older service-worker/cache installation.
2. Connect the tablet to `TunaRpi`.
3. In the tablet browser, verify `/status`, `/stream`, and `/snapshot`.
4. Open DevTools remote debugging and click Capture.
5. If Capture reports a network/CORS error, configure ustreamer to allow the kiosk origin or place the Pi endpoints behind an approved same-origin proxy. Direct `/snapshot` navigation alone does not prove fetch access.
6. If the kiosk is served over HTTPS, expose the Pi through HTTPS/same-origin routing; browsers can block HTTP Pi requests as mixed content.
7. Capture one Sashibo and one Tail-Cut sample and confirm Flask receives one corresponding `image_type` and one image each.
8. Disconnect upstream internet while retaining `TunaRpi`; confirm capture, grading, review, and local pending storage still complete.
9. Restore internet and run Sync; confirm the same deterministic record synchronizes once.

## Remaining boundary

Physical camera, Flask, CORS headers, mixed-content behavior, and real hotspot routing cannot be validated from the Windows development environment. Cloud round-trip preservation of the newly retained inference provenance needs a separately approved shared Supabase migration.
