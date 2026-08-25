# Analytics Retention Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore GA4 and Cloudflare Web Analytics during AdSense review with denied consent defaults while keeping Adsterra and every real advertising runtime disabled.

**Architecture:** Reuse the existing public GA4 repository variables, validate them in the shared site configuration and production workflow, and emit one consent-default block before the Google tag in the shared layout. Restore only the narrow Analytics and Cloudflare CSP origins, update the dynamic Privacy disclosure, and verify analytics-on and analytics-off builds separately.

**Tech Stack:** Astro 7, TypeScript 6, Node.js 22, Node test runner, GA4 gtag.js, Google Consent Mode v2, Cloudflare Workers, GitHub Actions.

## Global Constraints

- Do not create, delete, or reconfigure a Google Analytics account or property.
- Keep `PUBLIC_ADSENSE_ENABLED=false`; do not emit `adsbygoogle`, Auto ads, or an ad slot.
- Do not restore any Adsterra variable, component, script, domain, popunder, Social Bar, interstitial, or Direct Link.
- Default `analytics_storage`, `ad_storage`, `ad_user_data`, and `ad_personalization` to `denied`.
- Set `ads_data_redaction=true`, `allow_google_signals=false`, and `allow_ad_personalization_signals=false`.
- Do not send query strings to the initial GA4 page view.
- Do not claim that a Google-certified CMP is live.
- Preview and ordinary local builds fail closed unless valid Analytics variables are explicitly supplied.

---

### Task 1: Restore consent-safe GA4 configuration

**Files:**
- Modify: `tests/source-contract.test.mjs`
- Modify: `src/config/site.ts`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `.env.example`

**Interfaces:**
- Consumes: `PUBLIC_ANALYTICS_ENABLED?: string`, `PUBLIC_ANALYTICS_ID?: string`
- Produces: `site.analyticsEnabled: boolean`, `site.analyticsId: string`

- [ ] **Step 1: Write the failing source-contract tests**

Add assertions that require:

```js
assert.match(siteConfig, /PUBLIC_ANALYTICS_ENABLED/);
assert.match(siteConfig, /PUBLIC_ANALYTICS_ID/);
assert.match(siteConfig, /\^G-\[A-Z0-9\]\{8,\}\$/);
assert.match(layout, /gtag\('consent', 'default'/);
for (const consent of ['analytics_storage', 'ad_storage', 'ad_user_data', 'ad_personalization']) {
  assert.match(layout, new RegExp(`${consent}: 'denied'`));
}
assert.match(layout, /gtag\('set', 'ads_data_redaction', true\)/);
assert.match(layout, /allow_google_signals: false/);
assert.match(layout, /allow_ad_personalization_signals: false/);
assert.match(layout, /window\.location\.origin \+ window\.location\.pathname/);
assert.ok(layout.indexOf("gtag('consent', 'default'") < layout.indexOf('googletagmanager.com/gtag/js'));
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
node --experimental-strip-types --test --test-name-pattern "analytics configuration|shared head" tests/source-contract.test.mjs
```

Expected: FAIL because the current site configuration and shared head contain no Analytics integration.

- [ ] **Step 3: Implement validated configuration**

Add before the exported site object:

```ts
const analyticsId = import.meta.env.PUBLIC_ANALYTICS_ID?.trim() ?? '';
const analyticsIdIsValid = /^G-[A-Z0-9]{8,}$/.test(analyticsId);
```

Add to `site`:

```ts
analyticsEnabled: import.meta.env.PUBLIC_ANALYTICS_ENABLED === 'true' && analyticsIdIsValid,
analyticsId,
```

- [ ] **Step 4: Add the consent-default and GA4 blocks**

Inside the shared `<head>`, before the Google loader:

```astro
{site.analyticsEnabled && (
  <>
    <script is:inline>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
      gtag('set', 'ads_data_redaction', true);
    </script>
    <script is:inline async src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(site.analyticsId)}`}></script>
    <script is:inline define:vars={{ analyticsId: site.analyticsId }}>
      gtag('js', new Date());
      gtag('config', analyticsId, {
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        page_location: window.location.origin + window.location.pathname,
        page_path: window.location.pathname,
      });
    </script>
  </>
)}
```

- [ ] **Step 5: Document optional local variables**

Append:

```dotenv
PUBLIC_ANALYTICS_ENABLED=false
PUBLIC_ANALYTICS_ID=
```

- [ ] **Step 6: Run tests and verify GREEN**

Run:

```powershell
npm test
```

Expected: every source test passes.

- [ ] **Step 7: Commit**

```powershell
git add tests/source-contract.test.mjs src/config/site.ts src/layouts/BaseLayout.astro .env.example
git commit -m "feat(analytics): restore consent-safe GA4"
```

---

### Task 2: Restore narrow Analytics delivery and truthful disclosures

**Files:**
- Modify: `tests/source-contract.test.mjs`
- Modify: `tests/built-site.test.mjs`
- Modify: `worker/index.ts`
- Modify: `.github/workflows/deploy-production.yml`
- Modify: `src/pages/privacy.astro`

**Interfaces:**
- Consumes: `site.analyticsEnabled`, `site.analyticsId`
- Produces: production CSP and workflow that allow GA4 and Cloudflare Web Analytics but no advertising origins

- [ ] **Step 1: Write failing CSP, workflow, Privacy, and build assertions**

Require the source to contain:

```js
assert.match(worker, /https:\/\/static\.cloudflareinsights\.com/);
assert.match(worker, /https:\/\/www\.googletagmanager\.com/);
assert.match(worker, /https:\/\/\*\.google-analytics\.com/);
assert.doesNotMatch(worker, /no-transform/);
assert.doesNotMatch(worker, /profitableratecpmnetwork|highrevenueformat|googlesyndication|doubleclick/i);
assert.match(workflow, /PUBLIC_ANALYTICS_ENABLED:\s*\$\{\{ vars\.PUBLIC_ANALYTICS_ENABLED \}\}/);
assert.match(workflow, /PUBLIC_ANALYTICS_ID:\s*\$\{\{ vars\.PUBLIC_ANALYTICS_ID \}\}/);
assert.match(workflow, /name: Validate Analytics configuration/);
assert.match(privacy, /cookieless measurement pings/i);
assert.match(privacy, /Cloudflare Web Analytics is <strong>enabled<\/strong>/i);
assert.match(privacy, /Adsterra advertising units are disabled/i);
```

For generated HTML, branch on:

```js
const analyticsEnabled = process.env.PUBLIC_ANALYTICS_ENABLED === 'true';
const analyticsId = process.env.PUBLIC_ANALYTICS_ID?.trim() ?? '';
const validAnalytics = analyticsEnabled && /^G-[A-Z0-9]{8,}$/.test(analyticsId);
```

When `validAnalytics` is true, assert one Google loader, denied consent defaults, and the configured ID. Otherwise assert no Google loader.

- [ ] **Step 2: Run focused tests and verify RED**

```powershell
node --experimental-strip-types --test --test-name-pattern "workflow|CSP|trust pages|launch routes" tests/source-contract.test.mjs tests/built-site.test.mjs
```

Expected: FAIL because Analytics origins, variables, and enabled-state disclosure are absent.

- [ ] **Step 3: Update the Worker**

Remove the HTML `Cache-Control: no-transform` mutation. Set the CSP to:

```ts
"default-src 'self'; base-uri 'self'; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com; form-action 'self'; frame-ancestors 'none'; img-src 'self' data: https://*.google-analytics.com https://www.googletagmanager.com; object-src 'none'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://www.googletagmanager.com https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'"
```

- [ ] **Step 4: Restore only Analytics workflow variables and guard**

Add:

```yaml
PUBLIC_ANALYTICS_ENABLED: ${{ vars.PUBLIC_ANALYTICS_ENABLED }}
PUBLIC_ANALYTICS_ID: ${{ vars.PUBLIC_ANALYTICS_ID }}
```

Before the advertising guard, add:

```yaml
- name: Validate Analytics configuration
  run: node -e "const enabled = process.env.PUBLIC_ANALYTICS_ENABLED; const id = (process.env.PUBLIC_ANALYTICS_ID ?? '').trim(); if (!['true', 'false'].includes(enabled)) { console.error('::error::PUBLIC_ANALYTICS_ENABLED must be true or false.'); process.exit(1); } if (enabled === 'true' && !/^G-[A-Z0-9]{8,}$/.test(id)) { console.error('::error::PUBLIC_ANALYTICS_ID must be a valid GA4 measurement ID when analytics is enabled.'); process.exit(1); }"
```

Keep `PUBLIC_ADSENSE_ENABLED: "false"` and restore no Adsterra variables.

- [ ] **Step 5: Make Privacy conditional and accurate**

Import `site`. For `site.analyticsEnabled`, state that GA4 is enabled with all four consent categories defaulted to denied, may send cookieless pings, does not enable Analytics/advertising cookies before a future consent update, strips query strings from the configured page location, and disables Google Signals/ad personalization. For the disabled build, state that GA4 is disabled in that build.

Unconditionally state that Cloudflare Web Analytics is enabled on the production domain for aggregate traffic and performance measurement, Cloudflare infrastructure/security processing continues, and Adsterra and AdSense advertising are disabled.

- [ ] **Step 6: Run source tests and verify GREEN**

```powershell
npm test
```

Expected: every source test passes.

- [ ] **Step 7: Commit**

```powershell
git add tests/source-contract.test.mjs tests/built-site.test.mjs worker/index.ts .github/workflows/deploy-production.yml src/pages/privacy.astro
git commit -m "legal(analytics): retain measurement without ads"
```

---

### Task 3: Verify both build modes and release

**Files:**
- Modify only if a failing assertion reveals a real requirement gap.

**Interfaces:**
- Consumes: existing GitHub `PUBLIC_ANALYTICS_ENABLED=true` and valid `PUBLIC_ANALYTICS_ID`
- Produces: verified Preview and production deployments with analytics requests present and ad requests absent

- [ ] **Step 1: Verify the analytics-off build**

```powershell
$env:PUBLIC_ANALYTICS_ENABLED = 'false'
Remove-Item Env:PUBLIC_ANALYTICS_ID -ErrorAction SilentlyContinue
npm run validate
npm run check
npm run build
npm run audit:adsense
npm run test:built
```

Expected: 34 guides validate; checks, build, audit, and generated-site tests pass; generated HTML contains no GA4 tag or advertising runtime.

- [ ] **Step 2: Verify the analytics-on build with the existing repository variable**

```powershell
$analyticsId = gh variable get PUBLIC_ANALYTICS_ID
if ($analyticsId -notmatch '^G-[A-Z0-9]{8,}$') { throw 'Existing GA4 ID is missing or invalid.' }
$env:PUBLIC_ANALYTICS_ENABLED = 'true'
$env:PUBLIC_ANALYTICS_ID = $analyticsId
npm run build
npm run audit:adsense
npm run test:built
```

Expected: every generated page has one valid GA4 loader and denied consent defaults, Privacy reports enabled analytics, and advertising-runtime scans remain clean.

- [ ] **Step 3: Scan the configured output**

```powershell
rg -n -i "profitableratecpmnetwork|highrevenueformat|atOptions|invoke\.js|adsbygoogle|googlesyndication|doubleclick|popunder|social bar|interstitial|direct link" dist
```

Expected: no executable advertising result.

- [ ] **Step 4: Deploy and inspect Preview**

With the validated Analytics environment still set:

```powershell
npm run deploy:preview
```

Use a new Playwright session to confirm the Preview:

- loads the Google tag and sends only Google Analytics requests;
- has no Adsterra, AdSense, DoubleClick, popup, redirect, or new-window activity;
- has no console errors;
- keeps Search functional and the Preview response noindex.

- [ ] **Step 5: Merge and publish production**

```powershell
git push origin feat/adsense-readiness-howtofish
git switch main
git pull --ff-only origin main
git merge --ff-only feat/adsense-readiness-howtofish
npm test
git push origin main
```

Wait for the existing production workflow and require a successful conclusion for the final commit.

- [ ] **Step 6: Verify production network behavior**

Use a fresh browser context and require:

- one GA4 loader;
- Google Analytics collection requests with denied consent status;
- one Cloudflare Web Analytics beacon and same-origin RUM request;
- no `_ga` cookie while `analytics_storage` remains denied;
- no Adsterra, AdSense, DoubleClick, popunder, Social Bar, interstitial, or Direct Link request;
- Search returns results;
- canonical, sitemap, and noindex rules remain correct;
- no console or page errors.

- [ ] **Step 7: Final repository evidence**

```powershell
git status --short
git diff --check
git rev-parse HEAD
git rev-parse origin/main
git rev-parse origin/feat/adsense-readiness-howtofish
```

Expected: clean worktree and all three commit IDs match.
