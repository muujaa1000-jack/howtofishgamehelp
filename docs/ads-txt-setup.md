# ads.txt Setup After a Real Publisher ID Exists

No `public/ads.txt` is included in this branch because no real AdSense publisher ID was provided or verified. A missing file is safer than a public placeholder that falsely identifies a seller account.

## Create the file only after AdSense supplies the ID

After the owner obtains and verifies the real `pub` identifier, create `public/ads.txt` with one plain-text line in this format:

```text
google.com, pub-真实ID, DIRECT, f08c47fec0942fa0
```

Replace `pub-真实ID` with the exact publisher ID shown in the same AdSense account used for this site. Do not guess, shorten, copy an ID from another publisher, or commit an example numeric value.

## Verification after deployment

Open `https://howtofishgamehelp.com/ads.txt` and confirm all of the following before requesting review:

- HTTP status is 200.
- `Content-Type` is plain text.
- The response contains the exact real publisher ID.
- The response is not wrapped in HTML.
- There is no explanatory comment, fake ID, or placeholder text.
- The apex-domain URL is reachable without a redirect loop.

Also compare the `pub` portion of the ads.txt line with the `ca-pub` account value used for the site-level AdSense verification meta. They must refer to the same real publisher account.
