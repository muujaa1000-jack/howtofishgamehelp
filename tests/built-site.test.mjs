import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const dist = path.resolve('dist');

async function text(file) {
  return readFile(path.join(dist, file), 'utf8');
}

async function exists(file) {
  try { await stat(path.join(dist, file)); return true; } catch { return false; }
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : target;
  }));
  return nested.flat();
}

function hrefToFile(href) {
  const url = new URL(href, 'https://howtofishgamehelp.com');
  const pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') return 'index.html';
  if (path.extname(pathname)) return pathname.slice(1);
  return `${pathname.slice(1).replace(/\/$/, '')}/index.html`;
}

test('build contains the representative launch routes and metadata', async () => {
  assert.equal(await exists('index.html'), true, 'Run npm run build before built-site QA.');
  const representatives = [
    'bosses/index.html',
    'walkthrough/lighthouse-first-island/index.html',
    'bosses/spider-crab/index.html',
    'fixes/multiplayer-black-screen/index.html',
    'contact/index.html',
    '404.html',
    'robots.txt',
    'sitemap.xml',
    'rss.xml',
    'pagefind/pagefind-ui.js',
  ];
  for (const file of representatives) assert.equal(await exists(file), true, `${file} is missing`);

  const home = await text('index.html');
  assert.match(home, /<link rel="canonical" href="https:\/\/howtofishgamehelp\.com\/">/);
  assert.match(home, /<meta property="og:image" content="https:\/\/howtofishgamehelp\.com\/og-default\.png">/);
  assert.match(home, /application\/ld\+json/);
  assert.equal((home.match(/<h1(?:\s|>)/g) ?? []).length, 1);

  const contact = await text('contact/index.html');
  assert.match(contact, /noindex, nofollow/);
  assert.doesNotMatch(contact, /contact@howtofishgamehelp\.com/i);
});

test('all generated internal links resolve and launch output contains no private or placeholder configuration', async () => {
  const files = await walk(dist);
  const htmlFiles = files.filter((file) => file.endsWith('.html'));
  const corpus = (await Promise.all(files.filter((file) => /\.(?:html|xml|txt|js|css)$/.test(file)).map((file) => readFile(file, 'utf8')))).join('\n');
  assert.doesNotMatch(corpus, /localhost/i);
  assert.doesNotMatch(corpus, /ca-pub-[0-9]+/i);
  assert.doesNotMatch(corpus, /(?:^|[^A-Za-z0-9])G-[A-Z0-9]{8,}(?:$|[^A-Za-z0-9])/m);
  assert.doesNotMatch(corpus, /foxmail\.com/i);

  for (const file of htmlFiles) {
    const html = await readFile(file, 'utf8');
    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const href = match[1];
      if (/^(?:https?:|mailto:|#|data:)/.test(href)) continue;
      const expected = hrefToFile(href);
      assert.equal(await exists(expected), true, `${path.relative(dist, file)} links to missing ${href}`);
    }
  }
});

test('sitemap contains only the 43 indexable launch URLs', async () => {
  const sitemap = await text('sitemap.xml');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.equal(urls.length, 43);
  assert.ok(urls.every((url) => url.startsWith('https://howtofishgamehelp.com/')));
  assert.ok(!urls.some((url) => /\/(?:search|contact|404)\//.test(url)));
});
