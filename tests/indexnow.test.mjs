import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

import {
  INDEXNOW_ENDPOINT,
  MAX_URLS_PER_REQUEST,
  IndexNowSubmissionError,
  assertProductionInvocation,
  buildIndexNowPayloads,
  collectSitemapUrls,
  submitIndexNowPayloads,
  waitForPublishedKey,
} from '../scripts/indexnow.ts';

const root = path.resolve(import.meta.dirname, '..');
const canonicalOrigin = 'https://howtofishgamehelp.com';
const key = 'a'.repeat(64);
const keyLocation = `${canonicalOrigin}/${key}.txt`;

function response(body, status = 200, contentType = 'application/xml') {
  return new Response(body, { status, headers: { 'Content-Type': contentType } });
}

test('collectSitemapUrls recursively reads sitemap indexes and keeps only canonical indexable URLs', async () => {
  const documents = new Map([
    [`${canonicalOrigin}/sitemap.xml`, `
      <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <sitemap><loc>${canonicalOrigin}/sitemap-pages.xml</loc></sitemap>
        <sitemap><loc>${canonicalOrigin}/sitemap-guides.xml</loc></sitemap>
        <sitemap><loc>https://attacker.example/sitemap.xml</loc></sitemap>
      </sitemapindex>
    `],
    [`${canonicalOrigin}/sitemap-pages.xml`, `
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url><loc>${canonicalOrigin}/</loc></url>
        <url><loc>${canonicalOrigin}/about/</loc></url>
        <url><loc>${canonicalOrigin}/search/</loc></url>
        <url><loc>${canonicalOrigin}/404/</loc></url>
        <url><loc>https://www.howtofishgamehelp.com/about/</loc></url>
        <url><loc>${canonicalOrigin}/about/?preview=1</loc></url>
      </urlset>
    `],
    [`${canonicalOrigin}/sitemap-guides.xml`, `
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url><loc>${canonicalOrigin}/about/</loc></url>
        <url><loc>${canonicalOrigin}/guides/fish-and-chips/</loc></url>
        <url><loc>${canonicalOrigin}/guides/fish&amp;chips/</loc></url>
      </urlset>
    `],
  ]);
  const fetched = [];
  const fetchImpl = async (url) => {
    fetched.push(String(url));
    const body = documents.get(String(url));
    assert.notEqual(body, undefined, `unexpected fetch: ${url}`);
    return response(body);
  };

  const result = await collectSitemapUrls({
    sitemapUrl: `${canonicalOrigin}/sitemap.xml`,
    canonicalOrigin,
    fetchImpl,
  });

  assert.deepEqual(result.sitemapUrls, [
    `${canonicalOrigin}/sitemap.xml`,
    `${canonicalOrigin}/sitemap-pages.xml`,
    `${canonicalOrigin}/sitemap-guides.xml`,
  ]);
  assert.deepEqual(result.urls, [
    `${canonicalOrigin}/`,
    `${canonicalOrigin}/about/`,
    `${canonicalOrigin}/guides/fish-and-chips/`,
    `${canonicalOrigin}/guides/fish&chips/`,
  ]);
  assert.equal(fetched.includes('https://attacker.example/sitemap.xml'), false);
});

test('collectSitemapUrls rejects a failed same-host sitemap fetch', async () => {
  await assert.rejects(
    collectSitemapUrls({
      sitemapUrl: `${canonicalOrigin}/sitemap.xml`,
      canonicalOrigin,
      fetchImpl: async () => response('missing', 404, 'text/plain'),
    }),
    /sitemap fetch failed.*404/i,
  );
});

test('buildIndexNowPayloads filters duplicates and splits at 10,000 URLs', () => {
  const urls = Array.from({ length: MAX_URLS_PER_REQUEST + 1 }, (_, index) => `${canonicalOrigin}/guide-${index}/`);
  urls.push(urls[0], 'https://www.howtofishgamehelp.com/wrong-host/', `${canonicalOrigin}/search/`);

  const payloads = buildIndexNowPayloads({ urls, canonicalOrigin, key, keyLocation });

  assert.equal(payloads.length, 2);
  assert.equal(payloads[0].urlList.length, MAX_URLS_PER_REQUEST);
  assert.equal(payloads[1].urlList.length, 1);
  for (const payload of payloads) {
    assert.equal(payload.host, 'howtofishgamehelp.com');
    assert.equal(payload.key, key);
    assert.equal(payload.keyLocation, keyLocation);
  }
});

test('submitIndexNowPayloads records an HTTP 200 response without retrying', async () => {
  const payloads = buildIndexNowPayloads({ urls: [`${canonicalOrigin}/`], canonicalOrigin, key, keyLocation });
  const calls = [];
  const results = await submitIndexNowPayloads({
    payloads,
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return response('received', 200, 'text/plain');
    },
    verifyKey: async () => assert.fail('200 must not trigger key revalidation'),
    sleep: async () => assert.fail('200 must not sleep'),
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, INDEXNOW_ENDPOINT);
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.headers['Content-Type'], 'application/json; charset=utf-8');
  assert.deepEqual(JSON.parse(calls[0].init.body), payloads[0]);
  assert.deepEqual(results, [{ batch: 1, attempts: 1, status: 200, urlCount: 1, responseBody: 'received' }]);
});

test('submitIndexNowPayloads revalidates the published key and retries HTTP 202 once', async () => {
  const payloads = buildIndexNowPayloads({ urls: [`${canonicalOrigin}/`], canonicalOrigin, key, keyLocation });
  const statuses = [202, 200];
  let verified = 0;
  let slept = 0;

  const results = await submitIndexNowPayloads({
    payloads,
    fetchImpl: async () => response(statuses.shift() === 202 ? 'pending' : 'received', statuses.length === 1 ? 202 : 200, 'text/plain'),
    verifyKey: async () => { verified += 1; },
    sleep: async () => { slept += 1; },
  });

  assert.equal(verified, 1);
  assert.equal(slept, 1);
  assert.deepEqual(results, [{ batch: 1, attempts: 2, status: 200, urlCount: 1, responseBody: 'received' }]);
});

test('submitIndexNowPayloads stops after a second HTTP 202', async () => {
  const payloads = buildIndexNowPayloads({ urls: [`${canonicalOrigin}/`], canonicalOrigin, key, keyLocation });
  let calls = 0;

  await assert.rejects(
    submitIndexNowPayloads({
      payloads,
      fetchImpl: async () => { calls += 1; return response('pending', 202, 'text/plain'); },
      verifyKey: async () => {},
      sleep: async () => {},
    }),
    (error) => error instanceof IndexNowSubmissionError && error.status === 202 && error.attempts === 2,
  );
  assert.equal(calls, 2);
});

for (const status of [403, 422, 429]) {
  test(`submitIndexNowPayloads fails closed on HTTP ${status} without retrying`, async () => {
    const payloads = buildIndexNowPayloads({ urls: [`${canonicalOrigin}/`], canonicalOrigin, key, keyLocation });
    let calls = 0;

    await assert.rejects(
      submitIndexNowPayloads({
        payloads,
        fetchImpl: async () => { calls += 1; return response(`status ${status}`, status, 'text/plain'); },
        verifyKey: async () => assert.fail(`${status} must not trigger key revalidation`),
        sleep: async () => assert.fail(`${status} must not sleep`),
      }),
      (error) => error instanceof IndexNowSubmissionError && error.status === status && error.responseBody === `status ${status}`,
    );
    assert.equal(calls, 1);
  });
}

test('submitIndexNowPayloads reports a network failure without inventing an HTTP status', async () => {
  const payloads = buildIndexNowPayloads({ urls: [`${canonicalOrigin}/`], canonicalOrigin, key, keyLocation });

  await assert.rejects(
    submitIndexNowPayloads({
      payloads,
      fetchImpl: async () => { throw new Error('socket closed'); },
      verifyKey: async () => {},
      sleep: async () => {},
    }),
    (error) => error instanceof IndexNowSubmissionError && error.status === undefined && /without an HTTP response.*socket closed/i.test(error.message),
  );
});

test('waitForPublishedKey uses a finite deployment-visibility retry and confirms exact content', async () => {
  const responses = [response('not found', 404, 'text/plain'), response(`${key}\n`, 200, 'text/plain')];
  let sleeps = 0;

  const result = await waitForPublishedKey({
    key,
    keyLocation,
    attempts: 3,
    delayMs: 1,
    fetchImpl: async () => responses.shift(),
    sleep: async () => { sleeps += 1; },
  });

  assert.deepEqual(result, { attempts: 2, status: 200 });
  assert.equal(sleeps, 1);
});

test('waitForPublishedKey fails after its fixed attempt limit when content does not match', async () => {
  let calls = 0;

  await assert.rejects(
    waitForPublishedKey({
      key,
      keyLocation,
      attempts: 2,
      delayMs: 1,
      fetchImpl: async () => { calls += 1; return response('wrong-key', 200, 'text/plain'); },
      sleep: async () => {},
    }),
    /did not become readable.*2 attempts/i,
  );
  assert.equal(calls, 2);
});

test('the repository publishes one valid self-matching IndexNow key file', async () => {
  const publicDirectory = path.join(root, 'public');
  const entries = await readdir(publicDirectory, { withFileTypes: true });
  const candidates = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.txt')) continue;
    const stem = entry.name.slice(0, -4);
    if (!/^[A-Za-z0-9-]{8,128}$/.test(stem)) continue;
    const content = (await readFile(path.join(publicDirectory, entry.name), 'utf8')).trim();
    if (content === stem) candidates.push({ stem, content });
  }

  assert.equal(candidates.length, 1);
});

test('IndexNow submission is explicit and runs only after production deployment', async () => {
  const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  const workflow = await readFile(path.join(root, '.github/workflows/deploy-production.yml'), 'utf8');

  assert.equal(pkg.scripts['indexnow:submit'], 'node --experimental-strip-types scripts/indexnow.ts --production');
  assert.ok(pkg.scripts.deploy.indexOf('wrangler deploy') < pkg.scripts.deploy.indexOf('npm run indexnow:submit'));
  assert.doesNotMatch(pkg.scripts['deploy:preview'], /indexnow/i);
  assert.doesNotMatch(pkg.scripts['deploy:temporary'], /indexnow/i);
  assert.ok(workflow.indexOf('Promote production Worker version') < workflow.indexOf('Submit production URLs to IndexNow'));
  assert.match(workflow, /name: Submit production URLs to IndexNow\r?\n\s+run: npm run indexnow:submit/);
  assert.doesNotThrow(() => assertProductionInvocation(['--production']));
  assert.throws(() => assertProductionInvocation([]), /production-only/i);
  assert.throws(() => assertProductionInvocation(['--production', '--preview']), /production-only/i);
});
