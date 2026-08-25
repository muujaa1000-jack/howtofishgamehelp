# AdSense Readiness Audit

Audit date: 2026-08-25 (Asia/Singapore)

This document separates confirmed observations from open checks. It is not evidence that Google AdSense has approved the site.

## Repository and deployment baseline

| Item | Confirmed baseline |
|---|---|
| Repository | `D:\codex\howtofishgamehelp` |
| Starting branch | `main` |
| Starting commit | `881cc4f382bb9a6609d222cba68fc496a1f7a452` |
| Working branch | `feat/adsense-readiness-howtofish` |
| Production Worker version | `13382136-4365-44ed-9326-4f6f99105170` |
| Production release tag | `release-881cc4f382bb9a6609d222cba68fc496a1f7a452-32706483023-1` |
| Production verification | `https://howtofishgamehelp.com/` returned HTTP 200; `www` returned one HTTP 301 to the apex domain |
| Production sitemap checked | `https://howtofishgamehelp.com/sitemap-0.xml` contained 43 URLs |
| Production ads.txt | `https://howtofishgamehelp.com/ads.txt` returned HTTP 404; no placeholder seller line was published |

The current production deployment is not changed by this feature branch. A production release requires separate owner approval.

## Page and template baseline

| Class | Routes at baseline | Index state | Advertising state at baseline |
|---|---:|---|---|
| Complete guide template | 31 Markdown-backed routes | Indexable unless frontmatter says otherwise | Two Adsterra units were rendered on each current guide in the enabled production configuration |
| Category Hub template | 7 routes | Indexable | No guide ad components |
| Search | 1 route | `noindex,nofollow`; absent from the Astro-generated sitemap | No guide ad components |
| Trust/legal | About, Contact, Privacy, Terms, Disclaimer | Indexability varies with Contact build configuration | No guide ad components |
| Error | Custom 404 | Noindex | No guide ad components |
| XML/feed | sitemap and RSS | Machine-readable | No guide ad components |

The existing content is generated through one Astro collection, one concrete-guide route, and one category-Hub route. The existing `splitGuideContent.ts` helper is the only body-splitting implementation and must be retained for any later manual ad slot.

## Advertising and analytics baseline

Confirmed from repository code, current GitHub repository variables, current production guide HTML, and the production response CSP:

- `PUBLIC_ADS_ENABLED`, both Adsterra unit flags, and `PUBLIC_ANALYTICS_ENABLED` were set to `true` in the current production repository variables.
- A production Pufferfish guide contained two Adsterra unit markers, both third-party script URLs, and a GA4 loader.
- The Worker CSP allowed `profitableratecpmnetwork.com`, `highrevenueformat.com`, Google Tag Manager, and Google Analytics connections.
- Home did not contain guide ad units because the existing integration was limited to concrete guides; this did not prove that Adsterra was off site-wide.
- No `google-adsense-account` meta was found on the production guide.
- No AdSense Auto ads loader was found in the repository or checked production HTML.
- No Google-certified CMP or consent-choice interface was found. GA4 loaded when its environment switch was enabled, without a user choice in the site code.

Required branch action: remove all active Adsterra code and CSP allowances, keep analytics/advertising disabled until a real consent path exists where required, and add only validated AdSense-account meta capability.

## Game release and evidence baseline

- All 31 existing guides used `gameVersion: "1.0.5"` and `lastVerifiedAt: 2026-08-23`.
- The official Dazed Games announcement list was checked on 2026-08-25.
- The newest official entry was [Patch 1.0.9](https://steamcommunity.com/games/4001890/announcements/detail/711158520539514352), published at 2026-08-24 17:07 UTC (2026-08-25 in Asia/Singapore).
- Patch 1.0.9 adds Easy and Hard alongside the prior/default difficulty, adds a red Steam relay diagnostic, and says save corruption was “hopefully” fixed while directing remaining save/equipped-weapon crash cases to the community Discord.
- Patch 1.0.8 changes PlayStation controller glyphs and the fire-sizzle FX volume link.
- Patch 1.0.6 changes save-file validation and when local/server saves are written around crashes.

These announcements do not prove first-hand play, hidden numbers, complete bug resolution, achievement behavior under every difficulty, or per-player scaling. The page-by-page decisions belong in `docs/patch-impact-matrix.md`; there will be no global version-number replacement.

## Content depth and duplication baseline

- Existing guide bodies ranged from approximately 313 to 398 English words using the repository's word-count convention.
- The five requested priority routes were all below 400 words and needed purposeful expansion.
- Category Hub explanatory copy was below the requested 350–600-word range.
- The computed Guides Hub title was `Guides Guides`, creating a visible duplicate word.
- No duplicate concrete-guide title, description, or route was reported by the existing validator.
- Public content already included source lists and an explicit no-first-hand-testing note, but the visible label `Last checked` did not distinguish source review from game testing.

## Asset baseline

- Public visuals are limited to locally created brand SVGs, a generated original OG image, and manifest references.
- No Steam screenshot, official game logo, community image, competitor image, or third-party inline guide image was found in the public source.
- Historic browser QA screenshots are stored under `docs/qa-screenshots/` and are documentation artifacts, not public guide illustrations.
- The launch report records `public/og-default.png` as an original generated graphic and the SVG mark/favicon as locally created.

The per-file review and usage basis will be recorded in `docs/asset-rights-ledger.md`.

## Confirmed problems

1. Production concrete guides currently load Adsterra and GA4.
2. Active Adsterra domains and code remain in components, configuration, workflow variables, tests, and Worker CSP.
3. Non-production builds render empty advertising placeholders.
4. Advertising eligibility is template-wide rather than default-deny per guide.
5. Search uses `noindex,nofollow` instead of the required `noindex,follow`.
6. Privacy describes enabled Adsterra but does not contain the required future AdSense cookie disclosure.
7. About and Contact are conditional in ways that can show inconsistent email wording between build configurations.
8. All current guide metadata stops at Patch 1.0.5 even though later official patches exist.
9. Priority guides and category Hub explanations are too brief for the intended independent intents.
10. No automated AdSense readiness command exists.

## Open or manual checks

- End-to-end receipt at `contact@howtofishgamehelp.com` has not been demonstrated; only routing/configuration and public-page evidence exists.
- Whether the owner already has an AdSense account cannot be determined from the repository.
- Real `ca-pub` and `pub` identifiers do not exist in the repository and must come from the owner's AdSense account.
- A Google-certified CMP is not configured or published.
- Production will remain non-compliant until the owner approves and deploys the final branch and the live site is rechecked.

## Gate status at baseline

**Not ready.** The live site loads Adsterra on guide pages, uses outdated release metadata, lacks the AdSense cookie disclosure and default-deny guide eligibility, and has not completed the requested content, audit, Preview, or browser checks.
