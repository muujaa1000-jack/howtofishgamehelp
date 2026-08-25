# Analytics Retention During AdSense Review

Date: 2026-08-25

## Goal

Keep Google Analytics 4, Google Search Console verification, and Cloudflare Web Analytics active on `howtofishgamehelp.com` while all Adsterra units, intrusive formats, AdSense ad rendering, and Auto ads remain disabled.

The existing GA4 property and repository variables are reused. This change does not create, delete, or reconfigure an Analytics account or property.

## Selected consent behavior

The Google tag loads only when `PUBLIC_ANALYTICS_ENABLED=true` and `PUBLIC_ANALYTICS_ID` is a valid GA4 measurement ID.

Before the loader or any measurement command runs, the shared head sets:

- `analytics_storage: 'denied'`
- `ad_storage: 'denied'`
- `ad_user_data: 'denied'`
- `ad_personalization: 'denied'`
- `ads_data_redaction: true`

This is advanced Consent Mode with denied defaults. Until a real consent platform updates the state, GA4 may send cookieless measurement pings but must not read or write Analytics or advertising cookies. The configuration also keeps Google Signals and ad-personalization signals disabled.

The page location sent by the initial GA4 configuration is reduced to the apex origin and pathname. Search parameters and other query strings are not included.

## Components

### Shared site configuration

`src/config/site.ts` validates the existing public GA4 measurement ID and exposes `analyticsEnabled` and `analyticsId`. Missing, disabled, or malformed configuration fails closed and emits no Google tag.

### Shared document head

`src/layouts/BaseLayout.astro` emits one consent-default block before one Google tag loader. It then configures GA4 with the validated ID, disabled advertising signals, and a query-free page location. All public pages use this layout, so the behavior is consistent without page-specific integrations.

No AdSense loader, `adsbygoogle`, ad slot, Adsterra script, or ad-network request is introduced.

### Cloudflare delivery

`worker/index.ts` removes the HTML `no-transform` directive so Cloudflare Web Analytics can resume automatic beacon injection. The Content Security Policy allows:

- `https://static.cloudflareinsights.com` for the Cloudflare beacon script;
- the same-origin Cloudflare RUM endpoint through the existing `connect-src 'self'`;
- `https://www.googletagmanager.com` for the GA4 loader;
- the minimum Google Analytics collection origins;
- the existing same-origin Pagefind WebAssembly permission.

The policy continues to exclude Adsterra, Google advertising, DoubleClick, and wildcard script sources.

### Production workflow

`.github/workflows/deploy-production.yml` supplies the existing `PUBLIC_ANALYTICS_ENABLED` and `PUBLIC_ANALYTICS_ID` repository variables and validates them before building. `PUBLIC_ADSENSE_ENABLED` remains hard-coded to `false`. No Adsterra variable is restored.

Preview and ordinary local builds remain analytics-off unless analytics variables are explicitly provided for a controlled test.

### Privacy disclosure

`src/pages/privacy.astro` states that:

- GA4 is enabled in the production site with consent defaults denied;
- cookieless pings may be sent for basic measurement and modeling;
- Analytics and advertising cookies are not enabled before a future consent update;
- Google Signals and advertising personalization are intentionally disabled in the site tag;
- Cloudflare Web Analytics and infrastructure/security processing remain active;
- Adsterra and AdSense ad display remain disabled.

The page does not claim that a Google-certified CMP is already live.

## Verification

Automated tests must prove:

1. analytics configuration is validated and fails closed;
2. consent defaults appear before the Google tag loader;
3. all four consent types are denied and ad data redaction is enabled;
4. the configured page location omits query strings;
5. Google Signals and ad-personalization signals remain disabled;
6. the CSP permits only the required Analytics and Cloudflare origins while continuing to block advertising origins;
7. production automation supplies Analytics variables but keeps advertising disabled;
8. an analytics-off build contains no Google tag;
9. an analytics-on test build contains one valid Google tag per page and no advertising runtime;
10. Privacy accurately describes the enabled analytics and disabled advertising state.

Preview browser QA must confirm layout, Search, canonical, no ad markup, and no console errors. Production QA must additionally confirm actual GA4 and Cloudflare Analytics requests are present, while Adsterra, AdSense, DoubleClick, popunder, Social Bar, and interstitial requests remain absent.

## Release boundary

Release through the existing feature Preview, then fast-forward `main` only after the Preview checks pass. Do not enable AdSense ads, Auto ads, Adsterra, or a placeholder publisher ID as part of this change.
