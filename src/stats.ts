import type { IPDistributionStats } from './types.js';

/**
 * Renders a visual ASCII progress bar and summary in the terminal.
 */
export function printDistributionStats(title: string, stats: IPDistributionStats): void {
  const { total, ipv4Count, ipv6Count, ipv4Percentage, ipv6Percentage } = stats;

  console.log(`\n================== ${title} ==================`);
  console.log(`Total unique IPs found: ${total.toLocaleString()}`);

  if (total > 0) {
    const barWidth = 30;
    const v4Width = Math.round((barWidth * ipv4Count) / total);
    const v6Width = Math.round((barWidth * ipv6Count) / total);

    const ipv4Bar = '█'.repeat(v4Width).padEnd(barWidth, '░');
    const ipv6Bar = '█'.repeat(v6Width).padEnd(barWidth, '░');

    console.log('\nIP Address Distribution:');
    console.log(
      `  IPv4 (${ipv4Count.toString().padStart(5, ' ')}): [${ipv4Bar}] ${ipv4Percentage.toFixed(1)}%`
    );
    console.log(
      `  IPv6 (${ipv6Count.toString().padStart(5, ' ')}): [${ipv6Bar}] ${ipv6Percentage.toFixed(1)}%`
    );
  }
  console.log('====================================================\n');
}
