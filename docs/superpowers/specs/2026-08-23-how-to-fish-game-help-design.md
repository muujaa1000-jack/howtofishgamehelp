# How to Fish Game Help Launch Design

The user's 2026-08-23 launch specification is the approved product design. This document records the implementation interpretation used for delivery.

## Experience

The site is a compact field manual, not a marketing landing page. A deep-navy "chart table" surface, warm sand reading panels, coral marker accents, contour-line textures, and an original hook-and-route insignia make it distinctive without borrowing game art. The home page starts with search and immediate player routes; guide pages open with the answer before navigation aids or any future ad position.

## Content system

Typed Markdown frontmatter stores intent, dates, version, verification state, sources, sequence links, related links, draft, and noindex. Content is rendered by one reusable guide template. `needs-review`, drafts, and weak-evidence pages never enter the indexable route or sitemap. Hub pages organize real subtopics and include useful guidance rather than link-only lists.

## Operations

Static HTML is built with Astro and indexed with Pagefind. A minimal Worker serves assets, redirects `www` to apex while preserving path/query, applies security headers, and sends `X-Robots-Tag: noindex` on workers.dev hosts. Canonicals always point to the apex domain. Contact information is controlled by a build-time public boolean and stays absent until Cloudflare Email Routing is active.

## Quality gates

Node-based tests validate content and built output. Astro type checking, production build, duplicate metadata, internal links, sitemap counts, drafts, dependency audit, browser screenshots, console errors, and a lightweight performance run are recorded. Deployment, DNS, email, and end-to-end mail receipt are reported independently; none is inferred from local success.

