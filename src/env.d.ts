/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_ADS_ENABLED?: string;
  readonly PUBLIC_ANALYTICS_ENABLED?: string;
  readonly PUBLIC_ANALYTICS_ID?: string;
  readonly PUBLIC_CONTACT_EMAIL_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

