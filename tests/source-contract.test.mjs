import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const ignoredDirectories = new Set(['.git', '.superpowers', '.worktrees', 'dist', 'node_modules']);

async function text(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

async function walk(relativePath) {
  const absolute = path.join(root, relativePath);
  const entries = await readdir(absolute, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const child = path.join(relativePath, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(child)));
    else files.push(child);
  }
  return files;
}

test('project declares the required static Astro and Cloudflare commands', async () => {
  const pkg = JSON.parse(await text('package.json'));
  assert.equal(pkg.type, 'module');
  for (const script of ['dev', 'check', 'build', 'test', 'validate', 'preview', 'deploy']) {
    assert.equal(typeof pkg.scripts[script], 'string', `missing npm script: ${script}`);
  }

  const astroConfig = await text('astro.config.ts');
  assert.match(astroConfig, /site:\s*['"]https:\/\/howtofishgamehelp\.com['"]/);
  assert.match(astroConfig, /trailingSlash:\s*['"]always['"]/);

  const wrangler = await text('wrangler.jsonc');
  assert.match(wrangler, /"name"\s*:\s*"howtofishgamehelp"/);
  assert.match(wrangler, /"directory"\s*:\s*"\.\/dist"/);
  assert.match(wrangler, /"not_found_handling"\s*:\s*"404-page"/);
});

test('content schema contains every editorial evidence field', async () => {
  const schema = await text('src/content.config.ts');
  for (const field of [
    'title', 'description', 'slug', 'category', 'primaryIntent', 'publishedAt',
    'updatedAt', 'lastVerifiedAt', 'gameVersion', 'verificationStatus', 'sources',
    'previousGuide', 'nextGuide', 'relatedGuides', 'draft', 'noindex',
  ]) {
    assert.match(schema, new RegExp(`\\b${field}\\b`), `schema missing ${field}`);
  }
  assert.match(schema, /official/);
  assert.match(schema, /community-confirmed/);
  assert.match(schema, /needs-review/);
});

test('required public, legal, search, feed, and error routes exist', async () => {
  const required = [
    'src/pages/index.astro',
    'src/pages/about.astro',
    'src/pages/contact.astro',
    'src/pages/privacy.astro',
    'src/pages/terms.astro',
    'src/pages/disclaimer.astro',
    'src/pages/search.astro',
    'src/pages/404.astro',
    'src/pages/rss.xml.ts',
    'src/pages/robots.txt.ts',
    'src/pages/[category]/[slug].astro',
  ];
  await Promise.all(required.map((file) => text(file)));
});

test('repository contains no private forwarding destination or fake monetization identifiers', async () => {
  const textExtensions = new Set(['.astro', '.csv', '.css', '.html', '.js', '.json', '.jsonc', '.md', '.mjs', '.svg', '.ts', '.txt', '.yml', '.yaml']);
  const files = (await walk('.')).filter((file) =>
    !file.startsWith('.git') &&
    !file.startsWith('node_modules') &&
    !file.startsWith('dist') &&
    !file.endsWith('package-lock.json') &&
    textExtensions.has(path.extname(file)),
  );
  const corpus = (await Promise.all(files.map((file) => text(file)))).join('\n');
  assert.doesNotMatch(corpus, /foxmail\.com/i);
  assert.doesNotMatch(corpus, /ca-pub-[0-9]+/i);
  assert.doesNotMatch(corpus, /(?:^|[^A-Za-z0-9])G-[A-Z0-9]{8,}(?:$|[^A-Za-z0-9])/m);
});

test('production deployment workflow is main-only, gated, and secret-safe', async () => {
  const workflow = await text('.github/workflows/deploy-production.yml');

  assert.match(workflow, /^name: Deploy production$/m);
  assert.match(workflow, /^\s*push:\s*\n\s*branches:\s*\[main\]/m);
  assert.match(workflow, /^\s*workflow_dispatch:\s*$/m);
  assert.doesNotMatch(workflow, /^\s*pull_request:/m);
  assert.doesNotMatch(workflow, /branches:\s*\[['"]?\*['"]?\]/);
  assert.match(workflow, /^permissions:\s*\n\s*contents: read$/m);
  assert.match(workflow, /group: production-deploy/);
  assert.match(workflow, /cancel-in-progress: false/);

  assert.match(workflow, /CLOUDFLARE_API_TOKEN:\s*\$\{\{ secrets\.CLOUDFLARE_API_TOKEN \}\}/);
  assert.match(workflow, /CLOUDFLARE_ACCOUNT_ID:\s*\$\{\{ vars\.CLOUDFLARE_ACCOUNT_ID \}\}/);
  assert.match(workflow, /PUBLIC_CONTACT_EMAIL_ENABLED:\s*['"]true['"]/);
  assert.match(workflow, /PUBLIC_ANALYTICS_ENABLED:\s*\$\{\{ vars\.PUBLIC_ANALYTICS_ENABLED \}\}/);
  assert.match(workflow, /PUBLIC_ANALYTICS_ID:\s*\$\{\{ vars\.PUBLIC_ANALYTICS_ID \}\}/);
  assert.match(workflow, /PUBLIC_ADS_DEPLOYMENT:\s*["']production["']/);
  assert.match(workflow, /PUBLIC_ADS_ENABLED:\s*\$\{\{ vars\.PUBLIC_ADS_ENABLED \}\}/);
  assert.match(workflow, /PUBLIC_ADSTERRA_NATIVE_ENABLED:\s*\$\{\{ vars\.PUBLIC_ADSTERRA_NATIVE_ENABLED \}\}/);
  assert.match(workflow, /PUBLIC_ADSTERRA_BANNER_320X50_ENABLED:\s*\$\{\{ vars\.PUBLIC_ADSTERRA_BANNER_320X50_ENABLED \}\}/);
  assert.match(workflow, /name: Validate Analytics configuration/);
  assert.match(workflow, /process\.env\.PUBLIC_ANALYTICS_ENABLED/);
  assert.match(workflow, /\^G-\[A-Z0-9\]\{8,\}\$/);
  assert.match(workflow, /name: Validate advertising configuration/);
  assert.ok(
    workflow.indexOf('Validate Analytics configuration') < workflow.indexOf('npm run build'),
    'analytics configuration must be validated before the production build',
  );
  assert.ok(
    workflow.indexOf('Validate advertising configuration') < workflow.indexOf('npm run build'),
    'advertising configuration must be validated before build',
  );
  assert.doesNotMatch(workflow, /cfut_[A-Za-z0-9_-]+/);

  const requiredCommands = [
    'npm ci',
    'npm audit --audit-level=high',
    'npm run validate',
    'node --experimental-strip-types --test tests/ad-placement.test.mjs tests/source-contract.test.mjs tests/content-quality.test.mjs tests/validate-script.test.mjs',
    'npm run check',
    'npm run build',
    'npm run test:built',
    'npx wrangler versions upload --env="" --tag "$GITHUB_SHA"',
    'npx wrangler versions deploy --env="" --version-tag "$GITHUB_SHA" --yes',
  ];
  for (const command of requiredCommands) {
    assert.match(workflow, new RegExp(command.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `workflow missing: ${command}`);
  }

  assert.ok(
    requiredCommands.every((command, index) => index === 0 || workflow.indexOf(command) > workflow.indexOf(requiredCommands[index - 1])),
    'validation, build, and deployment commands must remain in safety order',
  );

  assert.doesNotMatch(
    workflow,
    /^\s*run:\s*npx wrangler deploy\s*$/m,
    'production automation must not rewrite custom-domain routes',
  );
});

test('worker CSP permits only the required Google Analytics origins', async () => {
  const worker = await text('worker/index.ts');
  assert.match(worker, /script-src[^;"]*https:\/\/www\.googletagmanager\.com/);
  assert.match(worker, /connect-src[^;"]*https:\/\/\*\.google-analytics\.com/);
  assert.match(worker, /connect-src[^;"]*https:\/\/\*\.analytics\.google\.com/);
  assert.match(worker, /connect-src[^;"]*https:\/\/www\.googletagmanager\.com/);
  assert.match(worker, /img-src[^;"]*https:\/\/\*\.google-analytics\.com/);
  assert.match(worker, /img-src[^;"]*https:\/\/www\.googletagmanager\.com/);
  assert.doesNotMatch(worker, /script-src[^;"]*https:\/\/\*/);
  assert.doesNotMatch(worker, /(?:doubleclick\.net|googleadservices\.com|googlesyndication\.com)/);
});

test('approved Adsterra components preserve exact classic-script contracts', async () => {
  const banner = await text('src/components/ads/AdsterraBanner320x50.astro');
  const native = await text('src/components/ads/AdsterraNativeBanner.astro');

  assert.match(banner, /'key'\s*:\s*'31358e95bdfca07885ad4d825c43845b'/);
  assert.match(banner, /'format'\s*:\s*'iframe'/);
  assert.match(banner, /'height'\s*:\s*50/);
  assert.match(banner, /'width'\s*:\s*320/);
  assert.ok(
    banner.indexOf('atOptions =') < banner.indexOf('https://www.highrevenueformat.com/31358e95bdfca07885ad4d825c43845b/invoke.js'),
  );
  assert.doesNotMatch(banner, /type=["']module["']|\basync\b|\bdefer\b/);

  assert.match(native, /async="async"/);
  assert.match(native, /data-cfasync="false"/);
  assert.match(native, /https:\/\/pl30995799\.profitableratecpmnetwork\.com\/cd35885d41c8db0e720a6e017aadbf77\/invoke\.js/);
  assert.ok(
    native.indexOf('/invoke.js') < native.indexOf('container-cd35885d41c8db0e720a6e017aadbf77'),
  );
  assert.doesNotMatch(native, /type=["']module["']/);
});

test('worker CSP permits only the two approved initial Adsterra script origins', async () => {
  const worker = await text('worker/index.ts');
  assert.match(worker, /script-src[^;\"]*https:\/\/pl30995799\.profitableratecpmnetwork\.com/);
  assert.match(worker, /script-src[^;\"]*https:\/\/www\.highrevenueformat\.com/);
  assert.doesNotMatch(worker, /script-src[^;\"]*https:\/\/\*/);
  assert.doesNotMatch(worker, /(?:profitableratecpmnetwork|highrevenueformat)[^;\"]*\*/);
});
