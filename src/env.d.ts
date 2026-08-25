/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_ADSENSE_ENABLED?: string;
  readonly PUBLIC_GOOGLE_ADSENSE_ACCOUNT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

