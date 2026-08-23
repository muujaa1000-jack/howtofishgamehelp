# Repository Rules

These rules apply to every change in this repository.

## Code

- Use TypeScript. Keep the site static-first, mobile-first, and low-JavaScript.
- Reuse focused components. Do not hard-code secrets, tokens, account details, or private routing addresses.
- Add a dependency only when it provides a necessary capability that cannot be kept simpler in the project.
- After changes, run the production build, type check, content validation, duplicate metadata check, internal-link check, and basic page tests.
- Do not hide errors by disabling checks, deleting tests, or introducing broad `any` types.

## Content

- Published site content is English. Internal operational documentation may be English or Chinese.
- Never claim first-hand play, first-hand testing, developer confirmation, or official status without evidence.
- Do not copy wording from Steam, forums, wikis, media, videos, or competing guide sites. Synthesize the minimum facts and write independently.
- One independently useful search intent maps to one page. Merge thin or overlapping ideas.
- Do not invent numbers, spawn times, drop rates, quest conditions, version details, names, or locations.
- `updatedAt` records a real edit; `lastVerifiedAt` records a real source check. Unknown versions are `Unknown`.
- Use `complete`, `all`, or `ultimate` only when the coverage is demonstrably complete.
- Unverified claims stay draft or are explicitly labeled as community reports. Empty, generic, or summary-only pages do not publish.

## SEO

- Each indexable page solves one main intent, with matching title, H1, slug, description, and body.
- Every indexable page has an apex-domain canonical. Drafts, search results, and low-value system states are noindex.
- Internal links follow real player journeys. Do not make doorway pages, keyword variants, hidden text, stuffed copy, or artificial backlinks.
- Never fabricate authors, reviews, ratings, dates, or structured data.

## Commercial

- Keep reusable ad-slot components but leave ads disabled until real approved configuration exists.
- Do not create fake ad code, seller IDs, or `ads.txt` entries. Disabled ads render no empty boxes.
- When enabled, ads reserve space and never precede the direct answer or cover navigation/content.
- No autoplay, forced redirects, pop-ups, fake downloads, or unapproved third-party scripts.

## Email and privacy

- The public contact address is `contact@howtofishgamehelp.com` only after its exact Cloudflare Email Routing rule is active and configuration-checked.
- The private forwarding destination is configuration-only. It must never appear in source, Git, examples, public docs, screenshots, reports, or replies.
- Configure only the exact public address; do not enable catch-all or create extra aliases.
- Do not add paid mail, email sending, third-party mail, or a contact form without a real backend.
- Do not claim end-to-end receipt unless a test message was actually received.

