# Launch Report

Checked: 2026-08-23 (Asia/Singapore)

Status: **Formal site live with automatic production deployment.** Production content, DNS, HTTPS, redirects, Email Routing, Contact publication, Search Console verification, sitemap submission, the stable noindex preview, and `main`-only GitHub Actions deployment are complete. Native Cloudflare Workers Builds is not attached because Cloudflare reports that the shared GitHub App installation is disconnected from this Cloudflare account; the repository-only Actions path is the active replacement.

## Deployment and repository

- Formal URL: `https://howtofishgamehelp.com/` — live and returning the project home page with status 200.
- Stable noindex preview: `https://howtofishgamehelp-preview.howtofishgamehelp.workers.dev/`.
- Production Worker name: `howtofishgamehelp`.
- Active production version ID: `05063a2b-ad9b-40b0-a9b8-29cd732a30e0`.
- Active deployment: promoted by GitHub Actions at `2026-08-23T15:09:46Z`, routing 100% to the version above.
- Production custom domains: apex ID `6c8f634aa5137d30a9d3cd854dc97cddd4551345`; www ID `06f2274628da5649cc17255db24c1039db59eb70`.
- Previous production version: `496d6abe-a606-4fd9-b5a4-a5959d209ca1`. Roll back with `npx wrangler rollback 496d6abe-a606-4fd9-b5a4-a5959d209ca1`, then repeat the formal-domain checks.
- Cloudflare account-email verification is complete. Wrangler subsequently deployed the account-owned preview without the earlier account-subdomain error.
- Stable preview version ID: `9dc7cceb-23aa-4362-b36d-f7752efd9704`. Home and guide routes return 200 with `X-Robots-Tag: noindex, nofollow`; canonical links point to the formal apex domain. The preview Contact route is 404 and does not publish the contact address.
- GitHub: `https://github.com/muujaa1000-jack/howtofishgamehelp`.
- Branch: `main`.
- Final commit: reported by `git rev-parse HEAD` in the Codex delivery response after this report is committed.
- GitHub verification: complete. The Cloudflare Workers and Pages GitHub App can access both the existing `PowerUp2Study` repository and `howtofishgamehelp`; the existing repository was preserved when access was updated.
- Cloudflare deployment credential: the first token created during setup was revoked after its one-time display was exposed in local tool output. A replacement user token named `howtofishgamehelp-workers-builds-deploy` is active, limited to the current Cloudflare account, and has only Workers Builds Configuration: Edit and Workers Scripts: Edit. No token secret was written to this repository, Git history, documentation, or static output.
- Workers Builds token: `howtofishgamehelp-workers-build-token` is registered and active for the replacement credential.
- Native Workers Builds repository connection: not created. The official `PUT /builds/repos/connections` request returned Cloudflare code `8000008`: the project is disconnected from the Git account. The GitHub App is installed and has repository access, but Cloudflare does not have a usable account-side SCM connection record.
- Automatic deployment uses `.github/workflows/deploy-production.yml`, triggers only on pushes to `main` or manual dispatch, and stores only the encrypted `CLOUDFLARE_API_TOKEN` secret plus the non-secret `CLOUDFLARE_ACCOUNT_ID` repository variable. No credential value is stored in Git.
- Verified Actions run `32647641557` completed successfully in 45 seconds at commit `a4dc6789304d21b503fec6cfeb553f24031346c0`. All gates passed before version `05063a2b-ad9b-40b0-a9b8-29cd732a30e0` was promoted to 100%.
- The initial Actions run `32647317534` uploaded and deployed version `496d6abe-a606-4fd9-b5a4-a5959d209ca1` but ended with an authentication error when the normal deploy command attempted to read custom-domain routes. The corrected workflow uses version upload and promotion, preserving the restricted token and leaving route ownership unchanged.
- Cloudflare's native repair would require changing the shared GitHub App installation and could affect the unrelated existing repository. It was not needed or performed.

## Published scope

- Public English guide pages: **31**.
- Draft guide pages: **0**. Unsupported candidate intents were excluded rather than published as thin drafts.
- Indexable URLs in `sitemap.xml`: **44** — 31 guides, 7 category hubs, the home page, 4 trust/legal pages, and the now-active Contact page.
- Generated HTML pages: **46** — the indexable HTML set plus noindex search and 404 pages; the sitemap and feeds are separate outputs.
- Six reporting groups:
  - Guides and Walkthrough: 5
  - Islands: 5
  - Bosses: 6
  - Items: 6
  - Achievements: 4
  - Fixes: 5

## Build and content verification

- Dependency install: passed with locked versions.
- Type check: passed with 0 errors, 0 warnings, and 0 hints.
- Static build: passed; Astro generated 46 HTML pages and Pagefind indexed all 31 guide pages.
- Content validation: passed; 31 public guides, 0 drafts, 0 schema/evidence/route errors.
- Automated tests: source structure, content quality, privacy, metadata, built output, and sitemap tests passed.
- Contact/sitemap dual-state tests: passed with Contact disabled and enabled; the enabled production build has 44 sitemap URLs and an indexable mail link.
- Duplicate slug/title/description check: passed.
- Internal link and asset check: passed across every generated HTML page.
- Draft leakage check: passed.
- Dependency audit: 0 known vulnerabilities.
- Ads: disabled; no ad script, seller ID, fake `ads.txt`, or empty ad box.
- Analytics: disabled; no analytics request or placeholder ID.

## Browser, layout, and performance QA

- Checked desktop and mobile home, mobile menu, Bosses hub, first-island progression, Spider Crab boss, multiplayer black-screen fix, Pagefind search, breadcrumbs, table of contents, previous/next navigation, OG/canonical metadata, Contact state, and custom 404.
- No horizontal overflow, text overlap, broken images, or serious console errors were found. The intentional unknown URL produced the expected document-level 404 console entry only.
- Screenshots are stored in `docs/qa-screenshots/`.
- Lighthouse local production build: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.799 s, LCP 0.908 s, CLS 0. The report completed before a Windows temporary-directory cleanup warning.
- Production security headers verified: CSP, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, and `X-Frame-Options: DENY`.
- GitHub Actions runner note: GitHub currently forces the v4 checkout and Node setup actions from their Node 20 runtime to Node 24. This is a platform deprecation warning, not a build or deployment failure; the workflow's project runtime remains Node 22.12.0.

## Formal-domain verification

- `https://howtofishgamehelp.com/`: 200, correct title, canonical, OG image, and no former parking content.
- `https://www.howtofishgamehelp.com/`: 301 to HTTPS apex.
- Both HTTP hostnames: 301 to HTTPS apex.
- www redirects preserve path and query string; verified with `/bosses/?utm_source=qa`.
- Representative Hub, progression, Boss, Fix, Contact, sitemap, and robots routes: 200.
- Unknown route: 404 with the custom page.
- Sitemap: 44 apex-domain URLs, includes Contact, excludes search/404/preview hosts.
- Canonical: all reviewed pages point to the HTTPS apex domain with the trailing-slash policy.
- HTTPS: active Cloudflare certificates exist for apex and www.
- Old parking A records: both exact imported Spaceship targets were reviewed and removed after preview QA; email records were preserved.
- Authoritative DNS: Cloudflare zone `07c4cf03c4dd8d26e0ac5834e5880e79` is active on the Free Website plan. External resolver readback matches the assigned nameservers.
- Post-Actions verification repeated the apex, www, HTTP, representative content, Contact, sitemap, robots, missing-route, preview-noindex, canonical, MX, SPF, GSC TXT, and nameserver checks successfully.

## Email Routing and Contact

- Zone onboarding: complete; Email Routing status `ready` and enabled.
- Destination verified: yes; the private destination is intentionally omitted.
- Exact public rule: one active literal matcher for `contact@howtofishgamehelp.com` forwarding to the verified destination.
- Catch-all: disabled. No extra public aliases were created.
- DNS: three Cloudflare MX records, SPF, and DKIM are present; MX and SPF resolve externally.
- Contact page: 200, indexable, includes the public `mailto:` link, and does not contain the private destination.
- End-to-end receipt test: not performed; configuration-level and DNS readbacks passed.

## Google Search Console

- Domain property `howtofishgamehelp.com`: verified by the live DNS TXT method.
- Sitemap submitted: `https://howtofishgamehelp.com/sitemap.xml`.
- Search Console readback: status **Success**, submitted/read on 2026-08-23, **44 discovered pages**, 0 discovered videos at submission time.
- The DNS verification record remains in place to preserve ownership.

## Remaining user action and follow-up

- Send one external email to the public Contact address and confirm receipt before calling mail delivery end-to-end verified.
- No other Cloudflare, GitHub, nameserver, destination, DNS, GSC, ad, analytics, or deployment action is required for the current live site.

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
