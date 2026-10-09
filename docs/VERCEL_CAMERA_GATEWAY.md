# Vercel camera and Raspberry Pi gateway

## Deployment modes

### Raspberry Pi hosted kiosk

Build with `npm run build:pi`. The kiosk uses same-origin `/status`, `/stream`, `/snapshot`, and `/grade`. This working path is unchanged.

### Vercel PWA

An HTTPS page cannot safely call `http://10.42.0.1:5000` or `:8080`. Without an HTTPS gateway, TunaEye shows connection guidance and makes no Pi request.

To enable camera and inference from Vercel, configure:

```env
VITE_PI_GATEWAY_URL=https://your-authenticated-gateway.example.com
```

The gateway must:

- terminate HTTPS with a browser-trusted certificate;
- require an authenticated browser session and return `401` or `403` otherwise;
- proxy `/status`, `/stream`, `/snapshot`, and `/grade` to Flask without changing their contracts;
- allow `https://kiosktunaeye.vercel.app` with explicit CORS headers and credentialed requests;
- answer Private Network Access preflights when the HTTPS gateway itself targets a private network;
- preserve multipart fields `image_type` and `image` and never expose Supabase service credentials.

For credentialed cross-origin requests, do not use `Access-Control-Allow-Origin: *`. Return the exact Vercel origin, `Access-Control-Allow-Credentials: true`, and allow `GET`, `POST`, `OPTIONS`, and the required headers. Authentication should use an HttpOnly, Secure session cookie; no reusable secret is embedded in the Vite bundle.

The application does not use `navigator.mediaDevices.getUserMedia()`. Browser webcam permission cannot fix this integration because capture comes from the Raspberry Pi `/snapshot` endpoint.
