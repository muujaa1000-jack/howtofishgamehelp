import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
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
  for (const script of ['dev', 'check', 'build', 'test', 'validate', 'audit:adsense', 'preview', 'deploy']) {
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
    'lastSourceReview', 'evidenceThroughVersion', 'firstHandTested',
    'patchSensitive', 'adEligible',
  ]) {
    assert.match(schema, new RegExp(`\\b${field}\\b`), `schema missing ${field}`);
  }
  assert.match(schema, /official/);
  assert.match(schema, /community-confirmed/);
  assert.match(schema, /needs-review/);
  assert.match(schema, /adEligible:\s*z\.boolean\(\)\.default\(false\)/);
  assert.match(schema, /firstHandTested:\s*z\.boolean\(\)\.default\(false\)/);
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
  assert.doesNotMatch(corpus, /pub-(?:X{4,}|0{16})/i);
  assert.doesNotMatch(corpus, /(?:^|[^A-Za-z0-9])G-[A-Z0-9]{8,}(?:$|[^A-Za-z0-9])/m);
});

test('active runtime and deployment files contain no Adsterra execution path', async () => {
  const activeFiles = [
    ...(await walk('src')).filter((file) => file !== path.join('src', 'pages', 'privacy.astro')),
    ...(await walk('worker')),
    ...(await walk('.github')),
    '.env.example',
    'package.json',
  ];
  const corpus = (await Promise.all(activeFiles.map((file) => text(file)))).join('\n');
  assert.doesNotMatch(
    corpus,
    /adsterra|profitableratecpmnetwork|highrevenueformat|atOptions|invoke\.js|popunder|social bar|interstitial|direct link/i,
  );
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
  assert.doesNotMatch(workflow, /PUBLIC_CONTACT_EMAIL_ENABLED/);
  assert.doesNotMatch(workflow, /PUBLIC_ANALYTICS_ENABLED|PUBLIC_ANALYTICS_ID/);
  assert.match(workflow, /PUBLIC_ADSENSE_ENABLED:\s*["']false["']/);
  assert.match(workflow, /PUBLIC_GOOGLE_ADSENSE_ACCOUNT:\s*\$\{\{ vars\.PUBLIC_GOOGLE_ADSENSE_ACCOUNT \}\}/);
  assert.doesNotMatch(workflow, /PUBLIC_ADS_DEPLOYMENT|PUBLIC_ADS_ENABLED|PUBLIC_ADSTERRA/);
  assert.match(workflow, /name: Validate advertising configuration/);
  assert.ok(
    workflow.indexOf('Validate advertising configuration') < workflow.indexOf('npm run build'),
    'advertising configuration must be validated before build',
  );
  assert.doesNotMatch(workflow, /cfut_[A-Za-z0-9_-]+/);

  const releaseTagReference = '${{ steps.worker-release-tag.outputs.tag }}';
  assert.match(
    workflow,
    /name: Set Worker release tag\r?\n\s+id: worker-release-tag\r?\n\s+shell: bash\r?\n\s+run: echo "tag=release-\$\{GITHUB_SHA\}-\$\{GITHUB_RUN_ID\}-\$\{GITHUB_RUN_ATTEMPT\}" >> "\$GITHUB_OUTPUT"/,
    'workflow must create one release tag with the commit, run ID, and run attempt',
  );
  assert.doesNotMatch(workflow, /--tag "\$GITHUB_SHA"/);
  assert.doesNotMatch(workflow, /--version-tag "\$GITHUB_SHA"/);

  const requiredCommands = [
    'npm ci',
    'npm audit --audit-level=high',
    'npm run validate',
    'node --experimental-strip-types --test tests/ad-placement.test.mjs tests/source-contract.test.mjs tests/content-quality.test.mjs tests/validate-script.test.mjs',
    'npm run check',
    'npm run build',
    'npm run audit:adsense',
    'npm run test:built',
    `npx wrangler versions upload --env="" --tag "${releaseTagReference}"`,
    `npx wrangler versions deploy --env="" --version-tag "${releaseTagReference}" --yes`,
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

test('production advertising guard accepts an empty account and rejects invalid account values', async () => {
  const workflow = await text('.github/workflows/deploy-production.yml');
  const match = workflow.match(/name: Validate advertising configuration\r?\n\s+run: node -e "([^"]+)"/);
  assert.ok(match, 'advertising guard command must be present');

  const baseEnv = { ...process.env };
  for (const name of ['PUBLIC_ADSENSE_ENABLED', 'PUBLIC_GOOGLE_ADSENSE_ACCOUNT']) delete baseEnv[name];

  const runGuard = (values) => spawnSync(process.execPath, ['-e', match[1]], {
    env: { ...baseEnv, ...values },
    encoding: 'utf8',
  });
  const accepted = runGuard({
    PUBLIC_ADSENSE_ENABLED: 'false',
    PUBLIC_GOOGLE_ADSENSE_ACCOUNT: '',
  });
  assert.equal(accepted.status, 0, accepted.stderr);

  const invalidEnabled = runGuard({
    PUBLIC_ADSENSE_ENABLED: 'true',
    PUBLIC_GOOGLE_ADSENSE_ACCOUNT: '',
  });
  assert.notEqual(invalidEnabled.status, 0, 'review build must reject enabled advertising');

  const invalidAccount = runGuard({
    PUBLIC_ADSENSE_ENABLED: 'false',
    PUBLIC_GOOGLE_ADSENSE_ACCOUNT: 'not-a-publisher-account',
  });
  assert.notEqual(invalidAccount.status, 0, 'invalid account format should be rejected');
});

test('worker CSP blocks advertising and analytics origins during review', async () => {
  const worker = await text('worker/index.ts');
  assert.doesNotMatch(worker, /googletagmanager|google-analytics|analytics\.google|googlesyndication|doubleclick/i);
  assert.doesNotMatch(worker, /profitableratecpmnetwork|highrevenueformat|adsterra/i);
  assert.match(worker, /connect-src 'self'/);
  assert.doesNotMatch(worker, /script-src[^;"]*https:\/\/\*/);
});

test('worker prevents Cloudflare analytics injection into HTML responses', async () => {
  const worker = (await import('../worker/index.ts')).default;
  const response = await worker.fetch(
    new Request('https://howtofishgamehelp.com/'),
    {
      ASSETS: {
        fetch: async () => new Response('<!doctype html><title>Guide</title>', {
          headers: {
            'Cache-Control': 'public, max-age=0, must-revalidate',
            'Content-Type': 'text/html; charset=utf-8',
          },
        }),
      },
    },
  );

  assert.match(response.headers.get('Cache-Control') ?? '', /(?:^|,)\s*no-transform(?:,|$)/i);
});

test('shared head validates and conditionally emits one AdSense account meta', async () => {
  const siteConfig = await text('src/config/site.ts');
  const layout = await text('src/layouts/BaseLayout.astro');
  assert.match(siteConfig, /\^ca-pub-\[0-9\]\{16\}\$/);
  assert.match(siteConfig, /PUBLIC_GOOGLE_ADSENSE_ACCOUNT/);
  assert.match(layout, /name="google-adsense-account"/);
  assert.match(layout, /site\.adsenseAccountIsValid/);
});
