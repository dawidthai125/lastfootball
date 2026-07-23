import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'http://localhost:3000';
const OUT = __dirname;

const pages = [
  { name: '01-dashboard', path: '/' },
  { name: '02-player', path: '/player' },
  { name: '03-club', path: '/club' },
  { name: '04-training', path: '/training' },
  { name: '05-matches', path: '/matches' },
  { name: '06-league', path: '/league' },
  { name: '07-transfers', path: '/transfers' },
  { name: '08-stadium', path: '/stadium' },
  { name: '09-academy', path: '/academy' },
  { name: '10-sponsors', path: '/sponsors' },
  { name: '11-finance', path: '/finance' },
  { name: '12-rankings', path: '/rankings' },
  { name: '13-messages', path: '/messages' },
  { name: '14-settings', path: '/settings' },
  { name: '15-status', path: '/status' },
];

async function shot(page, file) {
  const filePath = path.join(OUT, file);
  await page.screenshot({ path: filePath, fullPage: false });
  console.log('OK', file);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  const desktop = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  for (const p of pages) {
    await desktop.goto(BASE + p.path, { waitUntil: 'networkidle' });
    await desktop.waitForTimeout(400);
    await shot(desktop, `${p.name}-1920x1080.png`);
  }

  await desktop.goto(BASE + '/', { waitUntil: 'networkidle' });
  await desktop.waitForTimeout(400);
  await shot(desktop, 'extra-full-layout-1920x1080.png');
  await shot(desktop, 'extra-sidebar-expanded-1920x1080.png');

  const mid = await browser.newPage({
    viewport: { width: 1366, height: 768 },
    deviceScaleFactor: 1,
  });
  await mid.goto(BASE + '/', { waitUntil: 'networkidle' });
  await mid.waitForTimeout(400);
  await shot(mid, 'extra-viewport-1366x768.png');

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  });
  await mobile.goto(BASE + '/', { waitUntil: 'networkidle' });
  await mobile.waitForTimeout(400);
  await shot(mobile, 'extra-viewport-mobile-390x844.png');

  await browser.close();
  console.log('DONE');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
