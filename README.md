<div align="center">

# 🌐 Windscribe IPs & Endpoints Tracker

**An enterprise-grade, automatically updated threat intelligence feed and scraper for Windscribe VPN exit nodes, entry servers, and infrastructure subdomains.**

[![CI Pipeline](https://github.com/WhoisGray/Windscribe-IPs/actions/workflows/ci.yml/badge.svg)](https://github.com/WhoisGray/Windscribe-IPs/actions/workflows/ci.yml)
[![Daily Scraper](https://github.com/WhoisGray/Windscribe-IPs/actions/workflows/scraper.yml/badge.svg)](https://github.com/WhoisGray/Windscribe-IPs/actions/workflows/scraper.yml)
[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vitest Coverage](https://img.shields.io/badge/Tests-Vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

[📖 English Documentation](README.md) • [🇮🇷 مستندات فارسی](README-fa.md)

</div>

---

## 🚀 Key Features & Capabilities

- 🔄 **Fully Automated Daily Updates**: Powered by GitHub Actions cron jobs running every 24 hours (00:00 UTC) to fetch, resolve, and commit the freshest IP data automatically.
- ⚡ **High-Concurrency DNS Engine**: Asynchronously resolves both **IPv4 (A)** and **IPv6 (AAAA)** addresses with a tunable worker queue and resilient fallback for dead or transient subdomains.
- 🧹 **Normalized Data Schema (`ips: [...]`)**: Transforms scattered legacy fields (`ip`, `ip2`, `ip3`, `ip4`, `ip5`) into clean, deduplicated, and strictly typed IP arrays on every server node.
- 🎯 **Dual Feed Architecture**:
  - **Server IPs**: Direct exit/VPN server IP addresses (ideal for anti-fraud, abuse prevention, and VPN detection).
  - **Entry IPs**: WireGuard, OpenVPN, and gateway endpoints (ideal for network security and perimeter firewalls).
- 🔢 **Deterministic Natural IP Sorting**: Sorts IPv4 addresses by numeric octets (`1.2.3.4` before `1.2.3.10`) followed by canonically sorted IPv6 addresses.
- 🛡️ **Zero Runtime Dependencies**: Engine is built exclusively on top of modern Node.js standard APIs (`fetch`, `node:dns/promises`, `node:net`, `node:fs/promises`).
- 🧪 **Enterprise Test Suite**: Verified with Vitest unit tests covering parsing logic, schema normalization, DNS resilience, and sorting algorithms.
- 📦 **CLI & Library Support**: Use it as a turnkey command-line scraper or import it directly into your TypeScript/Node.js backend as an IP detection library.

---

## 📊 Live Data Feeds

All lists are regenerated and published daily. You can ingest these raw URLs directly into firewalls, blocklists, SIEMs, or scripts.

| File Name | Direct Raw Link | Description | Format |
| :--- | :--- | :--- | :--- |
| **`windscribe_serverlist.json`** | [Download Raw](https://raw.githubusercontent.com/WhoisGray/Windscribe-IPs/master/windscribe_serverlist.json) | Complete normalized Windscribe server dataset with locations, nodes, and `ips: [...]` arrays. | JSON |
| **`windscribe_ips.json`** | [Download Raw](https://raw.githubusercontent.com/WhoisGray/Windscribe-IPs/master/windscribe_ips.json) | Unique VPN server/exit IP addresses. | JSON Array |
| **`windscribe_ips.txt`** | [Download Raw](https://raw.githubusercontent.com/WhoisGray/Windscribe-IPs/master/windscribe_ips.txt) | Plain-text feed of server IPs with descriptive header comments. | Plain Text (1 per line) |
| **`windscribe_entry_ips.json`** | [Download Raw](https://raw.githubusercontent.com/WhoisGray/Windscribe-IPs/master/windscribe_entry_ips.json) | Combined entry IPs (node addresses + resolved WireGuard/OpenVPN endpoints). | JSON Array |
| **`windscribe_entry_ips.txt`** | [Download Raw](https://raw.githubusercontent.com/WhoisGray/Windscribe-IPs/master/windscribe_entry_ips.txt) | Plain-text feed of entry IPs for firewall rules. | Plain Text (1 per line) |
| **`windscribe_subdomains.json`** | [Download Raw](https://raw.githubusercontent.com/WhoisGray/Windscribe-IPs/master/windscribe_subdomains.json) | Discovered hostnames and subdomains across all locations. | JSON Array |

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js**: `>= 18.0.0`
- **npm**: `>= 9.0.0`

### Installation

```bash
git clone https://github.com/WhoisGray/Windscribe-IPs.git
cd Windscribe-IPs
npm install
```

### CLI Scraper Commands

```bash
# Run the full scraping pipeline (server list + entry IPs + DNS resolution)
npm start

# Scrape only server list and exit server IPs
npm run scrape:server

# Scrape only entry IPs and subdomains
npm run scrape:entry

# Run test suite
npm test

# Check TypeScript types
npm run typecheck

# Build TypeScript to dist/
npm run build
```

#### Advanced CLI Flags

```bash
# Adjust parallel DNS concurrency (default: 15) and custom output folder:
npx tsx src/index.ts --concurrency 30 --output-dir ./custom-data
```

---

## 💻 Integration Examples

### TypeScript / Node.js (Library Import)

Import the built-in checker utilities directly into your application:

```typescript
import { isWindscribeServerIp, isWindscribeEntryIp, checkIp } from './src/index.js';

// Load cached or fetched arrays/sets
const serverIps = new Set(['194.0.213.154', '185.238.28.32']);
const entryIps = new Set(['194.0.213.154', '1.220.90.178']);

const sampleIp = '194.0.213.154';

console.log('Is Server IP:', isWindscribeServerIp(sampleIp, serverIps)); // true
console.log('Is Entry IP:', isWindscribeEntryIp(sampleIp, entryIps));   // true

// Detailed multi-status check
const check = checkIp(sampleIp, serverIps, entryIps);
console.log(check);
// Output: { ip: '194.0.213.154', isServerIp: true, isEntryIp: true }
```

### Direct Remote Ingestion (JavaScript)

```javascript
const response = await fetch(
  'https://raw.githubusercontent.com/WhoisGray/Windscribe-IPs/master/windscribe_ips.json'
);
const vpnIps = new Set(await response.json());

function isVpnUser(clientIp) {
  return vpnIps.has(clientIp);
}

console.log(isVpnUser('194.0.213.154'));
```

### Python Ingestion

```python
import urllib.request
import json

URL = "https://raw.githubusercontent.com/WhoisGray/Windscribe-IPs/master/windscribe_ips.json"
with urllib.request.urlopen(URL) as resp:
    vpn_ips = set(json.loads(resp.read().decode("utf-8")))

def is_windscribe(ip: str) -> bool:
    return ip in vpn_ips

print("Check:", is_windscribe("194.0.213.154"))
```

### Linux Firewall / IPSet / Bash

```bash
# Create an ipset and block all Windscribe server IPs
ipset create windscribe_block hash:ip
curl -s https://raw.githubusercontent.com/WhoisGray/Windscribe-IPs/master/windscribe_ips.txt \
  | grep -v '^#' \
  | while read -r ip; do
      [ -n "$ip" ] && ipset add windscribe_block "$ip" 2>/dev/null
    done

# Add iptables drop rule
iptables -I INPUT -m set --match-set windscribe_block src -j DROP
```

---

## 🏗️ Architecture & Pipeline

```
  ┌────────────────────────────────────────────────────────┐
  │         Windscribe Mobile API v2 Endpoints             │
  │     https://assets.windscribe.com/serverlist/mob-v2/   │
  └───────────────────────────┬────────────────────────────┘
                              │
                    [fetcher.ts] (Retry & Timeout)
                              │
                              ▼
                   [combineServerLists]
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │         Schema Normalization (normalizeServerList)     │
  │     Transform: ip, ip2..ip5  ───►  ips: [...] Array    │
  └───────────────────────────┬────────────────────────────┘
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
       [extractIps]                 [extractSubdomains]
               │                             │
               ▼                             ▼
     windscribe_ips.json          [batchResolveHostnames]
     windscribe_ips.txt             (Concurrent A & AAAA)
                                             │
                                             ▼
                                 windscribe_entry_ips.json
                                 windscribe_entry_ips.txt
```

---

## 🧪 Quality & Testing

Unit tests run automatically via Vitest on Node 20 and 22 in CI:

```bash
npm test
```

Test Coverage includes:
- IP validation (IPv4 & IPv6 separation)
- Natural octet sorting
- Serverlist deduplication & merging
- Schema normalization (transforming `ip1-5` to `ips: [...]`)
- Concurrent DNS worker pool simulation and timeout handling
- IP checker utilities

---

## ⚙️ CI/CD Workflow

- **`ci.yml`**: Triggers on pull requests and pushes to `master`. Executes strict typecheck, linting, and unit tests across Node.js LTS versions.
- **`scraper.yml`**: Scheduled daily GitHub Action at 00:00 UTC. Runs tests, executes the scraper pipeline, updates datasets, and auto-commits changes with `[skip ci]`.

---

## 👤 Author

Developed and maintained by **[WhoisGray](https://github.com/WhoisGray)**.

---

## 📄 License

This repository is distributed under the **[Apache-2.0 License](LICENSE)**.
