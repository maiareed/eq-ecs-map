/* Home: the ECS map's line-art figure with three live entry points, over a slow drift of the lab's molecules. */
(function () {
  const g = document.getElementById('figureBody');
  if (g && window.EQ_BODY_SVG) g.innerHTML = window.EQ_BODY_SVG;

  const canvas = document.getElementById('homeCanvas');
  const cv = Lab.canvas(canvas, () => { seed(); draw(); });
  let parts = [], raf = 0, running = false;

  function seed() {
    parts = [];
    const n = Math.round((cv.w * cv.h) / 16000);
    for (let i = 0; i < n; i++) {
      const kind = i % 3; // 0 bead chain, 1 shuttle ring, 2 small ring
      parts.push({ x: Math.random() * cv.w, y: Math.random() * cv.h, a: Math.random() * 6.28, s: 0.6 + Math.random() * 0.8, kind, v: 0.08 + Math.random() * 0.14 });
    }
  }
  function draw(t = 0) {
    const { ctx, w, h } = cv, c = Lab.c;
    ctx.clearRect(0, 0, w, h);
    for (const p of parts) {
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.a + t * 0.00005);
      ctx.globalAlpha = 0.28;
      if (p.kind === 0) {
        for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc((k - 1) * 9 * p.s, Math.sin(k + p.a) * 3, 4.2 * p.s, 0, 6.29); ctx.fillStyle = c.gold; ctx.fill(); }
      } else if (p.kind === 1) {
        ctx.beginPath(); ctx.arc(0, 0, 6 * p.s, 0, 6.29); ctx.lineWidth = 2.4; ctx.strokeStyle = c.gold; ctx.stroke();
      } else {
        hex(ctx, 6 * p.s); ctx.lineWidth = 2.2; ctx.strokeStyle = c.plum; ctx.stroke();
      }
      ctx.restore();
    }
  }
  function hex(ctx, r) { ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); }
  function loop(t) {
    for (const p of parts) { p.y -= p.v; p.x += Math.sin(t * 0.0003 + p.a) * 0.12; if (p.y < -20) { p.y = cv.h + 20; p.x = Math.random() * cv.w; } }
    draw(t);
    if (running) raf = requestAnimationFrame(loop);
  }
  Lab.onTheme(() => draw());
  Lab.view('home', {
    start() { cv.fit(); if (Lab.reduced) { draw(); return; } running = true; cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); },
    stop() { running = false; cancelAnimationFrame(raf); },
  });
})();
