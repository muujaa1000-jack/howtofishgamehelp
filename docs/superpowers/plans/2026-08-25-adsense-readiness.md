# AdSense Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce and deploy a noindex feature preview that removes Adsterra execution paths, adds default-deny AdSense readiness controls, deepens current source-backed content, and passes the full application Gate except actions that require the site owner or a production release.

**Architecture:** Extend the existing Astro content schema and shared layouts, remove the current Adsterra integration instead of layering a second ad system over it, and validate both source metadata and generated output with Node tests. Preserve static generation, the current content renderer, and the existing body-splitting helper for future manual slots.

**Tech Stack:** Astro 7, TypeScript, Markdown content collections, Node test runner, Pagefind, Cloudflare Workers Static Assets, Playwright CLI.

## Global Constraints

- Published site copy is English; operational documentation may be English or Chinese.
- Do not claim first-hand playtesting, developer confirmation beyond cited official material, or guaranteed bug fixes.
- `adEligible` defaults to `false`; only explicitly reviewed complete guide pages set it to `true`.
- Do not emit a fake publisher ID, create a placeholder `public/ads.txt`, load Auto ads, publish a CMP claim, or change production.
- Search, hubs, trust/legal pages, 404, XML, and empty states are never advertising-eligible.
- Use Patch 1.0.9 only where the 2026-08-25 official announcement supports the change; do not globally replace version text.
- Reuse `src/lib/ads/splitGuideContent.ts` if manual in-content slots are implemented later.

---

### Task 1: Record the verified baseline and application controls

**Files:**
- Create: `docs/adsense-readiness-audit.md`
- Create: `docs/ads-txt-setup.md`
- Create: `docs/google-cmp-setup.md`
- Create: `docs/adsense-manual-submit.md`

**Interfaces:**
- Consumes: Git/Cloudflare/production/official-Steam readbacks captured on 2026-08-25.
- Produces: an evidence-bounded baseline and manual-only follow-up instructions used by the final Gate.

- [ ] **Step 1: Write the baseline with confirmed and unresolved findings separated**

Record commit, production version, sitemap count, page classes, GA4/Adsterra state, game version labels, thin-page counts, and asset state. State that production changes are outside this branch.

- [ ] **Step 2: Add ads.txt and CMP instructions without publishable placeholders**

Document the real-line shape as `google.com, pub-真实ID, DIRECT, f08c47fec0942fa0`, the HTTP/content checks, and the exact Google AdSense Privacy & messaging path. Do not create `public/ads.txt`.

- [ ] **Step 3: Add the manual submission checklist**

Include account duplication check, real identity/address, exact domain, real IDs, production environment, real ads.txt, certified CMP, verification, review request, audit-period ad shutdown, and click-integrity warnings.

- [ ] **Step 4: Commit the evidence baseline**

Run `git diff --check`, then commit only the four control documents with `chore(audit): record adsense readiness baseline`.

### Task 2: Remove Adsterra and add default-deny AdSense metadata

**Files:**
- Modify: `tests/ad-placement.test.mjs`
- Modify: `tests/source-contract.test.mjs`
- Modify: `tests/ads-built-site.test.mjs`
- Modify: `tests/built-site.test.mjs`
- Modify: `src/content.config.ts`
- Create: `src/config/gameRelease.ts`
- Modify: `src/config/site.ts`
- Modify: `src/env.d.ts`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/layouts/GuideLayout.astro`
- Modify: `src/pages/[category]/[slug].astro`
- Modify: `worker/index.ts`
- Modify: `.env.example`
- Modify: `.github/workflows/deploy-production.yml`
- Delete: `src/components/ads/AdsterraNativeBanner.astro`
- Delete: `src/components/ads/AdsterraBanner320x50.astro`
- Delete: `src/config/ads.ts`
- Delete: `src/lib/ads/resolveAdMode.ts`

**Interfaces:**
- Produces: `site.adsenseAccount: string`, `site.adsenseAccountIsValid: boolean`, guide fields `lastSourceReview`, `evidenceThroughVersion`, `firstHandTested`, `patchSensitive`, and `adEligible`.
- Consumes: existing guide collection and `splitGuideContentAfterQuickSteps` only for compatibility; no slot renders in this branch.

- [ ] **Step 1: Write failing source and built-output tests**

Tests must expect no Adsterra components, keys, domains, CSP entries, or environment switches; expect default-false eligibility; expect account meta absence for invalid/missing values and one meta for a valid test-only value; and expect no advertisement containers.

- [ ] **Step 2: Run focused tests and confirm the expected failures**

Run `node --experimental-strip-types --test tests/ad-placement.test.mjs tests/source-contract.test.mjs` and confirm failures point to current Adsterra contracts and missing metadata.

- [ ] **Step 3: Implement the minimal schema/config/layout change**

Add defaulted fields, validate `PUBLIC_GOOGLE_ADSENSE_ACCOUNT` with `^ca-pub-[0-9]{16}$`, emit the account meta only when valid, change guide evidence labels, and remove every active Adsterra path and CSP origin.

- [ ] **Step 4: Run focused tests to green**

Run the same focused source tests, then build once with all advertising/analytics switches disabled and run `npm run test:built`.

- [ ] **Step 5: Commit the advertising boundary**

Run `git diff --check` and commit with `feat(adsense): remove adsterra and add eligibility hooks`.

### Task 3: Fix Search and trust/legal consistency

**Files:**
- Modify: `tests/built-site.test.mjs`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/pages/search.astro`
- Modify: `src/pages/about.astro`
- Modify: `src/pages/contact.astro`
- Modify: `src/pages/privacy.astro`
- Modify: `src/pages/terms.astro`
- Modify: `src/pages/disclaimer.astro`
- Modify: `src/pages/404.astro`
- Modify: `src/components/Footer.astro`

**Interfaces:**
- Produces: explicit robots directives, consistent contact identity, accurate advertising/analytics disclosures, and permanent non-eligibility for controlled routes.

- [ ] **Step 1: Write failing built-page assertions**

Assert Search has exactly `noindex,follow`, Search is absent from sitemap, 404 is `noindex,nofollow`, trust/legal pages contain no ad markers, About and Contact expose the same public address in the production configuration, and Privacy includes AdSense disclosure while describing Adsterra as disabled.

- [ ] **Step 2: Run the built-page test against the baseline and confirm failure**

Run `npm run build` followed by `npm run test:built`; verify failures match the old Search robots and Privacy/About copy.

- [ ] **Step 3: Implement the copy and robots changes**

Use `BaseLayout`'s explicit robots prop, add non-JavaScript category choices to Search, add correction/rights/source-method language to About, keep the exact mailto on Contact, and update Privacy without claiming CMP deployment.

- [ ] **Step 4: Rebuild and run built-page tests**

Run `npm run build && npm run test:built` and inspect generated Search, About, Contact, Privacy, and 404 HTML.

- [ ] **Step 5: Commit trust and indexing changes**

Run `git diff --check` and commit with `legal(trust): align privacy about contact and search`.

### Task 4: Review Patch 1.0.9 impact and deepen supported content

**Files:**
- Create: `docs/patch-impact-matrix.md`
- Modify: `src/content/guides/**/*.md`
- Modify: `src/config/site.ts`
- Modify: `src/pages/[category]/index.astro`
- Modify: `tests/content-quality.test.mjs`
- Modify: `tests/validate-script.test.mjs`
- Modify: `scripts/validate-content.mjs`
- Regenerate: `docs/content-map.csv`
- Regenerate: `docs/evidence-ledger.csv`

**Interfaces:**
- Produces: 34 public guides, a per-page impact decision, five 800–1500-word priority guides, three source-supported Patch 1.0.9 pages, and seven 350–600-word hubs.

- [ ] **Step 1: Write failing content tests for new metadata, page count, priority depth, and new routes**

Assert every public entry has explicit source-review fields, all five requested priority pages contain at least 800 English words, the three approved Patch 1.0.9 routes exist and meet the complete-guide structure, and only the eight reviewed long-form pages opt into eligibility.

- [ ] **Step 2: Run content tests and confirm expected failures**

Run `node --experimental-strip-types --test tests/content-quality.test.mjs tests/validate-script.test.mjs`.

- [ ] **Step 3: Build the patch-impact matrix before changing page version labels**

For every existing route, record current label, 1.0.9 impact, exact action, official source, and status. Use `reviewed-no-direct-change`, `updated-for-difficulty`, `updated-for-connection`, `updated-for-save-safety`, or `evidence-limited` statuses.

- [ ] **Step 4: Update existing metadata page by page**

Add source-review metadata to all entries. Only change body/version wording when the matrix identifies a real Patch 1.0.6, 1.0.8, or 1.0.9 impact.

- [ ] **Step 5: Expand the five requested pages**

Add direct applicability, detailed steps, causes/limitations, mistakes, safe recovery, solo/co-op boundaries, patch history, FAQ, and source notes without invented gameplay values.

- [ ] **Step 6: Add the three Patch 1.0.9 pages and wire links**

Create `difficulty-settings.md`, `steam-relay-connection-failed.md`, and `save-file-corrupted-or-weapon-crash.md`, then update related/sequence links and category summaries. Preserve the official qualifier on the save fix.

- [ ] **Step 7: Expand hub field notes and render 350–600 useful words**

Add purpose, reading order, current-patch effect, and accurate summaries to each category hub without enabling ads.

- [ ] **Step 8: Regenerate ledgers and run content tests**

Run `npm run docs:content`, `npm run validate`, and the focused content tests. Expect 34 public guides and zero validation errors.

- [ ] **Step 9: Commit version/content work**

Run `git diff --check` and commit with `content(version): review guides through patch 1.0.9`, followed by a separate `content(help): deepen priority guides and add current issue pages` if the diff remains reviewable as two logical units.

### Task 5: Add asset and automated AdSense audits

**Files:**
- Create: `docs/asset-rights-ledger.md`
- Create: `scripts/audit-adsense-readiness.mjs`
- Create: `tests/adsense-audit.test.mjs`
- Modify: `package.json`
- Modify: `tests/source-contract.test.mjs`

**Interfaces:**
- Produces: `npm run audit:adsense`, a deterministic non-zero exit on any release Gate violation, and a rights record for every public/static visual asset.

- [ ] **Step 1: Write a failing test for the audit command**

Create fixtures or direct source checks proving that prohibited ad domains, fake IDs, controlled-page eligibility, wrong Search robots, Search in sitemap, duplicate guide labels, public editor placeholders, wrong canonical host, and invalid/multiple account meta cause failure.

- [ ] **Step 2: Run the audit test and confirm failure because the script is missing**

Run `node --test tests/adsense-audit.test.mjs`.

- [ ] **Step 3: Implement the audit script and package command**

Read `dist`, `src/content/guides`, and generated sitemap. Report each finding with route/file evidence and exit 1 if any finding remains.

- [ ] **Step 4: Record asset rights**

List original SVGs, generated OG image, web manifest references, and QA screenshots. Mark third-party image count zero and record replacement/removal actions if inspection finds otherwise.

- [ ] **Step 5: Run the audit test and real audit**

Run `node --test tests/adsense-audit.test.mjs`, `npm run build`, and `npm run audit:adsense`.

- [ ] **Step 6: Commit automated gates**

Run `git diff --check` and commit with `test(release): add adsense readiness checks`.

### Task 6: Full verification, browser QA, and preview deployment

**Files:**
- Create/update: `output/playwright/` browser artifacts (ignored)
- Update: `docs/adsense-readiness-audit.md` with final branch evidence

**Interfaces:**
- Consumes: complete feature branch.
- Produces: command results, desktop/mobile screenshots, request evidence, preview URL/commit, and an exact Gate decision.

- [ ] **Step 1: Run all non-browser checks fresh**

Run `npm ci`, `npm audit --audit-level=high`, `npm run validate`, `npm test`, `npm run check`, `npm run build`, `npm run test:built`, `npm run audit:adsense`, `git diff --check`, and the prohibited-string scan over `dist`.

- [ ] **Step 2: Start the built site and perform real-browser QA**

Use Playwright CLI at desktop and 375px widths for home, one long guide, one boss, one fix, one hub, Search, About, Contact, Privacy, and 404. Capture overflow, title/H1, canonical, robots, console, popup/new-window, and request-host evidence.

- [ ] **Step 3: Commit final documentation and push the branch**

Commit the updated audit evidence, push `feat/adsense-readiness-howtofish`, and keep `main` unchanged.

- [ ] **Step 4: Deploy the Cloudflare preview environment**

Run `npm run deploy:preview`, record the actual returned URL/version, and confirm `X-Robots-Tag: noindex, nofollow` plus apex canonical.

- [ ] **Step 5: Repeat representative browser/network checks on Preview**

Confirm no Adsterra or advertising requests, no empty slots, correct Search robots, valid navigation/layout, and no serious console error.

- [ ] **Step 6: Evaluate every final Gate item**

Mark the project `Ready for AdSense manual setup` only if the live-site requirements are actually true. If production remains on the old Adsterra-enabled commit, report `Not ready` and name production release as the blocking Gate rather than presenting Preview readiness as production completion.
