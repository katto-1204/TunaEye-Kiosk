package com.tunaeye.kiosk;

import android.app.admin.DevicePolicyManager;
import android.content.ComponentName;
import android.os.Bundle;
import android.view.View;
import android.webkit.JavascriptInterface;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private DevicePolicyManager devicePolicyManager;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        devicePolicyManager = (DevicePolicyManager) getSystemService(DEVICE_POLICY_SERVICE);
        getBridge().getWebView().addJavascriptInterface(new KioskBridge(), "TunaEyeKiosk");
        enterImmersiveMode();
        startDeviceOwnerLockTask();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) enterImmersiveMode();
    }

    private void enterImmersiveMode() {
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        );
    }

    private void startDeviceOwnerLockTask() {
        ComponentName admin = new ComponentName(this, TunaEyeDeviceAdminReceiver.class);
        if (devicePolicyManager.isDeviceOwnerApp(getPackageName())) {
            devicePolicyManager.setLockTaskPackages(admin, new String[] { getPackageName() });
            startLockTask();
        }
    }

    private class KioskBridge {
        @JavascriptInterface
        public void exitLockTask() {
            if (devicePolicyManager.isDeviceOwnerApp(getPackageName())) {
                stopLockTask();
            }
        }
    }
}
