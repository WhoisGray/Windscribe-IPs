import { promises as fs } from 'node:fs';
import type { IPCheckResult } from './types.js';

/**
 * Checks if a given IP address belongs to Windscribe VPN servers.
 */
export function isWindscribeServerIp(
  ip: string,
  serverIps: Set<string> | readonly string[]
): boolean {
  const set = serverIps instanceof Set ? serverIps : new Set(serverIps);
  return set.has(ip.trim());
}

/**
 * Checks if a given IP address is a Windscribe entry IP.
 */
export function isWindscribeEntryIp(
  ip: string,
  entryIps: Set<string> | readonly string[]
): boolean {
  const set = entryIps instanceof Set ? entryIps : new Set(entryIps);
  return set.has(ip.trim());
}

/**
 * Checks an IP against both server and entry IP sets.
 */
export function checkIp(
  ip: string,
  serverIps: Set<string> | readonly string[],
  entryIps: Set<string> | readonly string[]
): IPCheckResult {
  const cleanIp = ip.trim();
  return {
    ip: cleanIp,
    isServerIp: isWindscribeServerIp(cleanIp, serverIps),
    isEntryIp: isWindscribeEntryIp(cleanIp, entryIps),
  };
}

/**
 * Helper to load an IP list from a JSON file.
 */
export async function loadIPListFromJson(filePath: string): Promise<Set<string>> {
  const raw = await fs.readFile(filePath, 'utf-8');
  const list = JSON.parse(raw) as string[];
  return new Set(Array.isArray(list) ? list : []);
}
