/* The Spark: NAD+ as a shuttle. Empty NAD+ loads electrons from fuel (becoming NADH), unloads at the mitochondrion
   (a spark of ATP), and is broken apart by CD38, sirtuins and PARPs, then rebuilt by the recycler. Age turns up CD38. */
(function () {
  const stage = document.getElementById('sparkStage');
  const canvas = document.getElementById('sparkCanvas');
  const cap = document.getElementById('sparkCap');
  const ageIn = document.getElementById('age');
  const ageOut = document.getElementById('ageOut');
  const energyOut = document.getElementById('energyOut');
  const poolOut = document.getElementById('poolOut');
  const pauseBtn = document.getElementById('sparkPause');
  const line = document.getElementById('sparkLine');
  const lineCv = Lab.canvas(line, () => drawLine());
  const tip = Lab.tip(stage);
  const cv = Lab.canvas(canvas, () => { layout(); calibrate(); still(); });

  let G = {}, S = [], F = [], N = [], SP = [], E = [], P = [];
  let age = 35, running = false, paused = false, raf = 0, last = 0, simT = 0;
  let base = 30, fuelRate = 1, fuelAcc = 0, recQueue = 0, recAcc = 0, deNovoAcc = 0;
  let ref = 1, delivered = [], offered = [], energy = 100, hist = [], topUpAt = -1e9, capState = '';
  const rnd = mulberry(7);

  function mulberry(a) { return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const ageT = () => (age - 30) / 45;
  const target = () => Math.round(base * (1 - 0.5 * ageT()));
  const cd38Rate = () => 0.006 * (1 + 3.2 * ageT());
  const otherRate = 0.005;

  /* ---------- geometry ---------- */
  function layout() {
    const W = cv.w, H = cv.h; if (!W) return;
    const m = 10;
    const a = Math.min(W * 0.36, H * 0.30, 300), b = a * 0.44;
    G = {
      W, H, m,
      nuc: { x: W * 0.12, y: H * 0.1, r: Math.min(W, H) * 0.28 },
      mito: { x: W * 0.56, y: H * 0.64, a, b, rot: -0.18 },
      rec: { x: W * 0.5, y: H * 0.29 },
      cd38: [{ x: W - m, y: H * 0.34 }, { x: W * 0.22, y: H - m }, { x: W - m, y: H * 0.9 }],
    };
    const n = G.nuc;
    const ang1 = 0.55, ang2 = 1.15;
    G.sirt = { x: n.x + Math.cos(ang1) * n.r, y: n.y + Math.sin(ang1) * n.r };
    G.parp = { x: n.x + Math.cos(ang2) * n.r, y: n.y + Math.sin(ang2) * n.r };
    base = Math.round(Math.max(20, Math.min(40, (W * H) / 9000)));
    const speed = a * 0.32; // px per second
    G.speed = speed;
    const T = (2.2 * a) / speed + 0.4;
    fuelRate = 0.12 * base + 0 * T;
    if (!S.length) seed();
  }
  function mitoPoint(u, v) { // u,v in [-1,1] ellipse coords -> world
    const M = G.mito, c = Math.cos(M.rot), s = Math.sin(M.rot);
    const x = u * M.a, y = v * M.b; return { x: M.x + x * c - y * s, y: M.y + x * s + y * c };
  }
  function inMito(x, y, pad = 0) {
    const M = G.mito, c = Math.cos(-M.rot), s = Math.sin(-M.rot), dx = x - M.x, dy = y - M.y;
    const u = (dx * c - dy * s) / (M.a + pad), v = (dx * s + dy * c) / (M.b + pad); return u * u + v * v <= 1;
  }
  function randomCell() {
    // wander mostly around the mitochondrion, sometimes anywhere in the cell
    if (rnd() < 0.7) { const t = rnd() * 6.283, k = 1.1 + rnd() * 0.7; const p = mitoPoint(Math.cos(t) * k, Math.sin(t) * k); return { x: Math.max(30, Math.min(G.W - 30, p.x)), y: Math.max(40, Math.min(G.H - 40, p.y)) }; }
    return { x: G.m + 30 + rnd() * (G.W - 60 - G.m * 2), y: G.m + 40 + rnd() * (G.H - 80 - G.m * 2) };
  }
  function rimPoint() { const t = rnd() * 6.283; return mitoPoint(Math.cos(t) * 1.08, Math.sin(t) * 1.15); }
  function cristaPoint() { const u = (rnd() * 1.5 - 0.75), v = Math.sin(u * 9) * 0.45; return mitoPoint(u, v); }

  function seed() {
    S = []; F = []; N = []; SP = []; E = []; P = []; recQueue = 0; delivered = []; offered = []; hist = [];
    const n = target();
    for (let i = 0; i < n; i++) { const p = randomCell(); S.push(mkShuttle(p.x, p.y, rnd() < 0.4)); }
    for (let i = 0; i < 4; i++) { const p = rimPoint(); F.push({ x: p.x, y: p.y, tx: p.x, ty: p.y, wait: true, claimed: null }); }
  }
  function mkShuttle(x, y, loaded) { return { x, y, st: loaded ? 'loaded' : 'free', tx: x, ty: y, fuel: null, wt: 0, ph: rnd() * 6.28, ...(loaded ? cristaTarget() : {}) }; }
  function cristaTarget() { const p = cristaPoint(); return { tx: p.x, ty: p.y }; }

  /* ---------- simulation ---------- */
  function seek(o, dt, sp) {
    const dx = o.tx - o.x, dy = o.ty - o.y, d = Math.hypot(dx, dy);
    if (d < 1) return true;
    const st = Math.min(d, sp * dt);
    o.x += (dx / d) * st + (rnd() - 0.5) * 0.8; o.y += (dy / d) * st + (rnd() - 0.5) * 0.8;
    return d < 7;
  }
  function sim(dt) {
    simT += dt;
    const sp = G.speed;
    // fuel arrives from the bloodstream side and waits on the mitochondrion's rim
    fuelAcc += fuelRate * dt;
    while (fuelAcc >= 1) {
      fuelAcc -= 1;
      offered.push(simT);
      if (F.length > 40) continue;
      const th = rnd() * 6.283, p = mitoPoint(Math.cos(th) * 1.08, Math.sin(th) * 1.15), q = mitoPoint(Math.cos(th) * 1.75, Math.sin(th) * 2.2);
      F.push({ x: Math.max(16, Math.min(G.W - 16, q.x)), y: Math.max(20, Math.min(G.H - 20, q.y)), tx: p.x, ty: p.y, wait: false, claimed: null });
    }
    for (let i = F.length - 1; i >= 0; i--) {
      const f = F[i];
      if (f.spoil) { f.fade = (f.fade ?? 1) - dt * 2; if (f.fade <= 0) F.splice(i, 1); continue; }
      if (!f.wait && seek(f, dt, sp * 1.1)) {
        f.wait = true;
        if (F.filter((q) => q.wait && !q.spoil).length > 14) f.spoil = true; // unused fuel goes elsewhere
      }
    }

    // consumers break shuttles apart
    const count = S.length;
    const consume = (rate, site, who) => {
      if (rnd() < rate * count * dt) {
        const free = S.filter((s) => s.st === 'free');
        if (!free.length) return;
        let best = free[0], bd = 1e9; for (const s of free) { const d = Math.hypot(s.x - site.x, s.y - site.y); if (d < bd) { bd = d; best = s; } }
        if (best.fuel) { best.fuel.claimed = null; best.fuel = null; }
        best.st = 'captured'; best.site = site; best.who = who; best.tx = site.x; best.ty = site.y;
      }
    };
    G.cd38.forEach((c) => consume(cd38Rate() / 3, c, 'cd38'));
    consume(otherRate / 2, G.sirt, 'sirt'); consume(otherRate / 2, G.parp, 'parp');

    for (let i = S.length - 1; i >= 0; i--) {
      const s = S[i];
      s.ph += dt * 3;
      if (s.st === 'free') {
        if (!s.fuel) {
          let best = null, bd = 1e9;
          for (const f of F) if (f.wait && !f.claimed && !f.spoil) { const d = Math.hypot(f.x - s.x, f.y - s.y); if (d < bd) { bd = d; best = f; } }
          if (best) { best.claimed = s; s.fuel = best; s.tx = best.x; s.ty = best.y; }
          else { s.wt -= dt; if (s.wt <= 0) { const p = randomCell(); s.tx = p.x; s.ty = p.y; s.wt = 1.5 + rnd() * 2; } }
        }
        if (seek(s, dt, s.fuel ? sp : sp * 0.35) && s.fuel) {
          F.splice(F.indexOf(s.fuel), 1); s.fuel = null; s.st = 'loaded'; Object.assign(s, cristaTarget());
        }
      } else if (s.st === 'loaded') {
        if (seek(s, dt, sp * 0.9)) {
          // drop off electrons: two dots run the inner membrane, then a spark of ATP
          const end = mitoPoint(Math.sign(rnd() - 0.5) * (0.5 + rnd() * 0.4), (rnd() < 0.5 ? -1 : 1) * 0.92);
          E.push({ x: s.x, y: s.y, sx: s.x, sy: s.y, ex: end.x, ey: end.y, t: 0 });
          s.st = 'free'; s.wt = 0; delivered.push(simT);
        }
      } else if (s.st === 'captured') {
        if (seek(s, dt, sp * 0.7)) {
          P.push({ x: s.x, y: s.y, t: 0, who: s.who });
          N.push({ x: s.x, y: s.y, tx: G.rec.x, ty: G.rec.y, t: 0 });
          S.splice(i, 1);
        }
      }
    }
    for (let i = N.length - 1; i >= 0; i--) { const n = N[i]; n.t += dt; if (seek(n, dt, sp * 0.4)) { N.splice(i, 1); recQueue++; P.push({ x: G.rec.x, y: G.rec.y, t: 0, who: 'rec' }); } }
    // recycler rebuilds NAD+ while the cell is below its set point; above it, spent pieces are let go
    recAcc += dt;
    if (recAcc > 0.5) {
      recAcc = 0;
      if (recQueue > 0 && S.length < target()) { recQueue--; S.push(mkShuttle(G.rec.x, G.rec.y, false)); }
      else if (recQueue > 3) recQueue--;
    }
    deNovoAcc += dt;
    if (deNovoAcc > 2.2) { deNovoAcc = 0; if (S.length < target() - 2) S.push(mkShuttle(G.rec.x, G.rec.y, false)); }

    for (let i = E.length - 1; i >= 0; i--) {
      const e = E[i]; e.t += dt * 1.6;
      const k = Math.min(1, e.t); e.x = e.sx + (e.ex - e.sx) * k; e.y = e.sy + (e.ey - e.sy) * k;
      if (e.t >= 1) { E.splice(i, 1); SP.push({ x: e.ex, y: e.ey, t: 0, vx: (e.ex - G.mito.x) * 0.25, vy: (e.ey - G.mito.y) * 0.25 }); }
    }
    for (let i = SP.length - 1; i >= 0; i--) { const p = SP[i]; p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.t > 1.6) SP.splice(i, 1); }
    for (let i = P.length - 1; i >= 0; i--) { P[i].t += dt; if (P[i].t > 0.9) P.splice(i, 1); }

    // energy: drop-offs in the last 10 s against the fuel on offer
    while (delivered.length && delivered[0] < simT - 12) delivered.shift();
    while (offered.length && offered[0] < simT - 12) offered.shift();
    const e = simT > 6 ? (delivered.length / Math.min(12, simT)) / ref * 100 : energy;
    energy += (Math.min(110, e) - energy) * Math.min(1, dt * 0.8);
  }

  /* ---------- drawing ---------- */
  function drawCell() {
    const { ctx } = cv, c = Lab.c, W = G.W, H = G.H, m = G.m;
    ctx.clearRect(0, 0, W, H);
    // cytoplasm
    ctx.fillStyle = Lab.alpha(c.gold, c.dark ? 0.05 : 0.06);
    round(ctx, m, m, W - 2 * m, H - 2 * m, 30); ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = Lab.alpha(c.stroke, 0.35); ctx.stroke();
    ctx.lineWidth = 1.5; ctx.strokeStyle = Lab.alpha(c.stroke, 0.6); round(ctx, m + 6, m + 6, W - 2 * m - 12, H - 2 * m - 12, 25); ctx.stroke();
    // nucleus
    const n = G.nuc;
    ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, 6.29); ctx.fillStyle = Lab.alpha(c.plum, c.dark ? 0.10 : 0.07); ctx.fill();
    ctx.lineWidth = 2; ctx.setLineDash([2, 5]); ctx.strokeStyle = Lab.alpha(c.plum, 0.6); ctx.stroke(); ctx.setLineDash([]);
    // DNA scribble inside nucleus
    ctx.strokeStyle = Lab.alpha(c.plum, 0.35); ctx.lineWidth = 1.6; ctx.beginPath();
    for (let i = 0; i < 70; i++) { const t = i / 70, a = 0.15 + t * 1.2, rr = n.r * (0.25 + 0.5 * t); const x = n.x + Math.cos(a) * rr + Math.sin(i * 1.7) * 6, y = n.y + Math.sin(a) * rr + Math.cos(i * 1.3) * 6; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    // mitochondrion
    const M = G.mito;
    ctx.save(); ctx.translate(M.x, M.y); ctx.rotate(M.rot);
    ctx.beginPath(); ctx.ellipse(0, 0, M.a, M.b, 0, 0, 6.29);
    ctx.fillStyle = Lab.alpha(c.gold, c.dark ? 0.16 : 0.18); ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = Lab.alpha(c.gold_ink, 0.9); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, 0, M.a - 8, M.b - 8, 0, 0, 6.29); ctx.lineWidth = 1.5; ctx.strokeStyle = Lab.alpha(c.gold_ink, 0.6); ctx.stroke();
    // cristae: folded inner membrane
    ctx.beginPath();
    const folds = 7;
    for (let i = 0; i < folds; i++) {
      const u = -0.78 + (i / (folds - 1)) * 1.56, x = u * M.a, top = (i % 2 ? -1 : 1);
      const yEdge = top * Math.sqrt(Math.max(0, 1 - u * u)) * (M.b - 8);
      ctx.moveTo(x - 6, yEdge); ctx.quadraticCurveTo(x, -yEdge * 0.05, x + 6, yEdge);
    }
    ctx.lineWidth = 3; ctx.strokeStyle = Lab.alpha(c.plum, 0.55); ctx.lineCap = 'round'; ctx.stroke();
    ctx.restore();
    // recycler
    const R = G.rec;
    ctx.beginPath(); ctx.arc(R.x, R.y, 15, 0, 6.29); ctx.fillStyle = c.panel; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = c.olive; ctx.stroke();
    ctx.beginPath(); ctx.arc(R.x, R.y, 8, 0.3, 5.4); ctx.lineWidth = 2.5; ctx.stroke();
    // consumers
    G.cd38.forEach((p) => enzyme(ctx, p, c.plum));
    enzyme(ctx, G.sirt, c.plum); enzyme(ctx, G.parp, c.plum);
    // labels
    const L = (s, x, y, col, al = 'center') => { ctx.font = '700 16px Nunito, sans-serif'; ctx.textAlign = al; ctx.textBaseline = 'middle'; ctx.lineWidth = 5; ctx.strokeStyle = c.panel; ctx.strokeText(s, x, y); ctx.fillStyle = col; ctx.fillText(s, x, y); };
    const mp = mitoPoint(0, -1); L('Mitochondrion', mp.x, mp.y - 18, c.gold_ink);
    L('Nucleus', n.x + n.r * 0.35, n.y + n.r * 0.35, c.plum);
    L('Sirtuins', G.sirt.x + 46, G.sirt.y - 6, c.soft, 'left');
    L('PARP', G.parp.x + 18, G.parp.y + 18, c.soft, 'left');
    L('Recycler', R.x + 22, R.y, c.olive, 'left');
    L('CD38', G.cd38[0].x - 20, G.cd38[0].y - 22, c.plum, 'right');
  }
  function enzyme(ctx, p, col) {
    ctx.save(); ctx.translate(p.x, p.y);
    ctx.beginPath(); ctx.arc(0, 0, 11, 0, 6.29); ctx.fillStyle = col; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, 5, 0, 6.29); ctx.fillStyle = Lab.c.panel; ctx.fill();
    ctx.restore();
  }
  function round(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function drawParts() {
    const { ctx } = cv, c = Lab.c;
    for (const f of F) { ctx.save(); ctx.globalAlpha = f.spoil ? Math.max(0, f.fade ?? 1) * 0.6 : 1; ctx.translate(f.x, f.y); ctx.rotate(0.785); ctx.fillStyle = c.olive; ctx.fillRect(-5, -5, 10, 10); ctx.restore(); }
    for (const n of N) { ctx.beginPath(); ctx.arc(n.x - 3, n.y, 3.6, 0, 6.29); ctx.arc(n.x + 4, n.y + 2, 3, 0, 6.29); ctx.fillStyle = c.grey; ctx.fill(); }
    for (const s of S) {
      if (s.st === 'loaded') {
        const g = ctx.createRadialGradient(s.x, s.y, 2, s.x, s.y, 20);
        g.addColorStop(0, Lab.alpha(c.plum, 0.55)); g.addColorStop(1, Lab.alpha(c.plum, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(s.x, s.y, 20, 0, 6.29); ctx.fill();
        ctx.beginPath(); ctx.arc(s.x, s.y, 8, 0, 6.29); ctx.fillStyle = c.plum; ctx.fill();
        // its two electrons
        for (let k = 0; k < 2; k++) { const a = s.ph + k * Math.PI; ctx.beginPath(); ctx.arc(s.x + Math.cos(a) * 12, s.y + Math.sin(a) * 12, 2.6, 0, 6.29); ctx.fillStyle = c.gold; ctx.fill(); }
      } else {
        ctx.beginPath(); ctx.arc(s.x, s.y, 7.5, 0, 6.29); ctx.lineWidth = 3.2; ctx.strokeStyle = s.st === 'captured' ? Lab.alpha(c.gold, 0.55) : c.gold; ctx.stroke();
      }
    }
    for (const e of E) for (let k = 0; k < 2; k++) { ctx.beginPath(); ctx.arc(e.x + k * 5, e.y + k * 3, 3, 0, 6.29); ctx.fillStyle = c.gold; ctx.fill(); }
    for (const p of SP) {
      const a = 1 - p.t / 1.6, rr = 6 + p.t * 16;
      const g = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, rr);
      g.addColorStop(0, Lab.alpha(c.gold, 0.9 * a)); g.addColorStop(1, Lab.alpha(c.gold, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, rr, 0, 6.29); ctx.fill();
      if (p.t > 0.15 && p.t < 1.3) { ctx.font = '800 15px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = Lab.alpha(c.gold_ink, a); ctx.fillText('ATP', p.x, p.y - rr * 0.4); }
    }
    for (const p of P) { ctx.beginPath(); ctx.arc(p.x, p.y, 12 + p.t * 26, 0, 6.29); ctx.lineWidth = 2; ctx.strokeStyle = Lab.alpha(p.who === 'rec' ? c.olive : c.plum, 1 - p.t / 0.9); ctx.stroke(); }
  }
  function drawLoopNotes() { // reduced-motion still: arrows that tell the loop
    const { ctx } = cv, c = Lab.c;
    const a = mitoPoint(-1.25, 0.1), b = mitoPoint(-0.4, 0.2), d = mitoPoint(0.35, -1.7);
    ctx.save(); ctx.strokeStyle = c.gold_ink; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.quadraticCurveTo((a.x + b.x) / 2, a.y - 40, b.x, b.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(b.x + 30, b.y - 20); ctx.quadraticCurveTo(d.x, d.y + 30, d.x + 40, d.y); ctx.stroke();
    ctx.restore();
  }
  function frame() { if (!G.W) return; drawCell(); drawParts(); readouts(); }

  function readouts() {
    const e = Math.round(energy);
    energyOut.textContent = Math.min(100, e) + '%';
    poolOut.textContent = `${S.length} NAD+ shuttles in the cell`;
    drawLine();
  }
  function drawLine() {
    const { ctx, w, h } = lineCv, c = Lab.c; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const y = (v) => h - 6 - (Math.min(110, v) / 110) * (h - 14);
    ctx.strokeStyle = Lab.alpha(c.stroke, 0.35); ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.moveTo(0, y(100)); ctx.lineTo(w, y(100)); ctx.stroke(); ctx.setLineDash([]);
    if (hist.length < 2) return;
    const n = hist.length, dx = w / 119;
    ctx.beginPath(); hist.forEach((v, i) => { const x = w - (n - 1 - i) * dx; i ? ctx.lineTo(x, y(v)) : ctx.moveTo(x, y(v)); });
    ctx.lineTo(w, h); ctx.lineTo(w - (n - 1) * dx, h); ctx.closePath(); ctx.fillStyle = Lab.alpha(c.gold, 0.18); ctx.fill();
    ctx.beginPath(); hist.forEach((v, i) => { const x = w - (n - 1 - i) * dx; i ? ctx.lineTo(x, y(v)) : ctx.moveTo(x, y(v)); });
    ctx.strokeStyle = c.gold_ink; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(w - 3, y(hist[n - 1]), 4, 0, 6.29); ctx.fillStyle = c.gold_ink; ctx.fill();
  }

  /* ---------- captions ---------- */
  function caption() {
    let st = 'base';
    if (simT - topUpAt < 28) st = 'top';
    else if (age >= 52) st = 'old';
    if (st === capState) return; capState = st;
    const set = (tier, h, p) => (cap.innerHTML = `<span class="tier">${tier}</span><h2>${h}</h2><p>${p}</p>`);
    if (st === 'base') set('Established biology', 'A shuttle, not a fuel', 'NAD+ doesn\'t hold energy itself. It picks up electrons from the food you\'ve broken down (gold ring turns plum), carries them to the mitochondrion, drops them off and goes back for more. Every drop-off powers a spark of ATP, the energy your cells spend.');
    if (st === 'old') set('Mouse studies · one human study', 'Fewer shuttles, fewer sparks', 'In mice, CD38 climbs with age and breaks down more NAD+. In people, one study of skin found lower NAD+ at older ages. The human picture is still thin, and nobody has shown how much of a dip you\'d feel.');
    if (st === 'top') set('Small human trials', 'Topping up', 'Watch the same enzymes chew the extra back down. In small trials, taking NAD+ building blocks raises NAD+ in the blood, but whether that changes how people feel hasn\'t been shown. Nasal NAD+ hasn\'t been studied in people yet; that research so far is in animals.');
  }

  /* ---------- controls ---------- */
  ageIn.addEventListener('input', () => {
    age = +ageIn.value; ageOut.textContent = age;
    if (age > 60) Lab.done('t-age');
    if (Lab.reduced || !running || paused) { capState = ''; still(); } caption();
  });
  document.getElementById('topUp').addEventListener('click', () => {
    Lab.done('t-top');
    topUpAt = simT;
    const k = Math.round(base * 0.5);
    for (let i = 0; i < k; i++) S.push(mkShuttle(G.m + 8, G.H * (0.2 + rnd() * 0.7), false));
    capState = ''; caption();
    if (Lab.reduced || paused) { for (let i = 0; i < 60; i++) sim(0.1); frame(); }
  });
  pauseBtn.addEventListener('click', () => {
    paused = !paused; pauseBtn.setAttribute('aria-pressed', paused); pauseBtn.textContent = paused ? 'Play' : 'Pause';
    if (!paused && running && !Lab.reduced) { last = 0; raf = requestAnimationFrame(loop); }
  });

  /* tap to identify */
  canvas.addEventListener('pointerup', (e) => {
    const p = Lab.pt(e, canvas); const hit = identify(p.x, p.y);
    if (hit) { tip.show(p.x, p.y, hit[0], hit[1]); if (hit[2]) Lab.done('t-tap'); } else tip.hide();
  });
  function identify(x, y) {
    const near = (o, r) => Math.hypot(o.x - x, o.y - y) < r;
    for (const s of S) if (near(s, 22)) return s.st === 'loaded' ? ['NADH, loaded', 'The same molecule, now carrying two electrons to the mitochondrion.', true] : s.st === 'captured' ? ['NAD+, caught', 'An enzyme has grabbed this one and is about to break it apart.'] : ['NAD+, empty', 'Ready to pick up electrons from fuel. One shuttle makes this trip again and again.', true];
    for (const f of F) if (near(f, 18)) return ['Fuel', 'Pieces of broken-down sugar and fat. They hold the electrons NAD+ comes to collect.'];
    for (const n of N) if (near(n, 18)) return ['Spent pieces', 'What\'s left when NAD+ is broken apart (mostly nicotinamide). The recycler can rebuild NAD+ from them.'];
    for (const p of SP) if (near(p, 26)) return ['ATP', 'The small molecule your cells spend as energy.'];
    if (G.cd38.some((c) => near(c, 26))) return ['CD38', 'An enzyme at the cell surface that breaks NAD+ apart. In mice, it rises with age.'];
    if (near(G.sirt, 26)) return ['Sirtuins', 'Enzymes that spend NAD+ as they switch other proteins on and off, including ones that package your DNA.'];
    if (near(G.parp, 26)) return ['PARP', 'Spends NAD+ to flag damaged DNA for repair.'];
    if (near(G.rec, 26)) return ['Recycler', 'The salvage pathway. It rebuilds NAD+ from spent pieces, which is where most of your NAD+ comes from.'];
    if (inMito(x, y, 6)) return ['Mitochondrion', 'Its folded inner membrane takes the electrons and uses them to make ATP.'];
    if (Math.hypot(G.nuc.x - x, G.nuc.y - y) < G.nuc.r) return ['Nucleus', 'Where your DNA lives. Sirtuins and PARP work here.'];
    return null;
  }

  /* ---------- loop ---------- */
  function loop(t) {
    raf = 0;
    if (!running || paused) return;
    const dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016; last = t;
    sim(dt);
    if (Math.floor(simT * 4) !== Math.floor((simT - dt) * 4)) { hist.push(energy); if (hist.length > 120) hist.shift(); }
    caption(); frame();
    raf = requestAnimationFrame(loop);
  }
  function calibrate() {
    // measure what a 30-year-old cell delivers in this exact geometry; energy is shown against that
    const keep = age; age = 30; ref = 1; S = []; seed(); simT = 0;
    for (let i = 0; i < 500; i++) sim(0.1);
    ref = Math.max(0.5, delivered.length / 12) * 0.97; age = keep; S = [];
  }
  function still() {
    // Reduced motion or paused: settle the model for this age, then draw one honest frame.
    if (!G.W) return;
    S = []; seed(); simT = 0; energy = 100; hist = [];
    for (let i = 0; i < 400; i++) { sim(0.1); if (i % 2 === 0) { hist.push(energy); if (hist.length > 120) hist.shift(); } }
    caption(); frame();
  }
  window.__spark = { get: () => ({ rate: delivered.length / 12, energy, n: S.length, target: target(), base, fuelRate, simT }), sim: (k, dt) => { for (let i = 0; i < k; i++) sim(dt); } };
  Lab.onTheme(() => frame());
  let inited = false;
  Lab.view('spark', {
    start() {
      cv.fit(); lineCv.fit(); layout();
      if (!inited) { inited = true; calibrate(); still(); }
      running = true;
      if (Lab.reduced) { frame(); return; }
      last = 0; cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
    },
    stop() { running = false; cancelAnimationFrame(raf); raf = 0; },
  });
})();
