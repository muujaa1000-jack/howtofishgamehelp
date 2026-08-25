import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { parse } from 'parse5';

const dist = path.resolve('dist');
const adsenseAccount = process.env.PUBLIC_GOOGLE_ADSENSE_ACCOUNT?.trim() ?? '';
const validAdsenseAccount = /^ca-pub-[0-9]{16}$/.test(adsenseAccount);

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

function findByAttribute(node, name) {
  if (node.attrs?.some((attribute) => attribute.name === name)) return node;
  for (const child of node.childNodes ?? []) {
    const match = findByAttribute(child, name);
    if (match) return match;
  }
  return null;
}

function textContent(node) {
  if (node.nodeName === '#text') return node.value;
  return (node.childNodes ?? []).map(textContent).join(' ');
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
  const guide = await text('bosses/spider-crab/index.html');
  const privacy = await text('privacy/index.html');
  assert.match(home, /<link rel="canonical" href="https:\/\/howtofishgamehelp\.com\/">/);
  assert.match(home, /<meta name="msvalidate\.01" content="2F37111893DE046DA8A16D61DCC4F766">/);
  assert.match(home, /<meta property="og:image" content="https:\/\/howtofishgamehelp\.com\/og-default\.png">/);
  assert.match(home, /application\/ld\+json/);
  assert.equal((home.match(/<h1(?:\s|>)/g) ?? []).length, 1);

  for (const html of [home, guide]) {
    assert.doesNotMatch(html, /googletagmanager\.com|google-analytics\.com|gtag\(/);
  }
  assert.match(privacy, /Google Analytics is <strong>disabled<\/strong>/);

  const contact = await text('contact/index.html');
  assert.doesNotMatch(contact, /noindex/i);
  assert.match(contact, /href="mailto:contact@howtofishgamehelp\.com"/i);

  const search = await text('search/index.html');
  assert.match(search, /<meta name="robots" content="noindex,follow">/);
  assert.match(search, /Browse by category/i);
  for (const route of ['/guides/', '/walkthrough/', '/bosses/', '/fixes/']) {
    assert.match(search, new RegExp(`href="${route.replaceAll('/', '\\/')}"`));
  }

  const notFound = await text('404.html');
  assert.match(notFound, /<meta name="robots" content="noindex,nofollow">/);

  const robots = await text('robots.txt');
  assert.doesNotMatch(robots, /Disallow:\s*\/search\//i);
});

test('all generated internal links resolve and launch output contains no private or placeholder configuration', async () => {
  const files = await walk(dist);
  const htmlFiles = files.filter((file) => file.endsWith('.html'));
  const corpus = (await Promise.all(files.filter((file) => /\.(?:html|xml|txt|js|css)$/.test(file)).map((file) => readFile(file, 'utf8')))).join('\n');
  assert.doesNotMatch(corpus, /localhost/i);
  if (validAdsenseAccount) {
    const accountMentions = corpus.match(/ca-pub-[0-9]+/gi) ?? [];
    assert.ok(accountMentions.length > 0, 'configured account should appear in generated HTML');
    assert.ok(accountMentions.every((value) => value === adsenseAccount));
  } else {
    assert.doesNotMatch(corpus, /ca-pub-[0-9]+/i);
  }
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

test('sitemap contains only the intended indexable launch URLs', async () => {
  const sitemap = await text('sitemap.xml');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.ok(urls.length >= 44, `expected at least 44 indexable URLs, found ${urls.length}`);
  assert.ok(urls.every((url) => url.startsWith('https://howtofishgamehelp.com/')));
  assert.ok(!urls.some((url) => /\/(?:search|404)\//.test(url)));
  assert.equal(urls.includes('https://howtofishgamehelp.com/contact/'), true);
});

test('trust pages use one public identity and disclose review-period data practices', async () => {
  const about = await text('about/index.html');
  const contact = await text('contact/index.html');
  const privacy = await text('privacy/index.html');

  for (const html of [about, contact]) {
    assert.match(html, /contact@howtofishgamehelp\.com/i);
    assert.match(html, /Dazed Games/i);
    assert.match(html, /Steam/i);
  }
  assert.match(about, /Corrections and rights requests/i);
  assert.match(about, /official sources/i);
  assert.match(about, /community sources/i);
  assert.match(about, /editorial judgment/i);
  assert.match(about, /not independently playtested/i);

  assert.match(privacy, /Google AdSense and advertising cookies/i);
  assert.match(privacy, /https:\/\/adssettings\.google\.com\//);
  assert.match(privacy, /https:\/\/policies\.google\.com\/technologies\/partner-sites/);
  assert.match(privacy, /Adsterra advertising units were disabled/i);
  assert.match(privacy, /Google Analytics is <strong>disabled<\/strong>/i);
  assert.doesNotMatch(privacy, /Google-certified consent management platform where required/i);
  assert.doesNotMatch(privacy, /Privacy and cookie settings/i);
});

test('indexable hubs provide concise editorial routes and remain free of ads', async () => {
  for (const category of ['guides', 'walkthrough', 'islands', 'bosses', 'items', 'achievements', 'fixes']) {
    const html = await text(`${category}/index.html`);
    const hub = findByAttribute(parse(html), 'data-hub-copy');
    assert.ok(hub, `${category} hub is missing editorial copy`);
    const words = textContent(hub).match(/[A-Za-z][A-Za-z’'-]*/g) ?? [];
    assert.ok(words.length >= 350 && words.length <= 600, `${category} hub has ${words.length} editorial words`);
    assert.doesNotMatch(html, /(?:ad-slot|adsbygoogle|googlesyndication|data-ad-eligible="true")/i);
  }
  const guides = await text('guides/index.html');
  assert.match(guides, /<h1[^>]*>How to Fish Beginner Guides<\/h1>/);
  assert.doesNotMatch(guides, /Guides Guides/i);
});
