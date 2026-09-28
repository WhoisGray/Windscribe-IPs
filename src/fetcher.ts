import type { WindscribeServerList } from './types.js';
import { combineServerLists } from './parser.js';

export const DEFAULT_SERVERLIST_TEMPLATES = [
  'https://assets.windscribe.com/serverlist/mob-v2/0/{ts}',
  'https://assets.windscribe.com/serverlist/mob-v2/1/{ts}',
];

export const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36';

export interface FetchServerListOptions {
  urls?: string[];
  userAgent?: string;
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
}

/**
 * Fetch a single Windscribe server list JSON from a URL with retries and timeout.
 */
export async function fetchServerListFromUrl(
  url: string,
  options: { userAgent?: string; timeoutMs?: number; retries?: number; retryDelayMs?: number } = {}
): Promise<WindscribeServerList> {
  const {
    userAgent = DEFAULT_USER_AGENT,
    timeoutMs = 30000,
    retries = 2,
    retryDelayMs = 1500,
  } = options;

  let lastError: Error | unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': userAgent,
          Accept: 'application/json, text/plain, */*',
        },
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText} from ${url}`);
      }

      const json = (await response.json()) as WindscribeServerList;
      if (!json || typeof json !== 'object' || !Array.isArray(json.data)) {
        throw new Error(`Invalid response structure from ${url} (missing data array)`);
      }

      return json;
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        const delay = retryDelayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(
    `Failed to fetch server list from ${url} after ${retries + 1} attempts: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`
  );
}

/**
 * Fetch all Windscribe server lists and combine them.
 */
export async function fetchAllServerLists(
  options: FetchServerListOptions = {}
): Promise<WindscribeServerList> {
  const ts = Math.floor(Date.now() / 1000).toString();
  const urlTemplates = options.urls ?? DEFAULT_SERVERLIST_TEMPLATES;
  const urls = urlTemplates.map((template) => template.replace('{ts}', ts));

  const results: WindscribeServerList[] = [];

  for (const url of urls) {
    try {
      console.log(`[Fetcher] Requesting ${url} ...`);
      const data = await fetchServerListFromUrl(url, options);
      results.push(data);
      console.log(`[Fetcher] Successfully received ${data.data?.length ?? 0} locations.`);
    } catch (error) {
      console.error(`[Fetcher] Warning: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (results.length === 0) {
    throw new Error('Unable to fetch server list data from any Windscribe endpoint.');
  }

  const combined = combineServerLists(results[0]!, ...results.slice(1));
  console.log(`[Fetcher] Combined ${combined.data.length} total unique locations.`);
  return combined;
}
