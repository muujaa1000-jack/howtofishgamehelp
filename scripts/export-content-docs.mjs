import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : target;
  }));
  return files.flat().filter((file) => file.endsWith('.md'));
}

function scalar(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return match?.[1].trim().replace(/^['"]|['"]$/g, '') ?? '';
}

function csv(value) {
  const text = String(value ?? '').replaceAll('"', '""');
  return /[",\n]/.test(text) ? `"${text}"` : text;
}

const records = [];
for (const file of await walk(path.resolve('src/content/guides'))) {
  const raw = await readFile(file, 'utf8');
  const frontmatter = raw.split(/^---\s*$/m)[1];
  const sourceBlocks = [...frontmatter.matchAll(/^\s+- title:\s*["']?([^\n"']+)["']?\s*\n\s+url:\s*["']?([^\n"']+)["']?\s*\n\s+type:\s*["']?([^\n"']+)["']?/gm)];
  const category = scalar(frontmatter, 'category');
  const slug = scalar(frontmatter, 'slug');
  const answer = scalar(frontmatter, 'answer');
  const verification = scalar(frontmatter, 'verificationStatus');
  records.push({
    route: `/${category}/${slug}/`,
    title: scalar(frontmatter, 'title'),
    category,
    intent: scalar(frontmatter, 'primaryIntent'),
    priority: scalar(frontmatter, 'priority'),
    status: scalar(frontmatter, 'draft') === 'true' ? 'draft' : 'published',
    notes: answer,
    sourceTitle: sourceBlocks[0]?.[1] ?? '',
    sourceUrl: sourceBlocks[0]?.[2] ?? '',
    sourceType: sourceBlocks[0]?.[3] ?? '',
    verifiedAt: scalar(frontmatter, 'lastVerifiedAt'),
    sourceCount: sourceBlocks.length,
    confidence: verification === 'official' ? 'high' : verification === 'needs-review' ? 'low' : 'medium-high',
    publicAllowed: scalar(frontmatter, 'draft') !== 'true' && scalar(frontmatter, 'noindex') !== 'true' ? 'yes' : 'no',
  });
}

records.sort((a, b) => a.route.localeCompare(b.route));

const contentHeader = ['slug', 'title', 'category', 'primary_intent', 'priority', 'status', 'notes'];
const contentRows = records.map((record) => [record.route, record.title, record.category, record.intent, record.priority, record.status, record.notes].map(csv).join(','));
await writeFile('docs/content-map.csv', `${contentHeader.join(',')}\n${contentRows.join('\n')}\n`, 'utf8');

const evidenceHeader = ['page_slug', 'primary_intent', 'source_url', 'source_type', 'source_title', 'verified_at', 'supported_key_facts', 'second_source', 'current_confidence', 'public_allowed'];
const evidenceRows = records.map((record) => [record.route, record.intent, record.sourceUrl, record.sourceType, record.sourceTitle, record.verifiedAt, record.notes, record.sourceCount >= 2 ? 'yes' : 'no', record.confidence, record.publicAllowed].map(csv).join(','));
await writeFile('docs/evidence-ledger.csv', `${evidenceHeader.join(',')}\n${evidenceRows.join('\n')}\n`, 'utf8');

console.log(`Updated content map and evidence ledger for ${records.length} guide pages.`);
