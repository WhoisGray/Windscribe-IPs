import { describe, it, expect, vi, beforeEach } from 'vitest';
import { promises as dnsPromises } from 'node:dns';
import { getIpsForHostname, batchResolveHostnames } from '../src/resolver.js';

describe('resolver module', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns directly if input is already an IP', async () => {
    const result = await getIpsForHostname('1.1.1.1');
    expect(result).toEqual(['1.1.1.1']);
  });

  it('returns empty array on blank input', async () => {
    const result = await getIpsForHostname('   ');
    expect(result).toEqual([]);
  });

  it('resolves IPv4 and IPv6 addresses via dns.lookup', async () => {
    vi.spyOn(dnsPromises, 'lookup').mockResolvedValue([
      { address: '198.51.100.1', family: 4 },
      { address: '2001:db8::1', family: 6 },
    ]);

    const result = await getIpsForHostname('vpn.example.com');
    expect(result).toContain('198.51.100.1');
    expect(result).toContain('2001:db8::1');
  });

  it('gracefully handles lookup error without throwing', async () => {
    vi.spyOn(dnsPromises, 'lookup').mockRejectedValue(new Error('ENOTFOUND'));

    const result = await getIpsForHostname('nonexistent.domain.xyz');
    expect(result).toEqual([]);
  });

  it('resolves multiple hostnames concurrently', async () => {
    vi.spyOn(dnsPromises, 'lookup').mockImplementation(async (host) => {
      if (host === 'a.example.com') {
        return [{ address: '10.0.0.1', family: 4 }];
      }
      if (host === 'b.example.com') {
        return [{ address: '10.0.0.2', family: 4 }];
      }
      throw new Error('ENOTFOUND');
    });

    const progress: number[] = [];
    const results = await batchResolveHostnames(
      ['a.example.com', 'b.example.com', 'c.example.com'],
      {
        concurrency: 2,
        onProgress: (done) => progress.push(done),
      }
    );

    expect(results).toEqual(['10.0.0.1', '10.0.0.2']);
    expect(progress.length).toBeGreaterThan(0);
  });
});
