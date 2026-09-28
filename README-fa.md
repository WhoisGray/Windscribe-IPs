<div dir="rtl" align="center">

# 🌐 ردیاب و اسکرپر هوشمند IPها و اندپوینت‌های ویندسکرایب (Windscribe)

**فید اطلاعات تهدید (Threat Intelligence) و اسکرپر خودکار، سریع و حرفه‌ای برای ردیابی سرورهای خروجی، آی‌پی‌های اینتری و ساب‌دامین‌های زیرساختی VPN ویندسکرایب.**

[![CI Pipeline](https://github.com/WhoisGray/Windscribe-IPs/actions/workflows/ci.yml/badge.svg)](https://github.com/WhoisGray/Windscribe-IPs/actions/workflows/ci.yml)
[![Daily Scraper](https://github.com/WhoisGray/Windscribe-IPs/actions/workflows/scraper.yml/badge.svg)](https://github.com/WhoisGray/Windscribe-IPs/actions/workflows/scraper.yml)
[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vitest Coverage](https://img.shields.io/badge/Tests-Vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

[📖 English Documentation](README.md) • [🇮🇷 مستندات فارسی](README-fa.md)

</div>

---

## 🚀 ویژگی‌ها و قابلیت‌های کلیدی

- 🔄 **به‌روزرسانی کاملاً خودکار و ۲۴ ساعته**: با کمک GitHub Actions، هر روز رأس ساعت 00:00 UTC بدون نیاز به دخالت دست، جدیدترین داده‌ها واکشی، تحلیل و در مخزن کامیت می‌شوند.
- ⚡ **موتور ریزالو DNS موازی با کارایی بالا**: ریزالو همزمان رکوردهای **IPv4 (A)** و **IPv6 (AAAA)** با مدیریت صف همروندی (Concurrency Pool) و تحمل خطای بالا در برابر دامنه‌های از دسترس خارج شده.
- 🧹 **نرمال‌سازی ساختار داده (`ips: [...]`)**: تبدیل فیلدهای پراکنده و قدیمی (`ip`, `ip2`, `ip3`, `ip4`, `ip5`) به یک آرایه تمیز، تایپ‌شده، بدون تکرار و مرتب‌شده در تمام نودهای سرورلیست.
- 🎯 **تفکیک هوشمند فیدها به دو بخش کاربردی**:
  - **Server IPs (آی‌پی‌های خروجی سرور)**: مناسب برای سیستم‌های ضد تقلب، شناسایی کاربران VPN و امنیت نرم‌افزار.
  - **Entry IPs (آی‌پی‌های ورودی و اندپوینت‌ها)**: مناسب برای فایروال‌های لبه شبکه، روتینگ و مسدودسازی دسترسی به زیرساخت‌های WireGuard و OpenVPN.
- 🔢 **مرتب‌سازی طبیعی عددی (Natural Sorting)**: مرتب‌سازی دقیق اککت‌های عددی IPv4 (مثلاً `1.2.3.4` قبل از `1.2.3.10`) به همراه مرتب‌سازی کانونی آدرس‌های IPv6.
- 🛡️ **بدون وابستگی رانتایم جانبی (Zero Runtime Dependencies)**: پیاده‌سازی شده فقط با استفاده از امکانات پیشرفته و توکار Node.js مدرن (`fetch`, `node:dns/promises`, `node:net`, `node:fs/promises`).
- 🧪 **تست‌های یونیت کامل و مطمئن**: پوشش کامل با فریم‌ورک Vitest برای تضمین عملکرد پارسر، نرمال‌سازی، استخراج و اعتبارسنجی.
- 📦 **پشتیبانی دوگانه از CLI و کتابخانه**: امکان اجرا به عنوان ابزار خط فرمان یا ایمپورت توابع کمکی بررسی IP در پروژه‌های Node.js و TypeScript دیگر.

---

## 📊 فیدهای زنده و لینک‌های دانلود داده

کلیه داده‌ها روزانه بازتولید می‌شوند و می‌توانید مستقیماً از لینک‌های Raw زیر در فایروال‌ها، میکروتیک، اسکریپت‌ها یا سیستم‌های مانیتورینگ استفاده نمایید:

| نام فایل | لینک دانلود مستقیم (Raw) | توضیحات | فرمت |
| :--- | :--- | :--- | :--- |
| **`windscribe_serverlist.json`** | [دانلود فایل](https://raw.githubusercontent.com/WhoisGray/Windscribe-IPs/master/windscribe_serverlist.json) | کل سرورلیست نرمالایز شده شامل مشخصات لوکیشن‌ها، نودها و آرایه `ips: [...]` | JSON |
| **`windscribe_ips.json`** | [دانلود فایل](https://raw.githubusercontent.com/WhoisGray/Windscribe-IPs/master/windscribe_ips.json) | لیست تمام آی‌پی‌های خروجی سرورهای VPN | JSON Array |
| **`windscribe_ips.txt`** | [دانلود فایل](https://raw.githubusercontent.com/WhoisGray/Windscribe-IPs/master/windscribe_ips.txt) | متن ساده آی‌پی‌های سرور (یک آی‌پی در هر سطر با توضیحات هدر) | Plain Text |
| **`windscribe_entry_ips.json`** | [دانلود فایل](https://raw.githubusercontent.com/WhoisGray/Windscribe-IPs/master/windscribe_entry_ips.json) | لیست جامع آی‌پی‌های اینتری و ریزالو شده‌ی WireGuard و OpenVPN | JSON Array |
| **`windscribe_entry_ips.txt`** | [دانلود فایل](https://raw.githubusercontent.com/WhoisGray/Windscribe-IPs/master/windscribe_entry_ips.txt) | متن ساده آی‌پی‌های اینتری برای رول‌های فایروال | Plain Text |
| **`windscribe_subdomains.json`** | [دانلود فایل](https://raw.githubusercontent.com/WhoisGray/Windscribe-IPs/master/windscribe_subdomains.json) | کلیه هاست‌نیم‌ها و ساب‌دامین‌های زیرساختی کشف شده | JSON Array |

---

## 🛠️ راهنمای راه‌اندازی و استفاده

### پیش‌نیازها
- **Node.js**: نسخه `18.0.0` یا بالاتر
- **npm**: نسخه `9.0.0` یا بالاتر

### نصب و آماده‌سازی

```bash
git clone https://github.com/WhoisGray/Windscribe-IPs.git
cd Windscribe-IPs
npm install
```

### دستورات خط فرمان اسکرپر

```bash
# اجرای کل پایپ‌لاین (سرورلیست + استخراج اینتری‌ها + ریزالو DNS)
npm start

# فقط دریافت سرورلیست و استخراج سرور IPها
npm run scrape:server

# فقط استخراج اینتری IPها و ساب‌دامین‌ها
npm run scrape:entry

# اجرای تست‌های یونیت
npm test

# بررسی اعتبارسنجی تایپ‌های TypeScript
npm run typecheck

# بیلد پروژه به دایرکتوری dist/
npm run build
```

#### فلگ‌های سفارشی خط فرمان

```bash
# تنظیم تعداد درخواست‌های موازی DNS (پیش‌فرض: 15) و مسیر ذخیره سفارشی:
npx tsx src/index.ts --concurrency 30 --output-dir ./custom-folder
```

---

## 💻 نمونه کدهای استفاده

### استفاده به عنوان کتابخانه در TypeScript / Node.js

توابع آماده را مستقیماً در پروژه خود ایمپورت کنید:

```typescript
import { isWindscribeServerIp, isWindscribeEntryIp, checkIp } from './src/index.js';

// فرض کنید لیست آی‌پی‌ها را لود کرده‌اید
const serverIps = new Set(['194.0.213.154', '185.238.28.32']);
const entryIps = new Set(['194.0.213.154', '1.220.90.178']);

const ipToCheck = '194.0.213.154';

console.log('آیا آی‌پی سرور است؟', isWindscribeServerIp(ipToCheck, serverIps)); // true
console.log('آیا آی‌پی اینتری است؟', isWindscribeEntryIp(ipToCheck, entryIps));   // true

// بررسی وضعیت کامل با جزئیات:
const result = checkIp(ipToCheck, serverIps, entryIps);
console.log(result);
// خروجی: { ip: '194.0.213.154', isServerIp: true, isEntryIp: true }
```

### دریافت زنده با جاوا اسکریپت (Fetch)

```javascript
const response = await fetch(
  'https://raw.githubusercontent.com/WhoisGray/Windscribe-IPs/master/windscribe_ips.json'
);
const vpnIps = new Set(await response.json());

function isVpn(ip) {
  return vpnIps.has(ip);
}

console.log(isVpn('194.0.213.154'));
```

### دریافت در پایتون (Python)

```python
import urllib.request
import json

URL = "https://raw.githubusercontent.com/WhoisGray/Windscribe-IPs/master/windscribe_ips.json"
with urllib.request.urlopen(URL) as resp:
    vpn_ips = set(json.loads(resp.read().decode("utf-8")))

def is_windscribe(ip: str) -> bool:
    return ip in vpn_ips

print("آیا ویندسکرایب است؟", is_windscribe("194.0.213.154"))
```

### استفاده در فایروال لینوکس (Iptables / IPSet)

```bash
# ایجاد مجموعه ipset و بلاک کردن کلیه آی‌پی‌های سرور ویندسکرایب
ipset create windscribe_block hash:ip
curl -s https://raw.githubusercontent.com/WhoisGray/Windscribe-IPs/master/windscribe_ips.txt \
  | grep -v '^#' \
  | while read -r ip; do
      [ -n "$ip" ] && ipset add windscribe_block "$ip" 2>/dev/null
    done

# رول مسدودسازی
iptables -I INPUT -m set --match-set windscribe_block src -j DROP
```

---

## 🏗️ معماری و چرخه پردازش

```
  ┌────────────────────────────────────────────────────────┐
  │              اندپوینت‌های رسمی API ویندسکرایب             │
  │     https://assets.windscribe.com/serverlist/mob-v2/   │
  └───────────────────────────┬────────────────────────────┘
                              │
                    [fetcher.ts] (با Retry و Timeout)
                              │
                              ▼
                   [combineServerLists]
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │       نرمال‌سازی ساختار داده (normalizeServerList)       │
  │     تبدیل فیلدهای پراکنده ip1-ip5 به آرایه ips:[...]    │
  └───────────────────────────┬────────────────────────────┘
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
       [extractIps]                 [extractSubdomains]
               │                             │
               ▼                             ▼
     windscribe_ips.json          [batchResolveHostnames]
     windscribe_ips.txt            (ریزالو موازی A و AAAA)
                                             │
                                             ▼
                                 windscribe_entry_ips.json
                                 windscribe_entry_ips.txt
```

---

## 🧪 تست‌های خودکار

تمامی بخش‌های کلیدی برنامه توسط تست‌رانر فوق سریع **Vitest** پوشش داده شده‌اند:

```bash
npm test
```

موارد تست‌شده:
- اعتبارسنجی و تفکیک دقیق IPv4 و IPv6.
- مرتب‌سازی طبیعی عددی اککت‌ها.
- نرمال‌سازی نودها و جایگزینی کلیدهای قدیمی با آرایه `ips`.
- ادغام و حذف لوکیشن‌های تکراری.
- ماک کردن DNS و مدیریت قطعی یا انقضای دامنه‌ها.
- توابع اعتبارسنجی آی‌پی.

---

## ⚙️ اتوماسیون CI/CD

- **`ci.yml`**: با هر Push و Pull Request اجرا شده و بررسی تایپ‌ها و تست‌ها را روی نسخه‌های Node.js 20 و 22 به صورت موازی چک می‌کند.
- **`scraper.yml`**: به صورت روزانه (Cron 00:00 UTC) اجرا شده و بعد از اسکرپ و ریزالو، فایل‌های مخزن را با کامیت خودکار و برچسب `[skip ci]` به‌روز می‌نماید.

---

## 👤 سازنده

توسعه داده شده و مدیریت شده توسط **[WhoisGray](https://github.com/WhoisGray)**.

---

## 📄 لایسنس

این پروژه تحت لایسنس **[Apache-2.0](LICENSE)** منتشر شده است.
