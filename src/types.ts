export interface WindscribeNode {
  hostname?: string | null;
  ips?: string[];
  ip?: string | null;
  ip2?: string | null;
  ip3?: string | null;
  ip4?: string | null;
  ip5?: string | null;
  [key: string]: unknown;
}

export interface WindscribeGroup {
  ping_ip?: string | null;
  wg_endpoint?: string | null;
  ovpn_x509?: string | null;
  nodes?: WindscribeNode[];
  [key: string]: unknown;
}

export interface WindscribeLocation {
  id: number | string;
  name?: string;
  country?: string;
  dns_hostname?: string | null;
  groups?: WindscribeGroup[];
  [key: string]: unknown;
}

export interface WindscribeServerList {
  data: WindscribeLocation[];
  [key: string]: unknown;
}

export interface IPDistributionStats {
  total: number;
  ipv4Count: number;
  ipv6Count: number;
  ipv4Percentage: number;
  ipv6Percentage: number;
}

export interface ScrapeOptions {
  urls?: string[];
  userAgent?: string;
  timeoutMs?: number;
  concurrency?: number;
  outputDir?: string;
}

export interface IPCheckResult {
  ip: string;
  isServerIp: boolean;
  isEntryIp: boolean;
}
