# TunaEye V2 Raspberry Pi Compatibility Audit

Date: 2026-10-09  
Audit mode: read-only for the Raspberry Pi backend; kiosk upload-image implementation separately authorized by the user.

## A. Executive summary

Overall Raspberry Pi compatibility is **UNVERIFIED**. The requested audit targets `/home/tunarpi/rpi-cam-demo/`, but this workspace contains only the Windows kiosk repository. No Raspberry Pi shell, copied backend, `app.py`, model files, Python environment, ustreamer installation, or hotspot configuration was available for inspection.

The kiosk-side API contract is implemented and testable: it expects `GET /status`, `POST /grade`, ustreamer `/stream` and `/snapshot`, multipart fields `image_type` and `image`, and V2 grades plus confidence and class scores. Agreement with the actual Flask backend remains unverified.

The newly requested upload-image option is implemented in the kiosk. JPEG, PNG, and WebP files up to 10 MB are decoded and converted to JPEG, then use the same IndexedDB, review, Flask inference, result, receipt, and Supabase sync path as camera snapshots.

Major blockers:

- No access to `/home/tunarpi/rpi-cam-demo/` or the physical Pi.
- Model hashes, tensors, loadability, preprocessing, and class metadata cannot be verified.
- Flask request/response behavior and ustreamer routes cannot be verified.
- Installed Android PWA access to HTTP services from an HTTPS origin requires physical testing.
- The supplied SQL migration is non-idempotent and must not be applied blindly.

## B. Actual available project structure

```text
tunaeye/
├── src/
│   ├── App.tsx
│   ├── piClient.ts
│   ├── evidenceStorage.ts
│   ├── gradingRecords.ts
│   ├── cloudSync.ts
│   ├── supabase.ts
│   └── kioskState.ts
├── public/
│   ├── sw.js
│   └── DEMO_SAMPLES/
├── supabase/migrations/
│   └── 202610070001_shared_grading_contract.sql
├── tests/
│   ├── kiosk.spec.ts
│   └── supabase-sync.spec.ts
└── docs/SHARED_SUPABASE_CONTRACT.md
```

Expected but unavailable:

```text
/home/tunarpi/rpi-cam-demo/
├── app.py
├── generate_qr.py
├── qr.png
├── README.md
├── model/
│   ├── tunaeye_v2_sashibocore_fp32.tflite
│   └── tunaeye_v2_tailcut_fp32.tflite
└── pwa_build/
```

No conclusion is made about unavailable files.

## C. Environment findings

| Check | Result |
| --- | --- |
| Raspberry Pi OS/version | UNVERIFIED |
| 32/64-bit and CPU architecture | UNVERIFIED |
| Python version and virtual environment | UNVERIFIED |
| Disk/RAM | UNVERIFIED |
| TFLite/TensorFlow runtime | UNVERIFIED |
| Flask, Pillow, NumPy, OpenCV, requests, flask-cors | UNVERIFIED |
| Kiosk TypeScript production build | PASS |
| Local PostgreSQL/Supabase CLI | NOT INSTALLED |

No packages were installed and no system configuration was changed for this audit.

## D. Model verification

Both required files are unavailable in this workspace, so filename existence, absolute path, size, SHA-256, interpreter loading, tensors, and deployment class metadata are all **UNVERIFIED**.

Required values to verify on the Pi:

- Input: `[1, 224, 224, 3]`, `float32`
- Output: `[1, 4]`, `float32`
- Deployment metadata class order: `GRADE_A`, `GRADE_B`, `GRADE_C`, `INVALID`

Required preprocessing:

1. Decode and convert to RGB.
2. Center-square crop.
3. Resize to 224×224 with OpenCV bilinear interpolation.
4. Convert to `float32`, preserving 0–255 RGB values.
5. Add the batch dimension.

`/255.0` or `[-1, 1]` normalization is incompatible with the stated V2 training contract. Whether `app.py` currently performs either operation is UNVERIFIED.

## E. Flask API compatibility

The kiosk currently expects:

| Operation | Kiosk contract |
| --- | --- |
| Health | `GET http://10.42.0.1:5000/status` |
| Preview | `GET http://10.42.0.1:8080/stream` |
| Snapshot | `GET http://10.42.0.1:8080/snapshot` |
| Inference | `POST http://10.42.0.1:5000/grade` |
| Body | multipart `image_type` + `image` |
| Types | `sashibocore`, `tailcut` |
| Response | `id`, `capture_id`, `grade`, `confidence`, `scores` |

The client uses an 8-second timeout and bounded retries, validates image responses, maps V2 grade labels, and normalizes 0–1 confidence to 0–100. The actual backend route methods, multipart names, maximum upload size, errors, binding, CORS, duplicate handling, and concurrency behavior are **UNVERIFIED**.

The client currently retries inference POSTs. Until the backend supports an idempotency/request ID, duplicate model execution is a MEDIUM reliability risk.

## F. Camera and networking

| Check | Result |
| --- | --- |
| `TunaRpi` hotspot | UNVERIFIED |
| Pi address `10.42.0.1` | Configured in kiosk; live state UNVERIFIED |
| Flask port 5000/listening interface | UNVERIFIED |
| ustreamer port 8080/process/device/logs | UNVERIFIED |
| Android reachability | UNVERIFIED |
| CORS and Private Network Access | UNVERIFIED |

The service worker bypasses Pi-local requests, but a service worker cannot bypass HTTPS mixed-content, CORS, or browser Private Network Access rules. Physical Android Chrome testing is mandatory.

## G. Critical issues

### BLOCKER

- Raspberry Pi source/environment is unavailable, preventing the requested backend audit.
- Both TFLite models and their deployment metadata are unavailable.
- HTTPS-installed PWA to HTTP Pi compatibility has not been proven on the target tablet.

### HIGH

- Actual V2 preprocessing cannot be inspected; incorrect normalization or missing center crop would invalidate predictions.
- Actual model routing/class order cannot be verified.
- Flask upload validation, size limit, thread safety, binding, and error behavior are unknown.
- Kiosk local PIN/name identity is not Supabase role authentication; cross-device Admin authorization remains incomplete.

### MEDIUM

- Inference POST retry can execute a duplicate request without backend idempotency.
- Client-generated fallback inference/capture IDs can conceal a backend contract omission.
- The kiosk uses a client-side 10 MB upload cap; the Flask limit is unknown and must be aligned.
- Existing SQL migration is non-idempotent.

### LOW

- `pwa_build/`, QR assets, and old demo files may be legacy, but they must not be removed before the real Pi audit.

## H. Required changes after Pi access and approval

Potential backend changes must be limited to evidence found on the Pi. Likely review targets:

- `/home/tunarpi/rpi-cam-demo/app.py`
- dependency manifest or virtual-environment documentation, if present
- `/home/tunarpi/rpi-cam-demo/README.md`
- discovered systemd/service configuration, only if required

Do not modify model files, delete `pwa_build/`, or change hotspot/camera settings during the audit.

Kiosk files changed for the separately authorized upload option:

- `src/App.tsx`
- `src/styles.css`
- `tests/kiosk.spec.ts`

## I. Proposed minimal backend structure

```text
rpi-cam-demo/
├── app.py                 # Flask routes, validation, model selection
├── README.md              # setup, service, API contract, verification
├── requirements.txt       # only if the project does not already have a manifest
└── model/
    ├── tunaeye_v2_sashibocore_fp32.tflite
    └── tunaeye_v2_tailcut_fp32.tflite
```

Do not add Supabase, frontend hosting, training, model conversion, or unrelated abstractions.

## J. Recommended implementation order

1. Obtain read-only SSH access or a complete copy of `/home/tunarpi/rpi-cam-demo/`.
2. Record OS, architecture, Python/packages, disk/RAM, processes, listeners, hotspot, and Git state.
3. Hash and inspect both models with the installed interpreter.
4. Verify deployment class metadata and preprocessing against training.
5. Exercise `/status`, `/grade`, `/stream`, and `/snapshot` without changing services.
6. Compare real Flask payloads with the kiosk multipart contract.
7. Approve the smallest backend patch based on evidence.
8. Unit-test preprocessing and both model routes, then test the physical USB camera.
9. Test kiosk and official mobile app on `TunaRpi` without internet.
10. Test installed Android PWA browser security behavior.
11. Inspect live Supabase schema before applying any migration.

## K. Verification checklist

| Item | Status |
| --- | --- |
| Kiosk Pi URL/route contract | PASS by code inspection |
| Upload image control and shared evidence pipeline | PASS at 1024×600 with no console/network errors |
| Offline IndexedDB evidence persistence | PASS by existing browser coverage |
| Shared stable-ID Supabase sync implementation | PASS by mocked browser coverage |
| Real Pi project tree/environment | UNVERIFIED |
| Both model hashes/loadability/tensors | UNVERIFIED |
| Preprocessing | UNVERIFIED |
| Flask endpoints and errors | UNVERIFIED |
| ustreamer/USB camera | UNVERIFIED |
| Hotspot/firewall/listeners | UNVERIFIED |
| Physical Android installed PWA | UNVERIFIED |
| Official mobile API compatibility | UNVERIFIED |
| Live Supabase schema/RLS/Storage | UNVERIFIED |

Final automated verification: production build passed; Playwright passed 16 tests with one live-credential Supabase test skipped as designed.

## Database credential handling

The user supplied the missing direct-database password. It is intentionally not reproduced or stored in this report, source code, `.env`, tests, or command history. The browser continues to use only the project URL and publishable key.

The migration must first be compared with the live schema. If approved later, use PostgreSQL TLS, a single transaction, `ON_ERROR_STOP`, and an interactive password prompt. Rotate the shared password after setup because it was disclosed in chat.
