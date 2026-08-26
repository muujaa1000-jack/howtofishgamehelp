# Search Opportunity Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the early search-visible Island 3 route, publish one evidence-backed Tuna mini-boss guide, and add static quick-answer internal links on the homepage and relevant category hubs.

**Architecture:** Keep all gameplay content in the existing Astro content collection. Add one presentational Astro component that consumes static typed link data from `src/config/site.ts`; render it without client JavaScript on the homepage and category hubs. Preserve one page per independent intent and reuse the existing guide layout, cards, source metadata, and build-time link validation.

**Tech Stack:** Astro 7, TypeScript 6, Markdown content collections, Node test runner, parse5, Pagefind.

## Global Constraints

- Published site content is English; internal operational documentation may be English or Chinese.
- Do not claim first-hand play, first-hand testing, developer confirmation, or official status without evidence.
- One independently useful search intent maps to one page; do not create keyword variants.
- Do not invent health, damage, price, timing, spawn, drop, quest, version, name, or location details.
- Use TypeScript and keep the site static-first, mobile-first, and low-JavaScript.
- Add no production dependency and do not change ad, analytics, privacy, account, or deployment configuration.
- Only edited pages receive `updatedAt: 2026-08-27`; source-review dates change only where sources were re-opened on 2026-08-27.
- Community discussions establish demand only. Page facts come from the cited gameplay sources and official Patch 1.0.9 announcement.
- Current orchestration rules prohibit unsolicited subagent dispatch, so this plan must be executed inline with `superpowers:executing-plans`.

---

### Task 1: Lock the content intent and evidence contract

**Files:**
- Modify: `tests/content-quality.test.mjs`
- Modify: `tests/validate-script.test.mjs`

**Interfaces:**
- Consumes: existing `entries()`, `frontmatterOf()`, `routeOf()`, `scalar()`, and `list()` test helpers.
- Produces: a failing contract for 35 public guides, one canonical Island 3 page, a new `/bosses/tuna/` page, current metadata, and Tuna-to-bird links.

- [ ] **Step 1: Write the failing content tests**

Change the review count to 35 in both test files. In `tests/content-quality.test.mjs`, replace the date logic with explicit current-route sets and add this test:

```js
const publishedOnAugust25 = new Set([
  '/guides/difficulty-settings/',
  '/fixes/steam-relay-connection-failed/',
  '/fixes/save-file-corrupted-or-weapon-crash/',
]);
const publishedOnAugust27 = new Set(['/bosses/tuna/']);
const refreshedOnAugust27 = new Set([
  '/bosses/tuna/',
  '/bosses/terrorizing-bird/',
  '/islands/island-four-rocks/',
  '/islands/island-three-desert/',
]);

test('Island 3 variants stay canonical and Tuna has an evidence-backed route', async () => {
  const byRoute = new Map();
  for (const item of await entries()) {
    const frontmatter = frontmatterOf(item.source);
    byRoute.set(routeOf(frontmatter), { frontmatter, source: item.source });
  }

  const islandThree = byRoute.get('/islands/island-three-desert/');
  assert.ok(islandThree, 'missing canonical Island 3 page');
  assert.match(scalar(islandThree.frontmatter, 'title'), /get to.*beat island 3/i);
  assert.match(scalar(islandThree.frontmatter, 'answer'), /third island/i);
  assert.match(islandThree.source, /How to get to the third island/i);
  assert.equal([...byRoute.keys()].filter((route) => /island-three|third-island/.test(route)).length, 1);

  const tuna = byRoute.get('/bosses/tuna/');
  assert.ok(tuna, 'missing focused Tuna mini-boss page');
  assert.equal(scalar(tuna.frontmatter, 'verificationStatus'), 'community-confirmed');
  assert.equal(scalar(tuna.frontmatter, 'gameVersion'), '1.0.9');
  assert.match(tuna.source, /Professional Boss Lure/);
  assert.match(tuna.source, /preserve|keep the Tuna|do not sell or cook/i);
  assert.match(tuna.source, /\/bosses\/terrorizing-bird\//);
  assert.match(tuna.source, /steamcommunity\.com\/games\/4001890\/announcements\/detail\/711158520539514352/);

  assert.match(byRoute.get('/bosses/terrorizing-bird/').source, /\/bosses\/tuna\//);
  assert.match(byRoute.get('/islands/island-four-rocks/').source, /\/bosses\/tuna\//);
});
```

Use this date expectation inside the existing verification-metadata test:

```js
const expectedPublishedAt = publishedOnAugust27.has(route)
  ? '2026-08-27'
  : publishedOnAugust25.has(route) ? '2026-08-25' : '2026-08-23';
const expectedUpdatedAt = refreshedOnAugust27.has(route)
  ? '2026-08-27'
  : route === '/achievements/achievement-not-unlocking/' ? '2026-08-26' : '2026-08-25';
const expectedSourceReview = refreshedOnAugust27.has(route)
  ? '2026-08-27'
  : route === '/achievements/achievement-not-unlocking/' ? '2026-08-26' : '2026-08-25';
assert.equal(scalar(frontmatter, 'publishedAt'), expectedPublishedAt);
assert.equal(scalar(frontmatter, 'updatedAt'), expectedUpdatedAt);
assert.equal(scalar(frontmatter, 'lastSourceReview'), expectedSourceReview);
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```powershell
node --test tests/content-quality.test.mjs tests/validate-script.test.mjs
```

Expected: FAIL because 34 guides exist, `/bosses/tuna/` is missing, and Island 3 still has the old title and body.

- [ ] **Step 3: Commit only after the matching production work in Task 2 is green**

Do not commit a deliberately red tree. Task 1 and Task 2 form one red-green content cycle.

---

### Task 2: Improve Island 3 and publish the Tuna mini-boss guide

**Files:**
- Create: `src/content/guides/bosses/tuna.md`
- Modify: `src/content/guides/islands/island-three-desert.md`
- Modify: `src/content/guides/islands/island-four-rocks.md`
- Modify: `src/content/guides/bosses/terrorizing-bird.md`
- Modify: `scripts/validate-content.mjs`
- Test: `tests/content-quality.test.mjs`
- Test: `tests/validate-script.test.mjs`

**Interfaces:**
- Consumes: existing content schema and the route contracts introduced in Task 1.
- Produces: canonical `/islands/island-three-desert/`, new `/bosses/tuna/`, and the progression sequence Island 4 → Tuna → terrorizing bird.

- [ ] **Step 1: Update the Island 3 frontmatter and direct answer**

Use this metadata and opening answer while retaining the existing source list and evidence boundaries:

```yaml
title: "How to Get to and Beat Island 3 in How to Fish"
description: "Reach the third island, complete its grill and tourist quests, beat Pufferfish with the Carrot bait, and unlock the route to Island 4."
primaryIntent: "Reach the third island, beat its quest chain, and unlock Island 4"
updatedAt: 2026-08-27
lastVerifiedAt: 2026-08-27
lastSourceReview: 2026-08-27
answer: "To get to the third island, finish the forest island’s Giant Piranha hand-in and follow the new coordinates to the desert. On Island 3, complete the grill-side request, then give the tourist a fish the game marks as endangered to receive the Carrot. Use that bait to summon and beat Pufferfish, preserve its distinct drop, and return it to the tourist to unlock Island 4."
```

Add a section headed `## How to get to the third island` before the quest-order explanation. It must direct players from the Giant Piranha return hand-in to the awarded coordinates and link to `/islands/island-two-leeches/` and `/islands/island-progression/`. Keep the existing page as the only route for the observed `Island 3`, `third island`, `get to Island 3`, and `beat Island 3` variants.

- [ ] **Step 2: Create the Tuna guide**

Create `src/content/guides/bosses/tuna.md` with this structure and independently written copy:

```markdown
---
title: "How to Catch and Beat Tuna in How to Fish"
description: "Use the Professional Boss Lure to catch and defeat the Tuna mini-boss, preserve its body, and prepare the Island 4 bird encounter."
slug: "tuna"
category: "bosses"
primaryIntent: "Catch and defeat the Tuna mini-boss without losing the bird bait"
publishedAt: 2026-08-27
updatedAt: 2026-08-27
lastVerifiedAt: 2026-08-27
gameVersion: "1.0.9"
lastSourceReview: 2026-08-27
evidenceThroughVersion: "1.0.9"
firstHandTested: false
patchSensitive: true
adEligible: false
verificationStatus: "community-confirmed"
sources:
  - title: "Complete How to Fish game walkthrough"
    url: "https://www.destructoid.com/complete-how-to-fish-game-walkthrough-100-completion/"
    type: "gameplay-guide"
    accessedAt: 2026-08-27
  - title: "How to Fish Terrorizing Bird Boss"
    url: "https://nerdschalk.com/how-to-fish-terrorizing-bird-boss/"
    type: "gameplay-guide"
    accessedAt: 2026-08-27
  - title: "How to Fish Patch 1.0.9"
    url: "https://steamcommunity.com/games/4001890/announcements/detail/711158520539514352"
    type: "official-patch"
    accessedAt: 2026-08-27
previousGuide: "/islands/island-four-rocks/"
nextGuide: "/bosses/terrorizing-bird/"
relatedGuides:
  - "/items/lures-and-bait/"
  - "/items/weapon-progression/"
  - "/islands/island-four-rocks/"
draft: false
noindex: false
answer: "Activate the large-bird request on Island 4, equip the Professional Boss Lure, and cast for Tuna. When the Tuna mini-boss comes ashore, move out of its jumping line and attack after it lands. Pick up and preserve the defeated Tuna instead of selling or cooking it. Place the body on open ground near building cover to begin the terrorizing bird encounter."
featured: true
priority: "P0"
---

## Quick steps

1. Speak to the rocky island quest NPC about the large bird.
2. Obtain and equip the Professional Boss Lure.
3. Cast with enough clear ground to see the Tuna come ashore.
4. Move sideways from its jump, then attack after it lands.
5. Pick up the defeated Tuna and keep the body intact.
6. Place it near reliable building cover when you are ready for the bird.

## Start the correct Island 4 request

Tuna belongs to the rocky island's two-target progression chain. Activate the NPC request before spending the special lure, then prepare the place where the catch will land. The regular Professional Lure and the Professional Boss Lure serve different purposes; the reviewed walkthroughs identify the boss version as the Tuna trigger.

## Beat the Tuna without losing the next quest item

The reviewed gameplay sources describe a jumping or throwing attack once Tuna reaches land. Keep enough space to see the approach, move across its line, and use the recovery after landing for damage. A close-range weapon can fit this encounter, but no reviewed source establishes a universal damage value or exact number of hits, especially after the Patch 1.0.9 difficulty options.

The body is the important result. Pick it up after the fight and preserve it. Do not sell or cook the Tuna, because placing that body on the ground starts the following aerial encounter.

## Why it may not work

- **Nothing takes the lure:** confirm the bird request is active and the Professional Boss Lure is equipped.
- **Tuna keeps hitting during the approach:** leave a clear landing area and move sideways instead of backing along the same line.
- **The bird does not arrive:** remove the defeated Tuna from inventory and place it on open ground.
- **The next fight starts in a bad location:** carry the Tuna closer to building cover before placing it.
- **The Tuna body is gone:** do not substitute ordinary fish; return to the quest state and confirm whether another boss lure attempt is required.

## Solo and co-op notes

Solo players should clear normal threats and choose the bird-fight cover before casting. In co-op, decide who will carry the Tuna so it is not sold, cooked, or dropped accidentally. Keep the group together when the body is placed because that action transitions directly into the next encounter.

## Patch 1.0.9 difficulty boundary

Patch 1.0.9 officially changes creature health and damage through Easy, Normal, and Hard. The announcement does not publish Tuna health, a fixed fight time, or a different lure and hand-in chain. Follow the same setup on every mode and expect combat pressure to vary.

## What to do next

Carry the Tuna to the chosen cover and open the [terrorizing bird strategy](/bosses/terrorizing-bird/) before placing it. For the complete location chain, return to [Island 4 progression](/islands/island-four-rocks/); for lure distinctions, use [lures and bait](/items/lures-and-bait/).
```

- [ ] **Step 3: Link the neighboring progression pages**

In `island-four-rocks.md`, set `nextGuide: "/bosses/tuna/"`, add `/bosses/tuna/` to `relatedGuides`, update the reviewed dates to 2026-08-27, and link the first Tuna mention in the body to `/bosses/tuna/`.

In `terrorizing-bird.md`, set `previousGuide: "/bosses/tuna/"`, add `/bosses/tuna/` to `relatedGuides`, update the reviewed dates to 2026-08-27, and change the first Tuna setup sentence to link to the focused Tuna guide.

- [ ] **Step 4: Update the reviewed content count**

In `scripts/validate-content.mjs`, change the exact reviewed-set expectation and success output from 34 to 35. Do not weaken any source, word-count, metadata, or link rule.

- [ ] **Step 5: Run the focused tests and verify GREEN**

Run:

```powershell
node --test tests/content-quality.test.mjs tests/validate-script.test.mjs
```

Expected: all focused tests pass with 35 public guides and no validation errors.

- [ ] **Step 6: Commit the content cycle**

```powershell
git add -- tests/content-quality.test.mjs tests/validate-script.test.mjs scripts/validate-content.mjs src/content/guides/bosses/tuna.md src/content/guides/bosses/terrorizing-bird.md src/content/guides/islands/island-three-desert.md src/content/guides/islands/island-four-rocks.md
git commit -m "content(seo): add Tuna guide and sharpen Island 3 intent"
```

---

### Task 3: Add static quick-answer routes

**Files:**
- Create: `src/components/QuickAnswerLinks.astro`
- Modify: `src/config/site.ts`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/[category]/index.astro`
- Modify: `tests/built-site.test.mjs`

**Interfaces:**
- Consumes: `QuickAnswerLink` records from `src/config/site.ts`.
- Produces: `<QuickAnswerLinks links={...} />`, `homeQuickAnswers`, and `categoryQuickAnswers` with internal trailing-slash routes.

- [ ] **Step 1: Write the failing built-site test**

Add this test to `tests/built-site.test.mjs`:

```js
test('homepage and relevant hubs expose focused quick-answer routes', async () => {
  const expected = new Map([
    ['index.html', [
      '/guides/unlock-next-island/',
      '/items/radar-guide/',
      '/islands/island-three-desert/',
      '/bosses/tuna/',
    ]],
    ['guides/index.html', ['/guides/unlock-next-island/']],
    ['items/index.html', ['/items/radar-guide/']],
    ['islands/index.html', ['/islands/island-three-desert/']],
    ['bosses/index.html', ['/bosses/tuna/']],
  ]);

  for (const [file, routes] of expected) {
    const html = await text(file);
    const quickAnswers = findByAttribute(parse(html), 'data-quick-answers');
    assert.ok(quickAnswers, `${file} is missing quick answers`);
    for (const route of routes) {
      assert.match(html, new RegExp(`href="${route.replaceAll('/', '\\/')}"`), `${file} missing ${route}`);
    }
  }
});
```

- [ ] **Step 2: Build the unchanged site and verify RED**

Run:

```powershell
npm run build
node --test tests/built-site.test.mjs
```

Expected: FAIL with `index.html is missing quick answers`.

- [ ] **Step 3: Add typed quick-answer data**

Append to `src/config/site.ts`:

```ts
export type QuickAnswerLink = {
  label: string;
  href: `/${string}/`;
};

const boatKeys: QuickAnswerLink = {
  label: 'Get the boat keys and unlock the next island',
  href: '/guides/unlock-next-island/',
};
const radar: QuickAnswerLink = {
  label: 'Find and use the radar',
  href: '/items/radar-guide/',
};
const islandThree: QuickAnswerLink = {
  label: 'Reach and beat Island 3',
  href: '/islands/island-three-desert/',
};
const tuna: QuickAnswerLink = {
  label: 'Catch and defeat Tuna',
  href: '/bosses/tuna/',
};

export const homeQuickAnswers = [boatKeys, radar, islandThree, tuna] as const;

export const categoryQuickAnswers: Partial<Record<CategorySlug, readonly QuickAnswerLink[]>> = {
  guides: [boatKeys],
  items: [radar],
  islands: [islandThree],
  bosses: [tuna],
};
```

- [ ] **Step 4: Create the low-JavaScript component**

Create `src/components/QuickAnswerLinks.astro`:

```astro
---
import type { QuickAnswerLink } from '../config/site';

interface Props {
  title?: string;
  links: readonly QuickAnswerLink[];
}

const { title = 'Quick answers', links } = Astro.props;
---
{links.length > 0 && (
  <nav class="quick-answers" aria-label={title} data-quick-answers>
    <p>{title}</p>
    <ul>
      {links.map((link) => <li><a href={link.href}>{link.label}<span aria-hidden="true">→</span></a></li>)}
    </ul>
  </nav>
)}
<style>
  .quick-answers { margin-block: 1.5rem 2rem; padding: 1rem; border: 1px solid var(--line); border-radius: 14px; background: #fffdf7; }
  p { margin: 0 0 .75rem; color: var(--coral-dark); font-size: .74rem; font-weight: 900; letter-spacing: .09em; text-transform: uppercase; }
  ul { display: flex; flex-wrap: wrap; gap: .65rem; margin: 0; padding: 0; list-style: none; }
  a { display: inline-flex; align-items: center; gap: .45rem; min-height: 44px; padding: .6rem .8rem; border-radius: 999px; background: var(--sand-100); color: var(--navy-950); font-weight: 800; text-decoration: none; }
  a:hover { background: var(--coral); }
  @media (max-width: 560px) { li, a { width: 100%; } a { justify-content: space-between; } }
</style>
```

- [ ] **Step 5: Render it on the homepage and category hubs**

In `src/pages/index.astro`, import `QuickAnswerLinks` and `homeQuickAnswers`, then render this immediately before the category grid:

```astro
<QuickAnswerLinks title="Quick answers to current blockers" links={homeQuickAnswers} />
```

In `src/pages/[category]/index.astro`, import `QuickAnswerLinks` and `categoryQuickAnswers`, set:

```ts
const quickAnswers = categoryQuickAnswers[category.slug] ?? [];
```

Render it between the Hub note and guide grid:

```astro
<QuickAnswerLinks title={`Common ${category.label.toLowerCase()} questions`} links={quickAnswers} />
```

- [ ] **Step 6: Build and verify GREEN**

Run:

```powershell
npm run build
node --test tests/built-site.test.mjs
```

Expected: all built-site tests pass; Pagefind indexes 35 guide pages.

- [ ] **Step 7: Commit the quick-answer cycle**

```powershell
git add -- src/components/QuickAnswerLinks.astro src/config/site.ts src/pages/index.astro 'src/pages/[category]/index.astro' tests/built-site.test.mjs
git commit -m "feat(seo): add focused quick-answer links"
```

---

### Task 4: Refresh derived content records and run release-level verification

**Files:**
- Modify: `docs/content-map.csv`
- Modify: `docs/evidence-ledger.csv`
- Verify: all changed source and test files

**Interfaces:**
- Consumes: 35 validated Markdown guide entries.
- Produces: synchronized content documentation and a fully verified production build.

- [ ] **Step 1: Regenerate the content records**

Run:

```powershell
npm run docs:content
```

Expected: `Updated content map and evidence ledger for 35 guide pages.`

- [ ] **Step 2: Run all repository checks**

Run each command separately and require exit code 0:

```powershell
npm run check
npm run validate
npm run build
npm test
npm run audit:adsense
```

Expected: no type errors; 35 public guides; successful production build; all Node tests pass; AdSense readiness audit produces no new failure caused by this batch.

- [ ] **Step 3: Review the built pages in a real browser**

Start the local preview and inspect desktop and mobile widths for:

- `/`
- `/islands/island-three-desert/`
- `/bosses/tuna/`
- `/bosses/`
- `/items/`

Verify that quick-answer links wrap cleanly, no content is obscured, the new guide has one H1, internal links work, and no disabled ad box appears. Save screenshots only if they help document a real issue or correction.

- [ ] **Step 4: Inspect the final diff and working tree**

Run:

```powershell
git diff --check
git status --short
git diff HEAD~2 --stat
```

Expected: only the approved source, tests, content records, and plan file are changed; `.analytics/` remains untracked and is not committed.

- [ ] **Step 5: Commit the derived records if verification passed**

```powershell
git add -- docs/content-map.csv docs/evidence-ledger.csv
git commit -m "docs(content): refresh guide inventory"
```

- [ ] **Step 6: Re-run the final verification after the last commit**

Run:

```powershell
npm run check
npm run validate
npm run build
npm test
```

Expected: every command exits 0 from the committed tree, with 35 guides and no test failures.
