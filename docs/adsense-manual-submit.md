# AdSense Manual Setup and Submission

Complete these steps only after the branch has been released to production and the live AdSense Gate has been rechecked.

1. Check whether the owner already has an AdSense account. Do not create a second account to work around an old or pending account.
2. Register or continue with a long-term Google account controlled by the owner.
3. Enter the real country, legal name, payment profile, and address. Codex must not invent or submit identity/payment information.
4. Add only `howtofishgamehelp.com` as the site for this application.
5. Obtain the real `ca-pub` account value and matching `pub` identifier from AdSense.
6. Configure the production `PUBLIC_GOOGLE_ADSENSE_ACCOUNT` value with the exact real `ca-pub` value. Keep `PUBLIC_ADSENSE_ENABLED=false` during review preparation and do not enable Auto ads.
7. Create the real `public/ads.txt` line described in `docs/ads-txt-setup.md`, deploy it, and verify the apex URL returns the correct plain-text response.
8. Create and publish a Google-certified CMP through **Privacy & messaging → European regulations → Create message**.
9. Verify the site-level AdSense meta appears exactly once, ads.txt contains the correct account, the CMP choices work, and no old Adsterra request is made.
10. In AdSense, click **Request review** only after the live-site Gate passes. Codex must not click this button on the owner's behalf.
11. During review, keep Adsterra, Auto ads, popunders, Social Bar, interstitials, Direct Links, and other intrusive formats disabled.
12. The owner, family members, staff, and collaborators must never click the site's ads or ask anyone else to click them.

## Separate manual checks

- Send a real external email to `contact@howtofishgamehelp.com` and confirm receipt. Configuration evidence alone is not an end-to-end delivery test.
- Recheck the live production sitemap, canonical host, Search robots directive, account meta, ads.txt, CMP behavior, and network requests immediately before requesting review.
- Do not describe the application as submitted or approved until the corresponding AdSense account screen confirms that state.
