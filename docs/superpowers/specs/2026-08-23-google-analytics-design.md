# Google Analytics 4 Integration Design

Date: 2026-08-23
Status: Approved in the Codex task

## Purpose

Add Google Analytics 4 to the production `howtofishgamehelp.com` site so page traffic appears in the site's own GA4 reports. The integration must preserve the site's static-first architecture, keep analytics out of local and preview builds, avoid new dependencies, and describe the resulting data collection accurately on the public privacy page.

## Selected approach

Use the standard Google tag and load it immediately on every production page. The user explicitly selected this approach instead of an opt-in banner or consent-mode-first collection.

This choice provides the most complete GA4 traffic data and makes no visible interface change. It also means analytics requests and analytics cookies can begin before a visitor gives consent. The public privacy text must state that behavior; this design does not claim that immediate loading is sufficient for every visitor's jurisdiction.

## GA4 property and web stream

Use the user's currently signed-in Google session to create one GA4 property named `How to Fish Game Help` with:

- reporting time zone: United States Eastern Time (New York);
- currency: US dollar;
- website data stream URL: `https://howtofishgamehelp.com`;
- stream name: `How to Fish Game Help`.

The setup must not alter unrelated Analytics properties, streams, users, or account permissions. If the signed-in Google account has no Analytics account and creating a new account is required, stop and obtain separate confirmation before creating that account.

The resulting public measurement ID, in `G-...` format, is stored as the GitHub Actions repository variable `PUBLIC_ANALYTICS_ID`. It is not written into tracked source or documentation. A second production switch, `PUBLIC_ANALYTICS_ENABLED=true`, enables the existing project configuration. Preview and ordinary local builds do not receive either production value.

## Site integration and data flow

`BaseLayout.astro` conditionally renders the standard asynchronous Google tag only when the existing site configuration reports analytics as enabled and a measurement ID is present. Because all public pages use this layout, one focused integration covers the full site without page-specific duplication.

When a visitor opens a production page:

1. the generated page loads Google's tag library from `www.googletagmanager.com`;
2. the inline configuration initializes the single GA4 measurement ID;
3. GA4 records its standard page-view data and sends collection requests to Google Analytics;
4. local and preview pages render no Google tag because their analytics switch remains off.

Google Signals and ad-personalization signals are disabled in the tag configuration. Advertising remains separately disabled. No custom events, user IDs, ecommerce data, contact data, or first-party tracking endpoint are added in this change. Production noindex pages remain inside analytics coverage so missing-route and search usage can be diagnosed; preview builds remain outside analytics coverage.

## Security and failure behavior

The Worker Content Security Policy allows only the Google hosts needed to download the tag and send Analytics collection requests. Existing restrictions remain in place for all other scripts and connections.

If the enable switch is false or the measurement ID is empty, the generated site contains no Google script or analytics request. A missing GitHub variable therefore fails closed rather than injecting a broken or placeholder tag. The deployment workflow must fail before publishing if an analytics-enabled production build does not contain a valid-looking `G-...` ID.

## Privacy disclosure

Update the English privacy page before the tag is deployed. Remove the current claims that the launch is analytics-off and does not use analytics cookies. State that Google Analytics is enabled, that Google may process page views, referral information, device/browser information, approximate location, and analytics identifiers or cookies, and that the site does not enable advertising or send account, purchase, form, or user-ID data because those features do not exist.

The disclosure links to Google's own privacy information and gives visitors a practical browser or Google Analytics opt-out route. It does not make unsupported legal-compliance claims.

## Test-first implementation and verification

Before production code changes, add focused tests that fail because the Google tag, workflow configuration, CSP allowances, and enabled-state privacy copy are absent. The implementation then makes only the changes required for those tests.

Verification covers both configuration states:

- a default local build contains no Google tag or measurement ID;
- an analytics-enabled build contains one Google tag with the configured test ID on representative pages;
- the enabled build contains no placeholder, duplicate tag, advertising identifier, or tag on an unintended preview build;
- the privacy page matches the enabled state;
- the Worker CSP permits the required Analytics traffic without broadly weakening other directives;
- production build, type check, content validation, duplicate metadata check, internal-link check, dependency audit, and basic page tests all pass.

After the code and account configuration are verified, push the reviewed change to `main` so the existing production workflow deploys it. Completion requires a successful workflow run, live-page source showing the expected single measurement ID, response headers showing the intended CSP, and a real visit visible in the GA4 real-time report. A loaded script alone is not treated as proof that GA4 received the event.

## Rollback

If the live tag causes a site regression or GA4 does not receive events, disable `PUBLIC_ANALYTICS_ENABLED` in the production workflow configuration and redeploy the last reviewed code while the cause is investigated. Removing or changing the GA4 property is not part of site rollback and must not happen without separate approval.

## Non-goals

- No cookie-consent banner or consent-management platform.
- No Google Tag Manager container.
- No advertising, remarketing, Google Signals, or ad-personalization signals.
- No custom event taxonomy, conversions, ecommerce tracking, or user identification.
- No analytics on local or preview builds.
- No new production dependency.
