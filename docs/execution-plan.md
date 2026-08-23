# How to Fish Game Help Execution Plan

Updated: 2026-08-23

## Goal

Build, verify, deploy, and prepare the apex-domain launch of a fast English Astro guide site backed by a source ledger. Publish only independently useful pages whose key facts clear the evidence gate; keep uncertain candidates as noindex drafts.

## Architecture

- Astro 7 + TypeScript, static output, Markdown content collection, small reusable Astro components, and CSS-only interaction where practical.
- One catch-all guide renderer backed by typed frontmatter, plus dedicated home, category, legal, contact-status, search, 404, RSS, sitemap, and robots routes.
- Cloudflare Workers Static Assets with a minimal Worker for `www` redirect, preview noindex headers, and security headers.
- Pagefind search generated after build. Ads and analytics remain disabled unless real configuration is supplied.

## Delivery stages

- [x] Audit local tools, accounts, DNS, mail, current hosting, and official game identity.
- [x] Initialize Git; add repository rules, configuration, source-ledger documents, and test-first validation.
- [x] Research official facts, current patch notes, gameplay-backed walkthroughs, achievements, and community problems.
- [x] Build the design system, navigation, search, category paths, guide layout, trust notes, SEO, structured data, and original assets.
- [x] Publish the evidence-cleared launch set; unsupported candidates were excluded instead of padded into thin pages.
- [x] Run type/build/content/metadata/link/sitemap/audit checks and desktop/mobile browser QA with screenshots.
- [x] Commit and push to GitHub; deploy and verify a noindex Workers preview.
- [x] Authenticate Cloudflare, add and delegate the zone, inspect existing Worker/email state, remove only the confirmed parking A records, and bind both production custom domains.
- [x] Onboard Email Routing, activate one exact contact route with catch-all disabled, enable the public address, deploy, and complete production-domain checks.
- [x] Verify the Search Console domain property by DNS and submit the production sitemap successfully.
- [ ] After the user clicks the newly sent Cloudflare account-verification email, connect Workers Builds to the GitHub `main` branch and create a stable account-owned `workers.dev` preview.

## Test-first checkpoints

1. A failing structure test defines required routes, schema fields, config, and privacy boundaries before implementation.
2. A failing content test defines indexability, unique metadata, source minimums, and related-link validity before publishing content.
3. A failing build-output test defines canonical, robots, sitemap, headers, drafts, and preview safeguards before deployment.
4. Browser QA checks home desktop/mobile, one hub, one progression page, one boss page, one fix page, search, menu, breadcrumbs, sequence links, 404, metadata, overflow, images, and console errors.

## Stop conditions

Only pause for a required account login/authorization, registrar nameserver action, destination verification click, paid/irreversible action, or a real existing-mail conflict. All other failures are investigated and recorded while work continues.
