# GitHub Actions Production Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy the existing `howtofishgamehelp` production Worker automatically after every successful validation and build on `main` without changing the shared Cloudflare GitHub App or the stable preview Worker.

**Architecture:** A single repository workflow validates source and content, builds the production site with Contact enabled, checks the generated output, and calls the locked Wrangler dependency. GitHub stores the Cloudflare token as an encrypted secret and the account identifier as a repository variable; no credential value enters the repository.

**Tech Stack:** GitHub Actions, Node.js 22.12.0, npm, Astro 7, Node test runner, Wrangler 4.125.0, Cloudflare Workers Static Assets.

## Global Constraints

- Only pushes to `main` and explicit manual dispatch may run the production workflow.
- Pull requests and non-`main` branches must not deploy.
- The existing `howtofishgamehelp-preview` Worker must not be changed.
- The shared Cloudflare GitHub App and unrelated repositories must not be changed.
- The workflow must use the locked repository dependencies and add no production dependency.
- `PUBLIC_CONTACT_EMAIL_ENABLED` must equal `true` for the production build.
- The Cloudflare token must exist only as the encrypted `CLOUDFLARE_API_TOKEN` GitHub Actions secret.
- The Cloudflare account identifier must exist as the `CLOUDFLARE_ACCOUNT_ID` GitHub Actions variable.
- Never print, commit, document, or expose the credential value.

---

## File map

- Modify `tests/source-contract.test.mjs`: define the security and behavior contract for the production workflow.
- Create `.github/workflows/deploy-production.yml`: validate, build, test, and deploy `main` to the existing production Worker.
- Modify `docs/execution-plan.md`: mark the GitHub Actions recovery path complete after remote verification.
- Modify `docs/manual-actions.md`: remove the continuous-deployment decision and retain only the optional email receipt check.
- Modify `docs/launch-report.md`: record workflow, run, Worker version, commit, and final verification evidence.

### Task 1: Add the deployment workflow contract

**Files:**
- Modify: `tests/source-contract.test.mjs`
- Test: `tests/source-contract.test.mjs`

**Interfaces:**
- Consumes: the existing `text(relativePath)` test helper.
- Produces: a test named `production deployment workflow is main-only, gated, and secret-safe` that constrains `.github/workflows/deploy-production.yml`.

- [ ] **Step 1: Write the failing test**

Append this test to `tests/source-contract.test.mjs`:

```js
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
  assert.doesNotMatch(workflow, /cfut_[A-Za-z0-9_-]+/);

  const requiredCommands = [
    'npm ci',
    'npm audit --audit-level=high',
    'npm run validate',
    'node --test tests/source-contract.test.mjs tests/content-quality.test.mjs tests/validate-script.test.mjs',
    'npm run check',
    'npm run build',
    'npm run test:built',
    'npx wrangler deploy',
  ];
  for (const command of requiredCommands) {
    assert.match(workflow, new RegExp(command.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `workflow missing: ${command}`);
  }

  assert.ok(
    requiredCommands.every((command, index) => index === 0 || workflow.indexOf(command) > workflow.indexOf(requiredCommands[index - 1])),
    'validation, build, and deployment commands must remain in safety order',
  );
});
```

- [ ] **Step 2: Run the targeted test and verify RED**

Run:

```powershell
node --test --test-name-pattern "production deployment workflow" tests/source-contract.test.mjs
```

Expected: FAIL because `.github/workflows/deploy-production.yml` does not exist. The failure must be `ENOENT`, not a syntax or assertion error.

- [ ] **Step 3: Commit the failing contract**

```powershell
git add tests/source-contract.test.mjs
git commit -m "test: define production deployment workflow contract"
```

### Task 2: Implement the main-only production workflow

**Files:**
- Create: `.github/workflows/deploy-production.yml`
- Test: `tests/source-contract.test.mjs`

**Interfaces:**
- Consumes: GitHub secret `CLOUDFLARE_API_TOKEN`, GitHub variable `CLOUDFLARE_ACCOUNT_ID`, npm scripts in `package.json`, and `wrangler.jsonc` production configuration.
- Produces: one serialized production deployment job for `main` and manual dispatch.

- [ ] **Step 1: Create the minimal workflow**

Create `.github/workflows/deploy-production.yml` with this content:

```yaml
name: Deploy production

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: production-deploy
  cancel-in-progress: false

jobs:
  deploy:
    name: Validate, build, and deploy
    runs-on: ubuntu-latest
    timeout-minutes: 20
    env:
      CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
      CLOUDFLARE_ACCOUNT_ID: ${{ vars.CLOUDFLARE_ACCOUNT_ID }}
      PUBLIC_CONTACT_EMAIL_ENABLED: "true"
    steps:
      - name: Check out repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22.12.0
          cache: npm

      - name: Install locked dependencies
        run: npm ci

      - name: Audit dependencies
        run: npm audit --audit-level=high

      - name: Validate content
        run: npm run validate

      - name: Test source contracts
        run: node --test tests/source-contract.test.mjs tests/content-quality.test.mjs tests/validate-script.test.mjs

      - name: Type check
        run: npm run check

      - name: Build production site
        run: npm run build

      - name: Test generated site
        run: npm run test:built

      - name: Deploy production Worker
        run: npx wrangler deploy
```

- [ ] **Step 2: Run the targeted test and verify GREEN**

Run:

```powershell
node --test --test-name-pattern "production deployment workflow" tests/source-contract.test.mjs
```

Expected: PASS for the workflow contract.

- [ ] **Step 3: Run the complete local verification suite**

Run in order:

```powershell
npm run validate
node --test tests/source-contract.test.mjs tests/content-quality.test.mjs tests/validate-script.test.mjs
npm run check
$env:PUBLIC_CONTACT_EMAIL_ENABLED='true'; npm run build
$env:PUBLIC_CONTACT_EMAIL_ENABLED='true'; npm run test:built
npm audit --audit-level=high
```

Expected: content validation reports 31 public guides and zero errors; all source tests and built tests pass; Astro/TypeScript reports zero errors; build produces 44 sitemap URLs with Contact enabled; npm reports zero high-or-greater vulnerabilities.

- [ ] **Step 4: Scan the workflow and diff for credential leakage**

```powershell
rg -n "cfut_|Bearer |foxmail\.com" .github tests docs --glob '!docs/qa-screenshots/**'
git diff --check
```

Expected: no token, bearer credential, or private destination match; `git diff --check` exits successfully.

- [ ] **Step 5: Commit the implementation**

```powershell
git add .github/workflows/deploy-production.yml
git commit -m "ci: deploy production from main"
```

### Task 3: Configure GitHub and verify the first automatic deployment

**Files:**
- No repository file changes.

**Interfaces:**
- Consumes: the replacement restricted Cloudflare token held in the active secure session and account ID `36e9d90b5b870bef7eb227af87a79be4`.
- Produces: encrypted Actions secret `CLOUDFLARE_API_TOKEN`, Actions variable `CLOUDFLARE_ACCOUNT_ID`, and a verified successful workflow run.

- [ ] **Step 1: Store the non-secret account variable**

```powershell
gh variable set CLOUDFLARE_ACCOUNT_ID --repo muujaa1000-jack/howtofishgamehelp --body 36e9d90b5b870bef7eb227af87a79be4
```

Expected: exit code 0.

- [ ] **Step 2: Store the deployment token without printing it**

Pass the in-memory token to this command through standard input; do not place it in the command line, shell history, a file, or tool output:

```powershell
gh secret set CLOUDFLARE_API_TOKEN --repo muujaa1000-jack/howtofishgamehelp
```

Expected: exit code 0 and no token value in output.

- [ ] **Step 3: Verify only the secret and variable names**

```powershell
gh secret list --repo muujaa1000-jack/howtofishgamehelp
gh variable list --repo muujaa1000-jack/howtofishgamehelp
```

Expected: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` exist; their values are not printed or read back.

- [ ] **Step 4: Push `main` and trigger the workflow**

```powershell
git push origin main
```

Expected: the design, contract, and workflow commits reach `main`; GitHub creates a `Deploy production` run for the pushed commit.

- [ ] **Step 5: Monitor the exact run**

```powershell
$latestRun = gh run list --repo muujaa1000-jack/howtofishgamehelp --workflow deploy-production.yml --limit 1 --json databaseId,headSha,status,conclusion,url | ConvertFrom-Json | Select-Object -First 1
if ($latestRun.headSha -ne (git rev-parse HEAD)) { throw 'Latest workflow run does not match local HEAD.' }
gh run watch $latestRun.databaseId --repo muujaa1000-jack/howtofishgamehelp --exit-status
```

Expected: the run's `headSha` equals local `HEAD`, status reaches `completed`, and conclusion is `success`. On failure, read only failed-step logs with `gh run view $latestRun.databaseId --log-failed`, redact any credential-like text, and return to a failing regression test before changing the workflow.

### Task 4: Verify production and close the launch record

**Files:**
- Modify: `docs/execution-plan.md`
- Modify: `docs/manual-actions.md`
- Modify: `docs/launch-report.md`

**Interfaces:**
- Consumes: successful Actions run URL/ID, deployed Worker version, live HTTP readback, and final Git commit.
- Produces: an evidence-backed final launch report with only the optional end-to-end email receipt test remaining.

- [ ] **Step 1: Read the new Worker deployment**

```powershell
npx wrangler deployments list --name howtofishgamehelp
```

Expected: the newest deployment timestamp follows the successful Actions run and includes a new production version ID. Record the immediately previous version as the rollback target.

- [ ] **Step 2: Verify live production behavior**

Check:

```powershell
curl.exe -sS -o NUL -w "%{http_code} %{url_effective}`n" https://howtofishgamehelp.com/
curl.exe -sS -o NUL -w "%{http_code} %{url_effective}`n" https://howtofishgamehelp.com/contact/
curl.exe -sS -o NUL -w "%{http_code} %{url_effective}`n" https://howtofishgamehelp.com/bosses/spider-crab/
curl.exe -sS -o NUL -w "%{http_code} %{url_effective}`n" https://howtofishgamehelp.com/fixes/multiplayer-black-screen/
curl.exe -sS -o NUL -w "%{http_code} %{url_effective}`n" https://howtofishgamehelp.com/sitemap.xml
curl.exe -sS -o NUL -w "%{http_code} %{url_effective}`n" https://howtofishgamehelp.com/robots.txt
curl.exe -sS -I "https://www.howtofishgamehelp.com/bosses/?utm_source=actions-qa"
```

Expected: apex, Contact, representative guide, sitemap, and robots requests return 200; www returns 301 to the matching apex path and preserves the query string. Read the home and Contact HTML to verify apex canonical metadata, the public Contact link, no private destination, and no preview hostname.

- [ ] **Step 3: Update the three delivery documents**

Record the exact workflow run, final deployment and rollback version, successful checks, `main`-only scope, secret/variable name readback, and remaining optional mail receipt test. Remove the obsolete GitHub Actions approval request. Do not include secret values, private email addresses, account email addresses, or unredacted logs.

- [ ] **Step 4: Run final verification and commit the reports**

```powershell
npm test
npm run validate
npm run check
$env:PUBLIC_CONTACT_EMAIL_ENABLED='true'; npm run build
$env:PUBLIC_CONTACT_EMAIL_ENABLED='true'; npm run test:built
npm audit --audit-level=high
git diff --check
git status --short
git add docs/execution-plan.md docs/manual-actions.md docs/launch-report.md
git commit -m "docs: record github actions deployment"
git push origin main
```

Expected: all checks pass and the documentation commit triggers a second `Deploy production` run because it is a `main` push.

- [ ] **Step 5: Verify the final documentation-triggered deployment**

```powershell
$finalRun = gh run list --repo muujaa1000-jack/howtofishgamehelp --workflow deploy-production.yml --limit 1 --json databaseId,headSha,status,conclusion,url | ConvertFrom-Json | Select-Object -First 1
if ($finalRun.headSha -ne (git rev-parse HEAD)) { throw 'Final workflow run does not match final HEAD.' }
gh run watch $finalRun.databaseId --repo muujaa1000-jack/howtofishgamehelp --exit-status
```

Expected: the final run succeeds for final `HEAD`. Verify the final live result with:

```powershell
curl.exe -sS -o NUL -w "%{http_code} %{url_effective}`n" https://howtofishgamehelp.com/
curl.exe -sS -o NUL -w "%{http_code} %{url_effective}`n" https://howtofishgamehelp.com/contact/
curl.exe -sS -o NUL -w "%{http_code} %{url_effective}`n" https://howtofishgamehelp.com/bosses/spider-crab/
curl.exe -sS -o NUL -w "%{http_code} %{url_effective}`n" https://howtofishgamehelp.com/fixes/multiplayer-black-screen/
curl.exe -sS -o NUL -w "%{http_code} %{url_effective}`n" https://howtofishgamehelp.com/sitemap.xml
curl.exe -sS -o NUL -w "%{http_code} %{url_effective}`n" https://howtofishgamehelp.com/robots.txt
curl.exe -sS -I "https://www.howtofishgamehelp.com/bosses/?utm_source=actions-final"
```

Confirm the apex, Contact, representative guide, sitemap, and robots requests return 200; www returns 301 to the matching apex path and preserves the query string; home and Contact HTML retain apex canonical metadata, the public Contact link, and no private destination or preview hostname. Record the final commit, run, version, and rollback target in the Codex delivery response. Do not claim end-to-end email receipt unless the user confirms receipt.
