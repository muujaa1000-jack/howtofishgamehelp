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

test('review set contains 34 substantive public guides', async () => {
  const items = await entries();
  assert.equal(items.length, 34, `expected 34 guides, found ${items.length}`);
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
    const isNew = ['/guides/difficulty-settings/', '/fixes/steam-relay-connection-failed/', '/fixes/save-file-corrupted-or-weapon-crash/'].includes(route);
    assert.equal(scalar(frontmatter, 'publishedAt'), isNew ? '2026-08-25' : '2026-08-23');
    assert.equal(scalar(frontmatter, 'updatedAt'), '2026-08-25');
    assert.equal(scalar(frontmatter, 'lastSourceReview'), '2026-08-25');
    assert.equal(scalar(frontmatter, 'evidenceThroughVersion'), '1.0.9');
    assert.equal(scalar(frontmatter, 'firstHandTested'), 'false');
    assert.match(scalar(frontmatter, 'patchSensitive'), /^(?:true|false)$/);
    assert.match(scalar(frontmatter, 'adEligible'), /^(?:true|false)$/);
    assert.ok(['1.0.5', '1.0.9'].includes(scalar(frontmatter, 'gameVersion')));
    if (scalar(frontmatter, 'adEligible') === 'true') eligibleRoutes.push(route);
    assert.doesNotMatch(item.source, /\b(I tested|we tested|personally tested|tested on Steam Deck|verified in-game|official guide)\b/i, `${item.file} makes an unsupported testing claim`);
    assert.doesNotMatch(item.source, /\bguaranteed\b/i, `${item.file} makes an absolute claim`);
  }
  assert.deepEqual(eligibleRoutes.sort(), [...longFormRoutes].sort());
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
