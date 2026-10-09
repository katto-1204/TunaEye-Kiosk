# Correct Tail cut camera preview retake

1280x800 and1024x600 actual two-sample workflow passed. Both previews were decoded in the browser and compared pixel-for-pixel against supplied TAILCUT_A.png. Capture2of2, Tail cut context, actual Capture/snapshot and Captured Tail cut review were verified, with no console errors or failed requests.

The final2.5-second/150-frame moving UI clip preserves real camera preview→Capture→review. Tap coordinates and end-relative timing are in tail-camera-events.json. Only the Tail segment from this isolated recording is used; hardware/camera and inference endpoints are simulated. Production app and previous workflow captures were not changed.
