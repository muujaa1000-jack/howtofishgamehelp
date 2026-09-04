import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const contentDir = path.join(root, 'src/content/guides');

function frontmatterOf(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert.ok(match, 'Markdown entry must start with frontmatter');
  return match[1];
}

function scalar(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  assert.ok(match, `missing ${key}`);
  return match[1].trim().replace(/^['"]|['"]$/g, '');
}

function list(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*\\n((?:  - .+\\n?)+)`, 'm'));
  return match ? [...match[1].matchAll(/^  -\s+(.+)$/gm)].map((item) => item[1].trim().replace(/^['"]|['"]$/g, '')) : [];
}

async function entries() {
  assert.ok(existsSync(contentDir), 'launch content directory does not exist yet');
  const files = (await readdir(contentDir, { recursive: true })).filter((file) => file.endsWith('.md'));
  return Promise.all(files.map(async (file) => ({ file, source: await readFile(path.join(contentDir, file), 'utf8') })));
}

function routeOf(frontmatter) {
  return `/${scalar(frontmatter, 'category')}/${scalar(frontmatter, 'slug')}/`;
}

const longFormRoutes = new Set([
  '/guides/beginner-guide/',
  '/walkthrough/story-walkthrough/',
  '/bosses/pufferfish/',
  '/achievements/achievement-guide/',
  '/fixes/problems-and-fixes/',
  '/guides/difficulty-settings/',
  '/fixes/steam-relay-connection-failed/',
  '/fixes/save-file-corrupted-or-weapon-crash/',
]);

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
const refreshedOnAugust30 = new Set([
  '/bosses/boss-guide/',
  '/bosses/spider-crab/',
  '/bosses/tuna/',
  '/fixes/problems-and-fixes/',
  '/guides/beginner-guide/',
  '/guides/unlock-next-island/',
  '/islands/island-progression/',
  '/items/lures-and-bait/',
  '/items/radar-guide/',
  '/walkthrough/lighthouse-first-island/',
  '/walkthrough/story-walkthrough/',
]);
const sourceReviewedOnAugust30 = new Set([
  '/bosses/tuna/',
  '/fixes/problems-and-fixes/',
]);
const refreshedOnSeptember4 = new Set([
  '/fixes/camera-invert-controls/',
  '/fixes/multiplayer-black-screen/',
  '/fixes/problems-and-fixes/',
  '/fixes/save-file-corrupted-or-weapon-crash/',
  '/items/grilling-guide/',
  '/items/money-fast/',
  '/items/weapon-progression/',
]);

test('review set contains 35 substantive public guides', async () => {
  const items = await entries();
  assert.equal(items.length, 35, `expected 35 guides, found ${items.length}`);
  for (const item of items) {
    const frontmatter = frontmatterOf(item.source);
    const route = routeOf(frontmatter);
    assert.equal(scalar(frontmatter, 'draft'), 'false', `${item.file} must be public`);
    assert.notEqual(scalar(frontmatter, 'verificationStatus'), 'needs-review', `${item.file} needs review`);
    const body = item.source.replace(/^---[\s\S]*?---/, '');
    const words = body.match(/[A-Za-z][A-Za-z’'-]*/g) ?? [];
    assert.ok(words.length >= 220, `${item.file} is thin (${words.length} words)`);
    if (longFormRoutes.has(route)) {
      assert.ok(words.length >= 800 && words.length <= 1500, `${item.file} long-form depth is ${words.length} words`);
      for (const heading of ['## Applies to', '## Quick steps', '## Common mistakes', '## Safe recovery', '## Patch history and limitations', '## FAQ']) {
        assert.match(body, new RegExp(`^${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'm'), `${item.file} missing ${heading}`);
      }
    }
    for (const heading of ['## Quick steps', '## Why it may not work', '## What to do next']) {
      assert.match(body, new RegExp(`^${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'm'), `${item.file} missing ${heading}`);
    }
    assert.ok((frontmatter.match(/^  - title:/gm) ?? []).length >= 2, `${item.file} needs at least two sources`);
  }
});

test('titles, descriptions, and routes are unique and internally resolvable', async () => {
  const items = await entries();
  const records = items.map((item) => {
    const frontmatter = frontmatterOf(item.source);
    return {
      file: item.file,
      title: scalar(frontmatter, 'title'),
      description: scalar(frontmatter, 'description'),
      category: scalar(frontmatter, 'category'),
      slug: scalar(frontmatter, 'slug'),
      previousGuide: scalar(frontmatter, 'previousGuide'),
      nextGuide: scalar(frontmatter, 'nextGuide'),
      relatedGuides: list(frontmatter, 'relatedGuides'),
    };
  });
  assert.equal(new Set(records.map((item) => item.title)).size, records.length, 'duplicate title');
  assert.equal(new Set(records.map((item) => item.description)).size, records.length, 'duplicate description');
  const paths = new Set(records.map((item) => `/${item.category}/${item.slug}/`));
  assert.equal(paths.size, records.length, 'duplicate route');
  for (const item of records) {
    assert.ok(item.title.length <= 72, `${item.file} title too long`);
    assert.ok(item.description.length >= 70 && item.description.length <= 165, `${item.file} description length ${item.description.length}`);
    for (const link of [item.previousGuide, item.nextGuide, ...item.relatedGuides]) {
      if (link !== 'null') assert.ok(paths.has(link), `${item.file} has unresolved guide link ${link}`);
    }
  }
});

test('launch content keeps current verification metadata and avoids evidence overclaims', async () => {
  const eligibleRoutes = [];
  for (const item of await entries()) {
    const frontmatter = frontmatterOf(item.source);
    const route = routeOf(frontmatter);
    const expectedPublishedAt = publishedOnAugust27.has(route)
      ? '2026-08-27'
      : publishedOnAugust25.has(route) ? '2026-08-25' : '2026-08-23';
    const expectedUpdatedAt = refreshedOnSeptember4.has(route)
      ? '2026-09-04'
      : refreshedOnAugust30.has(route)
      ? '2026-08-30'
      : refreshedOnAugust27.has(route)
      ? '2026-08-27'
      : route === '/achievements/achievement-not-unlocking/' ? '2026-08-26' : '2026-08-25';
    const expectedSourceReview = refreshedOnSeptember4.has(route)
      ? '2026-09-04'
      : sourceReviewedOnAugust30.has(route)
      ? '2026-08-30'
      : refreshedOnAugust27.has(route)
      ? '2026-08-27'
      : route === '/achievements/achievement-not-unlocking/' ? '2026-08-26' : '2026-08-25';
    assert.equal(scalar(frontmatter, 'publishedAt'), expectedPublishedAt);
    assert.equal(scalar(frontmatter, 'updatedAt'), expectedUpdatedAt);
    assert.equal(scalar(frontmatter, 'lastSourceReview'), expectedSourceReview);
    assert.equal(scalar(frontmatter, 'evidenceThroughVersion'), refreshedOnSeptember4.has(route) ? '1.0.11' : sourceReviewedOnAugust30.has(route) ? '1.0.10' : '1.0.9');
    if (refreshedOnSeptember4.has(route)) assert.equal(scalar(frontmatter, 'lastVerifiedAt'), '2026-09-04');
    assert.equal(scalar(frontmatter, 'firstHandTested'), 'false');
    assert.match(scalar(frontmatter, 'patchSensitive'), /^(?:true|false)$/);
    assert.match(scalar(frontmatter, 'adEligible'), /^(?:true|false)$/);
    assert.ok(['1.0.5', '1.0.9', '1.0.10', '1.0.11'].includes(scalar(frontmatter, 'gameVersion')));
    if (scalar(frontmatter, 'adEligible') === 'true') eligibleRoutes.push(route);
    assert.doesNotMatch(item.source, /\b(I tested|we tested|personally tested|tested on Steam Deck|verified in-game|official guide)\b/i, `${item.file} makes an unsupported testing claim`);
    assert.doesNotMatch(item.source, /\bguaranteed\b/i, `${item.file} makes an absolute claim`);
  }
  assert.deepEqual(eligibleRoutes.sort(), [...longFormRoutes].sort());
});

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
  assert.equal(scalar(tuna.frontmatter, 'evidenceThroughVersion'), '1.0.10');
  assert.match(tuna.source, /Professional Boss Lure/);
  assert.match(tuna.source, /preserve|keep the Tuna|do not sell or cook/i);
  assert.match(tuna.source, /\/bosses\/terrorizing-bird\//);
  assert.match(tuna.source, /steamcommunity\.com\/games\/4001890\/announcements\/detail\/711158520539514352/);
  assert.match(tuna.source, /steamcommunity\.com\/games\/4001890\/announcements\/detail\/698774255287927073/);

  assert.match(byRoute.get('/bosses/terrorizing-bird/').source, /\/bosses\/tuna\//);
  assert.match(byRoute.get('/islands/island-four-rocks/').source, /\/bosses\/tuna\//);
});

test('boat keys and Tuna boss queries resolve to focused pages with descriptive anchors', async () => {
  const byRoute = new Map();
  for (const item of await entries()) {
    const frontmatter = frontmatterOf(item.source);
    byRoute.set(routeOf(frontmatter), { frontmatter, source: item.source });
  }

  const boat = byRoute.get('/guides/unlock-next-island/');
  assert.equal(scalar(boat.frontmatter, 'title'), 'How to Get Boat Keys and Unlock Island 2 in How to Fish');
  assert.equal(scalar(boat.frontmatter, 'description'), 'Defeat Spider Crab, return its drop to the lighthouse keeper, collect the boat keys and radar, then follow the coordinates to the forest island.');
  assert.match(scalar(boat.frontmatter, 'answer'), /^To get the boat keys,/);
  assert.match(byRoute.get('/guides/beginner-guide/').source, /\[boat keys and Island 2 unlock guide\]\(\/guides\/unlock-next-island\/\)/);
  assert.match(byRoute.get('/walkthrough/lighthouse-first-island/').source, /\[get the boat keys and leave the first island\]\(\/guides\/unlock-next-island\/\)/);
  assert.match(byRoute.get('/bosses/spider-crab/').source, /\[get the boat keys and unlock Island 2\]\(\/guides\/unlock-next-island\/\)/);
  assert.match(byRoute.get('/items/radar-guide/').source, /\[boat keys and next-island route\]\(\/guides\/unlock-next-island\/\)/);
  assert.match(byRoute.get('/islands/island-progression/').source, /\[first boat keys and Island 2 unlock\]\(\/guides\/unlock-next-island\/\)/);

  const tuna = byRoute.get('/bosses/tuna/');
  assert.equal(scalar(tuna.frontmatter, 'title'), 'How to Catch and Beat the Tuna Boss in How to Fish');
  assert.equal(scalar(tuna.frontmatter, 'description'), 'Use the Professional Boss Lure to catch the Tuna boss, dodge its jumping attack, keep the body, and start the Island 4 bird encounter.');
  assert.match(scalar(tuna.frontmatter, 'answer'), /^To catch and beat the Tuna boss,/);
  assert.match(byRoute.get('/bosses/boss-guide/').source, /\[Tuna boss guide\]\(\/bosses\/tuna\/\)/);
  assert.match(byRoute.get('/walkthrough/story-walkthrough/').source, /\[catch and beat the Tuna boss\]\(\/bosses\/tuna\/\)/);
  assert.match(byRoute.get('/items/lures-and-bait/').source, /\[Professional Boss Lure for the Tuna boss\]\(\/bosses\/tuna\/\)/);
});

test('achievement troubleshooting directs players to the current Steam build while preserving historical fixes', async () => {
  const item = (await entries()).find(({ file }) => file.endsWith('achievement-not-unlocking.md'));
  assert.ok(item, 'achievement-not-unlocking.md is missing');
  const frontmatter = frontmatterOf(item.source);

  assert.match(scalar(frontmatter, 'answer'), /Update How to Fish to the current Steam version/i);
  assert.doesNotMatch(scalar(frontmatter, 'answer'), /Update to version 1\.0\.5/i);
  assert.match(item.source, /title: "How to Fish Patch 1\.0\.9"/);
  assert.match(item.source, /accessedAt: 2026-08-26/);
  assert.match(item.source, /Patch 1\.0\.4 fixed/i);
  assert.match(item.source, /Patch 1\.0\.5 fixed/i);
});

test('Patch 1.0.9 issue pages use official evidence and qualified fix language', async () => {
  const byRoute = new Map();
  for (const item of await entries()) {
    const frontmatter = frontmatterOf(item.source);
    byRoute.set(routeOf(frontmatter), item.source);
  }

  const difficulty = byRoute.get('/guides/difficulty-settings/');
  const relay = byRoute.get('/fixes/steam-relay-connection-failed/');
  const save = byRoute.get('/fixes/save-file-corrupted-or-weapon-crash/');
  for (const source of [difficulty, relay, save]) {
    assert.ok(source, 'missing Patch 1.0.9 issue page');
    assert.match(source, /steamcommunity\.com\/games\/4001890\/announcements\/detail\/711158520539514352/);
    assert.match(source, /official-patch/);
  }
  assert.match(relay, /partner\.steamgames\.com\/doc\/features\/multiplayer\/steamdatagramrelay/);
  assert.match(save, /help\.steampowered\.com\/en\/faqs\/view\/(?:0C48-FCBD-DA71-93EB|68D2-35AB-09A9-7678)/);
  assert.match(save, /hopefully/i);
  assert.doesNotMatch(save, /\b(?:completely|permanently|fully) fixed\b/i);
});

test('Patch 1.0.11 facts update only the directly affected guide boundaries', async () => {
  const byRoute = new Map();
  for (const item of await entries()) {
    const frontmatter = frontmatterOf(item.source);
    byRoute.set(routeOf(frontmatter), { frontmatter, source: item.source });
  }

  const patchUrl = /steamcommunity\.com\/games\/4001890\/announcements\/detail\/698774255287927885/;
  for (const route of refreshedOnSeptember4) {
    const item = byRoute.get(route);
    assert.ok(item, `missing Patch 1.0.11 affected page ${route}`);
    assert.equal(scalar(item.frontmatter, 'evidenceThroughVersion'), '1.0.11');
    assert.match(item.source, patchUrl, `${route} must cite the official Patch 1.0.11 announcement`);
  }

  assert.match(byRoute.get('/fixes/camera-invert-controls/').source, /toggle (?:for )?aiming/i);
  assert.match(byRoute.get('/fixes/save-file-corrupted-or-weapon-crash/').source, /checked.+corrupt.+before loading/is);
  assert.match(byRoute.get('/fixes/save-file-corrupted-or-weapon-crash/').source, /backup/i);
  assert.match(byRoute.get('/fixes/multiplayer-black-screen/').source, /inventory bug on join.+invisible/is);
  assert.match(byRoute.get('/items/grilling-guide/').source, /Drip Parrotfish/i);
  assert.match(byRoute.get('/items/money-fast/').source, /held once before selling/i);
  assert.match(byRoute.get('/items/weapon-progression/').source, /iron sight/i);
  assert.match(byRoute.get('/items/weapon-progression/').source, /suppressor.+compensator/is);

  assert.equal(scalar(byRoute.get('/guides/difficulty-settings/').frontmatter, 'evidenceThroughVersion'), '1.0.9');
  assert.equal(scalar(byRoute.get('/walkthrough/story-walkthrough/').frontmatter, 'evidenceThroughVersion'), '1.0.9');
});
