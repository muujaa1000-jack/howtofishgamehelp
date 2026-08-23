# Google Analytics 4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the site's GA4 property and deploy an immediate-loading, production-only Google Analytics integration that is verified by a real-time event.

**Architecture:** The existing public Astro layout conditionally emits one standard Google tag from the existing public environment configuration. GitHub Actions supplies the production-only enable switch and public measurement ID, while the Cloudflare Worker permits only the Google tag and collection hosts required by GA4. The privacy page renders accurate copy for both analytics-disabled local builds and the enabled production build.

**Tech Stack:** Astro 7, TypeScript 6, Node.js 22.12, Node test runner, GitHub Actions, Cloudflare Workers, Google Analytics 4.

## Global Constraints

- Published site content is English.
- Use TypeScript and keep the site static-first, mobile-first, and low-JavaScript.
- Do not add a production dependency.
- Load GA4 immediately only in a build where the GitHub repository variable `PUBLIC_ANALYTICS_ENABLED=true` and `PUBLIC_ANALYTICS_ID` is a valid GA4 measurement ID.
- Keep local and preview builds analytics-off.
- Keep advertising, Google Signals, and ad-personalization signals disabled.
- Do not write the real measurement ID into tracked source, documentation, examples, screenshots, or Git history.
- Do not alter unrelated Analytics accounts, properties, streams, users, permissions, GitHub settings, or Cloudflare settings.
- If Google requires creation of a new Analytics account rather than a property in an existing account, stop for separate user confirmation.
- Use a failing test before each production code change.
- Run the production build, type check, content validation, duplicate metadata check, internal-link check, dependency audit, and basic page tests before deployment.

## File map

- `src/config/site.ts`: normalize and validate the public GA4 measurement ID and expose the enabled state.
- `src/layouts/BaseLayout.astro`: emit the single production Google tag shared by every page.
- `src/pages/privacy.astro`: disclose the enabled analytics behavior without changing unrelated legal content.
- `worker/index.ts`: permit the minimum Google tag and Analytics collection origins in the Content Security Policy.
- `.github/workflows/deploy-production.yml`: supply production analytics configuration and stop before building when the repository variable is invalid.
- `tests/built-site.test.mjs`: verify generated output in analytics-enabled and analytics-disabled builds.
- `tests/source-contract.test.mjs`: verify source, security policy, and workflow safety contracts.

Official references:

- [Set up Analytics for a website](https://support.google.com/analytics/answer/9304153?hl=en)
- [Google tag Content Security Policy guidance](https://developers.google.com/tag-platform/security/guides/csp)

---

### Task 1: Conditional GA4 tag

**Files:**
- Modify: `tests/built-site.test.mjs`
- Modify: `src/config/site.ts`
- Modify: `src/layouts/BaseLayout.astro`

**Interfaces:**
- Consumes: `PUBLIC_ANALYTICS_ENABLED?: string` and `PUBLIC_ANALYTICS_ID?: string` from Astro public build-time environment variables.
- Produces: `site.analyticsEnabled: boolean` and `site.analyticsId: string`; when enabled, each `BaseLayout` document contains one asynchronous Google tag loader and one `gtag('config', ...)` initialization.

- [ ] **Step 1: Add the enabled-output regression test**

Add these constants beside `contactEmailEnabled` in `tests/built-site.test.mjs`:

```js
const analyticsId = process.env.PUBLIC_ANALYTICS_ID?.trim() ?? '';
const analyticsEnabled =
  process.env.PUBLIC_ANALYTICS_ENABLED === 'true' &&
  /^G-[A-Z0-9]{8,}$/.test(analyticsId);
```

In the representative-route test, read one guide and verify both pages:

```js
  const guide = await text('bosses/spider-crab/index.html');
  for (const html of [home, guide]) {
    if (analyticsEnabled) {
      assert.equal(
        (html.match(/www\.googletagmanager\.com\/gtag\/js/g) ?? []).length,
        1,
        'enabled pages must load one Google tag',
      );
      assert.match(html, new RegExp(analyticsId));
      assert.match(html, /gtag\(['"]config['"],\s*analyticsId/);
      assert.match(html, /allow_google_signals:\s*false/);
      assert.match(html, /allow_ad_personalization_signals:\s*false/);
    } else {
      assert.doesNotMatch(html, /googletagmanager\.com|google-analytics\.com|gtag\(/);
    }
  }
```

Replace the unconditional GA4-ID rejection in the corpus test with:

```js
  if (analyticsEnabled) {
    assert.match(corpus, new RegExp(analyticsId));
  } else {
    assert.doesNotMatch(corpus, /(?:^|[^A-Za-z0-9])G-[A-Z0-9]{8,}(?:$|[^A-Za-z0-9])/m);
  }
```

- [ ] **Step 2: Run the enabled build and verify RED**

Run in one PowerShell session:

```powershell
$env:PUBLIC_ANALYTICS_ENABLED = 'true'
$env:PUBLIC_ANALYTICS_ID = ('G-' + 'TEST123456')
npm run build
npm run test:built
Remove-Item Env:PUBLIC_ANALYTICS_ENABLED
Remove-Item Env:PUBLIC_ANALYTICS_ID
```

Expected: the generated-site test fails with `enabled pages must load one Google tag`, because `BaseLayout.astro` does not yet emit the tag.

- [ ] **Step 3: Validate configuration and emit the minimal tag**

At the top of `src/config/site.ts`, before `export const site`, add:

```ts
const analyticsId = import.meta.env.PUBLIC_ANALYTICS_ID?.trim() ?? '';
const analyticsIdIsValid = /^G-[A-Z0-9]{8,}$/.test(analyticsId);
```

Replace the two analytics properties in `site` with:

```ts
  analyticsEnabled: import.meta.env.PUBLIC_ANALYTICS_ENABLED === 'true' && analyticsIdIsValid,
  analyticsId,
```

In `src/layouts/BaseLayout.astro`, immediately before the JSON-LD script, add:

```astro
    {site.analyticsEnabled && (
      <>
        <script is:inline async src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(site.analyticsId)}`}></script>
        <script is:inline define:vars={{ analyticsId: site.analyticsId }}>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', analyticsId, {
            allow_google_signals: false,
            allow_ad_personalization_signals: false,
          });
        </script>
      </>
    )}
```

- [ ] **Step 4: Verify GREEN in enabled and disabled builds**

Run:

```powershell
$env:PUBLIC_ANALYTICS_ENABLED = 'true'
$env:PUBLIC_ANALYTICS_ID = ('G-' + 'TEST123456')
npm run build
npm run test:built
Remove-Item Env:PUBLIC_ANALYTICS_ENABLED
Remove-Item Env:PUBLIC_ANALYTICS_ID
npm run build
npm run test:built
```

Expected: both generated-site test runs pass. The first build contains the tag; the second contains no Google tag or GA4 ID.

- [ ] **Step 5: Commit the focused integration**

```powershell
git add -- tests/built-site.test.mjs src/config/site.ts src/layouts/BaseLayout.astro
git commit -m "feat: add conditional GA4 tag"
```

### Task 2: Privacy disclosure and Content Security Policy

**Files:**
- Modify: `tests/source-contract.test.mjs`
- Modify: `tests/built-site.test.mjs`
- Modify: `src/pages/privacy.astro`
- Modify: `worker/index.ts`

**Interfaces:**
- Consumes: `site.analyticsEnabled` from Task 1.
- Produces: enabled-state privacy text and a Worker CSP that permits `www.googletagmanager.com` scripts plus HTTPS collection requests and image fallbacks to `*.google-analytics.com`.

- [ ] **Step 1: Add privacy and CSP regression tests**

In the first generated-site test in `tests/built-site.test.mjs`, add:

```js
  const privacy = await text('privacy/index.html');
  if (analyticsEnabled) {
    assert.match(privacy, /Google Analytics is <strong>enabled<\/strong>/);
    assert.match(privacy, /Google may process page views/);
    assert.match(privacy, /https:\/\/policies\.google\.com\/privacy/);
    assert.match(privacy, /https:\/\/tools\.google\.com\/dlpage\/gaoptout/);
    assert.doesNotMatch(privacy, /analytics-off launch configuration/);
  } else {
    assert.match(privacy, /Google Analytics is <strong>disabled<\/strong>/);
  }
```

Add this test to `tests/source-contract.test.mjs`:

```js
test('worker CSP permits only the required Google Analytics origins', async () => {
  const worker = await text('worker/index.ts');
  assert.match(worker, /script-src[^"]*https:\/\/www\.googletagmanager\.com/);
  assert.match(worker, /connect-src[^"]*https:\/\/\*\.google-analytics\.com/);
  assert.match(worker, /img-src[^"]*https:\/\/\*\.google-analytics\.com/);
  assert.doesNotMatch(worker, /script-src[^"]*https:\/\/\*/);
});
```

- [ ] **Step 2: Verify RED**

Run:

```powershell
node --test tests/source-contract.test.mjs
$env:PUBLIC_ANALYTICS_ENABLED = 'true'
$env:PUBLIC_ANALYTICS_ID = ('G-' + 'TEST123456')
npm run build
npm run test:built
Remove-Item Env:PUBLIC_ANALYTICS_ENABLED
Remove-Item Env:PUBLIC_ANALYTICS_ID
```

Expected: the source-contract test fails because the CSP lacks Google origins, and the built-site test fails because the privacy page still describes analytics as disabled.

- [ ] **Step 3: Add the enabled-state privacy copy**

Replace `src/pages/privacy.astro` with:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { site } from '../config/site';
---
<BaseLayout title="Privacy Policy" description="How to Fish Game Help explains its analytics, hosting, advertising, and visitor-data practices." canonicalPath="/privacy/">
  <article class="narrow section prose">
    <p class="eyebrow">Effective August 23, 2026</p>
    <h1>Privacy policy</h1>
    <p>This site serves static pages. Advertising is <strong>{site.adsEnabled ? 'enabled' : 'disabled'}</strong> and Google Analytics is <strong>{site.analyticsEnabled ? 'enabled' : 'disabled'}</strong>.</p>
    {site.analyticsEnabled ? (
      <>
        <h2>Google Analytics</h2>
        <p>We use Google Analytics to understand visits and improve these guides. Google may process page views, referral information, device and browser information, approximate location, and analytics identifiers or cookies. We have disabled Google Signals and ad-personalization signals.</p>
        <p>Learn how Google handles information in its <a href="https://policies.google.com/privacy">privacy policy</a>. You can limit cookies in your browser or use the <a href="https://tools.google.com/dlpage/gaoptout">Google Analytics opt-out add-on</a>.</p>
      </>
    ) : (
      <>
        <h2>Analytics</h2>
        <p>Google Analytics is disabled in this version of the site, so this site does not set its own analytics cookies.</p>
      </>
    )}
    <h2>Data we do not collect directly</h2>
    <p>There are no user accounts, comments, purchases, newsletters, or contact forms. We do not send account, purchase, form, or user-ID data to Google Analytics.</p>
    <h2>Hosting logs</h2>
    <p>Cloudflare may process limited request data such as IP address, browser information, requested URL, and security signals to deliver and protect the site. Those infrastructure logs are governed by Cloudflare’s practices.</p>
    <h2>External links</h2>
    <p>Links to Steam, developer pages, media, videos, community sources, Google policies, and opt-out tools take you to third-party sites with their own privacy policies.</p>
    <h2>Changes</h2>
    <p>This page will be updated when the site's analytics, advertising, or data-collection practices change.</p>
  </article>
</BaseLayout>
```

- [ ] **Step 4: Add the narrow CSP allowances**

Replace the `Content-Security-Policy` value in `worker/index.ts` with:

```ts
  'Content-Security-Policy': "default-src 'self'; base-uri 'self'; connect-src 'self' https://*.google-analytics.com; form-action 'self'; frame-ancestors 'none'; img-src 'self' data: https://*.google-analytics.com; object-src 'none'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'",
```

- [ ] **Step 5: Verify GREEN**

Run:

```powershell
node --test tests/source-contract.test.mjs
$env:PUBLIC_ANALYTICS_ENABLED = 'true'
$env:PUBLIC_ANALYTICS_ID = ('G-' + 'TEST123456')
npm run build
npm run test:built
Remove-Item Env:PUBLIC_ANALYTICS_ENABLED
Remove-Item Env:PUBLIC_ANALYTICS_ID
```

Expected: both test commands pass with no failures.

- [ ] **Step 6: Commit privacy and CSP**

```powershell
git add -- tests/source-contract.test.mjs tests/built-site.test.mjs src/pages/privacy.astro worker/index.ts
git commit -m "feat: disclose and permit GA4 traffic"
```

### Task 3: Production workflow guard

**Files:**
- Modify: `tests/source-contract.test.mjs`
- Modify: `.github/workflows/deploy-production.yml`

**Interfaces:**
- Consumes: GitHub Actions repository variable `PUBLIC_ANALYTICS_ID`.
- Produces: production build variables `PUBLIC_ANALYTICS_ENABLED` and `PUBLIC_ANALYTICS_ID`, with a pre-build guard that requires a boolean switch and requires the ID to match `^G-[A-Z0-9]{8,}$` whenever the switch is true.

- [ ] **Step 1: Add the workflow regression test**

In the production workflow test in `tests/source-contract.test.mjs`, add:

```js
  assert.match(workflow, /PUBLIC_ANALYTICS_ENABLED:\s*\$\{\{ vars\.PUBLIC_ANALYTICS_ENABLED \}\}/);
  assert.match(workflow, /PUBLIC_ANALYTICS_ID:\s*\$\{\{ vars\.PUBLIC_ANALYTICS_ID \}\}/);
  assert.match(workflow, /name: Validate Analytics configuration/);
  assert.match(workflow, /process\.env\.PUBLIC_ANALYTICS_ENABLED/);
  assert.match(workflow, /\^G-\[A-Z0-9\]\{8,\}\$/);
  assert.ok(
    workflow.indexOf('Validate Analytics configuration') < workflow.indexOf('npm run build'),
    'analytics configuration must be validated before the production build',
  );
```

- [ ] **Step 2: Verify RED**

Run:

```powershell
node --test tests/source-contract.test.mjs
```

Expected: the production workflow test fails because the analytics environment and guard are absent.

- [ ] **Step 3: Add production variables and the guard**

In the workflow job's `env` block, add:

```yaml
      PUBLIC_ANALYTICS_ENABLED: ${{ vars.PUBLIC_ANALYTICS_ENABLED }}
      PUBLIC_ANALYTICS_ID: ${{ vars.PUBLIC_ANALYTICS_ID }}
```

Immediately before `Build production site`, add:

```yaml
      - name: Validate Analytics configuration
        run: node -e "const enabled = process.env.PUBLIC_ANALYTICS_ENABLED; const id = process.env.PUBLIC_ANALYTICS_ID ?? ''; if (!['true', 'false'].includes(enabled)) { console.error('::error::PUBLIC_ANALYTICS_ENABLED must be true or false.'); process.exit(1); } if (enabled === 'true' && !/^G-[A-Z0-9]{8,}$/.test(id)) { console.error('::error::PUBLIC_ANALYTICS_ID must be a GA4 measurement ID when analytics is enabled.'); process.exit(1); }"
```

- [ ] **Step 4: Verify GREEN**

Run:

```powershell
node --test tests/source-contract.test.mjs
```

Expected: the workflow contract passes, including the order check.

- [ ] **Step 5: Commit the deployment guard**

```powershell
git add -- tests/source-contract.test.mjs .github/workflows/deploy-production.yml
git commit -m "ci: require production GA4 configuration"
```

### Task 4: GA4 property, stream, and GitHub variable

**Files:**
- No tracked file changes.

**Interfaces:**
- Consumes: the user's authorized, currently signed-in Google session and existing Google Analytics account.
- Produces: one GA4 property named `How to Fish Game Help`, one web stream for `https://howtofishgamehelp.com`, and the GitHub repository variables `PUBLIC_ANALYTICS_ENABLED=true` and `PUBLIC_ANALYTICS_ID`.

- [ ] **Step 1: Open Google Analytics and confirm the account boundary**

Use the Chrome-control skill to open `https://analytics.google.com/`. Confirm the visible signed-in identity and existing Analytics account before making changes. Do not expose the account email in tool output or the final reply.

If there is no existing Analytics account, stop and ask for approval to create one. If login, a security challenge, or acceptance of new legal terms is required, leave that step to the user and resume after it succeeds.

- [ ] **Step 2: Create the property**

In Admin, choose `Create property` and enter:

- Property name: `How to Fish Game Help`
- Reporting time zone: `United States` / `New York Time`
- Currency: `United States Dollar (USD)`

If business details are requested, select `Games`, `Small - 1 to 10 employees`, and the objective closest to `Examine user behavior`. Accept no advertising linkage, data sharing expansion, or unrelated product connection.

- [ ] **Step 3: Create the web stream**

Choose `Web`, then enter:

- Website URL: `https://howtofishgamehelp.com`
- Stream name: `How to Fish Game Help`

Keep standard enhanced measurement enabled. Do not create another stream if the wizard already created the exact URL/name pair. On the stream-details screen, verify the property name, stream URL, and measurement ID format.

- [ ] **Step 4: Store the copied measurement ID as a GitHub variable**

Copy the measurement ID from the stream-details screen, then run:

```powershell
$gaMeasurementId = (Get-Clipboard).Trim()
if ($gaMeasurementId -notmatch '^G-[A-Z0-9]{8,}$') {
  throw 'The copied value is not a valid GA4 measurement ID.'
}
gh variable set PUBLIC_ANALYTICS_ID --body $gaMeasurementId
gh variable set PUBLIC_ANALYTICS_ENABLED --body true
gh api repos/muujaa1000-jack/howtofishgamehelp/actions/variables/PUBLIC_ANALYTICS_ID --jq '{name, created_at, updated_at}'
gh api repos/muujaa1000-jack/howtofishgamehelp/actions/variables/PUBLIC_ANALYTICS_ENABLED --jq '{name, created_at, updated_at}'
Remove-Variable gaMeasurementId
```

Expected: the readbacks return both variable names and timestamps without printing either value.

- [ ] **Step 5: Verify remote configuration without another write**

Read the Google Analytics stream-details screen again and confirm:

- property name is `How to Fish Game Help`;
- time zone is New York / United States Eastern;
- currency is USD;
- stream URL is exactly `https://howtofishgamehelp.com`;
- only one matching web stream exists.

### Task 5: Full verification, deployment, and real-time receipt

**Files:**
- Verify all files changed in Tasks 1-3.

**Interfaces:**
- Consumes: clean committed code from Tasks 1-3 and the verified GitHub variable from Task 4.
- Produces: successful local checks, a successful production workflow deployment, live response verification, and one received GA4 real-time visit.

- [ ] **Step 1: Run the complete local verification**

Run in one PowerShell session:

```powershell
npm audit --audit-level=high
npm run validate
node --test tests/source-contract.test.mjs tests/content-quality.test.mjs tests/validate-script.test.mjs
npm run check

$gaMeasurementId = gh variable get PUBLIC_ANALYTICS_ID
$gaEnabled = gh variable get PUBLIC_ANALYTICS_ENABLED
if ($gaMeasurementId -notmatch '^G-[A-Z0-9]{8,}$') {
  throw 'GitHub does not contain a valid PUBLIC_ANALYTICS_ID.'
}
if ($gaEnabled -ne 'true') {
  throw 'GitHub does not have PUBLIC_ANALYTICS_ENABLED set to true.'
}
$env:PUBLIC_ANALYTICS_ENABLED = 'true'
$env:PUBLIC_ANALYTICS_ID = $gaMeasurementId
npm run build
npm run test:built
Remove-Item Env:PUBLIC_ANALYTICS_ENABLED
Remove-Item Env:PUBLIC_ANALYTICS_ID
Remove-Variable gaMeasurementId
Remove-Variable gaEnabled

npm run build
npm test
git diff --check
git status --short
```

Expected: the audit has no high-severity failure; validation reports zero errors; type checks, both builds, source tests, duplicate metadata checks, internal-link checks, sitemap checks, and basic page tests pass; `git diff --check` prints nothing; `git status --short` is empty.

- [ ] **Step 2: Review the commits before publishing**

Run:

```powershell
git log --oneline --decorate origin/main..HEAD
git diff --stat origin/main..HEAD
```

Expected: only the approved Analytics design, plan, conditional tag, privacy/CSP, workflow guard, and their tests are ahead of `origin/main`.

- [ ] **Step 3: Push and wait for the production workflow**

Run:

```powershell
git push origin main
$latestRun = gh run list --workflow deploy-production.yml --branch main --limit 1 --json databaseId,headSha,status,conclusion | ConvertFrom-Json
if ($latestRun.headSha -ne (git rev-parse HEAD)) {
  throw 'The latest deployment run does not match the pushed commit.'
}
gh run watch $latestRun.databaseId --exit-status
```

Expected: the workflow reaches `completed` with conclusion `success`.

- [ ] **Step 4: Verify the live source and security headers**

Run:

```powershell
$gaMeasurementId = gh variable get PUBLIC_ANALYTICS_ID
$response = Invoke-WebRequest -Uri 'https://howtofishgamehelp.com/' -UseBasicParsing
$loaderCount = ([regex]::Matches($response.Content, 'www\.googletagmanager\.com/gtag/js')).Count
$idCount = ([regex]::Matches($response.Content, [regex]::Escape($gaMeasurementId))).Count
$csp = [string]$response.Headers['Content-Security-Policy']
if ($response.StatusCode -ne 200 -or $loaderCount -ne 1 -or $idCount -lt 2) {
  throw 'The live page does not contain the expected single GA4 integration.'
}
if ($csp -notmatch 'www\.googletagmanager\.com' -or $csp -notmatch 'google-analytics\.com') {
  throw 'The live CSP does not permit the required GA4 traffic.'
}
Remove-Variable gaMeasurementId
```

Expected: no exception; the homepage is HTTP 200, contains one Google tag loader and the configured ID in both loader and initialization, and returns the required CSP.

- [ ] **Step 5: Verify a real GA4 event**

Use Chrome control to open `https://howtofishgamehelp.com/` in a normal tab with extensions that block analytics disabled for this check. In Google Analytics, open `Reports > Realtime` for `How to Fish Game Help` and use the stream's real-time or DebugView controls if needed.

Wait with bounded read-only refreshes for up to five minutes. Completion requires a current active user or `page_view` attributable to the verification visit. If no event appears, inspect the browser network request and console, the live CSP, and the selected GA4 stream before changing code; do not create a duplicate stream or property.

- [ ] **Step 6: Use the configuration rollback only if the live site regresses**

If the site regresses after deployment, disable collection without deleting the GA4 property or changing its stream:

```powershell
gh variable set PUBLIC_ANALYTICS_ENABLED --body false
$previousRunId = gh run list --workflow deploy-production.yml --branch main --limit 1 --json databaseId --jq '.[0].databaseId'
gh workflow run deploy-production.yml
for ($attempt = 0; $attempt -lt 15; $attempt++) {
  Start-Sleep -Seconds 2
  $rollbackRun = gh run list --workflow deploy-production.yml --branch main --limit 1 --json databaseId | ConvertFrom-Json
  if ([string]$rollbackRun.databaseId -ne [string]$previousRunId) { break }
}
if ([string]$rollbackRun.databaseId -eq [string]$previousRunId) {
  throw 'No rollback workflow run appeared.'
}
gh run watch $rollbackRun.databaseId --exit-status
$rollbackPage = Invoke-WebRequest -Uri 'https://howtofishgamehelp.com/' -UseBasicParsing
if ($rollbackPage.Content -match 'googletagmanager\.com|gtag\(') {
  throw 'The rollback deployment still contains Google Analytics.'
}
```

Expected when this contingency is used: the workflow succeeds and the live page contains no Google tag. Keep the property and measurement ID unchanged for diagnosis.

- [ ] **Step 7: Record the verified outcome**

Update the task with four independent results:

- Google property and stream readback;
- GitHub variable and workflow success;
- live source/header verification;
- GA4 real-time receipt.

If any result is missing, report that result as unverified rather than claiming the integration complete.
