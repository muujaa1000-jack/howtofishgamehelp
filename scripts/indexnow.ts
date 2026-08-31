import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
export const MAX_URLS_PER_REQUEST = 10_000;

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
type Sleep = (milliseconds: number) => Promise<void>;

export interface IndexNowPayload {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
}

export interface SitemapCollection {
  sitemapUrls: string[];
  urls: string[];
}

export interface BatchResult {
  batch: number;
  attempts: number;
  status: number;
  urlCount: number;
  responseBody: string;
}

interface SubmissionErrorOptions {
  status?: number;
  responseBody?: string;
  batch?: number;
  attempts?: number;
  cause?: unknown;
}

export class IndexNowSubmissionError extends Error {
  readonly status?: number;
  readonly responseBody?: string;
  readonly batch?: number;
  readonly attempts?: number;

  constructor(message: string, options: SubmissionErrorOptions = {}) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause });
    this.name = 'IndexNowSubmissionError';
    this.status = options.status;
    this.responseBody = options.responseBody;
    this.batch = options.batch;
    this.attempts = options.attempts;
  }
}

const excludedPaths = new Set([
  '/404',
  '/404/',
  '/robots.txt',
  '/rss.xml',
  '/search',
  '/search/',
  '/sitemap.xml',
]);

function decodeXmlEntities(value: string): string {
  const namedEntities: Record<string, string> = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    quot: '"',
  };

  return value.replace(/&(#x[0-9a-f]+|#[0-9]+|amp|apos|gt|lt|quot);/gi, (match, entity: string) => {
    if (entity.startsWith('#x') || entity.startsWith('#X')) {
      const codePoint = Number.parseInt(entity.slice(2), 16);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
    }
    if (entity.startsWith('#')) {
      const codePoint = Number.parseInt(entity.slice(1), 10);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
    }
    return namedEntities[entity.toLowerCase()] ?? match;
  });
}

function extractLocations(xml: string): string[] {
  return [...xml.matchAll(/<loc(?:\s[^>]*)?>([\s\S]*?)<\/loc>/gi)]
    .map((match) => decodeXmlEntities(match[1] ?? '').trim())
    .filter(Boolean);
}

function parseSitemap(xml: string): { kind: 'index' | 'urlset'; locations: string[] } {
  if (/<sitemapindex(?:\s|>)/i.test(xml)) return { kind: 'index', locations: extractLocations(xml) };
  if (/<urlset(?:\s|>)/i.test(xml)) return { kind: 'urlset', locations: extractLocations(xml) };
  throw new Error('Sitemap response is neither a sitemap index nor a URL set.');
}

function normalizeSameOriginUrl(value: string, canonicalOrigin: string): URL | undefined {
  let url: URL;
  let canonical: URL;
  try {
    url = new URL(value);
    canonical = new URL(canonicalOrigin);
  } catch {
    return undefined;
  }

  if (url.origin !== canonical.origin) return undefined;
  if (url.protocol !== 'https:' || url.username || url.password || url.hash || url.search) return undefined;
  return url;
}

function normalizeIndexableUrl(value: string, canonicalOrigin: string): string | undefined {
  const url = normalizeSameOriginUrl(value, canonicalOrigin);
  if (!url) return undefined;
  if (excludedPaths.has(url.pathname)) return undefined;
  if (/^\/sitemap(?:-[^/]*)?\.xml$/i.test(url.pathname)) return undefined;
  if (/\.(?:avif|css|gif|ico|jpe?g|js|json|map|png|svg|txt|webmanifest|webp|xml)$/i.test(url.pathname)) return undefined;
  return url.href;
}

export async function collectSitemapUrls({
  sitemapUrl,
  canonicalOrigin,
  fetchImpl = fetch,
  maxSitemaps = 100,
}: {
  sitemapUrl: string;
  canonicalOrigin: string;
  fetchImpl?: FetchLike;
  maxSitemaps?: number;
}): Promise<SitemapCollection> {
  const root = normalizeSameOriginUrl(sitemapUrl, canonicalOrigin);
  if (!root) throw new Error(`Sitemap URL must use the canonical origin: ${canonicalOrigin}`);

  const queue = [root.href];
  const seenSitemaps = new Set<string>();
  const seenUrls = new Set<string>();
  const sitemapUrls: string[] = [];
  const urls: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || seenSitemaps.has(current)) continue;
    if (seenSitemaps.size >= maxSitemaps) throw new Error(`Sitemap recursion exceeded the ${maxSitemaps} sitemap limit.`);

    seenSitemaps.add(current);
    sitemapUrls.push(current);
    const response = await fetchImpl(current, {
      headers: { Accept: 'application/xml,text/xml;q=0.9,*/*;q=0.1', 'Cache-Control': 'no-cache' },
      redirect: 'error',
    });
    if (!response.ok) throw new Error(`Sitemap fetch failed for ${current}: HTTP ${response.status}.`);

    const document = parseSitemap(await response.text());
    if (document.kind === 'index') {
      for (const location of document.locations) {
        const nested = normalizeSameOriginUrl(location, canonicalOrigin);
        if (nested && !seenSitemaps.has(nested.href)) queue.push(nested.href);
      }
      continue;
    }

    for (const location of document.locations) {
      const normalized = normalizeIndexableUrl(location, canonicalOrigin);
      if (!normalized || seenUrls.has(normalized)) continue;
      seenUrls.add(normalized);
      urls.push(normalized);
    }
  }

  return { sitemapUrls, urls };
}

function validateKey(key: string): void {
  if (!/^[A-Za-z0-9-]{8,128}$/.test(key)) {
    throw new Error('IndexNow key must contain 8-128 letters, numbers, or dashes.');
  }
}

export function buildIndexNowPayloads({
  urls,
  canonicalOrigin,
  key,
  keyLocation,
  batchSize = MAX_URLS_PER_REQUEST,
}: {
  urls: string[];
  canonicalOrigin: string;
  key: string;
  keyLocation: string;
  batchSize?: number;
}): IndexNowPayload[] {
  validateKey(key);
  if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > MAX_URLS_PER_REQUEST) {
    throw new Error(`IndexNow batch size must be an integer from 1 to ${MAX_URLS_PER_REQUEST}.`);
  }

  const canonical = new URL(canonicalOrigin);
  const expectedKeyLocation = new URL(`/${key}.txt`, canonical).href;
  if (keyLocation !== expectedKeyLocation) {
    throw new Error(`IndexNow keyLocation must be the canonical root key file: ${expectedKeyLocation}`);
  }

  const uniqueUrls: string[] = [];
  const seen = new Set<string>();
  for (const value of urls) {
    const normalized = normalizeIndexableUrl(value, canonicalOrigin);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    uniqueUrls.push(normalized);
  }
  if (uniqueUrls.length === 0) throw new Error('No eligible canonical URLs were found for IndexNow submission.');

  const payloads: IndexNowPayload[] = [];
  for (let offset = 0; offset < uniqueUrls.length; offset += batchSize) {
    payloads.push({
      host: canonical.hostname,
      key,
      keyLocation,
      urlList: uniqueUrls.slice(offset, offset + batchSize),
    });
  }
  return payloads;
}

export async function waitForPublishedKey({
  key,
  keyLocation,
  attempts = 6,
  delayMs = 2_000,
  fetchImpl = fetch,
  sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
}: {
  key: string;
  keyLocation: string;
  attempts?: number;
  delayMs?: number;
  fetchImpl?: FetchLike;
  sleep?: Sleep;
}): Promise<{ attempts: number; status: number }> {
  validateKey(key);
  if (!Number.isInteger(attempts) || attempts < 1) throw new Error('Published-key attempts must be a positive integer.');

  let lastStatus = 0;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetchImpl(keyLocation, {
        headers: { Accept: 'text/plain', 'Cache-Control': 'no-cache' },
        redirect: 'error',
      });
      lastStatus = response.status;
      if (response.status === 200 && (await response.text()).trim() === key) {
        return { attempts: attempt, status: response.status };
      }
    } catch {
      lastStatus = 0;
    }

    if (attempt < attempts) await sleep(delayMs);
  }

  throw new Error(`IndexNow key did not become readable with matching content after ${attempts} attempts (last HTTP status: ${lastStatus || 'none'}).`);
}

export async function submitIndexNowPayloads({
  payloads,
  endpoint = INDEXNOW_ENDPOINT,
  fetchImpl = fetch,
  verifyKey,
  sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
  retryDelayMs = 2_000,
}: {
  payloads: IndexNowPayload[];
  endpoint?: string;
  fetchImpl?: FetchLike;
  verifyKey: () => Promise<unknown>;
  sleep?: Sleep;
  retryDelayMs?: number;
}): Promise<BatchResult[]> {
  const results: BatchResult[] = [];

  for (const [index, payload] of payloads.entries()) {
    const batch = index + 1;
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      let response: Response;
      try {
        response = await fetchImpl(endpoint, {
          method: 'POST',
          headers: { Accept: 'application/json,text/plain,*/*', 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(payload),
          redirect: 'error',
        });
      } catch (error) {
        throw new IndexNowSubmissionError(
          `IndexNow batch ${batch} failed without an HTTP response: ${error instanceof Error ? error.message : String(error)}`,
          { batch, attempts: attempt, cause: error },
        );
      }

      const responseBody = await response.text();
      if (response.status === 200) {
        results.push({ batch, attempts: attempt, status: response.status, urlCount: payload.urlList.length, responseBody });
        break;
      }

      if (response.status === 202 && attempt === 1) {
        await verifyKey();
        await sleep(retryDelayMs);
        continue;
      }

      throw new IndexNowSubmissionError(
        `IndexNow batch ${batch} returned HTTP ${response.status} after ${attempt} attempt${attempt === 1 ? '' : 's'}.`,
        { status: response.status, responseBody, batch, attempts: attempt },
      );
    }
  }

  return results;
}

export function assertProductionInvocation(args: string[]): void {
  if (args.length !== 1 || args[0] !== '--production') {
    throw new Error('IndexNow submission is production-only and requires the exact --production flag.');
  }
}

async function loadRepositoryKey(publicDirectory: string): Promise<string> {
  const candidates: string[] = [];
  for (const entry of await readdir(publicDirectory, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.txt')) continue;
    const stem = entry.name.slice(0, -4);
    if (!/^[A-Za-z0-9-]{8,128}$/.test(stem)) continue;
    const content = (await readFile(path.join(publicDirectory, entry.name), 'utf8')).trim();
    if (content === stem) candidates.push(stem);
  }
  const candidate = candidates[0];
  if (candidates.length !== 1 || candidate === undefined) {
    throw new Error(`Expected exactly one self-matching IndexNow key file in public/, found ${candidates.length}.`);
  }
  return candidate;
}

async function main(args: string[]): Promise<void> {
  assertProductionInvocation(args);

  const startedAtUtc = new Date().toISOString();
  const canonicalOrigin = 'https://howtofishgamehelp.com';
  const sitemapUrl = `${canonicalOrigin}/sitemap.xml`;
  const key = await loadRepositoryKey(path.resolve('public'));
  const keyLocation = `${canonicalOrigin}/${key}.txt`;
  const keyReadback = await waitForPublishedKey({ key, keyLocation });
  const collection = await collectSitemapUrls({ sitemapUrl, canonicalOrigin });
  const payloads = buildIndexNowPayloads({ urls: collection.urls, canonicalOrigin, key, keyLocation });
  const batchResults = await submitIndexNowPayloads({
    payloads,
    verifyKey: () => waitForPublishedKey({ key, keyLocation, attempts: 3 }),
  });

  const report = {
    ok: true,
    state: 'URL_SUBMISSION_RECEIVED',
    note: 'HTTP 200 means IndexNow received the URLs; it does not prove indexing.',
    startedAtUtc,
    completedAtUtc: new Date().toISOString(),
    endpoint: INDEXNOW_ENDPOINT,
    host: new URL(canonicalOrigin).hostname,
    sitemapUrl,
    sitemapCount: collection.sitemapUrls.length,
    urlCount: collection.urls.length,
    batchCount: payloads.length,
    keyLocation,
    keyReadback,
    sampleUrls: collection.urls.slice(0, 5),
    batches: batchResults,
  };
  console.log(JSON.stringify(report, null, 2));
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';
if (invokedPath === import.meta.url) {
  main(process.argv.slice(2)).catch((error: unknown) => {
    const report = {
      ok: false,
      state: 'URL_SUBMISSION_FAILED',
      completedAtUtc: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      status: error instanceof IndexNowSubmissionError ? error.status ?? null : null,
      batch: error instanceof IndexNowSubmissionError ? error.batch ?? null : null,
      attempts: error instanceof IndexNowSubmissionError ? error.attempts ?? null : null,
      responseBody: error instanceof IndexNowSubmissionError ? error.responseBody ?? '' : '',
    };
    console.error(JSON.stringify(report, null, 2));
    process.exitCode = 1;
  });
}
