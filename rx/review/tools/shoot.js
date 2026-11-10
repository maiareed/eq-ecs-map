// Screenshot + layout checks for every Rx Learn page.
// Usage: node shoot.js <baseUrl> <outDir>   (serve rx/ first, e.g. python3 -m http.server)
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://localhost:8765/';
const out = process.argv[3] || 'screens';
const pages = ['index', 'peptides', 'ldn', 'nad', 'mots-c'];
const combos = [
  { w: 390, h: 844, theme: 'light' }, { w: 390, h: 844, theme: 'dark' },
  { w: 1280, h: 900, theme: 'light' }, { w: 1280, h: 900, theme: 'dark' }
];
(async () => {
  const browser = await chromium.launch();
  const report = [];
  for (const p of pages) for (const c of combos) for (const reduced of [false, true]) {
    if (reduced && c.theme === 'dark') continue; // reduced-motion pass in light only
    const ctx = await browser.newContext({ viewport: { width: c.w, height: c.h }, deviceScaleFactor: c.w === 390 ? 2 : 1,
      colorScheme: c.theme, reducedMotion: reduced ? 'reduce' : 'no-preference' });
    await ctx.addInitScript(t => { try { localStorage.setItem('eq-theme', t); } catch (e) {} }, c.theme);
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(base + p + '.html', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.documentElement.getAttribute('data-ready'));
    await page.waitForTimeout(reduced ? 200 : 2200);
    const m = await page.evaluate(() => {
      const de = document.documentElement;
      const small = [...document.querySelectorAll('#app p, #app li, #app .body-copy')].filter(n => n.offsetParent && parseFloat(getComputedStyle(n).fontSize) < 15.9).length;
      const taps = [...document.querySelectorAll('button, a, input, [role=button]')].filter(n => n.offsetParent || n.getBBox).map(n => n.getBoundingClientRect()).filter(r => r.width > 0 && (r.width < 44 || r.height < 44)).length;
      return { ready: de.getAttribute('data-ready'), hscroll: de.scrollWidth > de.clientWidth + 1, scrollW: de.scrollWidth, clientW: de.clientWidth, smallText: small, smallTaps: taps };
    });
    // interaction probe: click first toggle/seg/row if present
    let interact = 'n/a';
    const seg = await page.$('.seg button:nth-child(2)');
    if (seg) { await seg.click(); interact = await page.evaluate(() => [...document.querySelectorAll('.seg button[aria-pressed=true]')].length > 0 ? 'seg ok' : 'seg FAIL'); }
    const range = await page.$('input[type=range]');
    if (range) { await range.fill('10'); await range.dispatchEvent('input'); interact += await page.evaluate(() => document.querySelector('[data-readout]').textContent.length > 10 ? ', scrub ok' : ', scrub FAIL'); }
    const row = await page.$('.bead-row, .node');
    if (row) { await row.click(); interact += await page.evaluate(() => document.body.classList.contains('sheet-open') ? ', sheet ok' : ', sheet FAIL');
      if (!reduced) await page.screenshot({ path: `${out}/${p}-${c.w}-${c.theme}-sheet.png` });
      await page.keyboard.press('Escape'); }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.documentElement.getAttribute('data-ready'));
    await page.waitForTimeout(reduced ? 200 : 2200);
    const name = `${p}-${c.w}-${c.theme}${reduced ? '-reduced' : ''}`;
    await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
    report.push({ name, ...m, interact, errors });
    await ctx.close();
  }
  await browser.close();
  console.log(JSON.stringify(report, null, 1));
})();
