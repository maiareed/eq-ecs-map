const { chromium } = require('playwright');
const out = process.argv[2];
(async () => {
  const b = await chromium.launch(); const errs=[];
  for (const [w,th] of [[390,'light'],[1280,'dark']]) {
    const ctx = await b.newContext({ viewport:{width:w,height:w<500?844:860}, colorScheme:th, hasTouch:w<500 });
    const p = await ctx.newPage(); p.on('pageerror', e=>errs.push(e.message));
    const stageShot = async (sel, name) => { const el = await p.$(sel); await el.screenshot({ path:`${out}/${name}-${w}-${th}.png` }); };
    await p.goto('http://localhost:8765/rx/lab/index.html#beads'); await p.waitForTimeout(600);
    await p.click('text=Oxytocin'); await p.waitForTimeout(3200); await stageShot('#beadStage','x-oxy');
    await p.click('text=BPC-157'); await p.waitForTimeout(3500);
    for (const k of 'LIVFAW') await p.click(`.aa:text-is("${k}")`);
    await p.click('#bFold'); await p.waitForTimeout(5000); await stageShot('#beadStage','x-fold');
    await p.click('#bLine'); await p.waitForTimeout(2800); await stageShot('#beadStage','x-line');
    await p.goto('http://localhost:8765/rx/lab/index.html#spark'); await p.waitForTimeout(800);
    await p.$eval('#age', el=>{el.value=70; el.dispatchEvent(new Event('input'));}); await p.waitForTimeout(9000);
    await p.screenshot({ path:`${out}/x-spark70-${w}-${th}.png` });
    await p.goto('http://localhost:8765/rx/lab/index.html#dial'); await p.waitForTimeout(600);
    await p.click('button[data-dose="50"]'); await p.waitForTimeout(4000);
    await p.screenshot({ path:`${out}/x-dial50-${w}-${th}.png` });
    await p.click('button[data-dose="4.5"]');
    const box = await (await p.$('#dialCanvas')).boundingBox();
    await p.mouse.click(box.x + box.width*0.6, box.y + box.height*0.93); await p.waitForTimeout(1500);
    await stageShot('#dialStage','x-dialnoon');
    await ctx.close();
  }
  console.log(errs.join('\n')||'no errors'); await b.close();
})();
