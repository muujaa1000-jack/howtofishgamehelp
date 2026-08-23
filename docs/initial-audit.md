# Initial Audit

Checked: 2026-08-23 (Asia/Singapore)

## Workspace and tooling

- `D:\codex\howtofishgamehelp` was empty and was not a Git repository at the start.
- No root `AGENTS.md`, `package.json`, lockfile, source tree, or existing user changes were present.
- No adjacent Astro/Wrangler game-guide template was found in the quick scan, so no unrelated project will be copied or modified.
- Runtime: Node v24.14.1, npm 11.11.0, pnpm 11.19.0.
- Latest registry versions observed: Astro 7.2.4, Wrangler 4.125.0, Pagefind 1.5.2.
- Wrangler is not installed globally. `npx wrangler@latest` works, but `wrangler whoami` reports that Cloudflare is not authenticated.
- Because Cloudflare is not authenticated, Account ID, Zone ID, API scopes, existing Worker status, Email Routing status, and verified destination count cannot yet be inspected.
- GitHub CLI 2.92.0 is installed and authenticated as `muujaa1000-jack` with repository/workflow access. The target GitHub repository did not exist at audit time.

## Domain and current hosting

- Authoritative nameservers: `launch1.spaceship.net` and `launch2.spaceship.net`; the domain is not currently using Cloudflare DNS.
- Apex A records observed: `54.149.79.189` and `34.216.117.25`.
- Plain HTTP returned a Spaceship `Parking Page` with status 200. This is registrar parking, not an existing business website.
- HTTPS handshakes failed from the audit environment for both apex and `www`; no working production HTTPS site was verified.
- No MX, SPF, or DMARC record was returned. No existing mail provider was identified, but this must be rechecked immediately before any mail DNS change.
- Since the zone is not on Cloudflare and Cloudflare is not authenticated, Email Routing is not confirmed enabled and no routing rule can yet be inspected.

## Game identity and evidence boundary

- Official Steam app ID: 4001890.
- Official store data checked 2026-08-23 confirms: title `How to Fish`, developer/publisher Dazed Games, release date 2026-08-20, 1-4 player single-player/online co-op support, and 28 Steam achievements.
- Official Steam announcements checked 2026-08-23 show patches 1.0.4 and 1.0.5. Patch-sensitive claims must be verified against those notes and labeled with the verification date.
- Official material supports the broad loop (fish, sell, upgrade, quests, bosses, islands, rare variants) but not detailed boss tactics. Detailed pages require gameplay-backed or corroborating secondary evidence.

## Preservation decisions

- Do not alter current registrar DNS or parking until a Workers preview is built and verified.
- Do not change mail DNS until Cloudflare access is available and MX is rechecked.
- Do not publish the contact address in generated HTML until the exact routing rule is active and inspected.
- Cloudflare login and nameserver changes are deferred until all local work and preview-ready validation are complete.

## Subsequent authenticated readback

These findings were obtained after the local site and noindex preview had passed QA; they do not replace the initial-state record above.

- Cloudflare OAuth is authenticated for account `36e9d90b5b870bef7eb227af87a79be4` with Workers and Email Routing write access plus zone read access. Zone creation through the API was not permitted, so the zone was added through the authenticated dashboard.
- Cloudflare zone ID: `07c4cf03c4dd8d26e0ac5834e5880e79`; plan: Free Website; final status: active.
- Assigned nameservers: `anastasia.ns.cloudflare.com` and `matteo.ns.cloudflare.com`. Spaceship accepted both, and an external `1.1.1.1` readback returned the same pair.
- No existing Worker named `howtofishgamehelp` was present before deployment. The new Worker, its version history, and both custom domains belong to this project.
- The two imported apex A records were confirmed as the former Spaceship parking targets before deletion. No MX/TXT mail record was deleted or overwritten.
- Email Routing had no verified route at initial access. One already-verified destination became available after the exact destination was added; the private address is intentionally omitted here.
- GitHub CLI remained authenticated, and the project repository was created at `https://github.com/muujaa1000-jack/howtofishgamehelp`.
