// Dump the rendered copy of every page (reading order), including tap-to-open details and
// interactive states, to review/rendered/<page>.txt
// Usage: node tools/extract.js <baseUrl> <outDir>
const { chromium } = require('playwright');
const fs = require('fs');
const base = process.argv[2] || 'http://localhost:8766/rx/';
const out = process.argv[3] || 'rendered';
fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch();
  for (const p of ['index', 'peptides', 'ldn', 'nad', 'mots-c']) {
    const pg = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
    await pg.goto(base + p + '.html', { waitUntil: 'networkidle' });
    await pg.waitForFunction(() => document.documentElement.getAttribute('data-ready'));
    let txt = await pg.evaluate(() => {
      const svgText = [...document.querySelectorAll('#app svg text')].map(t => t.textContent).filter(Boolean);
      const aria = [...document.querySelectorAll('#app svg[aria-label]')].map(s => '[image description] ' + s.getAttribute('aria-label'));
      return document.getElementById('app').innerText + '\n\n--- Text inside visuals ---\n' + svgText.join('\n') + '\n\n--- Image descriptions ---\n' + aria.join('\n');
    });
    const rows = await pg.$$('.bead-row, .key-btn');
    const details = [];
    for (const r of rows) {
      await r.click();
      details.push(await pg.evaluate(() => document.querySelector('.sheet-body').innerText));
      await pg.keyboard.press('Escape');
    }
    const states = [];
    const range = await pg.$('input[type=range]');
    if (range) for (const h of [0, 4, 10, 20]) {
      await range.fill(String(h)); await range.dispatchEvent('input');
      states.push(await pg.evaluate(() => document.querySelector('[data-readout]').innerText));
    }
    for (const sgm of await pg.$$('[data-g]')) {
      await sgm.click();
      states.push(await pg.evaluate(() => document.querySelector('[data-gnote]').innerText));
    }
    if (details.length) txt += '\n\n--- Tap-to-open details ---\n' + details.join('\n\n');
    if (states.length) txt += '\n\n--- Interactive states ---\n' + [...new Set(states)].join('\n');
    fs.writeFileSync(`${out}/${p}.txt`, txt);
  }
  await b.close();
})();
