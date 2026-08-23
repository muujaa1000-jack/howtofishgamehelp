# How to Fish Game Help

Independent English guides for Dazed Games' *How to Fish*. The site is designed for static generation and deployment through Cloudflare Workers Static Assets.

## Local workflow

Commands will be available after implementation:

- `npm run check` — Astro/TypeScript validation
- `npm test` — source and built-site quality gates
- `npm run build` — production build plus Pagefind index
- `npm run preview` — local production preview
- `npm run deploy:preview` — temporary Workers preview where supported

Ads, analytics, and the public contact address are disabled by default. See `.env.example` for non-secret switches.

