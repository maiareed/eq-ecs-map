const { chromium } = require('playwright');
const out = process.argv[2]; const only = process.argv[3];
(async () => {
  const b = await chromium.launch();
  const errs = [];
  const views = ['home','beads','spark','dial'];
  const combos = [];
  for (const w of [390,1280]) for (const th of ['light','dark']) combos.push({w,th,rm:false});
  combos.push({w:390,th:'light',rm:true}); combos.push({w:1280,th:'dark',rm:true});
  for (const c of combos) {
    const ctx = await b.newContext({ viewport:{width:c.w,height:c.w<500?844:860}, deviceScaleFactor:1, colorScheme:c.th, reducedMotion:c.rm?'reduce':'no-preference', hasTouch:c.w<500 });
    const p = await ctx.newPage();
    p.on('pageerror', e=>errs.push(`${c.w}${c.th}: ${e.message}`));
    p.on('console', m=>{ if(m.type()==='error') errs.push(`${c.w}${c.th} console: ${m.text()}`)});
    for (const v of views) {
      if (only && v!==only) continue;
      await p.goto(`http://localhost:8765/rx/lab/index.html#${v}`);
      await p.waitForTimeout(v==='home'?800:4500);
      const ov = await p.evaluate(()=>document.documentElement.scrollWidth - innerWidth);
      if (ov>0) errs.push(`${c.w}${c.th} ${v} overflow ${ov}`);
      await p.screenshot({ path:`${out}/${v}-${c.w}-${c.th}${c.rm?'-rm':''}.png`, fullPage:true });
    }
    await ctx.close();
  }
  console.log(errs.join('\n')||'no errors');
  await b.close();
})();
