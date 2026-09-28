#!/usr/bin/env node
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { fetchAllServerLists } from './fetcher.js';
import {
  extractIps,
  extractSubdomains,
  extractNodeIps,
  sortIPs,
  calculateStats,
  normalizeServerList,
} from './parser.js';
import { batchResolveHostnames } from './resolver.js';
import {
  writeJson,
  writeTxtList,
  SERVER_TXT_HEADER,
  ENTRY_TXT_HEADER,
} from './writer.js';
import { printDistributionStats } from './stats.js';
import type { WindscribeServerList } from './types.js';

// Export everything for programmatic / library usage
export * from './types.js';
export * from './parser.js';
export * from './fetcher.js';
export * from './resolver.js';
export * from './writer.js';
export * from './stats.js';
export * from './checker.js';

interface CliConfig {
  outputDir: string;
  skipServer: boolean;
  skipEntry: boolean;
  concurrency: number;
}

function parseArgs(args: string[]): CliConfig {
  const config: CliConfig = {
    outputDir: process.cwd(),
    skipServer: false,
    skipEntry: false,
    concurrency: 15,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--only-server') {
      config.skipEntry = true;
    } else if (arg === '--only-entry') {
      config.skipServer = true;
    } else if (arg === '--output-dir' && args[i + 1]) {
      config.outputDir = path.resolve(args[++i]!);
    } else if (arg === '--concurrency' && args[i + 1]) {
      config.concurrency = parseInt(args[++i]!, 10) || 15;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Windscribe IPs Scraper CLI

Usage:
  npm start [options]
  npx windscribe-ips [options]

Options:
  --only-server       Scrape only Windscribe server list and server IPs
  --only-entry        Scrape only Windscribe entry IPs and subdomains
  --output-dir <path> Directory to save output files (default: current directory)
  --concurrency <num> Number of parallel DNS workers (default: 15)
  --help, -h          Show this help message
`);
      process.exit(0);
    }
  }

  return config;
}

export async function runScraper(config: CliConfig): Promise<void> {
  const serverListPath = path.join(config.outputDir, 'windscribe_serverlist.json');
  let serverList: WindscribeServerList;

  console.log(`[Scraper] Starting Windscribe Scraper (Output: ${config.outputDir})...`);

  // Step 1: Fetch or load server list
  if (!config.skipServer) {
    const rawList = await fetchAllServerLists();
    serverList = normalizeServerList(rawList);
    await writeJson(serverListPath, serverList);
    console.log(`[Scraper] Saved ${serverListPath} (${serverList.data.length} locations)`);

    // Server IPs
    const serverIps = extractIps(serverList);
    const serverIpsJsonPath = path.join(config.outputDir, 'windscribe_ips.json');
    const serverIpsTxtPath = path.join(config.outputDir, 'windscribe_ips.txt');

    await writeJson(serverIpsJsonPath, serverIps);
    await writeTxtList(serverIpsTxtPath, SERVER_TXT_HEADER, serverIps);
    console.log(`[Scraper] Saved ${serverIpsJsonPath} and ${serverIpsTxtPath}`);

    const serverStats = calculateStats(serverIps);
    printDistributionStats('Windscribe Server IPs', serverStats);
  } else {
    console.log(`[Scraper] Loading existing server list from ${serverListPath}...`);
    const content = await fs.readFile(serverListPath, 'utf-8');
    serverList = normalizeServerList(JSON.parse(content) as WindscribeServerList);
  }

  // Step 2: Entry IPs & Subdomains
  if (!config.skipEntry) {
    console.log('[Scraper] Starting Entry IP and Subdomain discovery...');

    const subdomains = extractSubdomains(serverList);
    const subdomainsPath = path.join(config.outputDir, 'windscribe_subdomains.json');
    await writeJson(subdomainsPath, subdomains);
    console.log(
      `[Scraper] Extracted and saved ${subdomains.length} subdomains to ${subdomainsPath}`
    );

    const nodeIps = new Set(extractNodeIps(serverList));
    console.log(`[Scraper] Extracted ${nodeIps.size} IPs directly from server list nodes`);

    console.log(`[Scraper] Resolving ${subdomains.length} hostnames in parallel (concurrency=${config.concurrency})...`);
    let lastReport = 0;
    const resolvedIps = await batchResolveHostnames(subdomains, {
      concurrency: config.concurrency,
      onProgress: (completed, total) => {
        if (completed === total || completed - lastReport >= 25) {
          lastReport = completed;
          const pct = Math.round((completed / total) * 100);
          process.stdout.write(`\r[DNS] Resolving: ${completed}/${total} hostnames (${pct}%)`);
        }
      },
    });
    process.stdout.write('\n');
    console.log(`[Scraper] Resolved ${resolvedIps.length} unique IPs from hostnames.`);

    const combinedEntryIps = sortIPs(new Set([...nodeIps, ...resolvedIps]));
    const entryIpsJsonPath = path.join(config.outputDir, 'windscribe_entry_ips.json');
    const entryIpsTxtPath = path.join(config.outputDir, 'windscribe_entry_ips.txt');

    await writeJson(entryIpsJsonPath, combinedEntryIps);
    await writeTxtList(entryIpsTxtPath, ENTRY_TXT_HEADER, combinedEntryIps);
    console.log(`[Scraper] Saved ${entryIpsJsonPath} and ${entryIpsTxtPath}`);

    const entryStats = calculateStats(combinedEntryIps);
    printDistributionStats('Windscribe Entry IPs', entryStats);
  }

  console.log('[Scraper] All scraping tasks completed successfully!');
}

// Execute CLI when run directly
const isDirectRun =
  process.argv[1] &&
  (process.argv[1].endsWith('src/index.ts') ||
    process.argv[1].endsWith('dist/index.js') ||
    process.argv[1].endsWith('windscribe-ips'));

if (isDirectRun) {
  const config = parseArgs(process.argv.slice(2));
  runScraper(config).catch((err) => {
    console.error('[Scraper] Fatal error:', err);
    process.exit(1);
  });
}
