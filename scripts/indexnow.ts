import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
export const MAX_URLS_PER_REQUEST = 10_000;
export const MAX_RESPONSE_BODY_BYTES = 8_192;
const MAX_KEY_BODY_BYTES = 1_024;
const MAX_SITEMAP_BODY_BYTES = 2_000_000;

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
  responseBodyUnavailable?: boolean;
}

interface SubmissionErrorOptions {
  status?: number;
  responseBody?: string;
  batch?: number;
  attempts?: number;
  postAttempted?: boolean;
  resultAmbiguous?: boolean;
  responseBodyUnavailable?: boolean;
  cause?: unknown;
}

export class IndexNowSubmissionError extends Error {
  readonly status?: number;
  readonly responseBody?: string;
  readonly batch?: number;
  readonly attempts?: number;
  readonly postAttempted: boolean;
  readonly resultAmbiguous: boolean;
  readonly responseBodyUnavailable: boolean;

  constructor(message: string, options: SubmissionErrorOptions = {}) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause });
    this.name = 'IndexNowSubmissionError';
    this.status = options.status;
    this.responseBody = options.responseBody;
    this.batch = options.batch;
    this.attempts = options.attempts;
    this.postAttempted = options.postAttempted ?? false;
    this.resultAmbiguous = options.resultAmbiguous ?? false;
    this.responseBodyUnavailable = options.responseBodyUnavailable ?? false;
  }
}

export async function readResponseBodyBounded(response: Response, maxBytes = MAX_RESPONSE_BODY_BYTES): Promise<string> {
  if (!Number.isInteger(maxBytes) || maxBytes < 1) throw new Error('response_body_limit_invalid');
  if (!response.body) return '';
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let text = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total >= maxBytes) {
      try {
        await reader.cancel('response_body_limit_exceeded');
      } catch {
        // The body is already unusable; retain the bounded-read error even if cancellation also fails.
      }
      throw new Error('response_body_limit_exceeded');
    }
    text += decoder.decode(value, { stream: true });
  }
  return text + decoder.decode();
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

    const document = parseSitemap(await readResponseBodyBounded(response, MAX_SITEMAP_BODY_BYTES));
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
      if (response.status === 200 && (await readResponseBodyBounded(response, MAX_KEY_BODY_BYTES)).trim() === key) {
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
  void verifyKey;
  void sleep;
  void retryDelayMs;
  const results: BatchResult[] = [];

  for (const [index, payload] of payloads.entries()) {
    const batch = index + 1;
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
        { batch, attempts: 1, postAttempted: true, resultAmbiguous: true, cause: error },
      );
    }

    let responseBody = '';
    let responseBodyUnavailable = false;
    try {
      responseBody = await readResponseBodyBounded(response, MAX_RESPONSE_BODY_BYTES);
    } catch {
      responseBodyUnavailable = true;
    }
    if (response.status === 200 || response.status === 202) {
      results.push({
        batch,
        attempts: 1,
        status: response.status,
        urlCount: payload.urlList.length,
        responseBody,
        ...(responseBodyUnavailable ? { responseBodyUnavailable: true } : {}),
      });
      continue;
    }
    throw new IndexNowSubmissionError(`IndexNow batch ${batch} returned HTTP ${response.status} after 1 attempt.`, {
      status: response.status,
      responseBody,
      batch,
      attempts: 1,
      postAttempted: true,
      responseBodyUnavailable,
    });
  }

  return results;
}

export function parseIndexNowMode(args: string[]): 'dry-run' | 'production' {
  if (args.length === 0) return 'dry-run';
  if (args.length === 1 && args[0] === '--production') return 'production';
  throw new Error('IndexNow usage: no arguments for dry-run, or the exact --production flag.');
}

export function assertProductionInvocation(args: string[]): void {
  if (parseIndexNowMode(args) !== 'production') throw new Error('IndexNow submission requires --production.');
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

function contentHash(urls: string[]): string {
  return createHash('sha256').update(urls.join('\n'), 'utf8').digest('hex');
}

function receiptBase({
  startedAt,
  completedAt,
  sitemapUrl,
  urls,
  mode,
  keyLocation,
}: {
  startedAt: string;
  completedAt: string;
  sitemapUrl: string;
  urls: string[];
  mode: 'dry-run' | 'production';
  keyLocation: string;
}) {
  return {
    site: 'howtofishgamehelp.com',
    started_at: startedAt,
    completed_at: completedAt,
    sitemap_url: sitemapUrl,
    url_count: urls.length,
    content_hash: contentHash(urls),
    mode,
    key_location: keyLocation,
    limitations: ['no_indexing_guarantee', 'unknown_change_type'],
  };
}

export async function writeReceiptExclusive({
  baseDirectory,
  receipt,
  receiptId,
}: {
  baseDirectory: string;
  receipt: { site: string; completed_at: string };
  receiptId?: string;
}): Promise<string> {
  const directory = path.join(baseDirectory, 'analysis', 'search-ops', 'indexnow-receipts', receipt.site);
  await mkdir(directory, { recursive: true });
  const runId = receipt.completed_at.replaceAll('-', '').replaceAll(':', '').replace('.', '');
  const uniqueId = receiptId ?? `${runId}-${randomUUID()}`;
  const receiptPath = path.join(directory, `${uniqueId}.json`);
  await writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
  return receiptPath;
}

export function receiptAfterLocalWriteFailure<T extends {
  state: string;
  mode: string;
  http_status: number | null;
  limitations: string[];
}>(receipt: T): T {
  const postAttempted = receipt.state === 'URL_SUBMISSION_RECEIVED'
    || receipt.http_status !== null
    || receipt.limitations.includes('post_attempted');
  return {
    ...receipt,
    limitations: [...new Set([
      ...receipt.limitations,
      'local_receipt_write_failed',
      ...(postAttempted ? ['post_attempted', 'no_automatic_retry'] : []),
    ])],
  };
}

export async function runIndexNow({
  mode = 'dry-run',
  key,
  fetchImpl = fetch,
  now = () => new Date(),
}: {
  mode?: 'dry-run' | 'production';
  key: string;
  fetchImpl?: FetchLike;
  now?: () => Date;
}) {
  if (mode !== 'dry-run' && mode !== 'production') throw new Error('invalid_indexnow_mode');
  const startedAt = now().toISOString();
  const canonicalOrigin = 'https://howtofishgamehelp.com';
  const sitemapUrl = `${canonicalOrigin}/sitemap.xml`;
  const keyLocation = `${canonicalOrigin}/${key}.txt`;
  let urls: string[] = [];
  try {
    await waitForPublishedKey({ key, keyLocation, attempts: 1, fetchImpl, sleep: async () => undefined });
    const collection = await collectSitemapUrls({ sitemapUrl, canonicalOrigin, fetchImpl });
    urls = collection.urls;
    const payloads = buildIndexNowPayloads({ urls, canonicalOrigin, key, keyLocation });
    if (mode === 'dry-run') {
      return {
        state: 'DRY_RUN_COMPLETE',
        ...receiptBase({ startedAt, completedAt: now().toISOString(), sitemapUrl, urls, mode, keyLocation }),
        http_status: null,
        response_body: '',
        limitations: ['no_indexing_guarantee', 'unknown_change_type', 'dry_run_no_indexnow_post'],
      };
    }
    const results = await submitIndexNowPayloads({ payloads, fetchImpl, verifyKey: async () => undefined });
    const last = results.at(-1);
    const responseBodyUnavailable = results.some((result) => result.responseBodyUnavailable);
    return {
      state: 'URL_SUBMISSION_RECEIVED',
      ...receiptBase({ startedAt, completedAt: now().toISOString(), sitemapUrl, urls, mode, keyLocation }),
      http_status: last?.status ?? null,
      response_body: last?.responseBody ?? '',
      limitations: [
        'no_indexing_guarantee',
        'unknown_change_type',
        'indexnow_receipt_only',
        ...(responseBodyUnavailable ? ['response_body_unavailable'] : []),
      ],
    };
  } catch (error) {
    const submission = error instanceof IndexNowSubmissionError ? error : undefined;
    return {
      state: 'URL_SUBMISSION_FAILED',
      ...receiptBase({ startedAt, completedAt: now().toISOString(), sitemapUrl, urls, mode, keyLocation }),
      http_status: submission?.status ?? null,
      response_body: submission?.responseBody ?? '',
      limitations: [
        'no_indexing_guarantee',
        'unknown_change_type',
        submission ? 'submission_failed_no_retry' : 'preflight_failed_no_post',
        ...(submission?.postAttempted ? ['post_attempted', 'no_automatic_retry'] : []),
        ...(submission?.resultAmbiguous ? ['result_ambiguous'] : []),
        ...(submission?.responseBodyUnavailable ? ['response_body_unavailable'] : []),
      ],
    };
  }
}

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function main(args: string[]): Promise<void> {
  const mode = parseIndexNowMode(args);
  const key = await loadRepositoryKey(path.join(repositoryRoot, 'public'));
  const receipt = await runIndexNow({ mode, key });
  let outputReceipt = receipt;
  let receiptPath: string | null = null;
  try {
    receiptPath = await writeReceiptExclusive({ baseDirectory: repositoryRoot, receipt });
  } catch {
    outputReceipt = receiptAfterLocalWriteFailure(receipt);
    process.exitCode = 1;
  }
  console.log(JSON.stringify({ ...outputReceipt, receipt_path: receiptPath }, null, 2));
  if (receipt.state === 'URL_SUBMISSION_FAILED') process.exitCode = 1;
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';
if (invokedPath === import.meta.url) {
  main(process.argv.slice(2)).catch((error: unknown) => {
    const completedAt = new Date().toISOString();
    const report = {
      state: 'URL_SUBMISSION_FAILED',
      site: 'howtofishgamehelp.com',
      started_at: completedAt,
      completed_at: completedAt,
      sitemap_url: 'https://howtofishgamehelp.com/sitemap.xml',
      url_count: 0,
      content_hash: createHash('sha256').update('', 'utf8').digest('hex'),
      mode: process.argv.slice(2).length === 1 && process.argv[2] === '--production' ? 'production' : 'dry-run',
      http_status: null,
      response_body: '',
      key_location: '',
      limitations: ['local_setup_failed', error instanceof Error ? error.name : 'Error'],
    };
    console.error(JSON.stringify(report, null, 2));
    process.exitCode = 1;
  });
}
