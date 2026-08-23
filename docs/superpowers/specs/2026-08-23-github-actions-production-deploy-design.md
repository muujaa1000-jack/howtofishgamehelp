# GitHub Actions Production Deployment Design

Date: 2026-08-23
Status: Approved in the Codex task

## Purpose

Restore continuous deployment for `howtofishgamehelp` without reinstalling the shared Cloudflare GitHub App or changing the unrelated `PowerUp2Study` repository. A push to the `main` branch must validate, build, and deploy the existing production Worker. Other branches must not deploy automatically.

## Selected approach

Use a repository-owned GitHub Actions workflow that calls the Wrangler version already locked in `package-lock.json`. This avoids an additional deployment Action dependency and keeps local and CI deployment behavior aligned.

The alternatives were rejected for this launch:

- Cloudflare's Wrangler Action would shorten the workflow but add an unnecessary third-party Action layer.
- A manual-only workflow would reduce automation but would not satisfy continuous deployment from `main`.
- Native Workers Builds remains blocked by Cloudflare SCM error `8000008`; repairing it requires reinstalling a shared GitHub App and could interrupt new builds for another repository.

## Trigger and permissions

The workflow runs on:

- a push to `main`;
- an explicit manual `workflow_dispatch` request.

It does not run for pull requests or non-`main` branches. GitHub permissions are limited to `contents: read`. A production concurrency group permits only one deployment at a time and does not cancel an active deployment when a newer commit arrives.

## Build and deployment flow

The job uses Node.js 22.12 or newer and the locked npm dependency graph. Steps run in this order:

1. Check out the repository.
2. Install the configured Node version with npm caching.
3. Run `npm ci`.
4. Run the dependency security audit at the existing launch threshold.
5. Run content validation, automated tests, and type checking.
6. Build with `PUBLIC_CONTACT_EMAIL_ENABLED=true`.
7. Run the built-output test against the generated site.
8. Deploy with the repository's pinned Wrangler package.

Any failure stops the job before deployment. The formal Contact page remains enabled because the public Email Routing rule is already active and verified at the configuration level.

## Credentials and configuration

The restricted Cloudflare deployment token is stored only as the encrypted GitHub Actions secret `CLOUDFLARE_API_TOKEN`. The Cloudflare account identifier is stored as the repository Actions variable `CLOUDFLARE_ACCOUNT_ID`.

Neither value is written into source files, documentation, build output, workflow logs, or Git history. The workflow references the secret and variable by name. The token remains limited to the current Cloudflare account with Workers Builds Configuration: Edit and Workers Scripts: Edit.

## Preview boundary

The existing `howtofishgamehelp-preview` Worker and its stable noindex `workers.dev` URL are not connected to this workflow. Non-`main` branches do not deploy or overwrite that preview. Preview canonical and noindex behavior remains independently verified.

## Tests

A source-contract test is added before the workflow. It must fail while the workflow is absent and then pass only when the workflow:

- listens to `main` and manual dispatch;
- excludes pull-request and broad branch triggers;
- uses read-only repository permissions;
- references the encrypted token and account variable without literal credentials;
- enables the production Contact build;
- runs validation, tests, type checking, building, built-output testing, and deployment;
- serializes production deployments.

After implementation, the complete local test, validation, type-check, build, built-output, link, metadata, sitemap, and dependency-audit suite runs again.

## Remote verification and rollback

Before pushing the workflow, GitHub readback must confirm the encrypted secret and account variable exist without reading their values. The first push to `main` triggers a real workflow run. Completion requires a successful GitHub Actions result, a new Cloudflare deployment readback, and fresh checks of the apex site, Contact page, canonical metadata, sitemap, robots policy, redirects, and representative guide routes.

If the first deployment fails, GitHub logs are inspected with secrets redacted and the failure is fixed through the same test-first loop. If a deployment succeeds but the live result regresses, roll back to the previously verified Cloudflare Worker version and disable or correct the workflow before retrying.

## Non-goals

- No changes to the shared Cloudflare GitHub App installation.
- No changes to other GitHub repositories.
- No automated preview-branch deployments.
- No paid services, new runtime dependencies, advertising, analytics, or application behavior changes.
