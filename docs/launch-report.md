# Launch Report

Checked: 2026-08-23 (Asia/Singapore)

Status: **Preview complete; production blocked by Cloudflare authentication and zone delegation.** The formal domain is still a registrar parking page, so this report does not call the site fully launched.

## Deployment and repository

- Formal URL: `https://howtofishgamehelp.com/` — **not live yet**.
- Verified noindex Workers preview: `https://howtofishgamehelp-preview.confused-column.workers.dev/`.
- Configured production Worker name: `howtofishgamehelp`.
- Temporary preview Worker: `howtofishgamehelp-preview`.
- Preview version ID: `a2eb0bba-7054-418b-b445-910ada354dcc`.
- Deployment result: 152 build files read, 103 static assets present in the final version, Worker startup measured at 5 ms, and the preview environment deployed cleanly.
- Production deploy attempt: assets uploaded, but custom-domain creation was rejected because Cloudflare could not infer a zone that has not been added/delegated. No registrar DNS was changed.
- Rollback: a temporary preview can be replaced by another preview deployment. After authenticated production deployment, list versions and use `wrangler rollback <VERSION_ID>`; retain the previous version ID before each release.
- GitHub: `https://github.com/muujaa1000-jack/howtofishgamehelp`.
- Branch: `main`.
- Validated source commit before final QA/report updates: `05c6a16`.
- Final handoff commit: use `git rev-parse HEAD`; the exact value is also reported in the Codex delivery response.

## Published scope

- Public English guide pages: **31**.
- Draft guide pages: **0**. Unsupported candidate intents were excluded rather than published as thin drafts.
- Indexable URLs in `sitemap.xml`: **43** — 31 guides, 7 category hubs, the home page, and 4 trust/legal pages.
- Generated HTML pages: **46** — the indexable set plus noindex Contact, search, and 404 pages.
- Six reporting groups:
  - Guides and Walkthrough: 5
  - Islands: 5
  - Bosses: 6
  - Items: 6
  - Achievements: 4
  - Fixes: 5

## Verification results

- Dependency install: passed with locked versions.
- Type check: passed with 0 errors, 0 warnings, and 0 hints.
- Static build: passed; Astro generated the full route set and Pagefind indexed all 31 guide pages.
- Content validation: passed; 31 public guides, 0 drafts, 0 schema/evidence/route errors.
- Automated tests: source structure, content quality, privacy, metadata, built output, and sitemap tests passed.
- Duplicate slug/title/description check: passed.
- Internal link and asset check: passed across every generated HTML page.
- Draft leakage check: passed.
- Dependency audit: 0 known vulnerabilities.
- Sitemap: `https://howtofishgamehelp.com/sitemap.xml`, 43 apex-domain URLs, no preview URLs.
- Browser QA: desktop and mobile home, mobile menu, Bosses hub, first-island progression, Spider Crab boss, multiplayer black-screen fix, Pagefind search, breadcrumbs, table of contents, previous/next navigation, OG/canonical metadata, Contact status, and custom 404 all checked.
- Browser layout: no horizontal overflow, text overlap, broken images, or serious console errors. The intentional unknown URL produced the expected document-level 404 console entry only.
- Screenshots: stored in `docs/qa-screenshots/`.
- Lighthouse local production build: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.799 s, LCP 0.908 s, CLS 0. The report was written successfully; Lighthouse then emitted a Windows temporary-directory cleanup warning, which did not invalidate the measurements.
- Preview headers: CSP, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options: DENY`, and `X-Robots-Tag: noindex, nofollow` verified.
- Preview pages: home, representative Hub/progression/Boss/Fix pages, Contact, search, sitemap, and robots returned 200; an unknown route returned 404.

## DNS, HTTPS, canonical, and contact

- Current nameservers: still the two Spaceship nameservers recorded in the initial audit.
- Current apex A records: `54.149.79.189` and `34.216.117.25`.
- Current apex HTTP: 200 registrar parking page, no redirect.
- Current apex HTTPS: TLS handshake failed; formal HTTPS is not live.
- `www` redirect: implemented and type-checked in the Worker, but not production-verified because custom domains are not bound.
- HTTP-to-HTTPS: implemented in the Worker, but not production-verified for the same reason.
- Canonical: verified locally and on Workers preview; all point to the HTTPS apex domain and preserve the trailing-slash policy.
- Email Routing zone onboarded: no.
- Destination verified: unable to inspect without Cloudflare authentication; no private destination is stored in the repository or report.
- Exact contact route active: no.
- End-to-end receipt test: not performed.
- Contact page: noindex status page; the public address is intentionally absent from generated HTML until the exact routing rule is active.
- Ads: disabled; no ad script, seller ID, or fake `ads.txt`.
- Analytics: disabled; no analytics request or placeholder ID.
- User action still required: Cloudflare authentication, registrar nameserver change after zone creation, and possibly one destination-verification click.

## Evidence limits

- A shark attack is described by walkthrough sources, but a separate Shark boss was not sufficiently established, so no standalone page was published.
- The candidate Tablet progression item was not supported strongly enough by the reviewed evidence.
- Exact drop rates, spawn timers, prices, and damage values were omitted where current public evidence was incomplete.
- Lost-item/save-loading reports lacked enough current official or repeatable evidence for a useful standalone fix page.
- A complete rare-fish/Fishipedia location checklist needs direct gameplay or video verification beyond the official achievement list.
- Multiplayer and achievement fixes are patch-sensitive and are explicitly dated to versions 1.0.4/1.0.5 where official notes support them.

## Next five evidence-gated pages

1. Who Stole My Beer quest walkthrough.
2. Endangered Fish bait and Tourist hand-in.
3. Beginner Boss Lure location and when it is useful.
4. Killscore multiplier and safe money-routing explanation.
5. Fishipedia and Drip Fish location checklist, only after complete gameplay verification.

## Branding asset record

- Original OG image: `public/og-default.png`, generated as a new image and resized to 1200×630.
- Generation prompt summary: a clean editorial nautical route-map graphic for an independent How to Fish guide brand, deep navy with sand and coral accents, using an original fish-hook mark and no game artwork, screenshots, or official logos.
- Original SVG logo and favicon were created locally and do not imitate the official game identity.
