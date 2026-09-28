import { isIP } from 'node:net';
import type {
  WindscribeServerList,
  WindscribeLocation,
  IPDistributionStats,
} from './types.js';

const IP_FIELDS = ['ip', 'ip2', 'ip3', 'ip4', 'ip5'] as const;

/**
 * Validates whether a string is a valid IPv4 or IPv6 address.
 */
export function isValidIP(ip: string): boolean {
  return isIP(ip.trim()) !== 0;
}

/**
 * Checks if an IP is IPv4.
 */
export function isIPv4(ip: string): boolean {
  return isIP(ip.trim()) === 4;
}

/**
 * Checks if an IP is IPv6.
 */
export function isIPv6(ip: string): boolean {
  return isIP(ip.trim()) === 6;
}

/**
 * Naturally sorts IP addresses: IPv4 addresses sorted by their 4 octets,
 * followed by IPv6 addresses sorted alphabetically.
 */
export function sortIPs(ips: Iterable<string>): string[] {
  const v4: string[] = [];
  const v6: string[] = [];
  const others: string[] = [];

  for (const rawIp of ips) {
    const ip = rawIp.trim();
    if (!ip) continue;
    if (isIPv4(ip)) {
      v4.push(ip);
    } else if (isIPv6(ip)) {
      v6.push(ip);
    } else if (isValidIP(ip)) {
      others.push(ip);
    }
  }

  // Sort IPv4 by numeric octets
  v4.sort((a, b) => {
    const octetsA = a.split('.').map(Number);
    const octetsB = b.split('.').map(Number);
    for (let i = 0; i < 4; i++) {
      if (octetsA[i] !== octetsB[i]) {
        return (octetsA[i] ?? 0) - (octetsB[i] ?? 0);
      }
    }
    return 0;
  });

  // Sort IPv6
  v6.sort((a, b) => a.localeCompare(b));
  others.sort((a, b) => a.localeCompare(b));

  return [...v4, ...v6, ...others];
}

/**
 * Combine multiple serverlist responses by merging their 'data' arrays,
 * deduplicating by location id while preserving original location data.
 */
export function combineServerLists(
  primary: WindscribeServerList,
  ...others: WindscribeServerList[]
): WindscribeServerList {
  const seenIds = new Set<number | string>();
  const combinedLocations: WindscribeLocation[] = [];

  const addLocations = (locations?: WindscribeLocation[]) => {
    if (!Array.isArray(locations)) return;
    for (const loc of locations) {
      if (loc && loc.id !== undefined && loc.id !== null) {
        if (!seenIds.has(loc.id)) {
          seenIds.add(loc.id);
          combinedLocations.push(loc);
        }
      }
    }
  };

  addLocations(primary?.data);
  for (const other of others) {
    addLocations(other?.data);
  }

  return {
    ...primary,
    data: combinedLocations,
  };
}

/**
 * Normalizes all nodes in the serverlist so that individual ip, ip2, ip3, ip4, ip5
 * fields are replaced with a single deduplicated `ips: [...]` array.
 */
export function normalizeServerList(data: WindscribeServerList): WindscribeServerList {
  if (!data || !Array.isArray(data.data)) return data;

  const normalizedLocations = data.data.map((location) => {
    if (!location || !Array.isArray(location.groups)) return location;

    const normalizedGroups = location.groups.map((group) => {
      if (!group || !Array.isArray(group.nodes)) return group;

      const normalizedNodes = group.nodes.map((rawNode) => {
        const node = { ...rawNode };
        const ipsSet = new Set<string>();

        // Gather from existing ips array if present
        if (Array.isArray(node.ips)) {
          for (const ip of node.ips) {
            if (typeof ip === 'string' && isValidIP(ip)) {
              ipsSet.add(ip.trim());
            }
          }
        }

        // Gather from legacy ip, ip2, ip3, ip4, ip5
        for (const field of IP_FIELDS) {
          const val = node[field];
          if (typeof val === 'string') {
            const trimmed = val.trim();
            if (isValidIP(trimmed)) {
              ipsSet.add(trimmed);
            }
          }
          // Remove legacy ip1-ip5 properties
          delete node[field];
        }

        node.ips = sortIPs(ipsSet);
        return node;
      });

      return {
        ...group,
        nodes: normalizedNodes,
      };
    });

    return {
      ...location,
      groups: normalizedGroups,
    };
  });

  return {
    ...data,
    data: normalizedLocations,
  };
}

/**
 * Extract all unique IPs from the serverlist.
 * Collects ips array or legacy ip/ip2–ip5, and ping_ip from every group and node entry.
 */
export function extractIps(data: WindscribeServerList): string[] {
  const ips = new Set<string>();
  const locations = data?.data;

  if (Array.isArray(locations)) {
    for (const location of locations) {
      if (!Array.isArray(location?.groups)) continue;

      for (const group of location.groups) {
        if (group?.ping_ip && typeof group.ping_ip === 'string') {
          const trimmed = group.ping_ip.trim();
          if (isValidIP(trimmed)) ips.add(trimmed);
        }

        if (Array.isArray(group?.nodes)) {
          for (const node of group.nodes) {
            if (Array.isArray(node.ips)) {
              for (const ip of node.ips) {
                if (typeof ip === 'string' && isValidIP(ip)) ips.add(ip.trim());
              }
            }
            for (const field of IP_FIELDS) {
              const val = node[field];
              if (typeof val === 'string') {
                const trimmed = val.trim();
                if (isValidIP(trimmed)) ips.add(trimmed);
              }
            }
          }
        }
      }
    }
  }

  return sortIPs(ips);
}

/**
 * Extract all unique hostnames and subdomains from the serverlist.
 * Sources:
 *  - location.dns_hostname
 *  - group.wg_endpoint
 *  - group.ovpn_x509
 *  - node.hostname
 */
export function extractSubdomains(data: WindscribeServerList): string[] {
  const subdomains = new Set<string>();
  const locations = data?.data;

  const addHostname = (name: unknown) => {
    if (typeof name !== 'string') return;
    const cleaned = name.trim().toLowerCase();
    if (!cleaned) return;
    // Exclude raw IPs from subdomain list
    if (isValidIP(cleaned)) return;
    subdomains.add(cleaned);
  };

  if (Array.isArray(locations)) {
    for (const location of locations) {
      addHostname(location?.dns_hostname);

      if (Array.isArray(location?.groups)) {
        for (const group of location.groups) {
          addHostname(group?.wg_endpoint);
          addHostname(group?.ovpn_x509);

          if (Array.isArray(group?.nodes)) {
            for (const node of group.nodes) {
              addHostname(node?.hostname);
            }
          }
        }
      }
    }
  }

  return Array.from(subdomains).sort();
}

/**
 * Extract all IPs directly listed in nodes and groups (ping_ip, ip–ip5).
 */
export function extractNodeIps(data: WindscribeServerList): string[] {
  return extractIps(data);
}

/**
 * Computes distribution statistics for a list of IP addresses.
 */
export function calculateStats(ips: string[]): IPDistributionStats {
  let ipv4Count = 0;
  let ipv6Count = 0;

  for (const ip of ips) {
    if (isIPv4(ip)) {
      ipv4Count++;
    } else if (isIPv6(ip)) {
      ipv6Count++;
    }
  }

  const total = ips.length;
  const ipv4Percentage = total > 0 ? (ipv4Count / total) * 100 : 0;
  const ipv6Percentage = total > 0 ? (ipv6Count / total) * 100 : 0;

  return {
    total,
    ipv4Count,
    ipv6Count,
    ipv4Percentage,
    ipv6Percentage,
  };
}
