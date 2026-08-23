# Manual Actions

The formal site, stable noindex preview, Email Routing configuration, Search Console ownership verification, sitemap submission, GitHub verification, and restricted Cloudflare deployment credential are complete.

## Continuous deployment decision

Cloudflare's native Workers Builds API reports that the shared Cloudflare Workers and Pages GitHub App installation is disconnected from this Cloudflare account, even though GitHub shows that the App can access `howtofishgamehelp`. Cloudflare's documented native repair is to uninstall and reinstall that shared App. Because the same installation also has access to the existing `PowerUp2Study` repository, that repair could interrupt its new automatic builds and was not performed.

Recommended: approve a repository-only GitHub Actions workflow and allow the restricted Cloudflare token to be stored as an encrypted Actions secret in `muujaa1000-jack/howtofishgamehelp`. This avoids changing the shared GitHub App installation. The secret must never be printed or committed.

Alternative: explicitly authorize uninstalling and reinstalling the shared Cloudflare GitHub App, accepting temporary interruption risk for repositories that currently depend on it. This option is not recommended without first checking the other repository's deployment setup.

## Optional receipt check

Send one message from an unrelated external mailbox to `contact@howtofishgamehelp.com` and confirm it reaches the verified destination. This is the only remaining Email Routing validation; configuration-level checks already pass.

The Search Console domain property is already verified, and `https://howtofishgamehelp.com/sitemap.xml` is already submitted with status `Success`. Account-specific verification values and the private mail destination are intentionally omitted.
