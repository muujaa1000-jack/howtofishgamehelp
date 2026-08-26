# Search Opportunity Optimization Design

## Objective

Improve the first search-visible pages without creating overlapping keyword pages. This batch will strengthen the existing Island 3 answer, add one independently useful Tuna mini-boss guide, and expose four high-friction answers through concise internal-link shortcuts.

## Scope

The implementation includes three changes.

1. Update `/islands/island-three-desert/` so its title, description, direct answer, headings, and troubleshooting copy naturally answer the observed variants `third island`, `get to island 3`, and `beat island 3`.
2. Publish `/bosses/tuna/` as a focused guide for starting the Tuna encounter, defeating the mini-boss, preserving the Tuna body, and continuing to the terrorizing bird encounter.
3. Add a small static quick-answer link group to the homepage and relevant category hubs. The initial links will lead to the existing boat-key unlock guide, radar guide, Island 3 guide, and new Tuna guide.

The batch does not add Bean, Cod, Drip, fish-location, item-loss, or endgame-fix pages. Those topics need more evidence or repeated search demand.

## Content Boundaries

Published copy remains English and independently written. It will not claim first-hand play, official confirmation, exact health, damage, timing, spawn rate, drop rate, or guaranteed behavior unless a cited source supports the statement.

The Tuna page will use the existing gameplay-guide evidence already cited by the Island 4 and terrorizing bird pages, plus the official Patch 1.0.9 announcement for the difficulty boundary. Community discussions justify the search opportunity but will not be presented as proof of the route or combat method.

`updatedAt` will change only on pages edited in this batch. `lastVerifiedAt` and `lastSourceReview` will change only when the corresponding sources are reviewed again during implementation. The new page will use version and verification metadata consistent with the reviewed sources.

## Page Design

### Island 3

The existing route remains the canonical answer. The page will retain its desert progression scope and add query language without creating separate pages for numbered-island variants. The opening answer will directly explain how to reach, complete, and leave the third island. The body will keep the grill and tourist quest distinction, Carrot bait, Pufferfish fight handoff, and return step.

### Tuna mini-boss

The new page will have one main intent: defeat Tuna and preserve the required body for the bird encounter. It will include the repository-standard quick steps, failure checks, solo and co-op notes, Patch 1.0.9 difficulty boundary, and next-step links. It will link to Island 4, lures and bait, weapon progression, and the terrorizing bird guide. The neighboring Island 4, boss hub, and terrorizing bird content will link back to Tuna.

### Quick-answer links

A small reusable `QuickAnswerLinks` Astro component will render a heading and a short list of descriptive links. It will use static data from `src/config/site.ts`, no client-side JavaScript, and no new dependency.

The homepage will show all four links. Category hubs will show only links relevant to that section. Existing guide cards remain unchanged, and the quick links will not replace the editorial Hub copy.

## Data Flow and Failure Behavior

The component receives an array of `{ label, href }` records. An empty array renders nothing. All href values are internal absolute paths ending in `/`. Build-time content and internal-link checks must fail if a configured destination does not exist.

Content remains generated through the existing Astro content collection. The content documentation exporter will regenerate `docs/content-map.csv` and `docs/evidence-ledger.csv` after the new guide passes validation.

## Test Strategy

Tests will be added before production changes.

- A source-level content test will require the new Tuna route, its evidence metadata, its standard sections, and bidirectional links to the bird encounter.
- A source-level test will require the Island 3 page to contain the approved query variants while keeping one canonical route.
- A built-site test will require the homepage and relevant category hubs to expose the four quick-answer destinations.
- Existing uniqueness, metadata, source, privacy, ad, and internal-link tests will remain enabled.

Implementation is complete only after the production build, type check, content validation, duplicate metadata check, internal-link check, and basic page tests pass. Desktop and mobile browser screenshots will be reviewed because the homepage and Hub layout change.

## Success Criteria

- `/islands/island-three-desert/` directly answers the observed Island 3 query variants without a duplicate route.
- `/bosses/tuna/` is indexable, evidence-backed, independently useful, and linked into the Island 4 to bird progression chain.
- Homepage, Guides, Items, Islands, and Bosses surfaces provide clear routes to the relevant answers without adding JavaScript.
- All required repository checks pass with no disabled rules, hidden errors, new dependencies, or unrelated changes.
