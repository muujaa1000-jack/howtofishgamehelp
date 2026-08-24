import { resolveAdMode } from '../lib/ads/resolveAdMode';

const adsEnabled = import.meta.env.PUBLIC_ADS_ENABLED === 'true';
const shared = {
  isProductionBuild: import.meta.env.PROD,
  deployment: import.meta.env.PUBLIC_ADS_DEPLOYMENT,
  adsEnabled,
};

export const ads = {
  banner320x50Mode: resolveAdMode({
    ...shared,
    unitEnabled: import.meta.env.PUBLIC_ADSTERRA_BANNER_320X50_ENABLED === 'true',
  }),
  nativeMode: resolveAdMode({
    ...shared,
    unitEnabled: import.meta.env.PUBLIC_ADSTERRA_NATIVE_ENABLED === 'true',
  }),
} as const;
