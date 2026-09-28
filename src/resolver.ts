import { promises as dnsPromises } from 'node:dns';
import { isValidIP, sortIPs } from './parser.js';

export interface ResolveOptions {
  concurrency?: number;
  timeoutMs?: number;
  onProgress?: (completed: number, total: number, lastHostname: string, foundCount: number) => void;
}

/**
 * Resolves both IPv4 and IPv6 addresses for a given hostname.
 * Gracefully handles NXDOMAIN / ENOTFOUND / timeouts.
 */
export async function getIpsForHostname(
  hostname: string,
  timeoutMs = 10000
): Promise<string[]> {
  const cleanHost = hostname.trim();
  if (!cleanHost) return [];

  // If already an IP address, return it directly
  if (isValidIP(cleanHost)) {
    return [cleanHost];
  }

  const ips = new Set<string>();

  try {
    const lookupPromise = dnsPromises.lookup(cleanHost, { all: true });
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`DNS resolution timed out for ${cleanHost}`)), timeoutMs)
    );

    const addresses = await Promise.race([lookupPromise, timeoutPromise]);

    for (const record of addresses) {
      if (record?.address && isValidIP(record.address)) {
        ips.add(record.address);
      }
    }
  } catch {
    // Silently handle expected resolution errors (hostname expired, private, etc.)
  }

  return Array.from(ips);
}

/**
 * Resolves IP addresses for a batch of hostnames with concurrency control.
 */
export async function batchResolveHostnames(
  hostnames: string[],
  options: ResolveOptions = {}
): Promise<string[]> {
  const { concurrency = 15, timeoutMs = 8000, onProgress } = options;
  const uniqueHostnames = Array.from(new Set(hostnames.map((h) => h.trim().toLowerCase()))).filter(
    Boolean
  );

  const discoveredIps = new Set<string>();
  let completed = 0;
  const total = uniqueHostnames.length;

  if (total === 0) return [];

  // Worker queue pool with concurrency control
  let cursor = 0;

  async function worker() {
    while (cursor < uniqueHostnames.length) {
      const idx = cursor++;
      const hostname = uniqueHostnames[idx]!;

      try {
        const ips = await getIpsForHostname(hostname, timeoutMs);
        for (const ip of ips) {
          discoveredIps.add(ip);
        }
        completed++;
        onProgress?.(completed, total, hostname, ips.length);
      } catch {
        completed++;
        onProgress?.(completed, total, hostname, 0);
      }
    }
  }

  const workerCount = Math.min(concurrency, total);
  const workers = Array.from({ length: workerCount }, () => worker());
  await Promise.all(workers);

  return sortIPs(discoveredIps);
}
