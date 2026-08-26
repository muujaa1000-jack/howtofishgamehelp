import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('src/content/guides');
const required = [
  'title', 'description', 'slug', 'category', 'primaryIntent', 'publishedAt', 'updatedAt',
  'lastVerifiedAt', 'gameVersion', 'verificationStatus', 'sources', 'previousGuide',
  'nextGuide', 'relatedGuides', 'draft', 'noindex',
];
const reviewMetadata = [
  'lastSourceReview', 'evidenceThroughVersion', 'firstHandTested', 'patchSensitive',
  'adEligible', 'answer',
];
const allowedVerification = new Set(['official', 'community-confirmed', 'mixed', 'needs-review']);
const errors = [];
const warnings = [];

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

function report(file, message) {
  errors.push(`${path.relative(process.cwd(), file)}: ${message}`);
}

function warn(file, message) {
  warnings.push(`${path.relative(process.cwd(), file)}: ${message}`);
}

const files = await walk(root);
const guides = [];

for (const file of files) {
  const raw = await readFile(file, 'utf8');
  const parts = raw.split(/^---\s*$/m);
  if (parts.length < 3) {
    report(file, 'missing YAML frontmatter');
    continue;
  }

  const frontmatter = parts[1];
  const body = parts.slice(2).join('---').trim();
  for (const field of required) {
    if (!new RegExp(`^${field}:`, 'm').test(frontmatter)) report(file, `missing ${field}`);
  }
  for (const field of reviewMetadata) {
    if (!new RegExp(`^${field}:`, 'm').test(frontmatter)) warn(file, `missing review metadata ${field}`);
  }

  const title = scalar(frontmatter, 'title');
  const description = scalar(frontmatter, 'description');
  const slug = scalar(frontmatter, 'slug');
  const category = scalar(frontmatter, 'category');
  const verificationStatus = scalar(frontmatter, 'verificationStatus');
  const draft = scalar(frontmatter, 'draft') === 'true';
  const noindex = scalar(frontmatter, 'noindex') === 'true';
  const route = `/${category}/${slug}/`;
  const sourceCount = (frontmatter.match(/^\s+- title:/gm) ?? []).length;
  const words = body.replace(/[#*`>_[\]()\d.:-]/g, ' ').split(/\s+/).filter(Boolean).length;
  const links = [...frontmatter.matchAll(/^\s+(?:-\s+)?["']?(\/[a-z0-9/-]+\/)["']?\s*$/gm)].map((match) => match[1]);

  if (!allowedVerification.has(verificationStatus)) report(file, `invalid verificationStatus ${verificationStatus}`);
  if (verificationStatus === 'needs-review' && !noindex) report(file, 'needs-review must also be noindex');
  if (!draft && sourceCount < 2) report(file, 'public guide needs at least two evidence sources');
  if (!draft && words < 220) report(file, `public guide body has only ${words} words`);
  for (const heading of ['## Quick steps', '## Why it may not work', '## Solo and co-op', '## What to do next']) {
    if (!draft && !body.includes(heading)) report(file, `missing ${heading}`);
  }

  guides.push({ file, title, description, route, draft, links });
}

const publicGuides = guides.filter((guide) => !guide.draft);
const publicRoutes = new Set(publicGuides.map((guide) => guide.route));
for (const key of ['title', 'description', 'route']) {
  const seen = new Map();
  for (const guide of publicGuides) {
    const value = guide[key].toLowerCase();
    if (seen.has(value)) report(guide.file, `duplicate ${key} also used by ${seen.get(value)}`);
    seen.set(value, path.relative(process.cwd(), guide.file));
  }
}

for (const guide of publicGuides) {
  for (const link of guide.links) {
    if (!publicRoutes.has(link)) report(guide.file, `frontmatter link does not resolve: ${link}`);
  }
}

if (publicGuides.length !== 35) {
  errors.push(`Reviewed set has ${publicGuides.length} public guides; expected 35.`);
}

if (errors.length) {
  console.error(`Content validation failed with ${errors.length} validation errors:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

if (warnings.length) {
  console.warn(`Content validation passed with ${warnings.length} warnings:`);
  for (const warning of warnings) console.warn(`- ${warning}`);
}

console.log(`Content validation passed: ${publicGuides.length} public guides, ${guides.length - publicGuides.length} drafts, 0 validation errors, ${warnings.length} warnings.`);
