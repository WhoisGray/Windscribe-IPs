import { describe, it, expect } from 'vitest';
import {
  combineServerLists,
  extractIps,
  extractSubdomains,
  extractNodeIps,
  isValidIP,
  isIPv4,
  isIPv6,
  sortIPs,
  calculateStats,
  normalizeServerList,
} from '../src/parser.js';
import type { WindscribeServerList } from '../src/types.js';

describe('parser utilities', () => {
  it('correctly validates IPv4 and IPv6', () => {
    expect(isValidIP('192.168.1.1')).toBe(true);
    expect(isIPv4('192.168.1.1')).toBe(true);
    expect(isIPv6('192.168.1.1')).toBe(false);

    expect(isValidIP('2001:db8::1')).toBe(true);
    expect(isIPv4('2001:db8::1')).toBe(false);
    expect(isIPv6('2001:db8::1')).toBe(true);

    expect(isValidIP('invalid.ip.string')).toBe(false);
    expect(isValidIP('')).toBe(false);
  });

  it('sorts IPs naturally with IPv4 first by octet then IPv6', () => {
    const raw = ['10.0.0.2', '10.0.0.10', '10.0.0.1', '2001:db8::2', '2001:db8::1'];
    const sorted = sortIPs(raw);
    expect(sorted).toEqual([
      '10.0.0.1',
      '10.0.0.2',
      '10.0.0.10',
      '2001:db8::1',
      '2001:db8::2',
    ]);
  });

  it('combines serverlists deduplicating by location id', () => {
    const listA: WindscribeServerList = {
      data: [
        { id: 1, name: 'Location 1', groups: [] },
        { id: 2, name: 'Location 2', groups: [] },
      ],
    };

    const listB: WindscribeServerList = {
      data: [
        { id: 2, name: 'Location 2 Duplicated', groups: [] },
        { id: 3, name: 'Location 3', groups: [] },
      ],
    };

    const combined = combineServerLists(listA, listB);
    expect(combined.data.length).toBe(3);
    expect(combined.data.map((l) => l.id)).toEqual([1, 2, 3]);
    // Keeps first seen data
    expect(combined.data.find((l) => l.id === 2)?.name).toBe('Location 2');
  });

  it('extracts IPs from nodes and groups accurately', () => {
    const mockList: WindscribeServerList = {
      data: [
        {
          id: 1,
          groups: [
            {
              ping_ip: '10.0.0.1',
              nodes: [
                { ip: '10.0.0.2', ip2: '10.0.0.3', ip3: 'invalid-ip', ip4: null, ip5: '' },
                { ip: '10.0.0.2' }, // duplicate
              ],
            },
          ],
        },
      ],
    };

    const ips = extractIps(mockList);
    expect(ips).toEqual(['10.0.0.1', '10.0.0.2', '10.0.0.3']);
  });

  it('extracts subdomains and hostnames, excluding IPs and duplicates', () => {
    const mockList: WindscribeServerList = {
      data: [
        {
          id: 1,
          dns_hostname: 'la-dns.windscribe.com',
          groups: [
            {
              wg_endpoint: 'la-wg.windscribe.com',
              ovpn_x509: 'LA-OVPN.WINDSCRIBE.COM', // uppercase test
              nodes: [
                { hostname: 'node-1.windscribe.com', ip: '1.2.3.4' },
                { hostname: '1.2.3.4' }, // raw IP should be excluded
              ],
            },
          ],
        },
      ],
    };

    const subdomains = extractSubdomains(mockList);
    expect(subdomains).toEqual([
      'la-dns.windscribe.com',
      'la-ovpn.windscribe.com',
      'la-wg.windscribe.com',
      'node-1.windscribe.com',
    ]);
  });

  it('calculates statistics correctly', () => {
    const ips = ['1.1.1.1', '8.8.8.8', '2001:4860:4860::8888'];
    const stats = calculateStats(ips);
    expect(stats.total).toBe(3);
    expect(stats.ipv4Count).toBe(2);
    expect(stats.ipv6Count).toBe(1);
    expect(stats.ipv4Percentage).toBeCloseTo(66.67, 1);
    expect(stats.ipv6Percentage).toBeCloseTo(33.33, 1);
  });

  it('normalizes node ip1-ip5 properties into an ips array and removes individual ip fields', () => {
    const rawList: WindscribeServerList = {
      data: [
        {
          id: 1,
          groups: [
            {
              id: 10,
              nodes: [
                {
                  hostname: 'node1.example.com',
                  ip: '194.0.213.155',
                  ip2: '185.238.28.48',
                  ip3: '185.238.28.49',
                  ip4: null,
                  ip5: '',
                  weight: 1,
                },
              ],
            },
          ],
        },
      ],
    };

    const normalized = normalizeServerList(rawList);
    const node = normalized.data[0]?.groups?.[0]?.nodes?.[0];

    expect(node).toBeDefined();
    expect(node?.ips).toEqual(['185.238.28.48', '185.238.28.49', '194.0.213.155']);
    expect(node?.ip).toBeUndefined();
    expect(node?.ip2).toBeUndefined();
    expect(node?.ip3).toBeUndefined();
    expect(node?.ip4).toBeUndefined();
    expect(node?.ip5).toBeUndefined();
    expect(node?.hostname).toBe('node1.example.com');
    expect(node?.weight).toBe(1);
  });

  it('extracts IPs when nodes already use the ips array format', () => {
    const listWithIpsArray: WindscribeServerList = {
      data: [
        {
          id: 1,
          groups: [
            {
              ping_ip: '1.1.1.1',
              nodes: [
                {
                  hostname: 'node1.example.com',
                  ips: ['10.0.0.1', '10.0.0.2'],
                },
              ],
            },
          ],
        },
      ],
    };

    const ips = extractIps(listWithIpsArray);
    expect(ips).toEqual(['1.1.1.1', '10.0.0.1', '10.0.0.2']);
  });
});
