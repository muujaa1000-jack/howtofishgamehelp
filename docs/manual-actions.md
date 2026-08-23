# Manual Actions

Local implementation, GitHub publication, and a noindex Workers preview are complete. Production remains behind one Cloudflare account/zone handoff.

## Required now

1. Authenticate the Cloudflare account that should own the production Worker and DNS zone when prompted by Codex.
2. After Codex adds the zone, replace the two current Spaceship nameservers at the registrar with the exact Cloudflare pair returned for this zone. No exact values are guessed in advance.
3. If Cloudflare reports that the forwarding destination is not verified, open the single Cloudflare verification email and click its confirmation link. Codex will create the exact route afterward; do not create a catch-all manually.

## After production DNS is live

1. Add the domain property `howtofishgamehelp.com` in Google Search Console.
2. Use DNS TXT verification. The exact TXT value must come from the live Search Console property; no placeholder value should be published.
3. Submit `https://howtofishgamehelp.com/sitemap.xml`.
4. Send one external test email to the public contact address and confirm receipt before calling mail delivery end-to-end verified.

Exact account-specific values are intentionally omitted until they can be read from the live account.
