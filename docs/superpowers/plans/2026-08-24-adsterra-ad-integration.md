# Adsterra Low-Interruption Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the two approved Adsterra units to concrete guide pages only, with structure-safe placement, inert non-production placeholders, accurate privacy disclosure, narrow CSP changes, verified mobile layout, and a controlled production release.

**Architecture:** Parse Astro's eagerly rendered guide HTML with `parse5` during `getStaticPaths()`, split only between complete top-level nodes after the full `h2#quick-steps` section, and pass the two safe fragments to the article renderer around a dedicated 320x50 component. Render the Native component from `GuideLayout.astro` after the complete source section. Resolve placeholder/live/off behavior from one pure environment policy and one Astro configuration module.

**Tech Stack:** Astro 7.2.4, TypeScript 6, Astro content collections, parse5 8.0.1 as a build-only development dependency, Node test runner, Pagefind, Cloudflare Workers Static Assets, GitHub Actions.

## Global Constraints

- Do not change the framework, Cloudflare project, domain, or existing URL structure.
- Do not modify any of the 31 guide Markdown files.
- Only Native Banner unit `30895300` and Banner 320x50 unit `30895328` are allowed.
- Do not add Social Bar, Popunder, Interstitial, Smartlink, Direct Link, or another advertising format.
- Do not use client-side DOM lookup, movement, lifecycle reinjection, fixed positioning, sticky positioning, iframe scaling, iframe clipping, or automated ad clicks.
- Preserve the supplied Adsterra script URLs, key, attributes, container ID, classic-script behavior, and execution order exactly.
- Local development, CI, ordinary builds, and ordinary previews must contain inert placeholders and make no Adsterra requests.
- Real code requires a production build, `PUBLIC_ADS_DEPLOYMENT=production`, the total switch, and the corresponding unit switch.
- A missing Quick steps boundary skips only the 320x50 unit for that route, logs the route, and appears in the build summary.
- Fail the build only when at least 80% of guide routes cannot be split.
- Keep internal `priority` and `verificationStatus` data while removing public `P0`, `P1`, `P2`, and metadata-label `mixed` displays.
- Do not weaken CSP with broad wildcard sources or delete the existing CSP.
- Never click a real advertisement or use repeated/batch real-ad page loads.

---

### Task 1: Structure-safe guide content splitter

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/lib/ads/splitGuideContent.ts`
- Create: `tests/ad-placement.test.mjs`

**Interfaces:**
- Produces: `splitGuideContentAfterQuickSteps(html, route): GuideContentSplitResult`.
- Produces: `summarizeGuideAdPlacements(results): GuidePlacementSummary`.
- A successful result contains `status: 'split'`, `route`, `beforeBanner`, and `afterBanner`.
- A skipped result contains `status: 'skipped'`, `route`, and `reason`.

- [ ] **Step 1: Write the failing node-boundary tests**

Create `tests/ad-placement.test.mjs`:

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  splitGuideContentAfterQuickSteps,
  summarizeGuideAdPlacements,
} from '../src/lib/ads/splitGuideContent.ts';

test('splits after every complete node in the Quick steps section', () => {
  const html = [
    '<p>Opening</p>',
    '<h2 id="quick-steps">Quick steps</h2>',
    '<p>Read this first.</p>',
    '<ol><li><a href="/one/">One</a></li><li><code>Two</code></li></ol>',
    '<h2 id="details">Details</h2>',
    '<p>More detail.</p>',
  ].join('');

  const result = splitGuideContentAfterQuickSteps(html, '/guides/example/');

  assert.equal(result.status, 'split');
  assert.match(result.beforeBanner, /<h2 id="quick-steps">Quick steps<\/h2>/);
  assert.match(result.beforeBanner, /<ol><li><a href="\/one\/">One<\/a><\/li><li><code>Two<\/code><\/li><\/ol>$/);
  assert.doesNotMatch(result.beforeBanner, /id="details"/);
  assert.match(result.afterBanner, /^<h2 id="details">Details<\/h2>/);
});

test('skips the banner when Quick steps is missing or not a top-level H2', () => {
  const missing = splitGuideContentAfterQuickSteps('<h2 id="details">Details</h2>', '/guides/missing/');
  const nested = splitGuideContentAfterQuickSteps(
    '<section><h2 id="quick-steps">Quick steps</h2><ol><li>One</li></ol></section><h2 id="details">Details</h2>',
    '/guides/nested/',
  );

  assert.deepEqual(missing, {
    status: 'skipped',
    route: '/guides/missing/',
    reason: 'top-level h2#quick-steps was not found',
  });
  assert.equal(nested.status, 'skipped');
});

test('skips the banner when no following same-level H2 establishes the boundary', () => {
  const result = splitGuideContentAfterQuickSteps(
    '<h2 id="quick-steps">Quick steps</h2><ol><li>One</li></ol>',
    '/guides/no-boundary/',
  );

  assert.deepEqual(result, {
    status: 'skipped',
    route: '/guides/no-boundary/',
    reason: 'the next top-level H2 after Quick steps was not found',
  });
});

test('summary tolerates isolated skips and fails at an 80 percent skip ratio', () => {
  const split = (route) => ({ status: 'split', route, beforeBanner: '<p>A</p>', afterBanner: '<p>B</p>' });
  const skipped = (route) => ({ status: 'skipped', route, reason: 'missing' });

  const isolated = summarizeGuideAdPlacements([
    split('/a/'), split('/b/'), split('/c/'), split('/d/'), skipped('/e/'),
  ]);
  const broadFailure = summarizeGuideAdPlacements([
    split('/a/'), skipped('/b/'), skipped('/c/'), skipped('/d/'), skipped('/e/'),
  ]);

  assert.deepEqual(isolated.skippedRoutes, ['/e/']);
  assert.equal(isolated.shouldFailBuild, false);
  assert.equal(broadFailure.skipRatio, 0.8);
  assert.equal(broadFailure.shouldFailBuild, true);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
node --experimental-strip-types --test tests/ad-placement.test.mjs
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/lib/ads/splitGuideContent.ts`.

- [ ] **Step 3: Add the approved build-only parser**

Run:

```powershell
npm install --save-dev parse5@8.0.1
```

Expected: `package.json` and `package-lock.json` add only `parse5` and its locked transitive dependency; the package remains absent from browser and Worker bundles.

- [ ] **Step 4: Implement complete-node splitting and summary policy**

Create `src/lib/ads/splitGuideContent.ts`:

```ts
import {
  parseFragment,
  serializeOuter,
  type DefaultTreeAdapterTypes,
} from 'parse5';

type ChildNode = DefaultTreeAdapterTypes.ChildNode;
type Element = DefaultTreeAdapterTypes.Element;

export interface GuideContentSplit {
  status: 'split';
  route: string;
  beforeBanner: string;
  afterBanner: string;
}

export interface GuideContentSkip {
  status: 'skipped';
  route: string;
  reason: string;
}

export type GuideContentSplitResult = GuideContentSplit | GuideContentSkip;

export interface GuidePlacementSummary {
  totalRoutes: number;
  skippedRoutes: string[];
  skipRatio: number;
  shouldFailBuild: boolean;
}

function isElement(node: ChildNode): node is Element {
  return 'tagName' in node;
}

function isTopLevelH2(node: ChildNode): node is Element {
  return isElement(node) && node.tagName === 'h2';
}

function elementId(node: Element): string | undefined {
  return node.attrs.find((attribute) => attribute.name === 'id')?.value;
}

function serializeNodes(nodes: ChildNode[]): string {
  return nodes.map((node) => serializeOuter(node)).join('');
}

export function splitGuideContentAfterQuickSteps(
  html: string | undefined,
  route: string,
): GuideContentSplitResult {
  if (!html) {
    return { status: 'skipped', route, reason: 'Astro rendered HTML was unavailable' };
  }

  const fragment = parseFragment(html);
  const nodes = fragment.childNodes;
  const quickStepsIndex = nodes.findIndex(
    (node) => isTopLevelH2(node) && elementId(node) === 'quick-steps',
  );

  if (quickStepsIndex === -1) {
    return { status: 'skipped', route, reason: 'top-level h2#quick-steps was not found' };
  }

  const nextH2Offset = nodes.slice(quickStepsIndex + 1).findIndex(isTopLevelH2);
  if (nextH2Offset === -1) {
    return {
      status: 'skipped',
      route,
      reason: 'the next top-level H2 after Quick steps was not found',
    };
  }

  const splitIndex = quickStepsIndex + 1 + nextH2Offset;
  return {
    status: 'split',
    route,
    beforeBanner: serializeNodes(nodes.slice(0, splitIndex)),
    afterBanner: serializeNodes(nodes.slice(splitIndex)),
  };
}

export function summarizeGuideAdPlacements(
  results: GuideContentSplitResult[],
): GuidePlacementSummary {
  const skippedRoutes = results
    .filter((result): result is GuideContentSkip => result.status === 'skipped')
    .map((result) => result.route);
  const totalRoutes = results.length;
  const skipRatio = totalRoutes === 0 ? 1 : skippedRoutes.length / totalRoutes;

  return {
    totalRoutes,
    skippedRoutes,
    skipRatio,
    shouldFailBuild: totalRoutes === 0 || skipRatio >= 0.8,
  };
}
```

- [ ] **Step 5: Verify GREEN and type safety**

Run:

```powershell
node --experimental-strip-types --test tests/ad-placement.test.mjs
npm run check
```

Expected: four placement tests pass; Astro and Worker TypeScript checks pass.

- [ ] **Step 6: Commit the structured splitter**

```powershell
git add -- package.json package-lock.json src/lib/ads/splitGuideContent.ts tests/ad-placement.test.mjs
git commit -m "feat: split guide content at safe ad boundaries"
```

### Task 2: Central ad modes and independent Adsterra components

**Files:**
- Create: `src/lib/ads/resolveAdMode.ts`
- Create: `src/config/ads.ts`
- Create: `src/components/ads/AdsterraBanner320x50.astro`
- Create: `src/components/ads/AdsterraNativeBanner.astro`
- Modify: `src/env.d.ts`
- Modify: `tests/ad-placement.test.mjs`
- Modify: `tests/source-contract.test.mjs`

**Interfaces:**
- Produces: `resolveAdMode(input): 'placeholder' | 'live' | 'off'`.
- Produces: `ads.banner320x50Mode` and `ads.nativeMode`.
- Components consume only their resolved mode and emit no real identifier in placeholder mode.

- [ ] **Step 1: Add failing environment and source-contract tests**

Append to `tests/ad-placement.test.mjs`:

```js
import { resolveAdMode } from '../src/lib/ads/resolveAdMode.ts';

test('ad mode is placeholder outside a marked production deployment', () => {
  assert.equal(resolveAdMode({
    isProductionBuild: false,
    deployment: 'production',
    adsEnabled: true,
    unitEnabled: true,
  }), 'placeholder');
  assert.equal(resolveAdMode({
    isProductionBuild: true,
    deployment: undefined,
    adsEnabled: true,
    unitEnabled: true,
  }), 'placeholder');
});

test('production mode is live only when both switches are enabled', () => {
  const base = { isProductionBuild: true, deployment: 'production' };
  assert.equal(resolveAdMode({ ...base, adsEnabled: true, unitEnabled: true }), 'live');
  assert.equal(resolveAdMode({ ...base, adsEnabled: false, unitEnabled: true }), 'off');
  assert.equal(resolveAdMode({ ...base, adsEnabled: true, unitEnabled: false }), 'off');
});
```

Append to `tests/source-contract.test.mjs`:

```js
test('approved Adsterra components preserve exact classic-script contracts', async () => {
  const banner = await text('src/components/ads/AdsterraBanner320x50.astro');
  const native = await text('src/components/ads/AdsterraNativeBanner.astro');

  assert.match(banner, /'key'\s*:\s*'31358e95bdfca07885ad4d825c43845b'/);
  assert.match(banner, /'format'\s*:\s*'iframe'/);
  assert.match(banner, /'height'\s*:\s*50/);
  assert.match(banner, /'width'\s*:\s*320/);
  assert.ok(
    banner.indexOf('atOptions =') < banner.indexOf('https://www.highrevenueformat.com/31358e95bdfca07885ad4d825c43845b/invoke.js'),
  );
  assert.doesNotMatch(banner, /type=["']module["']|\basync\b|\bdefer\b/);

  assert.match(native, /async="async"/);
  assert.match(native, /data-cfasync="false"/);
  assert.match(native, /https:\/\/pl30995799\.profitableratecpmnetwork\.com\/cd35885d41c8db0e720a6e017aadbf77\/invoke\.js/);
  assert.ok(
    native.indexOf('/invoke.js') < native.indexOf('container-cd35885d41c8db0e720a6e017aadbf77'),
  );
  assert.doesNotMatch(native, /type=["']module["']/);
});
```

- [ ] **Step 2: Verify RED**

Run:

```powershell
node --experimental-strip-types --test tests/ad-placement.test.mjs tests/source-contract.test.mjs
```

Expected: FAIL because the mode resolver and both approved components do not exist.

- [ ] **Step 3: Implement the pure mode resolver and Astro config**

Create `src/lib/ads/resolveAdMode.ts`:

```ts
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
```

Create `src/config/ads.ts`:

```ts
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
```

Add to `ImportMetaEnv` in `src/env.d.ts`:

```ts
  readonly PUBLIC_ADS_DEPLOYMENT?: string;
  readonly PUBLIC_ADSTERRA_NATIVE_ENABLED?: string;
  readonly PUBLIC_ADSTERRA_BANNER_320X50_ENABLED?: string;
```

- [ ] **Step 4: Create the 320x50 component**

Create `src/components/ads/AdsterraBanner320x50.astro`:

```astro
---
import { ads } from '../../config/ads';
const mode = ads.banner320x50Mode;
---
{mode !== 'off' && (
  <aside class="ad-slot ad-slot--320x50" aria-label="Advertisement" data-adsterra-unit="banner-320x50" data-ad-mode={mode}>
    <div class="ad-label">Advertisement</div>
    <div class="ad-frame">
      {mode === 'placeholder' ? (
        <div class="ad-placeholder">Advertisement placeholder</div>
      ) : (
        <>
          <script is:inline>
            atOptions = {
              'key' : '31358e95bdfca07885ad4d825c43845b',
              'format' : 'iframe',
              'height' : 50,
              'width' : 320,
              'params' : {}
            };
          </script>
          <script is:inline src="https://www.highrevenueformat.com/31358e95bdfca07885ad4d825c43845b/invoke.js"></script>
        </>
      )}
    </div>
  </aside>
)}
<style>
  .ad-slot { width: 320px; max-width: none; margin-block: 2.25rem; margin-inline: calc((100% - 320px) / 2); }
  .ad-label { margin-bottom: .45rem; color: var(--muted); font-size: .68rem; line-height: 1; letter-spacing: .08em; text-transform: uppercase; }
  .ad-frame, .ad-placeholder { width: 320px; min-width: 320px; height: 50px; min-height: 50px; }
  .ad-frame { overflow: visible; }
  .ad-placeholder { display: grid; place-items: center; border: 1px dashed var(--line); background: rgba(255,255,255,.55); color: var(--muted); font-size: .72rem; }
</style>
```

- [ ] **Step 5: Create the Native component**

Create `src/components/ads/AdsterraNativeBanner.astro`:

```astro
---
import { ads } from '../../config/ads';
const mode = ads.nativeMode;
---
{mode !== 'off' && (
  <aside class="ad-slot ad-slot--native" aria-label="Advertisement" data-adsterra-unit="native" data-ad-mode={mode}>
    <div class="ad-label">Advertisement</div>
    <div class="ad-native-frame">
      {mode === 'placeholder' ? (
        <div class="ad-placeholder">Advertisement placeholder</div>
      ) : (
        <>
          <script is:inline async="async" data-cfasync="false" src="https://pl30995799.profitableratecpmnetwork.com/cd35885d41c8db0e720a6e017aadbf77/invoke.js"></script>
          <div id="container-cd35885d41c8db0e720a6e017aadbf77"></div>
        </>
      )}
    </div>
  </aside>
)}
<style>
  .ad-slot { width: 100%; max-width: 100%; margin-block: 2.5rem; }
  .ad-label { margin-bottom: .55rem; color: var(--muted); font-size: .68rem; line-height: 1; letter-spacing: .08em; text-transform: uppercase; }
  .ad-native-frame { width: 100%; min-height: 180px; overflow-x: clip; }
  .ad-placeholder { display: grid; min-height: 180px; place-items: center; border: 1px dashed var(--line); background: rgba(255,255,255,.55); color: var(--muted); font-size: .72rem; }
</style>
```

- [ ] **Step 6: Verify GREEN**

Run:

```powershell
node --experimental-strip-types --test tests/ad-placement.test.mjs tests/source-contract.test.mjs
npm run check
```

Expected: mode-policy and exact-code contracts pass; the type check reports no errors.

- [ ] **Step 7: Commit modes and components**

```powershell
git add -- src/lib/ads/resolveAdMode.ts src/config/ads.ts src/components/ads/AdsterraBanner320x50.astro src/components/ads/AdsterraNativeBanner.astro src/env.d.ts tests/ad-placement.test.mjs tests/source-contract.test.mjs
git commit -m "feat: add gated Adsterra components"
```

### Task 3: Article-only placement and internal-label removal

**Files:**
- Modify: `src/pages/[category]/[slug].astro`
- Modify: `src/layouts/GuideLayout.astro`
- Modify: `src/components/GuideCard.astro`
- Modify: `src/pages/about.astro`
- Modify: `src/config/site.ts`
- Delete: `src/components/AdSlot.astro`
- Delete: `src/components/TopContentAd.astro`
- Delete: `src/components/MidContentAd.astro`
- Delete: `src/components/EndContentAd.astro`
- Create: `tests/ads-built-site.test.mjs`

**Interfaces:**
- `getStaticPaths()` computes all split results, warnings, summary, and threshold before returning route props.
- `GuideLayout.astro` owns exactly one Native placement after its source section.
- The route owns exactly one 320x50 placement between the two safe rendered fragments.

- [ ] **Step 1: Add failing generated-page contracts**

Create `tests/ads-built-site.test.mjs`:

```js
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const dist = path.resolve('dist');
const categories = new Set(['guides', 'walkthrough', 'islands', 'bosses', 'items', 'achievements', 'fixes']);
const liveAds = process.env.PUBLIC_ADS_DEPLOYMENT === 'production' &&
  process.env.PUBLIC_ADS_ENABLED === 'true' &&
  process.env.PUBLIC_ADSTERRA_NATIVE_ENABLED === 'true' &&
  process.env.PUBLIC_ADSTERRA_BANNER_320X50_ENABLED === 'true';

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : target;
  }));
  return nested.flat();
}

function count(html, pattern) {
  return (html.match(pattern) ?? []).length;
}

test('all concrete guides contain exactly one correctly placed unit of each approved type', async () => {
  const files = await walk(dist);
  const guides = files.filter((file) => {
    const relative = path.relative(dist, file).split(path.sep);
    return relative.length === 3 && categories.has(relative[0]) && relative[2] === 'index.html';
  });
  assert.equal(guides.length, 31);

  for (const file of guides) {
    const html = await readFile(file, 'utf8');
    assert.equal(count(html, /data-adsterra-unit="banner-320x50"/g), 1, file);
    assert.equal(count(html, /data-adsterra-unit="native"/g), 1, file);

    const quick = html.indexOf('<h2 id="quick-steps">');
    const banner = html.indexOf('data-adsterra-unit="banner-320x50"');
    const nextH2 = html.indexOf('<h2', quick + 1);
    const sources = html.indexOf('<section class="source-note"');
    const native = html.indexOf('data-adsterra-unit="native"');
    const sequence = html.indexOf('<nav class="sequence"');
    assert.ok(quick !== -1 && quick < banner && banner < nextH2, `${file} banner boundary`);
    assert.ok(sources !== -1 && sources < native && native < sequence, `${file} native boundary`);

    if (liveAds) {
      assert.equal(count(html, /pl30995799\.profitableratecpmnetwork\.com\/cd35885d41c8db0e720a6e017aadbf77\/invoke\.js/g), 1, file);
      assert.equal(count(html, /id="container-cd35885d41c8db0e720a6e017aadbf77"/g), 1, file);
      assert.equal(count(html, /www\.highrevenueformat\.com\/31358e95bdfca07885ad4d825c43845b\/invoke\.js/g), 1, file);
      assert.equal(count(html, /atOptions\s*=/g), 1, file);
      assert.ok(html.indexOf('atOptions =') < html.indexOf('www.highrevenueformat.com'), file);
      assert.ok(html.indexOf('<body') < html.indexOf('pl30995799.profitableratecpmnetwork.com'), file);
    } else {
      assert.equal(count(html, /Advertisement placeholder/g), 2, file);
      assert.doesNotMatch(html, /profitableratecpmnetwork|highrevenueformat|31358e95bdfca07885ad4d825c43845b|container-cd35885d41c8db0e720a6e017aadbf77/);
    }
  }
});

test('excluded HTML pages contain no ad unit, script, key, or native container', async () => {
  const excluded = [
    'index.html', 'guides/index.html', 'walkthrough/index.html', 'islands/index.html',
    'bosses/index.html', 'items/index.html', 'achievements/index.html', 'fixes/index.html',
    'search/index.html', 'about/index.html', 'contact/index.html', 'privacy/index.html',
    'terms/index.html', 'disclaimer/index.html', '404.html',
  ];
  for (const relative of excluded) {
    const html = await readFile(path.join(dist, relative), 'utf8');
    assert.doesNotMatch(html, /data-adsterra-unit|profitableratecpmnetwork|highrevenueformat|31358e95bdfca07885ad4d825c43845b|container-cd35885d41c8db0e720a6e017aadbf77/, relative);
  }
});

test('public cards and guide headers do not expose internal priority or verification labels', async () => {
  const home = await readFile(path.join(dist, 'index.html'), 'utf8');
  const category = await readFile(path.join(dist, 'bosses/index.html'), 'utf8');
  const guide = await readFile(path.join(dist, 'bosses/spider-crab/index.html'), 'utf8');
  const about = await readFile(path.join(dist, 'about/index.html'), 'utf8');
  for (const html of [home, category, guide]) assert.doesNotMatch(html, />P[012]</);
  assert.doesNotMatch(guide, /<span class="status">mixed<\/span>/i);
  assert.doesNotMatch(about, /<strong>Mixed:<\/strong>/i);
});
```

- [ ] **Step 2: Verify RED against the current build**

Run:

```powershell
npm run build
node --test tests/ads-built-site.test.mjs
```

Expected: FAIL because current guide pages do not contain the approved components and still expose priority/status labels.

- [ ] **Step 3: Integrate structured splitting in the concrete guide route**

Replace `src/pages/[category]/[slug].astro` with:

```astro
---
import { getCollection, render } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import AdsterraBanner320x50 from '../../components/ads/AdsterraBanner320x50.astro';
import GuideLayout from '../../layouts/GuideLayout.astro';
import { guidePath } from '../../config/site';
import {
  splitGuideContentAfterQuickSteps,
  summarizeGuideAdPlacements,
} from '../../lib/ads/splitGuideContent';

export async function getStaticPaths() {
  const entries = await getCollection('guides', ({ data }) => !data.draft);
  const placements = entries.map((entry) => {
    const route = guidePath(entry.data.category, entry.data.slug);
    return splitGuideContentAfterQuickSteps(entry.rendered?.html, route);
  });
  const summary = summarizeGuideAdPlacements(placements);

  for (const placement of placements) {
    if (placement.status === 'skipped') {
      console.warn(`[ads] Skipping 320x50 on ${placement.route}: ${placement.reason}`);
    }
  }
  console.info(
    `[ads] 320x50 placement summary: ${summary.totalRoutes - summary.skippedRoutes.length} placed, ${summary.skippedRoutes.length} skipped` +
    (summary.skippedRoutes.length ? ` (${summary.skippedRoutes.join(', ')})` : ''),
  );
  if (summary.shouldFailBuild) {
    throw new Error(`[ads] Quick steps placement failed for ${Math.round(summary.skipRatio * 100)}% of guide routes.`);
  }

  return entries.map((entry, index) => ({
    params: { category: entry.data.category, slug: entry.data.slug },
    props: { entry, entries, placement: placements[index] },
  }));
}

const { entry, entries, placement } = Astro.props;
const { Content, headings } = await render(entry);
const byPath = new Map(entries.map((item) => [guidePath(item.data.category, item.data.slug), item]));
const previous = entry.data.previousGuide ? byPath.get(entry.data.previousGuide) : undefined;
const next = entry.data.nextGuide ? byPath.get(entry.data.nextGuide) : undefined;
const related = entry.data.relatedGuides
  .map((path: string) => byPath.get(path))
  .filter((item): item is CollectionEntry<'guides'> => item !== undefined);
---
<GuideLayout entry={entry} headings={headings} previous={previous} next={next} related={related}>
  {placement.status === 'split' ? (
    <>
      <Fragment set:html={placement.beforeBanner} />
      <AdsterraBanner320x50 />
      <Fragment set:html={placement.afterBanner} />
    </>
  ) : <Content />}
</GuideLayout>
```

- [ ] **Step 4: Move Native after Sources and remove obsolete slots**

In `src/layouts/GuideLayout.astro`, replace the old ad imports with:

```astro
import AdsterraNativeBanner from '../components/ads/AdsterraNativeBanner.astro';
```

Replace the public eyebrow and verification card with:

```astro
<p class="eyebrow">{category.label}</p>
<h1>{data.title}</h1>
<p class="dek">{data.description}</p>
```

and:

```astro
<div class="verification-card">
  <dl><div><dt>Last checked</dt><dd>{data.lastVerifiedAt.toLocaleDateString('en-US', { dateStyle: 'medium' })}</dd></div><div><dt>Game version</dt><dd>{data.gameVersion}</dd></div></dl>
</div>
```

Remove `<TopContentAd />`. Immediately after the closing `</section>` of `.source-note`, render:

```astro
<AdsterraNativeBanner />
```

Remove `<EndContentAd />`. Do not change the sequence or related sections.

Delete the four obsolete generic placeholder files listed for this task, and remove `adsEnabled` from the exported `site` object in `src/config/site.ts`.

- [ ] **Step 5: Hide card and About-page internal labels**

In `src/components/GuideCard.astro`, replace:

```astro
<div class="meta"><span>{entry.data.category}</span><span>{entry.data.priority}</span></div>
```

with:

```astro
<div class="meta"><span>{entry.data.category}</span></div>
```

Change `.meta` to:

```css
.meta { display: flex; gap: .5rem; color: var(--coral-dark); font-size: .7rem; font-weight: 850; letter-spacing: .1em; text-transform: uppercase; }
```

In `src/pages/about.astro`, replace the verification-label section with:

```astro
<h2>How we handle evidence</h2><ul><li>Developer pages, the Steam store, achievements, and patch notes support official identity and version facts.</li><li>Gameplay guidance uses multiple attributable player sources when official instructions are incomplete.</li><li>Patch-sensitive or incomplete claims remain clearly limited, noindex, or unpublished until the evidence improves.</li></ul>
```

- [ ] **Step 6: Verify GREEN and inspect the placement summary**

Run:

```powershell
npm run build
node --test tests/ads-built-site.test.mjs
npm run check
```

Expected: build log reports `31 placed, 0 skipped`; all three generated-page tests pass; type checks pass.

- [ ] **Step 7: Commit article placement and label cleanup**

```powershell
git add -- src/pages/[category]/[slug].astro src/layouts/GuideLayout.astro src/components/GuideCard.astro src/pages/about.astro src/config/site.ts src/components/AdSlot.astro src/components/TopContentAd.astro src/components/MidContentAd.astro src/components/EndContentAd.astro tests/ads-built-site.test.mjs
git commit -m "feat: place ads on guide content only"
```

### Task 4: Privacy disclosure and narrow CSP

**Files:**
- Modify: `src/pages/privacy.astro`
- Modify: `worker/index.ts`
- Modify: `tests/source-contract.test.mjs`
- Modify: `tests/ads-built-site.test.mjs`

**Interfaces:**
- Privacy always discloses production Adsterra practices and preserves conditional GA4 truth.
- Worker initially permits only the two supplied Adsterra script origins.

- [ ] **Step 1: Add failing privacy and CSP contracts**

Append to `tests/source-contract.test.mjs`:

```js
test('worker CSP permits only the two approved initial Adsterra script origins', async () => {
  const worker = await text('worker/index.ts');
  assert.match(worker, /script-src[^;\"]*https:\/\/pl30995799\.profitableratecpmnetwork\.com/);
  assert.match(worker, /script-src[^;\"]*https:\/\/www\.highrevenueformat\.com/);
  assert.doesNotMatch(worker, /script-src[^;\"]*https:\/\/\*/);
  assert.doesNotMatch(worker, /(?:profitableratecpmnetwork|highrevenueformat)[^;\"]*\*/);
});
```

Append to `tests/ads-built-site.test.mjs`:

```js
test('privacy page discloses Adsterra without inventing consent controls', async () => {
  const privacy = await readFile(path.join(dist, 'privacy/index.html'), 'utf8');
  assert.match(privacy, /uses Adsterra to display third-party advertisements/i);
  assert.match(privacy, /IP address, browser and device information/i);
  assert.match(privacy, /cookies, pixels, local storage, or similar technologies/i);
  assert.match(privacy, /https:\/\/adsterra\.com\/privacy-policy-managed\//);
  assert.match(privacy, /https:\/\/adsterra\.com\/cookies\//);
  assert.match(privacy, /Effective August 24, 2026/);
  assert.doesNotMatch(privacy, /ads? (?:are|is) blocked until (?:you|the user) consent/i);
});
```

- [ ] **Step 2: Verify RED**

Run:

```powershell
node --experimental-strip-types --test tests/source-contract.test.mjs
npm run build
node --test tests/ads-built-site.test.mjs
```

Expected: source contract fails on missing Adsterra CSP origins; built-page test fails on the old privacy copy.

- [ ] **Step 3: Replace the privacy page with accurate production disclosure**

Replace `src/pages/privacy.astro` with:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { site } from '../config/site';
---
<BaseLayout title="Privacy Policy" description="How to Fish Game Help explains its analytics, hosting, advertising, and visitor-data practices." canonicalPath="/privacy/">
  <article class="narrow section prose">
    <p class="eyebrow">Effective August 24, 2026</p>
    <h1>Privacy policy</h1>
    <p>This site serves static informational pages. It uses Adsterra to display third-party advertisements. Google Analytics is <strong>{site.analyticsEnabled ? 'enabled' : 'disabled'}</strong> in this build.</p>
    {site.analyticsEnabled ? (
      <>
        <h2>Google Analytics</h2>
        <p>We use Google Analytics to understand visits and improve these guides. Google may process page views, referral information, device and browser information, approximate location, and analytics identifiers or cookies. We have disabled Google Signals and ad-personalization signals.</p>
        <p>Learn how Google handles information in its <a href="https://policies.google.com/privacy">privacy policy</a>. You can limit cookies in your browser or use the <a href="https://tools.google.com/dlpage/gaoptout">Google Analytics opt-out add-on</a>.</p>
      </>
    ) : (
      <>
        <h2>Analytics</h2>
        <p>Google Analytics is disabled in this build, so this site does not set its own analytics cookies.</p>
      </>
    )}
    <h2>Advertising</h2>
    <p>We use Adsterra to display third-party advertisements. Adsterra and its advertising partners may process technical information needed to deliver, limit, measure, and protect ads. This may include your IP address, browser and device information, the requested page, approximate location, ad impressions and clicks, and anti-fraud or security signals.</p>
    <p>Adsterra or its partners may use cookies, pixels, local storage, or similar technologies. We do not control every third-party advertisement. If you click an advertisement, the destination has its own privacy policy and terms.</p>
    <p>The core guides do not require an account or a purchase. Browser privacy settings, content blockers, or cookie controls may prevent advertisements from appearing, but should not prevent access to the core guide text.</p>
    <p>Read Adsterra's <a href="https://adsterra.com/privacy-policy-managed/">privacy policy</a> and <a href="https://adsterra.com/cookies/">Cookies Policy</a>.</p>
    <h2>Data we do not collect directly</h2>
    <p>There are no user accounts, comments, purchases, newsletters, or contact forms. We do not send account, purchase, form, or user-ID data to Google Analytics.</p>
    <h2>Hosting logs</h2>
    <p>Cloudflare may process limited request data such as IP address, browser information, requested URL, and security signals to deliver and protect the site. Those infrastructure logs are governed by Cloudflare's practices.</p>
    <h2>External links</h2>
    <p>Links to advertisements, Steam, developer pages, media, videos, community sources, Google policies, and opt-out tools take you to third-party sites with their own privacy policies and terms.</p>
    <h2>Changes</h2>
    <p>This page will be updated when the site's analytics, advertising, or data-collection practices change.</p>
  </article>
</BaseLayout>
```

- [ ] **Step 4: Add only the two known script origins to CSP**

In `worker/index.ts`, replace the CSP value with:

```ts
  'Content-Security-Policy': "default-src 'self'; base-uri 'self'; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com; form-action 'self'; frame-ancestors 'none'; img-src 'self' data: https://*.google-analytics.com https://www.googletagmanager.com; object-src 'none'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://pl30995799.profitableratecpmnetwork.com https://www.highrevenueformat.com; style-src 'self' 'unsafe-inline'",
```

- [ ] **Step 5: Verify GREEN**

Run:

```powershell
node --experimental-strip-types --test tests/source-contract.test.mjs
npm run build
node --test tests/ads-built-site.test.mjs tests/built-site.test.mjs
```

Expected: privacy and narrow-CSP contracts pass, along with existing analytics and generated-site tests.

- [ ] **Step 6: Commit privacy and CSP**

```powershell
git add -- src/pages/privacy.astro worker/index.ts tests/source-contract.test.mjs tests/ads-built-site.test.mjs
git commit -m "feat: disclose and permit approved guide ads"
```

### Task 5: Production workflow and environment guards

**Files:**
- Modify: `.env.example`
- Modify: `.github/workflows/deploy-production.yml`
- Modify: `package.json`
- Modify: `tests/source-contract.test.mjs`

**Interfaces:**
- Production workflow receives the three boolean switches from repository variables.
- Production workflow sets `PUBLIC_ADS_DEPLOYMENT=production` itself.
- Validation fails before build when a switch is missing or not `true`/`false`.

- [ ] **Step 1: Add failing workflow contracts**

In the production workflow test in `tests/source-contract.test.mjs`, add:

```js
  assert.match(workflow, /PUBLIC_ADS_DEPLOYMENT:\s*["']production["']/);
  assert.match(workflow, /PUBLIC_ADS_ENABLED:\s*\$\{\{ vars\.PUBLIC_ADS_ENABLED \}\}/);
  assert.match(workflow, /PUBLIC_ADSTERRA_NATIVE_ENABLED:\s*\$\{\{ vars\.PUBLIC_ADSTERRA_NATIVE_ENABLED \}\}/);
  assert.match(workflow, /PUBLIC_ADSTERRA_BANNER_320X50_ENABLED:\s*\$\{\{ vars\.PUBLIC_ADSTERRA_BANNER_320X50_ENABLED \}\}/);
  assert.match(workflow, /name: Validate advertising configuration/);
  assert.ok(
    workflow.indexOf('Validate advertising configuration') < workflow.indexOf('npm run build'),
    'advertising configuration must be validated before build',
  );
```

Update the required source-test command contract to:

```js
    'node --experimental-strip-types --test tests/ad-placement.test.mjs tests/source-contract.test.mjs tests/content-quality.test.mjs tests/validate-script.test.mjs',
```

- [ ] **Step 2: Verify RED**

Run:

```powershell
node --experimental-strip-types --test tests/source-contract.test.mjs
```

Expected: FAIL because the production advertising variables, guard, and updated test command are absent.

- [ ] **Step 3: Declare safe local defaults**

Replace the advertising section of `.env.example` with:

```dotenv
PUBLIC_ADS_DEPLOYMENT=preview
PUBLIC_ADS_ENABLED=false
PUBLIC_ADSTERRA_NATIVE_ENABLED=false
PUBLIC_ADSTERRA_BANNER_320X50_ENABLED=false
```

Change the `test` and `test:built` scripts in `package.json` to:

```json
"test": "node --experimental-strip-types --test tests/*.test.mjs",
"test:built": "node --test tests/built-site.test.mjs tests/ads-built-site.test.mjs"
```

- [ ] **Step 4: Add production environment and pre-build validation**

In the workflow job `env`, add:

```yaml
      PUBLIC_ADS_DEPLOYMENT: "production"
      PUBLIC_ADS_ENABLED: ${{ vars.PUBLIC_ADS_ENABLED }}
      PUBLIC_ADSTERRA_NATIVE_ENABLED: ${{ vars.PUBLIC_ADSTERRA_NATIVE_ENABLED }}
      PUBLIC_ADSTERRA_BANNER_320X50_ENABLED: ${{ vars.PUBLIC_ADSTERRA_BANNER_320X50_ENABLED }}
```

Change the source-test step to:

```yaml
      - name: Test source contracts
        run: node --experimental-strip-types --test tests/ad-placement.test.mjs tests/source-contract.test.mjs tests/content-quality.test.mjs tests/validate-script.test.mjs
```

Immediately before `Build production site`, add:

```yaml
      - name: Validate advertising configuration
        run: node -e "const names = ['PUBLIC_ADS_ENABLED', 'PUBLIC_ADSTERRA_NATIVE_ENABLED', 'PUBLIC_ADSTERRA_BANNER_320X50_ENABLED']; for (const name of names) { if (!['true', 'false'].includes(process.env[name])) { console.error('::error::' + name + ' must be true or false.'); process.exit(1); } } if (process.env.PUBLIC_ADS_DEPLOYMENT !== 'production') { console.error('::error::PUBLIC_ADS_DEPLOYMENT must be production.'); process.exit(1); }"
```

- [ ] **Step 5: Verify GREEN**

Run:

```powershell
node --experimental-strip-types --test tests/source-contract.test.mjs
npm run check
```

Expected: production workflow ordering and switch contracts pass; type checks pass.

- [ ] **Step 6: Commit workflow guards**

```powershell
git add -- .env.example .github/workflows/deploy-production.yml package.json tests/source-contract.test.mjs
git commit -m "ci: gate production Adsterra build"
```

### Task 6: Full local, build-mode, and viewport verification

**Files:**
- Verify all files changed in Tasks 1-5.
- No tracked changes unless a failing check reveals a focused defect that receives its own test-first fix.

**Interfaces:**
- Produces fresh evidence for default placeholders, production HTML, all requested viewport widths, metadata, links, sitemap, and clean Git state.

- [ ] **Step 1: Run the default placeholder build and all repository checks**

Run in a clean PowerShell session with no advertising variables set:

```powershell
Remove-Item Env:PUBLIC_ADS_DEPLOYMENT -ErrorAction SilentlyContinue
Remove-Item Env:PUBLIC_ADS_ENABLED -ErrorAction SilentlyContinue
Remove-Item Env:PUBLIC_ADSTERRA_NATIVE_ENABLED -ErrorAction SilentlyContinue
Remove-Item Env:PUBLIC_ADSTERRA_BANNER_320X50_ENABLED -ErrorAction SilentlyContinue
npm audit --audit-level=high
npm run validate
node --experimental-strip-types --test tests/ad-placement.test.mjs tests/source-contract.test.mjs tests/content-quality.test.mjs tests/validate-script.test.mjs
npm run check
npm run build
npm test
```

Expected: audit has no high-severity failure; content reports 31 public guides and zero errors; build reports `31 placed, 0 skipped`; all tests and type checks pass; generated HTML contains placeholders but no Adsterra identifier or domain.

- [ ] **Step 2: Measure the five required placeholder viewports**

Start `npm run preview -- --host 127.0.0.1` in a persistent terminal session. In another PowerShell session, run the locally installed Python Playwright client against the placeholder page only:

```powershell
@'
from playwright.sync_api import sync_playwright

url = "http://127.0.0.1:4321/bosses/spider-crab/"
widths = [320, 360, 375, 390, 414]
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    for width in widths:
        page = browser.new_page(viewport={"width": width, "height": 900})
        page.goto(url, wait_until="networkidle")
        metrics = page.evaluate("""() => {
          const frame = document.querySelector('[data-adsterra-unit="banner-320x50"] .ad-frame');
          const rect = frame.getBoundingClientRect();
          return {
            viewport: document.documentElement.clientWidth,
            scrollWidth: document.documentElement.scrollWidth,
            left: rect.left,
            right: rect.right,
            width: rect.width,
            height: rect.height,
          };
        }""")
        assert metrics["width"] == 320 and metrics["height"] == 50, metrics
        assert metrics["scrollWidth"] <= metrics["viewport"], metrics
        assert metrics["left"] >= -0.01 and metrics["right"] <= metrics["viewport"] + 0.01, metrics
        print(metrics)
        page.close()
    browser.close()
'@ | python -X utf8 -
```

Expected: five printed records; each is exactly 320x50, stays inside the viewport, and has `scrollWidth <= viewport`. No request reaches either Adsterra domain because the build is placeholder mode.

- [ ] **Step 3: Build and inspect production-mode HTML without opening it**

Run:

```powershell
$env:PUBLIC_ADS_DEPLOYMENT = 'production'
$env:PUBLIC_ADS_ENABLED = 'true'
$env:PUBLIC_ADSTERRA_NATIVE_ENABLED = 'true'
$env:PUBLIC_ADSTERRA_BANNER_320X50_ENABLED = 'true'
npm run build
npm run test:built
node --test tests/ads-built-site.test.mjs
Remove-Item Env:PUBLIC_ADS_DEPLOYMENT
Remove-Item Env:PUBLIC_ADS_ENABLED
Remove-Item Env:PUBLIC_ADSTERRA_NATIVE_ENABLED
Remove-Item Env:PUBLIC_ADSTERRA_BANNER_320X50_ENABLED
```

Expected: build reports `31 placed, 0 skipped`; generated-site tests confirm one script/container/config per allowed guide and none on excluded pages. This step reads HTML files only and makes no Adsterra request.

- [ ] **Step 4: Restore default output and verify the working tree**

Run:

```powershell
npm run build
npm test
git diff --check
git status --short
git log --oneline --decorate origin/main..HEAD
```

Expected: default placeholder build and all tests pass; `git diff --check` prints nothing; status is clean; only the approved design, plan, and focused implementation commits are ahead of `origin/main`.

### Task 7: Placeholder preview, production release, live verification, and rollback gate

**Files:**
- No tracked changes unless the deployment date changes or a verified live issue receives a test-first fix.

**Interfaces:**
- Consumes reviewed clean commits and existing Cloudflare/GitHub authentication.
- Produces a placeholder preview, verified repository-variable metadata, successful production workflow, live source/header/browser evidence, and a disabled-ad rollback path.

- [ ] **Step 1: Publish and inspect an inert temporary preview**

With all advertising variables removed, run:

```powershell
npm run deploy:temporary
```

Open only the returned preview URL's `/bosses/spider-crab/` and `/privacy/` pages. Verify that the guide shows two `Advertisement placeholder` areas and that page source contains neither Adsterra domain, the Banner key, nor the Native container ID. Do not enable live code on this preview.

- [ ] **Step 2: Set and read back only the approved production switches**

Run:

```powershell
gh variable set PUBLIC_ADS_ENABLED --body true
gh variable set PUBLIC_ADSTERRA_NATIVE_ENABLED --body true
gh variable set PUBLIC_ADSTERRA_BANNER_320X50_ENABLED --body true
gh api repos/muujaa1000-jack/howtofishgamehelp/actions/variables/PUBLIC_ADS_ENABLED --jq '{name, created_at, updated_at}'
gh api repos/muujaa1000-jack/howtofishgamehelp/actions/variables/PUBLIC_ADSTERRA_NATIVE_ENABLED --jq '{name, created_at, updated_at}'
gh api repos/muujaa1000-jack/howtofishgamehelp/actions/variables/PUBLIC_ADSTERRA_BANNER_320X50_ENABLED --jq '{name, created_at, updated_at}'
```

Expected: readbacks show only the three variable names and timestamps, not advertising keys or unrelated configuration.

- [ ] **Step 3: Push the reviewed main branch and wait for the exact workflow**

Run:

```powershell
$pushedHeadSha = (git rev-parse HEAD).Trim()
git push origin main
$deployRun = $null
for ($attempt = 1; $attempt -le 20; $attempt++) {
  $deployRun = gh run list --workflow deploy-production.yml --branch main --limit 1 --json databaseId,headSha,status,conclusion |
    ConvertFrom-Json |
    Where-Object { $_.headSha -eq $pushedHeadSha } |
    Select-Object -First 1
  if ($null -ne $deployRun) { break }
  if ($attempt -lt 20) { Start-Sleep -Seconds 2 }
}
if ($null -eq $deployRun) { throw "No production workflow appeared for $pushedHeadSha." }
gh run watch $deployRun.databaseId --exit-status
```

Expected: the workflow for the exact pushed commit completes successfully, including audit, content validation, source tests, type checks, production ad guard, build summary, and generated-site tests.

- [ ] **Step 4: Verify live source and excluded routes without executing ads**

Run one read-only source request per required route:

```powershell
$guide = Invoke-WebRequest -Uri 'https://howtofishgamehelp.com/bosses/spider-crab/' -UseBasicParsing
$excluded = @(
  'https://howtofishgamehelp.com/',
  'https://howtofishgamehelp.com/bosses/',
  'https://howtofishgamehelp.com/search/',
  'https://howtofishgamehelp.com/privacy/',
  'https://howtofishgamehelp.com/404/'
)
if (([regex]::Matches($guide.Content, 'pl30995799\.profitableratecpmnetwork\.com')).Count -ne 1) { throw 'Native loader count is not one.' }
if (([regex]::Matches($guide.Content, 'container-cd35885d41c8db0e720a6e017aadbf77')).Count -ne 1) { throw 'Native container count is not one.' }
if (([regex]::Matches($guide.Content, 'www\.highrevenueformat\.com')).Count -ne 1) { throw 'Banner loader count is not one.' }
foreach ($url in $excluded) {
  $response = Invoke-WebRequest -Uri $url -UseBasicParsing -SkipHttpErrorCheck
  if ($response.Content -match 'profitableratecpmnetwork|highrevenueformat|31358e95bdfca07885ad4d825c43845b|container-cd35885d41c8db0e720a6e017aadbf77') {
    throw "Excluded route contains Adsterra code: $url"
  }
}
```

Expected: the guide source has each unit once; excluded route source has none. Source requests do not execute scripts or create iframes.

- [ ] **Step 5: Perform one controlled real browser verification**

Use the Chrome-control skill to open only `https://howtofishgamehelp.com/bosses/spider-crab/` once. Do not click either advertisement and do not loop or batch-refresh.

Inspect and record:

- Native script and container each appear once;
- Banner configuration precedes its loader and produces no more than one 320x50 iframe;
- Native appears after Sources and before sequence navigation;
- no duplicate ID or duplicate iframe exists;
- no horizontal overflow or covered content appears;
- console and CSP show the exact blocked resource type and origin, if any;
- observed Native height is compared with the 180px reservation;
- Cloudflare Rocket Loader's current zone setting is read, and `data-cfasync="false"` remains present.

If a required resource is blocked, add only a concrete exact origin to the matching CSP directive when it does not materially weaken the policy, beginning a new test-first fix cycle. If the needed permission is broad or unclear, proceed immediately to Step 6.

- [ ] **Step 6: Use the production switch rollback on any material live failure**

Run only if live verification finds a material loading, security, or layout regression:

```powershell
gh variable set PUBLIC_ADS_ENABLED --body false
$previousRunId = gh run list --workflow deploy-production.yml --branch main --limit 1 --json databaseId --jq '.[0].databaseId'
gh workflow run deploy-production.yml
for ($attempt = 1; $attempt -le 20; $attempt++) {
  Start-Sleep -Seconds 2
  $rollbackRun = gh run list --workflow deploy-production.yml --branch main --limit 1 --json databaseId,headSha,status,conclusion | ConvertFrom-Json | Select-Object -First 1
  if ([string]$rollbackRun.databaseId -ne [string]$previousRunId) { break }
}
if ([string]$rollbackRun.databaseId -eq [string]$previousRunId) { throw 'No rollback workflow appeared.' }
gh run watch $rollbackRun.databaseId --exit-status
$rollbackPage = Invoke-WebRequest -Uri 'https://howtofishgamehelp.com/bosses/spider-crab/' -UseBasicParsing
if ($rollbackPage.Content -match 'profitableratecpmnetwork|highrevenueformat|31358e95bdfca07885ad4d825c43845b|container-cd35885d41c8db0e720a6e017aadbf77') {
  throw 'Rollback deployment still contains live Adsterra code.'
}
```

Expected when used: rollback workflow succeeds and live guide source contains no Adsterra code.

- [ ] **Step 7: Record final evidence**

Report independently:

- stack, route, layout, and content-rendering path;
- actual `parse5` boundary behavior and build summary;
- modified/deleted/created files;
- default placeholder and production HTML test results;
- five viewport measurement records;
- skipped routes, duplicate-script/ID/iframe results, and overflow result;
- Privacy, Analytics, CSP, ClientRouter, and Rocket Loader findings;
- placeholder preview, GitHub variable readback, workflow, live source, live browser, and rollback-switch status;
- absence of a CMP as a remaining human legal/compliance decision.
