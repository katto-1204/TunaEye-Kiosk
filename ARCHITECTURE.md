# TunaEye Kiosk Architecture

This document translates `main sysarch.png` into the intended deployable system.

## System topology

```text
Camera + chamber
      |
      v
Tablet PWA kiosk  <----HTTP/LAN---->  Raspberry Pi edge service
      |                                  |
      | captured evidence                | model inference
      | result + audit events            | grade + confidence + model id
      v                                  v
Convex synchronization layer <----> Supabase PostgreSQL + object storage
      |
      +----> other kiosk/admin clients
      +----> native/mobile clients
```

## Components

### Tablet kiosk (`apps/web` in the supplied diagram)

- Runs this installable PWA.
- Guides grader identity, sample selection, fish association, weight, capture, review, results, override, and printing.
- Keeps an offline local record queue and audit log.
- Calls the Raspberry Pi over the station LAN for inference.
- Synchronizes durable records through the cloud services when connected.

### Raspberry Pi edge service (`packages/edge`)

- Owns the deployed tuna grading model and model version.
- Accepts captured image evidence and sample metadata.
- Returns status, grade, confidence, model identifier, and inference timing.
- Exposes a health endpoint used by Admin Settings.

Recommended health contract:

```http
GET /health
```

```json
{
  "status": "ready",
  "model": "tunaeye-yellowfin-v1",
  "version": "1.0.0",
  "device": "raspberry-pi"
}
```

Recommended inference contract:

```http
POST /infer
Content-Type: application/json
```

```json
{
  "sampleType": "Sashibo core",
  "image": "data:image/jpeg;base64,...",
  "fishId": "Fish 1",
  "weightKg": 82.4
}
```

```json
{
  "status": "valid",
  "grade": "A",
  "confidence": 0.96,
  "model": "tunaeye-yellowfin-v1",
  "inferenceMs": 184
}
```

### Supabase

- PostgreSQL is the durable source of truth for stations, graders, fish, samples, grading records, overrides, receipts, and audit events.
- Object storage holds captured evidence using private buckets and signed URLs.
- Row-level security must isolate organizations and stations.
- Service keys must never be stored in the browser.

### Convex

- Distributes live record changes and connection state to other authorized admin clients.
- Coordinates queued/offline mutations and cross-device dashboard freshness.
- Does not replace PostgreSQL as the long-term system of record in this design.

## Suggested data entities

- `organizations`
- `stations`
- `devices`
- `graders`
- `grading_sessions`
- `fish`
- `samples`
- `inference_results`
- `manual_overrides`
- `receipts`
- `audit_events`
- `sync_jobs`

## Security boundaries

- Admin access uses a station PIN in the current kiosk interface. Production should store only a salted verifier and enforce attempt limits.
- Manual overrides require administrator authorization and create audit events.
- The Raspberry Pi API should use device-bound credentials and TLS or a trusted private network.
- Supabase and Convex public client configuration may be exposed, but privileged secrets remain server-side.
- Captured images and grader identity are operational data and require retention and access policies.

## Offline and synchronization behavior

1. The kiosk creates a local grading session and audit events.
2. The Raspberry Pi supplies inference while the LAN is available.
3. Results are saved locally immediately so dashboard navigation cannot lose them.
4. Manual sync refreshes local dashboard state and records a sync event.
5. The future cloud adapter uploads queued records and evidence, then Convex broadcasts the change to other clients.
6. Conflicts should use immutable inference events and append-only overrides rather than overwriting history.

## Fullscreen limitation

The PWA manifest requests fullscreen landscape mode, and the kiosk requests browser fullscreen after a user action. A normal website cannot forcibly hide Android Back, Home, and Recents controls. Guaranteed system-navigation suppression requires Android kiosk/lock-task device management or a native wrapper configured by the device owner.

## Current repository boundary

This repository contains the kiosk user interface, local storage, PWA, printing, diagnostics UI, and documented integration contracts. It does not currently contain the Raspberry Pi server, trained model artifact, Supabase schema/migrations, Convex functions, production authentication, or deployment credentials.
