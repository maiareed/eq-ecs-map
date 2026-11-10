/* The Dial: opioid receptors through a day after a bedtime naltrexone dose. The block curve uses the label's
   4 h (naltrexone) and 13 h (6-beta-naltrexol) half-lives in a simple one-compartment sketch; the endorphin
   rebound is the leading theory, drawn dotted. Conceptual, not pharmacokinetic data. */
(function () {
  const stage = document.getElementById('dialStage');
  const canvas = document.getElementById('dialCanvas');
  const cap = document.getElementById('dialCap');
  const blockOut = document.getElementById('blockOut');
  const clockOut = document.getElementById('clockOut');
  const playBtn = document.getElementById('dialPlay');
  const seg = document.getElementById('doseSeg');
  const tip = Lab.tip(stage);
  const cv = Lab.canvas(canvas, () => { layout(); if (Lab.reduced || !playing) arrangeStill(); draw(); });

  /* ---------- model ---------- */
  const ke = Math.LN2 / 4, km = Math.LN2 / 13, ka = 1.8, kam = 0.6, K = 1.6;
  function X(D, t) { let s = 0; for (let d = 0; d <= t; d += 24) { const u = t - d; s += D * (Math.exp(-ke * u) - Math.exp(-ka * u)) * 1.25 + D * 0.08 * (Math.exp(-km * u) - Math.exp(-kam * u)); } return s; }
  const curves = {};
  function curve(D) {
    if (curves[D]) return curves[D];
    const dt = 0.1, O = [], Sg = [], Ea = [];
    let B = 0;
    for (let i = 0; i <= 720; i++) { // three days; keep the third
      const t = i * dt, x = X(D, t), o = x / (x + K);
      B += (o - B) / 8 * dt;
      const E = 1 + 1.6 * B;
      if (t >= 48) { O.push(o); Sg.push((1 - o) * E); Ea.push(E); }
    }
    return (curves[D] = { O, S: Sg, E: Ea });
  }
  const at = (arr, t) => { const i = Math.max(0, Math.min(arr.length - 1, Math.round(t * 10))); return arr[i]; };

  let dose = 4.5, t = 0, playing = !Lab.reduced, running = false, raf = 0, last = 0, played = 0;
  let G = {}, recs = [], nal = [], endo = [], grab = null, scrub = false, capKey = '';

  function layout() {
    const w = cv.w, h = cv.h; if (!w) return;
    const sceneH = Math.round(h * 0.58);
    const mem = Math.round(sceneH * 0.7);
    const n = Math.max(5, Math.min(14, Math.floor((w - 30) / 60)));
    const gap = (w - 40) / n;
    G = { w, h, sceneH, mem, top: 96, chart: { x0: 54, x1: w - 18, y0: sceneH + 34, y1: h - 66 } };
    const prev = recs;
    recs = [];
    for (let i = 0; i < n; i++) recs.push({ x: 20 + gap * (i + 0.5), y: mem - 24, nal: null, endo: null, glow: 0, bump: 0 });
    if (prev.length !== n) { nal.forEach((p) => (p.rec = null)); endo.forEach((p) => (p.rec = null)); }
    if (!endo.length) seedEndo();
  }
  function seedEndo() { endo = []; for (let i = 0; i < 9; i++) endo.push(mkP('endo')); }
  function mkP(kind, x, y) {
    return { kind, x: x ?? 20 + Math.random() * (G.w - 40), y: y ?? G.top + Math.random() * (G.mem - G.top - 70), vx: (Math.random() - 0.5) * 30, vy: (Math.random() - 0.5) * 30, rec: null, hold: 0, cool: 0, a: Math.random() * 6.28, fade: 1, leaving: false, manual: false };
  }

  /* ---------- sim ---------- */
  function occ() { return at(curve(dose).O, t); }
  function sig() { return at(curve(dose).S, t); }
  function sim(dt) {
    const o = dose ? occ() : 0;
    const n = recs.length;
    const want = Math.round(o * n);
    const blocked = recs.filter((r) => r.nal).length;
    // free-floating naltrexone roughly tracks how much is around
    const floatWant = dose ? Math.round(2 + 8 * o) : 0;
    const floating = nal.filter((p) => !p.rec && !p.leaving && !p.seeking);
    if (floating.length < floatWant && nal.length < 26) nal.push(mkP('nal', 20 + Math.random() * (G.w - 40), G.top - 10));
    if (floating.length > floatWant + 1) floating[0].leaving = true;
    if (blocked + nal.filter((p) => p.seeking).length < want) {
      const free = recs.filter((r) => !r.nal && !r.claim);
      const p = floating.find((q) => !q.seeking) || (nal.push(mkP('nal', 20 + Math.random() * (G.w - 40), G.top - 10)), nal[nal.length - 1]);
      if (free.length && p) { const r = free[Math.floor(Math.random() * free.length)]; p.seeking = r; r.claim = p; }
    } else if (blocked > want) {
      const r = recs.find((q) => q.nal && !q.nal.manual);
      if (r) { const p = r.nal; r.nal = null; p.rec = null; p.vy = -60; p.vx = (Math.random() - 0.5) * 40; p.leaving = Math.random() < 0.5; }
    }
    for (let i = nal.length - 1; i >= 0; i--) {
      const p = nal[i];
      if (p === grab?.p) continue;
      if (p.rec) { p.x = p.rec.x; p.y = p.rec.y - 2; if (p.manual) { p.hold -= dt; if (p.hold <= 0) { p.manual = false; } } continue; }
      if (p.seeking) {
        const r = p.seeking; const dx = r.x - p.x, dy = r.y - 2 - p.y, d = Math.hypot(dx, dy);
        if (r.nal || !dose) { r.claim = null; p.seeking = null; continue; }
        if (d < 6) { r.nal = p; p.rec = r; r.claim = null; p.seeking = null; if (r.endo) kick(r.endo, r); continue; }
        p.x += dx / d * Math.min(d, 140 * dt); p.y += dy / d * Math.min(d, 140 * dt); continue;
      }
      drift(p, dt);
      if (p.leaving) { p.fade -= dt * 0.8; if (p.fade <= 0) { nal.splice(i, 1); } }
    }
    if (!dose) nal.forEach((p) => { if (p.rec && !p.manual) { p.rec.nal = null; p.rec = null; p.leaving = true; } });
    // endorphins: supply follows the theory line
    const eWant = Math.round(6 + 6 * (dose ? at(curve(dose).E, t) - 1 : 0));
    if (endo.length < Math.min(14, eWant)) endo.push(mkP('endo', 20 + Math.random() * (G.w - 40), G.top - 10));
    if (endo.length > eWant + 1) { const p = endo.find((q) => !q.rec); if (p) p.leaving = true; }
    for (let i = endo.length - 1; i >= 0; i--) {
      const p = endo[i];
      if (p === grab?.p) continue;
      p.cool -= dt;
      if (p.rec) { p.hold -= dt; p.x = p.rec.x; p.y = p.rec.y - 6; p.rec.glow = 1; if (p.hold <= 0) kick(p, p.rec); continue; }
      drift(p, dt);
      if (p.y > G.mem - 52 && p.cool <= 0) {
        for (const r of recs) if (Math.abs(r.x - p.x) < 18) {
          if (r.nal) { p.vy = -Math.abs(p.vy) - 40; r.bump = 1; p.cool = 0.6; }
          else if (!r.endo) { r.endo = p; p.rec = r; p.hold = 1.1 + Math.random() * 0.6; }
          break;
        }
      }
      if (p.leaving) { p.fade -= dt * 0.8; if (p.fade <= 0) endo.splice(i, 1); }
    }
    for (const r of recs) { r.glow = Math.max(0, r.glow - dt * 1.4); r.bump = Math.max(0, r.bump - dt * 2.5); if (r.endo) r.glow = 1; }
  }
  function kick(p, r) { r.endo = null; p.rec = null; p.vy = -70; p.vx = (Math.random() - 0.5) * 60; p.cool = 1.4; }
  function drift(p, dt) {
    p.vx += (Math.random() - 0.5) * 80 * dt; p.vy += (Math.random() - 0.5) * 80 * dt + 10 * dt;
    const sp = Math.hypot(p.vx, p.vy), max = 60; if (sp > max) { p.vx *= max / sp; p.vy *= max / sp; }
    p.x += p.vx * dt; p.y += p.vy * dt; p.a += dt;
    if (p.x < 14) { p.x = 14; p.vx *= -1; } if (p.x > G.w - 14) { p.x = G.w - 14; p.vx *= -1; }
    if (p.y < G.top) { p.y = G.top; p.vy = Math.abs(p.vy); } if (p.y > G.mem - 40) { p.y = G.mem - 40; p.vy = -Math.abs(p.vy); }
  }
  function arrangeStill() {
    // A designed still: receptors blocked per the model, endorphins docked on every other open receptor.
    if (!G.w) return;
    recs.forEach((r) => { r.nal = null; r.endo = null; r.claim = null; r.glow = 0; });
    nal = []; endo = [];
    const o = dose ? occ() : 0, want = Math.round(o * recs.length);
    const order = recs.map((r, i) => i).sort((a, b) => ((a * 7) % recs.length) - ((b * 7) % recs.length));
    for (let k = 0; k < want; k++) { const r = recs[order[k]]; const p = mkP('nal', r.x, r.y - 2); p.rec = r; r.nal = p; nal.push(p); }
    let alt = 0;
    recs.forEach((r) => { if (!r.nal && alt++ % 2 === 0) { const p = mkP('endo', r.x, r.y - 6); p.rec = r; p.hold = 1e9; r.endo = p; r.glow = 1; endo.push(p); } });
    const floatN = dose ? Math.round(2 + 6 * o) : 0;
    for (let i = 0; i < floatN; i++) nal.push(mkP('nal', 30 + ((i * 97) % (G.w - 60)), G.top + 20 + ((i * 53) % (G.mem - G.top - 100))));
    for (let i = 0; i < 4; i++) endo.push(mkP('endo', 50 + ((i * 131) % (G.w - 100)), G.top + 40 + ((i * 71) % (G.mem - G.top - 110))));
  }

  /* ---------- draw ---------- */
  function draw() {
    const { ctx, w, h } = cv, c = Lab.c; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const mem = G.mem;
    // inside-the-cell wash
    ctx.fillStyle = Lab.alpha(c.plum, c.dark ? 0.08 : 0.05); ctx.fillRect(0, mem, w, G.sceneH - mem);
    // membrane: two rows of lipid heads
    for (const yy of [mem - 7, mem + 7]) { ctx.fillStyle = Lab.alpha(c.stroke, 0.55); for (let x = 4; x < w; x += 11) { ctx.beginPath(); ctx.arc(x, yy, 3.6, 0, 6.29); ctx.fill(); } }
    ctx.strokeStyle = Lab.alpha(c.stroke, 0.25); ctx.lineWidth = 1; for (let x = 4; x < w; x += 11) { ctx.beginPath(); ctx.moveTo(x, mem - 4); ctx.lineTo(x, mem + 4); ctx.stroke(); }
    lab(ctx, 'Outside the nerve cell', 16, G.top - 22, c.dim, 'left');
    lab(ctx, 'Inside the cell', w - 16, mem + 50, c.dim, 'right');
    // receptors
    for (const r of recs) {
      if (r.glow > 0) {
        const g = ctx.createRadialGradient(r.x, mem + 26, 2, r.x, mem + 26, 40);
        g.addColorStop(0, Lab.alpha(c.gold, 0.7 * r.glow)); g.addColorStop(1, Lab.alpha(c.gold, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(r.x, mem + 26, 40, 0, 6.29); ctx.fill();
      }
      ctx.save(); ctx.translate(r.x + Math.sin(r.bump * 20) * r.bump * 2, 0);
      ctx.strokeStyle = r.nal ? c.plum : c.ink; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-14, r.y - 10); ctx.quadraticCurveTo(-14, r.y + 10, 0, r.y + 10); ctx.quadraticCurveTo(14, r.y + 10, 14, r.y - 10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, r.y + 10); ctx.lineTo(0, mem + 16); ctx.stroke();
      ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, mem + 16); ctx.quadraticCurveTo(6, mem + 22, 0, mem + 28); ctx.stroke();
      ctx.restore();
    }
    // molecules
    for (const p of endo) drawEndo(ctx, p);
    for (const p of nal) drawNal(ctx, p);
    drawChart(ctx);
  }
  function drawEndo(ctx, p) {
    const c = Lab.c; ctx.save(); ctx.globalAlpha = Math.max(0, p.fade); ctx.translate(p.x, p.y); ctx.rotate(p.rec ? 0 : Math.sin(p.a) * 0.6);
    ctx.fillStyle = c.gold; for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.arc(k * 8, Math.abs(k) * 3, 5, 0, 6.29); ctx.fill(); }
    ctx.restore();
  }
  function drawNal(ctx, p) {
    const c = Lab.c; ctx.save(); ctx.globalAlpha = Math.max(0, p.fade); ctx.translate(p.x, p.y); ctx.rotate(p.rec ? 0 : p.a);
    ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * 9, Math.sin(a) * 9); } ctx.closePath();
    ctx.fillStyle = p.rec ? Lab.alpha(c.plum, 0.35) : c.panel; ctx.fill(); ctx.lineWidth = 3.4; ctx.strokeStyle = c.plum; ctx.stroke();
    ctx.restore();
  }
  function lab(ctx, s, x, y, col, al = 'center', font = '700 16px Nunito, sans-serif') {
    ctx.font = font; ctx.textAlign = al; ctx.textBaseline = 'middle'; ctx.lineWidth = 5; ctx.strokeStyle = Lab.c.panel; ctx.strokeText(s, x, y); ctx.fillStyle = col; ctx.fillText(s, x, y);
  }
  function drawChart(ctx) {
    const c = Lab.c, C = G.chart, w = G.w;
    // divider
    ctx.strokeStyle = c.line; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, G.sceneH); ctx.lineTo(w, G.sceneH); ctx.stroke();
    const H = C.y1 - C.y0, h1 = H * 0.5, gap = 42, h2 = H - h1 - gap;
    const X = (tt) => C.x0 + (tt / 24) * (C.x1 - C.x0);
    const Y1 = (v) => C.y0 + h1 - v * h1;
    const base2 = C.y0 + h1 + gap, Y2 = (v) => base2 + h2 - (Math.min(1.4, v) / 1.4) * h2;
    lab(ctx, 'Receptors blocked', 16, C.y0 - 16, c.ink, 'left');
    lab(ctx, 'Your own signal · theory', 16, base2 - 14, c.ink, 'left');
    // gridlines
    ctx.strokeStyle = Lab.alpha(c.stroke, 0.25); ctx.setLineDash([2, 4]);
    for (const v of [0, 0.5, 1]) { ctx.beginPath(); ctx.moveTo(C.x0, Y1(v)); ctx.lineTo(C.x1, Y1(v)); ctx.stroke(); }
    ctx.setLineDash([]);
    lab(ctx, '100%', C.x0 - 8, Y1(1), c.dim, 'right', '600 15px Nunito, sans-serif');
    lab(ctx, '0', C.x0 - 8, Y1(0), c.dim, 'right', '600 15px Nunito, sans-serif');
    // usual-signal baseline
    ctx.strokeStyle = Lab.alpha(c.stroke, 0.5); ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.moveTo(C.x0, Y2(1)); ctx.lineTo(C.x1, Y2(1)); ctx.stroke(); ctx.setLineDash([]);
    lab(ctx, 'usual', C.x0 - 8, Y2(1), c.dim, 'right', '600 15px Nunito, sans-serif');
    // 50 mg ghost for comparison
    if (dose !== 50) {
      const g = curve(50);
      ctx.strokeStyle = Lab.alpha(c.plum, 0.45); ctx.lineWidth = 1.6; ctx.setLineDash([5, 5]);
      ctx.beginPath(); g.O.forEach((v, i) => { const x = X(i / 10); i ? ctx.lineTo(x, Y1(v)) : ctx.moveTo(x, Y1(v)); }); ctx.stroke(); ctx.setLineDash([]);
      lab(ctx, '50 mg', C.x1 - 4, Y1(at(g.O, 23)) - 14, Lab.alpha(c.plum, 0.9), 'right', '700 15px Nunito, sans-serif');
    }
    const cur = dose ? curve(dose) : { O: new Array(241).fill(0), S: new Array(241).fill(1) };
    // block area
    ctx.beginPath(); ctx.moveTo(X(0), Y1(0)); cur.O.forEach((v, i) => ctx.lineTo(X(i / 10), Y1(v))); ctx.lineTo(X(24), Y1(0)); ctx.closePath();
    ctx.fillStyle = Lab.alpha(c.plum, 0.22); ctx.fill();
    ctx.beginPath(); cur.O.forEach((v, i) => { const x = X(i / 10); i ? ctx.lineTo(x, Y1(v)) : ctx.moveTo(x, Y1(v)); }); ctx.strokeStyle = c.plum; ctx.lineWidth = 3; ctx.stroke();
    // signal (theory, dotted)
    ctx.beginPath(); cur.S.forEach((v, i) => { const x = X(i / 10); i ? ctx.lineTo(x, Y2(v)) : ctx.moveTo(x, Y2(v)); });
    ctx.strokeStyle = c.gold_ink; ctx.lineWidth = 3; ctx.setLineDash([1, 6]); ctx.lineCap = 'round'; ctx.stroke(); ctx.setLineDash([]);
    // time axis
    (w < 520 ? [[0, '10 pm'], [8, '6 am'], [16, '2 pm'], [24, '10 pm']] : [[0, '10 pm'], [6, '4 am'], [12, '10 am'], [18, '4 pm'], [24, '10 pm']]).forEach(([tt, s], i, a) => lab(ctx, s, X(tt), C.y1 + 22, c.dim, i === 0 ? 'left' : i === a.length - 1 ? 'right' : 'center', '600 15px Nunito, sans-serif'));
    // dose marker
    ctx.fillStyle = c.plum; ctx.beginPath(); ctx.moveTo(X(0), C.y1 + 4); ctx.lineTo(X(0) + 6, C.y1 + 12); ctx.lineTo(X(0) - 6, C.y1 + 12); ctx.fill();
    // playhead
    const px = X(t);
    ctx.strokeStyle = c.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px, C.y0 - 4); ctx.lineTo(px, C.y1 + 4); ctx.stroke();
    ctx.beginPath(); ctx.arc(px, Y1(at(cur.O, t)), 7, 0, 6.29); ctx.fillStyle = c.plum; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = c.panel; ctx.stroke();
    ctx.beginPath(); ctx.arc(px, Y2(at(cur.S, t)), 6, 0, 6.29); ctx.fillStyle = c.gold_ink; ctx.fill(); ctx.stroke();
  }

  /* ---------- readouts & captions ---------- */
  function clock(tt) { const hr = (22 + tt) % 24, H = Math.floor(hr), M = Math.floor((hr - H) * 60 / 15) * 15; const h12 = ((H + 11) % 12) + 1; return `${h12}:${String(M).padStart(2, '0')} ${H < 12 ? 'am' : 'pm'}`; }
  function readouts() {
    const o = dose ? occ() : 0;
    blockOut.textContent = `${Math.round(o * 100)}% blocked`;
    clockOut.textContent = clock(t);
    const s = sig();
    let key;
    if (!dose) key = 'off';
    else if (dose === 50) key = 'fifty';
    else if (o > 0.4) key = 'block';
    else if (s > 1.03) key = 'rebound';
    else key = 'clearing';
    if (key === capKey) return; capKey = key;
    const set = (tier, h, p, th) => (cap.innerHTML = `<span class="tier${th ? ' theory' : ''}">${tier}</span><h2>${h}</h2><p>${p}</p>`);
    if (key === 'off') set('Established biology', 'Your own signal', 'Endorphins are your body\'s own opioids, and they\'re peptides too. They dock on opioid receptors, switch them on for a moment, and let go. That\'s the gold glow inside the cell.');
    if (key === 'block') set('FDA label', 'The block', 'Naltrexone fits the same receptors but doesn\'t switch them on. While it sits there, your endorphins bounce off. At a low dose this lasts a few hours, mostly while you sleep.');
    if (key === 'clearing') set('FDA label', 'Clearing out', 'Your body clears about half the naltrexone every 4 hours, so a small dose lets go of the receptors by morning.');
    if (key === 'rebound') set('Leading theory', 'The rebound', 'As the small dose clears, receptors open up again. The leading theory is that the short block prompts your body to make more endorphins and more receptors, so the signal comes back stronger. It hasn\'t been confirmed in controlled human trials.', true);
    if (key === 'fifty') set('FDA label', 'A block that holds', 'At 50 mg the block lasts around the clock, and the signal stays low. That\'s the job of the standard dose: keeping opioids from working all day. LDN aims for the opposite, a short block that lifts.');
  }

  /* ---------- controls ---------- */
  seg.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    dose = +b.dataset.dose;
    seg.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b));
    if (dose === 50) Lab.done('t-50');
    played = 0; capKey = '';
    if (Lab.reduced || !playing) arrangeStill();
    readouts(); draw();
  });
  function setPlaying(p) {
    playing = p; playBtn.setAttribute('aria-pressed', p); playBtn.textContent = p ? 'Pause the day' : 'Play the day';
    if (p && running && !raf) { last = 0; raf = requestAnimationFrame(loop); }
  }
  playBtn.addEventListener('click', () => setPlaying(!playing));

  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    const p = Lab.pt(e, canvas);
    if (p.y > G.sceneH) { scrub = true; setT(p.x); return; }
    let best = null, bd = 36;
    for (const q of [...nal, ...endo]) { const d = Math.hypot(q.x - p.x, q.y - p.y); if (d < bd) { bd = d; best = q; } }
    if (best) {
      if (best.rec) { const r = best.rec; if (best.kind === 'nal') r.nal = null; else r.endo = null; best.rec = null; best.manual = false; }
      if (best.seeking) { best.seeking.claim = null; best.seeking = null; }
      best.leaving = false; best.fade = 1;
      grab = { p: best, moved: false, x: p.x, y: p.y };
    } else {
      // tap on a receptor explains it
      const r = recs.find((q) => Math.abs(q.x - p.x) < 20 && Math.abs(q.y - p.y) < 34);
      if (r) tip.show(p.x, p.y, 'Opioid receptor', r.nal ? 'Blocked by naltrexone. Endorphins can\'t land here.' : 'Open. When an endorphin docks, it signals inside the cell.');
    }
  });
  canvas.addEventListener('pointermove', (e) => {
    const p = Lab.pt(e, canvas);
    if (scrub) { setT(p.x); return; }
    if (grab) { grab.p.x = p.x; grab.p.y = Math.min(p.y, G.mem - 10); if (Math.hypot(p.x - grab.x, p.y - grab.y) > 6) grab.moved = true; if (!raf) draw(); }
  });
  const up = (e) => {
    if (scrub) { scrub = false; return; }
    if (!grab) return;
    const q = grab.p, moved = grab.moved; grab = null;
    if (!q) return;
    const r = recs.find((rr) => Math.abs(rr.x - q.x) < 26 && Math.abs(rr.y - q.y) < 40);
    if (r) {
      if (q.kind === 'nal' && !r.nal) { if (r.endo) kick(r.endo, r); r.nal = q; q.rec = r; q.manual = true; q.hold = 5; Lab.done('t-drag'); tip.show(r.x, r.y - 20, 'Docked, but silent', 'Naltrexone fits the lock and doesn\'t turn it.'); }
      else if (q.kind === 'endo' && !r.nal && !r.endo) { r.endo = q; q.rec = r; q.hold = Lab.reduced ? 1e9 : 2.5; r.glow = 1; Lab.done('t-drag'); tip.show(r.x, r.y - 20, 'Signal on', 'An endorphin docked and switched the receptor on.'); }
      else if (q.kind === 'endo' && r.nal) { q.vy = -80; r.bump = 1; tip.show(r.x, r.y - 20, 'Bounced off', 'This receptor is blocked, so the endorphin can\'t land.'); }
    } else if (!moved) {
      tip.show(q.x, q.y, q.kind === 'nal' ? 'Naltrexone' : 'Endorphin', q.kind === 'nal' ? 'A small molecule, not a peptide. It fits opioid receptors without switching them on.' : 'One of your own opioid peptides. It switches the receptor on, briefly.');
    }
    draw();
  };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  function setT(x) {
    const C = G.chart; t = Math.max(0, Math.min(23.9, ((x - C.x0) / (C.x1 - C.x0)) * 24));
    if (playing) setPlaying(false);
    arrangeStill(); readouts(); draw();
  }

  /* ---------- loop ---------- */
  function loop(now) {
    raf = 0;
    if (!running) return;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now;
    if (playing) { t += dt * 0.8; played += dt * 0.8; if (t >= 24) t -= 24; if (dose === 4.5 && played > 12) Lab.done('t-45'); }
    sim(dt); readouts(); draw();
    raf = requestAnimationFrame(loop);
  }
  Lab.onTheme(() => draw());
  let inited = false;
  Lab.view('dial', {
    start() {
      cv.fit(); layout();
      if (!inited) { inited = true; t = Lab.reduced ? 2 : 0.5; arrangeStill(); }
      running = true; readouts(); draw();
      if (Lab.reduced) { playing = false; playBtn.hidden = true; return; }
      last = 0; cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
    },
    stop() { running = false; cancelAnimationFrame(raf); raf = 0; },
  });
})();
