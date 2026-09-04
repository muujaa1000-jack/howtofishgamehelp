import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

import {
  INDEXNOW_ENDPOINT,
  MAX_URLS_PER_REQUEST,
  IndexNowSubmissionError,
  buildIndexNowPayloads,
  collectSitemapUrls,
  submitIndexNowPayloads,
  waitForPublishedKey,
} from '../scripts/indexnow.ts';
import * as indexNow from '../scripts/indexnow.ts';

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

test('submitIndexNowPayloads accepts HTTP 202 without retrying', async () => {
  const payloads = buildIndexNowPayloads({ urls: [`${canonicalOrigin}/`], canonicalOrigin, key, keyLocation });
  let verified = 0;
  let slept = 0;
  let calls = 0;

  const results = await submitIndexNowPayloads({
    payloads,
    fetchImpl: async () => { calls += 1; return response('pending', 202, 'text/plain'); },
    verifyKey: async () => { verified += 1; },
    sleep: async () => { slept += 1; },
  });

  assert.equal(verified, 0);
  assert.equal(slept, 0);
  assert.equal(calls, 1);
  assert.deepEqual(results, [{ batch: 1, attempts: 1, status: 202, urlCount: 1, responseBody: 'pending' }]);
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

test('deployment is decoupled while IndexNow defaults to dry-run and production requires the exact explicit flag', async () => {
  const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  const workflow = await readFile(path.join(root, '.github/workflows/deploy-production.yml'), 'utf8');
  const parseIndexNowMode = indexNow.parseIndexNowMode;

  assert.equal(typeof parseIndexNowMode, 'function');
  assert.equal(pkg.scripts['indexnow:submit'], 'node --experimental-strip-types scripts/indexnow.ts');
  assert.match(pkg.scripts.deploy, /wrangler deploy/);
  assert.doesNotMatch(pkg.scripts.deploy, /indexnow/i);
  assert.doesNotMatch(pkg.scripts['deploy:preview'], /indexnow/i);
  assert.doesNotMatch(pkg.scripts['deploy:temporary'], /indexnow/i);
  assert.doesNotMatch(workflow, /indexnow/i);
  assert.equal(parseIndexNowMode([]), 'dry-run');
  assert.equal(parseIndexNowMode(['--production']), 'production');
  assert.throws(() => parseIndexNowMode(['--preview']), /usage/i);
  assert.throws(() => parseIndexNowMode(['--production', '--preview']), /usage/i);
});

test('runIndexNow returns the unified dry-run receipt without POST and de-duplicates URLs', async () => {
  const runIndexNow = indexNow.runIndexNow;
  assert.equal(typeof runIndexNow, 'function');
  const calls = [];
  const fetchImpl = async (input, init) => {
    const url = String(input);
    const method = String(init?.method ?? 'GET').toUpperCase();
    calls.push({ url, method });
    if (url === keyLocation) return response(`${key}\n`, 200, 'text/plain');
    if (url === `${canonicalOrigin}/sitemap.xml`) {
      return response(`<urlset><url><loc>${canonicalOrigin}/</loc></url><url><loc>${canonicalOrigin}/</loc></url></urlset>`);
    }
    throw new Error(`Unexpected request: ${method} ${url}`);
  };
  const timestamps = [new Date('2026-09-04T13:00:00.000Z'), new Date('2026-09-04T13:00:01.000Z')];

  const receipt = await runIndexNow({ key, fetchImpl, now: () => timestamps.shift() });

  assert.deepEqual(
    Object.keys(receipt).sort(),
    ['completed_at', 'content_hash', 'http_status', 'key_location', 'limitations', 'mode', 'response_body', 'site', 'sitemap_url', 'started_at', 'state', 'url_count'],
  );
  assert.equal(receipt.state, 'DRY_RUN_COMPLETE');
  assert.equal(receipt.site, 'howtofishgamehelp.com');
  assert.equal(receipt.started_at, '2026-09-04T13:00:00.000Z');
  assert.equal(receipt.completed_at, '2026-09-04T13:00:01.000Z');
  assert.equal(receipt.sitemap_url, `${canonicalOrigin}/sitemap.xml`);
  assert.equal(receipt.url_count, 1);
  assert.match(receipt.content_hash, /^[a-f0-9]{64}$/);
  assert.equal(receipt.mode, 'dry-run');
  assert.equal(receipt.http_status, null);
  assert.equal(receipt.response_body, '');
  assert.equal(receipt.key_location, keyLocation);
  assert.ok(receipt.limitations.includes('no_indexing_guarantee'));
  assert.equal(calls.some((call) => call.method === 'POST'), false);
});

for (const status of [200, 202]) {
  test(`runIndexNow records one HTTP ${status} POST as URL_SUBMISSION_RECEIVED`, async () => {
    let posts = 0;
    const fetchImpl = async (input, init) => {
      const url = String(input);
      if (String(init?.method ?? 'GET').toUpperCase() === 'POST') {
        posts += 1;
        return response(status === 200 ? 'received' : 'pending', status, 'text/plain');
      }
      if (url === keyLocation) return response(key, 200, 'text/plain');
      return response(`<urlset><url><loc>${canonicalOrigin}/</loc></url></urlset>`);
    };

    const receipt = await indexNow.runIndexNow({ mode: 'production', key, fetchImpl });

    assert.equal(receipt.state, 'URL_SUBMISSION_RECEIVED');
    assert.equal(receipt.http_status, status);
    assert.equal(receipt.response_body, status === 200 ? 'received' : 'pending');
    assert.equal(posts, 1);
  });
}

test('runIndexNow keeps HTTP 200 as received when bounded response reading is canceled at its limit', async () => {
  let posts = 0;
  const fetchImpl = async (input, init) => {
    const url = String(input);
    if (String(init?.method ?? 'GET').toUpperCase() === 'POST') {
      posts += 1;
      return response('x'.repeat(9_000), 200, 'text/plain');
    }
    if (url === keyLocation) return response(key, 200, 'text/plain');
    return response(`<urlset><url><loc>${canonicalOrigin}/</loc></url></urlset>`);
  };

  const receipt = await indexNow.runIndexNow({ mode: 'production', key, fetchImpl });

  assert.equal(receipt.state, 'URL_SUBMISSION_RECEIVED');
  assert.equal(receipt.http_status, 200);
  assert.equal(receipt.response_body, '');
  assert.ok(receipt.limitations.includes('response_body_unavailable'));
  assert.equal(posts, 1);
});

for (const scenario of [
  { label: 'HTTP', result: async () => response('denied', 403, 'text/plain'), status: 403, body: 'denied' },
  { label: 'network', result: async () => { throw new Error('socket closed'); }, status: null, body: '' },
]) {
  test(`runIndexNow records ${scenario.label} submission failure without retry`, async () => {
    let posts = 0;
    const fetchImpl = async (input, init) => {
      const url = String(input);
      if (String(init?.method ?? 'GET').toUpperCase() === 'POST') {
        posts += 1;
        return scenario.result();
      }
      if (url === keyLocation) return response(key, 200, 'text/plain');
      return response(`<urlset><url><loc>${canonicalOrigin}/</loc></url></urlset>`);
    };

    const receipt = await indexNow.runIndexNow({ mode: 'production', key, fetchImpl });

    assert.equal(receipt.state, 'URL_SUBMISSION_FAILED');
    assert.equal(receipt.http_status, scenario.status);
    assert.equal(receipt.response_body, scenario.body);
    assert.ok(receipt.limitations.includes('post_attempted'));
    assert.ok(receipt.limitations.includes('no_automatic_retry'));
    assert.equal(receipt.limitations.includes('result_ambiguous'), scenario.label === 'network');
    assert.equal(posts, 1);
  });
}

test('readResponseBodyBounded cancels the stream at its byte limit', async () => {
  const readResponseBodyBounded = indexNow.readResponseBodyBounded;
  assert.equal(typeof readResponseBodyBounded, 'function');
  let canceled = false;
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('12345'));
      controller.enqueue(new TextEncoder().encode('67890'));
    },
    cancel() {
      canceled = true;
    },
  });

  await assert.rejects(readResponseBodyBounded(new Response(stream), 8), /response_body_limit/);
  assert.equal(canceled, true);
});
