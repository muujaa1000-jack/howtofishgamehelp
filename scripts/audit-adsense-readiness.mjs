import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('.');
const dist = path.join(root, 'dist');
const contentRoot = path.join(root, 'src', 'content', 'guides');
const apex = 'https://howtofishgamehelp.com';
const errors = [];

const approvedEligibleRoutes = new Set([
  '/guides/beginner-guide/',
  '/guides/difficulty-settings/',
  '/walkthrough/story-walkthrough/',
  '/bosses/pufferfish/',
  '/achievements/achievement-guide/',
  '/fixes/problems-and-fixes/',
  '/fixes/steam-relay-connection-failed/',
  '/fixes/save-file-corrupted-or-weapon-crash/',
]);

const neverEligibleRoutes = new Set([
  '/search/', '/about/', '/contact/', '/privacy/', '/terms/', '/disclaimer/', '/404/',
  '/guides/', '/walkthrough/', '/islands/', '/bosses/', '/items/', '/achievements/', '/fixes/',
]);

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  }));
  return nested.flat();
}

function fail(message) {
  errors.push(message);
}

function frontmatterOf(source, file) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    fail(`${file}: missing frontmatter`);
    return '';
  }
  return match[1];
}

function scalar(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return match?.[1].trim().replace(/^['"]|['"]$/g, '') ?? '';
}

function routeToHtml(route) {
  if (route === '/404/') return path.join(dist, '404.html');
  return path.join(dist, ...route.split('/').filter(Boolean), 'index.html');
}

if (!(await exists(dist))) {
  console.error('AdSense readiness audit requires a current dist build. Run npm run build first.');
  process.exit(1);
}

const distFiles = await walk(dist);
const textFiles = distFiles.filter((file) => /\.(?:html|js|json|css|xml|txt)$/i.test(file));
const textEntries = await Promise.all(textFiles.map(async (file) => [file, await readFile(file, 'utf8')]));
const distCorpus = textEntries.map(([, source]) => source).join('\n');
const htmlEntries = textEntries.filter(([file]) => file.endsWith('.html'));

const executableAdPatterns = [
  /atOptions/i,
  /invoke\.js/i,
  /profitableratecpmnetwork/i,
  /highrevenueformat/i,
  /pagead2\.googlesyndication\.com/i,
  /adsbygoogle/i,
  /(?:popunder|social bar|interstitial|direct link)[\s\S]{0,120}(?:script|href|src|window\.open)/i,
];
for (const pattern of executableAdPatterns) {
  if (pattern.test(distCorpus)) fail(`built output contains an advertising execution pattern: ${pattern}`);
}

if (/(?:class|id|data-[a-z-]*)=["'][^"']*(?:ad-slot|adsbygoogle|ad-container)[^"']*["']/i.test(distCorpus)) {
  fail('built output contains an advertising container or slot');
}

const fakeZeroId = `pub-${'0'.repeat(16)}`;
const fakeLetterId = `pub-${'X'.repeat(16)}`;
if (distCorpus.includes(fakeZeroId) || distCorpus.includes(fakeLetterId)) fail('built output contains a fake publisher ID');
if (/\bGuides Guides\b/i.test(distCorpus)) fail('built output contains the duplicated heading Guides Guides');
if (/\b(?:TODO|TBD|Screenshot needed|draft only|release candidate)\b/i.test(distCorpus)) {
  fail('built output contains a public editorial placeholder');
}

const searchFile = routeToHtml('/search/');
if (!(await exists(searchFile))) {
  fail('search page is missing from the build');
} else {
  const searchHtml = await readFile(searchFile, 'utf8');
  if (!/<meta\s+name=["']robots["']\s+content=["']noindex,follow["']\s*\/?\s*>/i.test(searchHtml)) {
    fail('/search/ must emit exactly noindex,follow');
  }
  if (!/<noscript>[\s\S]*?<a\s+href=["']\/(?:guides|walkthrough|islands|bosses|items|achievements|fixes)\//i.test(searchHtml)) {
    fail('/search/ must provide category navigation without JavaScript');
  }
}

const sitemapFiles = textEntries.filter(([file]) => /sitemap.*\.xml$/i.test(file));
if (!sitemapFiles.length) fail('no sitemap XML was generated');
const sitemapCorpus = sitemapFiles.map(([, source]) => source).join('\n');
if (sitemapCorpus.includes(`${apex}/search/`)) fail('sitemap contains /search/');
if (sitemapCorpus.includes(`${apex}/404/`)) fail('sitemap contains /404/');

for (const route of neverEligibleRoutes) {
  const file = routeToHtml(route);
  if (!(await exists(file))) {
    fail(`${route} is missing from the build`);
    continue;
  }
  const html = await readFile(file, 'utf8');
  if (/(?:ad-slot|adsbygoogle|googlesyndication|data-ad-eligible=["']true)/i.test(html)) {
    fail(`${route} contains advertising markup`);
  }
}

const canonicalFiles = htmlEntries.filter(([file]) => file.endsWith('index.html') || file.endsWith('404.html'));
const titles = new Map();
for (const [file, html] of canonicalFiles) {
  const relative = path.relative(dist, file);
  const titleMatches = [...html.matchAll(/<title>([^<]+)<\/title>/gi)].map((match) => match[1].trim());
  if (titleMatches.length !== 1 || !titleMatches[0]) fail(`${relative} must have one non-empty title`);
  else if (titles.has(titleMatches[0].toLowerCase())) fail(`${relative} duplicates the title used by ${titles.get(titleMatches[0].toLowerCase())}`);
  else titles.set(titleMatches[0].toLowerCase(), relative);
  const descriptions = [...html.matchAll(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/gi)];
  if (descriptions.length !== 1 || !descriptions[0][1].trim()) fail(`${relative} must have one non-empty meta description`);
  const h1Count = (html.match(/<h1(?:\s|>)/gi) ?? []).length;
  if (h1Count !== 1) fail(`${relative} has ${h1Count} H1 elements`);
  const canonicals = [...html.matchAll(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/gi)].map((match) => match[1]);
  if (canonicals.length !== 1) fail(`${relative} has ${canonicals.length} canonical links`);
  else if (!canonicals[0].startsWith(`${apex}/`)) fail(`${relative} has a non-apex canonical`);
}

const metaCounts = [];
for (const [file, html] of canonicalFiles) {
  const accounts = [...html.matchAll(/<meta\s+name=["']google-adsense-account["']\s+content=["']([^"']+)["']/gi)].map((match) => match[1]);
  if (accounts.length > 1) fail(`${path.relative(dist, file)} has duplicate AdSense account meta tags`);
  if (accounts.some((value) => !/^ca-pub-[0-9]{16}$/.test(value))) fail(`${path.relative(dist, file)} has an invalid AdSense account meta value`);
  metaCounts.push(accounts.length);
}
if (new Set(metaCounts).size > 1) fail('AdSense account meta is not consistently emitted across shared pages');

const contentFiles = (await walk(contentRoot)).filter((file) => file.endsWith('.md'));
for (const file of contentFiles) {
  const source = await readFile(file, 'utf8');
  const frontmatter = frontmatterOf(source, path.relative(root, file));
  const route = `/${scalar(frontmatter, 'category')}/${scalar(frontmatter, 'slug')}/`;
  const isEligible = scalar(frontmatter, 'adEligible') === 'true';
  if (isEligible !== approvedEligibleRoutes.has(route)) fail(`${route} has an unexpected adEligible value`);
  for (const field of ['lastSourceReview', 'evidenceThroughVersion', 'firstHandTested', 'patchSensitive', 'adEligible']) {
    if (!new RegExp(`^${field}:`, 'm').test(frontmatter)) fail(`${route} is missing ${field}`);
  }
  if (scalar(frontmatter, 'firstHandTested') !== 'false') fail(`${route} makes an unsupported first-hand testing claim`);
}

const adsTxt = path.join(dist, 'ads.txt');
if (await exists(adsTxt)) {
  const value = (await readFile(adsTxt, 'utf8')).trim();
  if (!/^google\.com, pub-[0-9]{16}, DIRECT, f08c47fec0942fa0$/.test(value)) {
    fail('ads.txt exists but is not one exact valid Google publisher record');
  }
}

if (errors.length) {
  console.error(`AdSense readiness audit failed with ${errors.length} errors:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`AdSense readiness audit passed: ${canonicalFiles.length} pages, ${contentFiles.length} guides, ${sitemapFiles.length} sitemap files, 0 errors.`);
console.log(`AdSense account meta: ${metaCounts[0] === 1 ? 'one valid tag per page' : 'not configured; no tag emitted'}.`);
console.log(`ads.txt: ${(await exists(adsTxt)) ? 'one valid Google record' : 'not published; no placeholder file'}.`);
