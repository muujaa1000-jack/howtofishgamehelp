# AdSense Readiness Design

Date: 2026-08-25 (Asia/Singapore)

## Objective

Prepare `howtofishgamehelp.com` as a first-site AdSense application candidate without creating an AdSense account, publishing a fake publisher identifier, enabling Auto ads, restoring Adsterra, or changing production before the owner approves a release.

## Verified baseline

- Repository: `D:\codex\howtofishgamehelp`, clean `main` at `881cc4f382bb9a6609d222cba68fc496a1f7a452` before this branch.
- Production deployment: Cloudflare Worker version `13382136-4365-44ed-9326-4f6f99105170`, tagged to the same commit.
- Production sitemap: 43 URLs on 2026-08-25; Search and 404 are excluded.
- Production guide pages load GA4 and two Adsterra units. GitHub variables currently enable both systems.
- Production has no AdSense account meta and `/ads.txt` returns 404.
- Latest official game release evidence: Patch 1.0.9, announced by Dazed Games on 2026-08-25 in Asia/Singapore. It adds difficulty settings and Steam relay diagnostics and uses qualified language for save/equipment-crash fixes.

## Architecture

### Evidence and release metadata

Keep the existing Astro content collection and extend its metadata rather than introducing a second content system. Every public guide records a real source-review date, evidence-through version, first-hand testing status, patch sensitivity, and a default-false advertising eligibility flag. A central release record supplies the current official patch label and announcement URL; it does not overwrite per-page evidence automatically.

The guide layout will display `Last source review`, `Evidence reviewed through`, and a source-based testing statement. `lastVerifiedAt` and `gameVersion` remain compatible fields while the new fields make their meaning explicit.

### Advertising boundary

Remove active Adsterra components, keys, script origins, environment switches, production workflow variables, and CSP allowances. No local, preview, or future production build may contain an Adsterra executable path or empty advertisement container.

AdSense readiness uses one configuration module. It validates an optional `PUBLIC_GOOGLE_ADSENSE_ACCOUNT` and emits exactly one account meta tag only when the value is a real-format `ca-pub` identifier. `PUBLIC_ADSENSE_ENABLED` remains false during application preparation. Guide metadata is default-deny; only specifically reviewed long-form guide pages may set `adEligible: true`. Hubs, Search, trust/legal pages, 404, XML, and empty states never opt in.

No Auto ads loader or working ad unit is added in this branch. The existing content-splitting helper stays available for a later manual-slot implementation, preventing a second insertion algorithm.

### Indexing and trust pages

`BaseLayout` accepts an explicit robots value. Search renders `noindex,follow`, remains out of the sitemap, has no advertising path, and retains useful category links without JavaScript. The 404 remains `noindex,nofollow`. Legal/trust pages stay indexable but ineligible for ads.

About, Contact, and Privacy use one public contact identity. They distinguish source review from playtesting, explain corrections and rights requests, disclose actual GA4 and disabled-Adsterra status, and add forward-looking AdSense cookie disclosure without claiming that AdSense ads or a certified CMP are active.

### Content depth

Review every existing guide against Patch 1.0.9 and record the decision in a patch-impact matrix. Expand the five requested priority guides to independently useful long-form pages. Add the three Patch 1.0.9-supported issue pages because the official announcement directly supports those intents. Each new page separates official facts, bounded troubleshooting, unknowns, and recovery steps.

Category hubs remain indexable and ad-ineligible. Their existing field-note data expands to provide a 350–600-word orientation, reading order, current-patch impact, and accurate page summaries without turning hubs into duplicate guides.

### Assets

Keep only the existing original brand SVGs, generated original OG image, web manifest, and QA screenshots. Record each in an asset-rights ledger. The public site will not add Steam screenshots, official logos, community images, or third-party artwork during this task.

### Verification and release

Add one deterministic AdSense audit command that reads source metadata and built output. It checks prohibited ad code and fake IDs, controlled-page eligibility, Search robots/sitemap behavior, canonical host, metadata completeness, placeholders, and AdSense meta behavior in both unconfigured and configured test builds.

Run the repository's content validation, source tests, Astro/TypeScript checks, production build, built-site tests, link checks, and prohibited-string scan. Then use a real browser at desktop and mobile widths on the requested page classes and inspect requests for advertising hosts.

Deploy only the feature branch to the noindex Cloudflare preview environment. Production remains on `881cc4f` until the owner approves release; therefore the final submission Gate must remain `Not ready` if live production still loads Adsterra.

## Error handling and safety

- Invalid or missing AdSense account values produce no meta tag and no build-time placeholder.
- Missing new content metadata produces validator warnings while schema defaults preserve old entries; all public entries changed in this branch receive explicit values.
- A source claim not supported by official material remains `Unknown`, patch-sensitive, or source-based.
- Preview deploy evidence includes the returned URL, version/deployment ID when available, commit, noindex header, and post-deploy browser/network checks.
- Production variables, Worker deployment, AdSense account data, CMP configuration, and review submission are not changed in this branch.

## Acceptance criteria

The branch passes all repository checks, the new AdSense audit, built-output scans, and browser QA. Preview contains no Adsterra code or requests, Search is `noindex,follow`, all controlled pages are ad-ineligible, AdSense meta is absent without a valid real-format value, and the required documentation records evidence and manual follow-up accurately.
