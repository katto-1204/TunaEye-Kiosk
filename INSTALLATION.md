# TunaEye Installation Guide

This guide covers the local development setup for the TunaEye kiosk app and the common production build paths used by this repository.

## Prerequisites

- Node.js 18+ (Node 20 LTS recommended)
- npm (or pnpm if you prefer it)
- Git
- A browser with camera, print, and local storage access for kiosk testing
- Optional: Android Studio / Capacitor tooling for Android packaging
- Optional: a Raspberry Pi running the TunaEye inference service and camera stream

## 1) Clone the repository

```bash
git clone https://github.com/katto-1204/tunaeye-kiosk.git
cd tunaeye-kiosk
```

## 2) Install dependencies

```bash
npm install
```

If you prefer pnpm, the repo also includes a pnpm workspace config and lockfile, so this also works:

```bash
pnpm install
```

## 3) Configure environment variables

Copy the example environment file and fill in the values for your deployment:

```bash
copy .env.example .env.local
```

On macOS/Linux:

```bash
cp .env.example .env.local
```

The app expects variables such as:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key
VITE_PI_API_URL=http://10.42.0.1:5000
VITE_PI_CAMERA_URL=http://10.42.0.1:8080
VITE_DEMO_MODE=false
VITE_PI_LOCAL_HOSTED=false
VITE_PI_GATEWAY_URL=
```

Notes:

- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` enable cloud sync and hosted admin features.
- `VITE_PI_API_URL` and `VITE_PI_CAMERA_URL` are used for the local Raspberry Pi deployment on the station LAN.
- `VITE_PI_GATEWAY_URL` is for an authenticated HTTPS gateway used in hosted deployments.
- `VITE_DEMO_MODE=true` is useful for offline demos and local UI testing without live inference.

## 4) Start the app in development mode

```bash
npm run dev
```

This starts the Vite dev server on port 3000 by default.

Open the app in a browser at:

```text
http://localhost:3000
```

## 5) Run a production build

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview -- --host 0.0.0.0 --port 3000
```

## 6) Android build / Capacitor packaging

This project includes Capacitor support for Android kiosk packaging.

```bash
npm run build:android
```

To open the Android project in Android Studio:

```bash
npm run open:android
```

## 7) Raspberry Pi / kiosk integration

For local Pi-based grading, the kiosk expects the station to expose the Raspberry Pi endpoints on the local network.

Typical values:

- Pi API: `http://10.42.0.1:5000`
- Pi camera stream: `http://10.42.0.1:8080`

The frontend checks for:

- `/status`
- `/stream`
- `/snapshot`
- `/grade`

If these are not available, the kiosk falls back to graceful warning states or demo mode depending on your configuration.

## 8) Production deployment notes

This repository is designed for a kiosk-style frontend and can be deployed in several ways:

- Local browser kiosk on a tablet or workstation
- Raspberry Pi-hosted local deployment with camera + inference API
- HTTPS deployment behind an authenticated gateway
- Android app packaged with Capacitor

For hosted deployment, keep the browser on HTTPS and use the reverse proxy endpoint configured in `VITE_PI_GATEWAY_URL`.

## 9) Useful scripts

From the project root:

```bash
npm run dev        # local development server
npm run build      # production build
npm run preview    # local production preview
npm run build:android
npm run open:android
```

## 10) Troubleshooting

### App is blank or not loading

- Confirm dependencies were installed with `npm install`
- Confirm the local `.env.local` file exists and contains valid values
- Check the browser console for runtime errors

### Camera or Pi requests fail

- Verify the Pi is reachable on the configured local network IP
- Confirm the camera stream and `/grade` endpoint are active
- Ensure your browser is using localhost or HTTPS when required

### Supabase sync is unavailable

- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly
- Confirm the project is configured for the same Supabase instance expected by the app
- Verify the browser is online when attempting to sync

### Android build issues

- Make sure the Android SDK is installed and configured
- Run the capacitor sync step after a successful production build
- Rebuild after changing app config or native settings

## Support

For repository-specific details, refer to the project docs in the root folder, especially:

- [README.md](README.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [FEATURES.md](FEATURES.md)
- [ANDROID_KIOSK_SETUP.md](ANDROID_KIOSK_SETUP.md)

If you are setting up a kiosk station for the first time, start with the local development flow above, then switch to the Pi/API and Supabase values required for your deployment environment.
