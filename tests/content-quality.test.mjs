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

test('launch set contains 28 to 32 substantive public guides', async () => {
  const items = await entries();
  assert.ok(items.length >= 28 && items.length <= 32, `expected 28-32 guides, found ${items.length}`);
  for (const item of items) {
    const frontmatter = frontmatterOf(item.source);
    assert.equal(scalar(frontmatter, 'draft'), 'false', `${item.file} must be public`);
    assert.notEqual(scalar(frontmatter, 'verificationStatus'), 'needs-review', `${item.file} needs review`);
    const body = item.source.replace(/^---[\s\S]*?---/, '');
    const words = body.match(/[A-Za-z][A-Za-z’'-]*/g) ?? [];
    assert.ok(words.length >= 220, `${item.file} is thin (${words.length} words)`);
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
  for (const item of await entries()) {
    const frontmatter = frontmatterOf(item.source);
    assert.equal(scalar(frontmatter, 'publishedAt'), '2026-08-23');
    assert.equal(scalar(frontmatter, 'updatedAt'), '2026-08-23');
    assert.equal(scalar(frontmatter, 'lastVerifiedAt'), '2026-08-23');
    assert.equal(scalar(frontmatter, 'gameVersion'), '1.0.5');
    assert.doesNotMatch(item.source, /\b(I tested|we tested|personally tested|official guide)\b/i, `${item.file} makes an unsupported testing claim`);
    assert.doesNotMatch(item.source, /\bguaranteed\b/i, `${item.file} makes an absolute claim`);
  }
});

