# TunaEye Shared Supabase Contract

This contract is shared by TunaEye Kiosk, TunaEyePhoneLEGIT, and the Admin Dashboard. All clients use one Supabase project. Raspberry Pi devices never connect to Supabase.

## Environment

- `VITE_SUPABASE_URL`: shared Supabase project URL.
- `VITE_SUPABASE_ANON_KEY`: project publishable/anon key.
- Never expose `service_role` in kiosk or mobile code.
- Anonymous Auth must be enabled for unattended kiosk sessions unless the deployment replaces it with an interactive Supabase Auth flow.

## Authentication and roles

- Every cloud operation uses a Supabase Auth session.
- `profiles.user_id` is the primary key and references `auth.users.id`.
- `profiles.role` is `grader` or `admin`; the database, not UI visibility, enforces admin reads.
- New authenticated users receive a `grader` profile from `handle_new_user()`.
- Promote administrators only through a trusted server or the Supabase dashboard.

## Canonical table

`public.grading_records` is the only grading result table. Kiosk and mobile must not create source-specific tables.

| Column | Type | Required | Contract |
| --- | --- | --- | --- |
| `id` | text PK | yes | Stable client-generated ID reused by every retry. |
| `user_id` | uuid FK auth.users | yes | Authenticated record owner. |
| `source` | `kiosk` or `mobile` | yes | Originating client. |
| `station_id` | text | no | Kiosk/station identifier. |
| `session_id` | text | yes | Groups samples from one grading session. |
| `grader_name` | text | yes | Display name captured by client. |
| `sample_type` | `sashibo_core` or `tail_cut` | yes | No eye, gill, species, or freshness values. |
| `fish_id` | text | yes | Preserves same-fish/different-fish association. |
| `weight_kg` | numeric | no | Weight in kilograms. |
| `grade` | `A`, `B`, `C`, `Invalid` | yes | Final grade. |
| `confidence` | numeric 0–100 | no | Original model confidence. |
| `result_status` | text | yes | Inference state such as valid, uncertain, or invalid. |
| `original_grade` | tuna grade | no | Raspberry Pi model grade before override. |
| `override_grade` | tuna grade | no | Authorized expert decision. |
| `override_reason` | text | no | Required by client workflow for overrides. |
| `override_actor` | text | no | Grader identity recorded when an override is applied. |
| `override_at` | timestamptz | no | Time the override was applied. |
| `capture_id` | text | no | Raspberry Pi capture identifier. |
| `inference_id` | text | no | Raspberry Pi inference identifier. |
| `raw_confidence` | double precision | no | Unnormalized confidence returned by inference. |
| `scores` | jsonb | no | Raw `GRADE_A`, `GRADE_B`, `GRADE_C`, and `INVALID` scores. |
| `image_type` | text | no | Pi model input: `sashibocore` or `tailcut`. |
| `model_source` | text | no | `raspberry-pi` or explicitly enabled `demo`. |
| `image_path` | text | no | Private Storage path for the selected sample. |
| `gradcam_path` | text | no | Private Grad-CAM object path when produced. |
| `captured_at` | timestamptz | yes | Device capture/session time. |
| `created_at` | timestamptz | yes | Cloud creation time. |
| `updated_at` | timestamptz | yes | Last successful upsert time. |

## Storage

- Private bucket: `grading-images`.
- Object path: `{user_id}/{record_id}/{sample_type}.jpg`.
- Optional Grad-CAM path: `{user_id}/{record_id}/{sample_type}-gradcam.jpg`.
- Database rows store paths, never image binaries or public URLs.
- Owners can upload/read their objects. Admin profiles can read all objects.

## Local synchronization

Local-only states are `pending`, `syncing`, `synced`, and `failed`. They are not duplicated in PostgreSQL.

1. Complete inference and save the grading record locally with a stable ID and `pending` state.
2. Save JPEG evidence in the platform local database (IndexedDB on kiosk).
3. On manual Sync or the browser `online` event, authenticate with Supabase.
4. Upload evidence with `upsert: true` to the deterministic path.
5. Upsert `grading_records` on primary key `id`.
6. Read all persisted contract fields back and download the private image to verify both row and object persistence.
7. Only then mark local evidence and record `synced`.
8. Retain every unsynced record. After verification, retain the newest 200 synced records locally and prune only older verified metadata and evidence.
9. On any error mark the local item `failed`; retain it for retry.

Manual price schedule saves use the same authenticated Supabase session and are
read back and verified for the station and all three grades before the UI
reports a successful cloud sync.

No polling and no Supabase Realtime subscription are part of this contract.

## Raspberry Pi boundary

- The kiosk connects locally to the Pi API at `http://10.42.0.1:5000` and ustreamer at `http://10.42.0.1:8080` by default.
- The exact snapshot blob saved to IndexedDB is sent to `POST /grade`; the Pi never receives Supabase credentials.
- Pi `GRADE_A`, `GRADE_B`, `GRADE_C`, and `INVALID` responses map to the existing cloud grade enum. A 0–1 confidence is normalized once to the contract's 0–100 value.
- Capture IDs, inference IDs, confidence values, all four class scores, model input/source, and override audit fields are preserved in the canonical cloud row.
- An HTTPS-hosted PWA may be blocked from direct HTTP/private-network requests. Production needs an approved secure local gateway or a locally served kiosk origin before hardware support can be claimed.

## TunaEyePhoneLEGIT requirements

Required: `id`, authenticated `user_id`, `source: mobile`, `session_id`, `grader_name`, `sample_type`, `fish_id`, final `grade`, `result_status`, and `captured_at`.

Optional when unavailable: `station_id`, `weight_kg`, confidence, override fields, image path, and Grad-CAM path. Mobile must use the same enums, bucket, object paths, upsert key, and state transition order as kiosk.

## Admin behavior

The Admin Dashboard reads `grading_records` after RLS confirms `profiles.role = admin`. It sees kiosk and mobile rows only after successful cloud synchronization. Unsynchronized local rows are not cloud/admin records.
