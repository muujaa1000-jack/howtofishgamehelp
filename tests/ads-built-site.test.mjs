import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const dist = path.resolve('dist');
const categories = new Set(['guides', 'walkthrough', 'islands', 'bosses', 'items', 'achievements', 'fixes']);
const prohibitedRuntime = /data-adsterra-unit|profitableratecpmnetwork|highrevenueformat|atOptions\s*=|invoke\.js|adsbygoogle|googlesyndication|doubleclick|data-ad-mode|Advertisement placeholder/i;
const adsenseAccount = process.env.PUBLIC_GOOGLE_ADSENSE_ACCOUNT?.trim() ?? '';
const validAdsenseAccount = /^ca-pub-[0-9]{16}$/.test(adsenseAccount);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : target;
  }));
  return nested.flat();
}

test('concrete guides contain evidence labels but no advertising runtime or empty slot', async () => {
  const files = await walk(dist);
  const guides = files.filter((file) => {
    const relative = path.relative(dist, file).split(path.sep);
    return relative.length === 3 && categories.has(relative[0]) && relative[2] === 'index.html';
  });
  assert.ok(guides.length >= 31, `expected at least 31 concrete guides, found ${guides.length}`);

  for (const file of guides) {
    const html = await readFile(file, 'utf8');
    assert.doesNotMatch(html, prohibitedRuntime, file);
    assert.doesNotMatch(html, /class="ad-slot|aria-label="Advertisement"/i, file);
    assert.match(html, /Last source review/i, file);
    assert.match(html, /Evidence reviewed through/i, file);
    assert.match(html, /Source-based guide; not independently playtested/i, file);
  }
});

test('controlled routes and the complete built corpus contain no advertising runtime', async () => {
  const excluded = [
    'index.html', 'guides/index.html', 'walkthrough/index.html', 'islands/index.html',
    'bosses/index.html', 'items/index.html', 'achievements/index.html', 'fixes/index.html',
    'search/index.html', 'about/index.html', 'contact/index.html', 'privacy/index.html',
    'terms/index.html', 'disclaimer/index.html', '404.html',
  ];
  for (const relative of excluded) {
    const html = await readFile(path.join(dist, relative), 'utf8');
    assert.doesNotMatch(html, prohibitedRuntime, relative);
    assert.doesNotMatch(html, /class="ad-slot|aria-label="Advertisement"/i, relative);
  }

  const files = await walk(dist);
  const corpus = (await Promise.all(
    files.filter((file) => /\.(?:html|xml|txt|js|css)$/.test(file)).map((file) => readFile(file, 'utf8')),
  )).join('\n');
  assert.doesNotMatch(corpus, prohibitedRuntime);
  for (const file of files.filter((file) => file.endsWith('.html'))) {
    const html = await readFile(file, 'utf8');
    const metas = html.match(/<meta name="google-adsense-account" content="([^"]+)">/g) ?? [];
    assert.equal(metas.length, validAdsenseAccount ? 1 : 0, file);
    if (validAdsenseAccount) assert.match(metas[0], new RegExp(`content="${adsenseAccount}"`), file);
  }
});

test('public cards and guide headers do not expose internal priority or review-status codes', async () => {
  const home = await readFile(path.join(dist, 'index.html'), 'utf8');
  const category = await readFile(path.join(dist, 'bosses/index.html'), 'utf8');
  const guide = await readFile(path.join(dist, 'bosses/spider-crab/index.html'), 'utf8');
  const about = await readFile(path.join(dist, 'about/index.html'), 'utf8');
  for (const html of [home, category, guide]) assert.doesNotMatch(html, />P[012]</);
  assert.doesNotMatch(guide, /<span class="status">mixed<\/span>/i);
  assert.doesNotMatch(about, /<strong>Mixed:<\/strong>/i);
});
