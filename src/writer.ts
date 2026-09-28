import { promises as fs } from 'node:fs';
import path from 'node:path';

export const SERVER_TXT_HEADER = `#
# windscribe_ips.txt
# https://github.com/WhoisGray/Windscribe-IPs/blob/master/windscribe_ips.txt
#
# An automatically updated list of IP addresses associated with the
# widely used free and privacy-focused VPN provider, Windscribe.
#
# This list could be used to block malicious traffic from Windscribe's servers.
#
`;

export const ENTRY_TXT_HEADER = `#
# windscribe_entry_ips.txt
# https://github.com/WhoisGray/Windscribe-IPs/blob/master/windscribe_entry_ips.txt
#
# An automatically updated list of Entry IPs associated with the
# widely used free and privacy-focused VPN provider, Windscribe.
#
# This list could be used to block access to Windscribe's services.
#
`;

/**
 * Write formatted JSON file.
 */
export async function writeJson(filePath: string, data: unknown): Promise<void> {
  const resolved = path.resolve(filePath);
  const content = JSON.stringify(data, null, 2) + '\n';
  await fs.writeFile(resolved, content, 'utf-8');
}

/**
 * Write list file with comment header.
 */
export async function writeTxtList(
  filePath: string,
  header: string,
  items: string[]
): Promise<void> {
  const resolved = path.resolve(filePath);
  const content = `${header.trim()}\n\n${items.join('\n')}\n`;
  await fs.writeFile(resolved, content, 'utf-8');
}
