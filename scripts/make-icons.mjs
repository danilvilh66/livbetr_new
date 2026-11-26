// Renders favicon PNGs and the social share image from SVG/HTML with Playwright.
// Run once after changing the brand mark: npm run icons
import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const pub = (p) => fileURLToPath(new URL(`../public/${p}`, import.meta.url));

const svg = await readFile(pub('favicon.svg'), 'utf8');
const font = (await readFile(pub('assets/fonts/figtree-latin-var.woff2'))).toString('base64');
const logo = (await readFile(pub('assets/img/logo-white.png'))).toString('base64');

const browser = await chromium.launch();
const page = await browser.newPage();

for (const [file, size, pad] of [['favicon-32.png', 32, 0], ['apple-touch-icon.png', 180, 0], ['icon-192.png', 192, 0], ['icon-512.png', 512, 0]]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${size - pad * 2}px;height:${size - pad * 2}px;margin:${pad}px}</style>${svg}`);
  await page.screenshot({ path: pub(file), omitBackground: true });
}

await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(`<style>
@font-face{font-family:F;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:300 900}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#0B2E3E;color:#fff;font-family:F,sans-serif;padding:72px 80px;display:grid;grid-template-columns:1.25fr .75fr;gap:40px;align-items:center;overflow:hidden}
img{width:190px}
h1{font-size:76px;line-height:1;letter-spacing:-.04em;font-weight:800;margin:40px 0 22px}
p{font-size:28px;color:rgba(255,255,255,.8);font-weight:500}
.tag{background:#fff;color:#0B2E3E;border-radius:14px 26px 26px 14px;padding:30px 34px 26px 50px;rotate:-5deg;position:relative;box-shadow:0 30px 60px rgba(0,0,0,.35)}
.tag:before{content:'';position:absolute;left:18px;top:50%;width:14px;height:14px;border-radius:50%;background:#D6E8E5;translate:0 -50%}
.row{display:flex;justify-content:space-between;align-items:baseline;gap:20px;font-size:24px;font-weight:600;margin-bottom:8px}
.row b{font-size:46px;letter-spacing:-.03em}
.dot{display:inline-block;width:14px;height:14px;border-radius:50%;margin-right:10px;background:#0F7D78}
.foot{border-top:2px dashed #D3DFDD;padding-top:14px;margin-top:8px;color:#0B625E;font-weight:700;font-size:21px}
</style>
<div><img src="data:image/png;base64,${logo}" alt=""><h1>Weight-loss care, priced honestly.</h1><p>GLP-1 medication, a licensed clinician and a 1:1 coach. One price at every dose.</p></div>
<div class="tag"><div class="row"><span><i class="dot"></i>Semaglutide</span><b>$65</b></div><div class="row"><span><i class="dot" style="background:#E0A020"></i>Tirzepatide</span><b>$110</b></div><div class="foot">Per month, same price at every dose</div></div>`);
await page.waitForTimeout(300);
await page.screenshot({ path: pub('assets/img/og-image.png') });

await browser.close();
console.log('Icons and og-image written to public/');
