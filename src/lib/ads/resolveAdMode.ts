export type AdRenderMode = 'placeholder' | 'live' | 'off';

interface AdModeInput {
  isProductionBuild: boolean;
  deployment: string | undefined;
  adsEnabled: boolean;
  unitEnabled: boolean;
}

export function resolveAdMode(input: AdModeInput): AdRenderMode {
  if (!input.isProductionBuild || input.deployment !== 'production') return 'placeholder';
  return input.adsEnabled && input.unitEnabled ? 'live' : 'off';
}
