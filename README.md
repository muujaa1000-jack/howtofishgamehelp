# How to Fish Game Help

Independent English guides for Dazed Games' *How to Fish*. The site is designed for static generation and deployment through Cloudflare Workers Static Assets.

## Local workflow

Available commands:

- `npm run check` — Astro/TypeScript validation
- `npm test` — source, content, privacy, and built-site quality gates
- `npm run validate` — editorial schema, evidence, metadata, and internal-route validation
- `npm run docs:content` — regenerate the content map and evidence ledger from frontmatter
- `npm run build` — production build plus Pagefind index
- `npm run preview` — local production preview
- `npm run deploy:temporary` — unauthenticated, noindex Workers preview
- `npm run deploy` — authenticated custom-domain production deployment after the Cloudflare zone is ready

The production Worker serves only the formal custom domains; the separate preview environment keeps its `workers.dev` URL and noindex headers. Advertising and analytics are disabled during AdSense review preparation. The configured public contact address is shared by About and Contact. See `.env.example` for the optional AdSense verification value.
