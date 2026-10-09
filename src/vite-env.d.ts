/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_PI_API_URL?: string
  readonly VITE_PI_CAMERA_URL?: string
  readonly VITE_DEMO_MODE?: string
  readonly VITE_PI_LOCAL_HOSTED?: string
  readonly VITE_PI_GATEWAY_URL?: string
}

interface ImportMeta { readonly env: ImportMetaEnv }
