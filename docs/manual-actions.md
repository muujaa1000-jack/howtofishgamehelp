# Manual Actions

The formal site, stable noindex preview, Email Routing configuration, Search Console ownership verification, sitemap submission, GitHub verification, restricted Cloudflare deployment credential, and `main`-only GitHub Actions deployment are complete.

## Continuous deployment

No deployment action is required. A repository-only GitHub Actions workflow now validates, builds, uploads, and promotes the production Worker whenever `main` changes. Its first route-safe run completed successfully on 2026-08-23. Native Cloudflare Workers Builds remains unused because its shared GitHub App connection reports Cloudflare SCM error `8000008`; changing that shared installation is unnecessary while the Actions path is healthy.

## Optional receipt check

Send one message from an unrelated external mailbox to `contact@howtofishgamehelp.com` and confirm it reaches the verified destination. This is the only remaining Email Routing validation; configuration-level checks already pass.

The Search Console domain property is already verified, and `https://howtofishgamehelp.com/sitemap.xml` is already submitted with status `Success`. Account-specific verification values and the private mail destination are intentionally omitted.
