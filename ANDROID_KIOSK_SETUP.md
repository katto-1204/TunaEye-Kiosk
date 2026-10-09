# Android kiosk wrapper

The `android/` project wraps the built TunaEye web app in a Capacitor WebView.
It enables immersive fullscreen and starts Android Lock Task Mode when the
tablet has been provisioned as the device owner. This is the native boundary
that can block Android Back, Home, and Recents; a normal browser page cannot
do that.

## Build

1. Install Android Studio with an Android SDK and an emulator or USB tablet.
2. Build and copy the web app:

   ```powershell
   pnpm build:android
   ```

3. Open the project:

   ```powershell
   pnpm open:android
   ```

4. Build and install the debug APK from Android Studio.

The app allows cleartext traffic because the Pi API is served on the local
`10.42.0.1` network. Keep the tablet on the Pi network when using Pi-local
inference.

## Provision a dedicated tablet

Device-owner provisioning must be done on a factory-reset or otherwise
unprovisioned device. Remove all accounts and work profiles first. With USB
debugging enabled and the app already installed:

```powershell
adb shell dpm set-device-owner com.tunaeye.kiosk/.TunaEyeDeviceAdminReceiver
```

After provisioning, launch TunaEye. `MainActivity` allowlists its package and
calls `startLockTask()`. Back, Home, and Recents remain inside the app while
Lock Task Mode is active.

To remove device-owner mode during development, use the tablet Settings flow
or factory reset the tablet. Do not rely on the in-app lock icon for device
administration; it is only the controlled operator exit from Lock Task Mode.

## Exit behavior

The tiny lock button in the web UI calls the native `TunaEyeKiosk.exitLockTask`
bridge when running in this wrapper. In a regular Android Chrome session it
only exits browser fullscreen. The wrapper must be provisioned as device owner
for system navigation blocking to take effect.
