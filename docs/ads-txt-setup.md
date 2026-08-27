# ads.txt Setup

`public/ads.txt` contains the AdSense publisher record supplied by the site owner:

```text
google.com, pub-1734822721111637, DIRECT, f08c47fec0942fa0
```

The numeric `pub` portion matches the configured `ca-pub` account value. Do not add placeholder IDs or records for unapproved advertising systems.

## Verification after deployment

Open `https://howtofishgamehelp.com/ads.txt` and confirm all of the following before requesting review:

- HTTP status is 200.
- `Content-Type` is plain text.
- The response contains the exact real publisher ID.
- The response is not wrapped in HTML.
- There is no explanatory comment, fake ID, or placeholder text.
- The apex-domain URL is reachable without a redirect loop.

Also compare the `pub` portion of the ads.txt line with the `ca-pub` account value used for the site-level AdSense verification meta. They must refer to the same real publisher account.
