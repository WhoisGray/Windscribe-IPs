import { describe, it, expect } from 'vitest';
import {
  isWindscribeServerIp,
  isWindscribeEntryIp,
  checkIp,
} from '../src/checker.js';

describe('checker module', () => {
  const serverIps = ['198.54.128.195', '74.80.181.146'];
  const entryIps = ['198.54.128.195', '185.244.150.1'];

  it('identifies server IPs correctly', () => {
    expect(isWindscribeServerIp('198.54.128.195', serverIps)).toBe(true);
    expect(isWindscribeServerIp('1.1.1.1', serverIps)).toBe(false);
  });

  it('identifies entry IPs correctly', () => {
    expect(isWindscribeEntryIp('185.244.150.1', entryIps)).toBe(true);
    expect(isWindscribeEntryIp('1.1.1.1', entryIps)).toBe(false);
  });

  it('checks both server and entry statuses in single call', () => {
    const res1 = checkIp('198.54.128.195', serverIps, entryIps);
    expect(res1).toEqual({
      ip: '198.54.128.195',
      isServerIp: true,
      isEntryIp: true,
    });

    const res2 = checkIp('74.80.181.146', serverIps, entryIps);
    expect(res2).toEqual({
      ip: '74.80.181.146',
      isServerIp: true,
      isEntryIp: false,
    });

    const res3 = checkIp('8.8.8.8', serverIps, entryIps);
    expect(res3).toEqual({
      ip: '8.8.8.8',
      isServerIp: false,
      isEntryIp: false,
    });
  });
});
