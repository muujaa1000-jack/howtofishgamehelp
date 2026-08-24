import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const dist = path.resolve('dist');
const categories = new Set(['guides', 'walkthrough', 'islands', 'bosses', 'items', 'achievements', 'fixes']);
const liveAds = process.env.PUBLIC_ADS_DEPLOYMENT === 'production' &&
  process.env.PUBLIC_ADS_ENABLED === 'true' &&
  process.env.PUBLIC_ADSTERRA_NATIVE_ENABLED === 'true' &&
  process.env.PUBLIC_ADSTERRA_BANNER_320X50_ENABLED === 'true';

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : target;
  }));
  return nested.flat();
}

function count(html, pattern) {
  return (html.match(pattern) ?? []).length;
}

test('all concrete guides contain exactly one correctly placed unit of each approved type', async () => {
  const files = await walk(dist);
  const guides = files.filter((file) => {
    const relative = path.relative(dist, file).split(path.sep);
    return relative.length === 3 && categories.has(relative[0]) && relative[2] === 'index.html';
  });
  assert.equal(guides.length, 31);

  for (const file of guides) {
    const html = await readFile(file, 'utf8');
    assert.equal(count(html, /data-adsterra-unit="banner-320x50"/g), 1, file);
    assert.equal(count(html, /data-adsterra-unit="native"/g), 1, file);

    const quick = html.indexOf('<h2 id="quick-steps">');
    const banner = html.indexOf('data-adsterra-unit="banner-320x50"');
    const nextH2 = html.indexOf('<h2', quick + 1);
    const sources = html.indexOf('<section class="source-note"');
    const native = html.indexOf('data-adsterra-unit="native"');
    const sequence = html.indexOf('<nav class="sequence"');
    assert.ok(quick !== -1 && quick < banner && banner < nextH2, `${file} banner boundary`);
    assert.ok(sources !== -1 && sources < native && native < sequence, `${file} native boundary`);

    if (liveAds) {
      assert.equal(count(html, /pl30995799\.profitableratecpmnetwork\.com\/cd35885d41c8db0e720a6e017aadbf77\/invoke\.js/g), 1, file);
      assert.equal(count(html, /id="container-cd35885d41c8db0e720a6e017aadbf77"/g), 1, file);
      assert.equal(count(html, /www\.highrevenueformat\.com\/31358e95bdfca07885ad4d825c43845b\/invoke\.js/g), 1, file);
      assert.equal(count(html, /atOptions\s*=/g), 1, file);
      assert.ok(html.indexOf('atOptions =') < html.indexOf('www.highrevenueformat.com'), file);
      assert.ok(html.indexOf('<body') < html.indexOf('pl30995799.profitableratecpmnetwork.com'), file);
    } else {
      assert.equal(count(html, /Advertisement placeholder/g), 2, file);
      assert.doesNotMatch(html, /profitableratecpmnetwork|highrevenueformat|31358e95bdfca07885ad4d825c43845b|container-cd35885d41c8db0e720a6e017aadbf77/);
    }
  }
});

test('excluded HTML pages contain no ad unit, script, key, or native container', async () => {
  const excluded = [
    'index.html', 'guides/index.html', 'walkthrough/index.html', 'islands/index.html',
    'bosses/index.html', 'items/index.html', 'achievements/index.html', 'fixes/index.html',
    'search/index.html', 'about/index.html', 'contact/index.html', 'privacy/index.html',
    'terms/index.html', 'disclaimer/index.html', '404.html',
  ];
  for (const relative of excluded) {
    const html = await readFile(path.join(dist, relative), 'utf8');
    assert.doesNotMatch(html, /data-adsterra-unit|profitableratecpmnetwork|highrevenueformat|31358e95bdfca07885ad4d825c43845b|container-cd35885d41c8db0e720a6e017aadbf77/, relative);
  }
});

test('public cards and guide headers do not expose internal priority or verification labels', async () => {
  const home = await readFile(path.join(dist, 'index.html'), 'utf8');
  const category = await readFile(path.join(dist, 'bosses/index.html'), 'utf8');
  const guide = await readFile(path.join(dist, 'bosses/spider-crab/index.html'), 'utf8');
  const about = await readFile(path.join(dist, 'about/index.html'), 'utf8');
  for (const html of [home, category, guide]) assert.doesNotMatch(html, />P[012]</);
  assert.doesNotMatch(guide, /<span class="status">mixed<\/span>/i);
  assert.doesNotMatch(about, /<strong>Mixed:<\/strong>/i);
});

test('privacy page discloses Adsterra without inventing consent controls', async () => {
  const privacy = await readFile(path.join(dist, 'privacy/index.html'), 'utf8');
  assert.match(privacy, /uses Adsterra to display third-party advertisements/i);
  assert.match(privacy, /IP address, browser and device information/i);
  assert.match(privacy, /cookies, pixels, local storage, or similar technologies/i);
  assert.match(privacy, /https:\/\/adsterra\.com\/privacy-policy-managed\//);
  assert.match(privacy, /https:\/\/adsterra\.com\/cookies\//);
  assert.match(privacy, /Effective August 24, 2026/);
  assert.doesNotMatch(privacy, /ads? (?:are|is) blocked until (?:you|the user) consent/i);
});
