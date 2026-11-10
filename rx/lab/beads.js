/* Bead by Bead: a chain-physics peptide builder that recognizes real molecules, folds, and lines up to scale. */
(function () {
  const AA = {
    G: ['Glycine', 'np'], A: ['Alanine', 'np'], V: ['Valine', 'np'], L: ['Leucine', 'np'], I: ['Isoleucine', 'np'],
    M: ['Methionine', 'np'], F: ['Phenylalanine', 'np'], W: ['Tryptophan', 'np'], P: ['Proline', 'np'],
    S: ['Serine', 'po'], T: ['Threonine', 'po'], C: ['Cysteine', 'po'], Y: ['Tyrosine', 'po'], N: ['Asparagine', 'po'], Q: ['Glutamine', 'po'],
    K: ['Lysine', 'pos'], R: ['Arginine', 'pos'], H: ['Histidine', 'pos'],
    D: ['Aspartate', 'neg'], E: ['Glutamate', 'neg'],
  };
  const CLASS_NAME = { np: 'water-shy', po: 'water-loving', pos: 'charged +', neg: 'charged −' };
  const ORDER = 'GAVLIMFWPSTCYNQKRHDE';

  const KNOWN = {
    KPV: { name: 'KPV', tier: 'Lab research', h: 'You built KPV', p: 'Lysine, proline, valine. These are the last three amino acids of a hormone called alpha-MSH, clipped off on their own. Lab studies look at how this tiny piece quiets inflammatory signals.' },
    GHK: { name: 'GHK', tier: 'Established chemistry', h: 'You built GHK, and it grabbed copper', p: 'Glycine, histidine, lysine. First isolated from human plasma in 1973. It holds a copper ion tightly, and that pairing is the GHK-Cu you see in skin creams.' },
    CYIQNCPLG: { name: 'Oxytocin', tier: 'Established chemistry', h: 'You built oxytocin', p: 'Nine beads. Watch the two cysteines (C) reach across and bond, closing a ring of six. In peptides, shape matters as much as sequence.' },
    GEPPPGKPADDAGLV: { name: 'BPC-157', tier: 'Mostly animal studies', h: 'You built BPC-157', p: 'Fifteen beads, a lab-made sequence described as coming from a protein in stomach juice. No regulator has approved it for human use, and in a 2025 review, 35 of 36 studies were in animals.' },
    MRWQEMGYIFYPRKLR: { name: 'MOTS-c', tier: 'Established chemistry', h: 'You built MOTS-c', p: 'Sixteen beads, with an unusual origin: the instructions for it sit in the small loop of DNA inside your mitochondria, not in the nucleus with the rest of your genes.' },
  };
  const PRESETS = [['KPV', 'KPV'], ['GHK', 'GHK'], ['Oxytocin', 'CYIQNCPLG'], ['BPC-157', 'GEPPPGKPADDAGLV'], ['MOTS-c', 'MRWQEMGYIFYPRKLR']];

  const LINEUP = [
    { name: 'Naltrexone, no chain', n: 4, ghost: true, note: '≈ 4 by weight' },
    { name: 'NAD+, no chain', n: 7, ghost: true, note: '≈ 7 by weight' },
    { name: 'KPV · GHK', n: 3, seq: 'KPV' },
    { name: 'PT-141', n: 7, note: '7, in a ring' },
    { name: 'Oxytocin', n: 9, seq: 'CYIQNCPLG' },
    { name: 'BPC-157', n: 15, seq: 'GEPPPGKPADDAGLV' },
    { name: 'MOTS-c', n: 16, seq: 'MRWQEMGYIFYPRKLR' },
    { name: 'Tirzepatide', n: 39 },
    { name: 'Insulin', n: 51, note: '51, two chains' },
    { name: 'Albumin, in your blood', n: 585 },
  ];

  const stage = document.getElementById('beadStage');
  const canvas = document.getElementById('beadCanvas');
  const cap = document.getElementById('beadCap');
  const countOut = document.getElementById('beadCount');
  const hint = document.getElementById('beadHint');
  const tip = Lab.tip(stage);
  let r = 16, L = 34;
  const cv = Lab.canvas(canvas, () => { r = Math.max(18, Math.min(34, cv.w / 22)); L = r * 2.1; clampAll(); if (mode === 'line') layoutLine(); draw(); });

  let chain = [], mode = 'build', fold = false, running = false, raf = 0, settle = 0;
  let panned = false, touched = false, copper = null, building = null, grab = null, lineY = 0, lineStart = 0, lineMax = 0, lineRows = [];

  /* ---------- tray ---------- */
  const tray = document.getElementById('tray');
  ORDER.split('').forEach((k) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'aa ' + AA[k][1]; b.textContent = k;
    b.setAttribute('aria-label', `${AA[k][0]}, ${CLASS_NAME[AA[k][1]]}`);
    b.title = AA[k][0];
    b.addEventListener('click', () => { stopBuild(); if (mode === 'line') setMode('build'); add(k); });
    tray.appendChild(b);
  });
  const presets = document.getElementById('presets');
  PRESETS.forEach(([label, seq]) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'btn'; b.textContent = label;
    b.addEventListener('click', () => buildSeq(seq));
    presets.appendChild(b);
  });
  document.getElementById('bUndo').addEventListener('click', () => { stopBuild(); if (mode === 'line') setMode('build'); chain.pop(); changed(); });
  document.getElementById('bClear').addEventListener('click', () => { stopBuild(); if (mode === 'line') setMode('build'); chain = []; changed(); });
  const bFold = document.getElementById('bFold');
  bFold.addEventListener('click', () => { fold = !fold; bFold.setAttribute('aria-pressed', fold); if (mode === 'line') setMode('build'); if (fold && chain.length > 12) Lab.done('t-fold'); kick(Lab.reduced ? 0 : 1); if (Lab.reduced) relax(500); caption(); draw(); });
  const bLine = document.getElementById('bLine');
  bLine.addEventListener('click', () => setMode(mode === 'line' ? 'build' : 'line'));

  function setMode(m) {
    mode = m; bLine.setAttribute('aria-pressed', m === 'line');
    bLine.textContent = m === 'line' ? 'Back to my chain' : 'Line them up';
    hint.textContent = m === 'line' ? 'Drag up and down to see the biggest' : 'Drag the chain, or add beads below';
    if (m === 'line') { lineY = 0; panned = false; lineStart = performance.now(); layoutLine(); Lab.done('t-line'); }
    hint.hidden = false; tip.hide(); caption(); kick(1); draw();
  }

  /* ---------- chain ops ---------- */
  function seq() { return chain.map((b) => b.k).join(''); }
  function add(k, quiet) {
    if (chain.length >= 40) { capMax(); return; }
    let x, y;
    if (!chain.length) { x = cv.w / 2; y = cv.h / 2; }
    else {
      const e = chain[chain.length - 1], p = chain[chain.length - 2];
      let dx = p ? e.x - p.x : 1, dy = p ? e.y - p.y : 0; const d = Math.hypot(dx, dy) || 1;
      const a = Math.atan2(dy / d, dx / d) + (Math.random() - 0.5) * 0.9;
      x = e.x + Math.cos(a) * L; y = e.y + Math.sin(a) * L;
    }
    chain.push({ k, x, y, px: x, py: y, born: performance.now() });
    if (!quiet) changed();
  }
  function changed() {
    touched = true;
    const s = seq();
    copper = s === 'GHK' ? (copper || { x: cv.w - 30, y: 30, t: performance.now() }) : null;
    if (s === 'KPV') Lab.done('t-kpv');
    if (s === 'GHK') Lab.done('t-ghk');
    if (fold && chain.length > 12) Lab.done('t-fold');
    countOut.textContent = `${chain.length} / 40`;
    recenter();
    if (Lab.reduced) relax(400);
    kick(1); caption(); draw();
  }
  function buildSeq(s) {
    stopBuild(); if (mode === 'line') setMode('build');
    chain = []; copper = null;
    if (Lab.reduced) { s.split('').forEach((k) => add(k, true)); changed(); return; }
    let i = 0;
    const step = () => { if (i < s.length) { add(s[i++], true); countOut.textContent = `${chain.length} / 40`; kick(1); caption(true); building = setTimeout(step, 170); } else { building = null; changed(); } };
    step();
  }
  function stopBuild() { if (building) { clearTimeout(building); building = null; } }

  /* ---------- physics ---------- */
  function recenter() {
    if (!chain.length) return;
    let cx = 0, cy = 0; chain.forEach((b) => { cx += b.x; cy += b.y; }); cx /= chain.length; cy /= chain.length;
    const dx = cv.w / 2 - cx, dy = cv.h / 2 - cy;
    // nudge only if far off-centre
    if (Math.hypot(dx, dy) > Math.min(cv.w, cv.h) * 0.22) chain.forEach((b) => { b.x += dx * 0.5; b.y += dy * 0.5; b.px += dx * 0.5; b.py += dy * 0.5; });
  }
  function step(t, jitter) {
    const n = chain.length; if (!n) return;
    const cx = cv.w / 2, cy = cv.h / 2;
    let mx = 0, my = 0; chain.forEach((b) => { mx += b.x; my += b.y; }); mx /= n; my /= n;
    for (const b of chain) {
      if (b === grab?.b) continue;
      let vx = (b.x - b.px) * 0.86, vy = (b.y - b.py) * 0.86;
      b.px = b.x; b.py = b.y;
      vx += (cx - b.x) * 0.0009; vy += (cy - b.y) * 0.0009;
      if (jitter) { vx += (Math.random() - 0.5) * 0.35; vy += (Math.random() - 0.5) * 0.35; }
      if (fold) {
        const cls = AA[b.k][1];
        if (cls !== 'np') { const dx = b.x - mx, dy = b.y - my, d = Math.hypot(dx, dy) || 1; vx += dx / d * 0.05; vy += dy / d * 0.05; }
      }
      b.x += vx; b.y += vy;
    }
    // pair forces
    for (let i = 0; i < n; i++) for (let j = i + 2; j < n; j++) {
      const a = chain[i], b = chain[j];
      let dx = b.x - a.x, dy = b.y - a.y; const d = Math.hypot(dx, dy) || 0.01;
      const min = r * 2.05;
      if (d < min) { const push = (min - d) / d * 0.5; move(a, -dx * push, -dy * push); move(b, dx * push, dy * push); continue; }
      if (fold) {
        const ca = AA[a.k][1], cb = AA[b.k][1];
        if (ca === 'np' && cb === 'np' && d < r * 14) { const f = 0.012 * (d - min) / d; move(a, dx * f, dy * f); move(b, -dx * f, -dy * f); }
        else if (((ca === 'pos' && cb === 'neg') || (ca === 'neg' && cb === 'pos')) && d < r * 8) { const f = 0.006 * (d - min) / d; move(a, dx * f, dy * f); move(b, -dx * f, -dy * f); }
      } else if (j === i + 2 && d < L * (n <= 4 ? 1.95 : 1.75)) {
        // gentle stiffness keeps an unfolded chain loose but open; tiny chains stay nearly straight
        const f = (L * (n <= 4 ? 1.95 : 1.75) - d) / d * 0.08; move(a, -dx * f, -dy * f); move(b, dx * f, dy * f);
      }
    }
    // bonds
    const ring = seq() === 'CYIQNCPLG';
    for (let it = 0; it < 6; it++) {
      for (let i = 0; i < n - 1; i++) bond(chain[i], chain[i + 1], L);
      if (ring) bond(chain[0], chain[5], L * 1.15);
    }
    clampAll();
    // copper glides to its pocket between G and H
    if (copper && n === 3) {
      const a = chain[0], b = chain[1], c = chain[2];
      const mx2 = (a.x + b.x) / 2, my2 = (a.y + b.y) / 2;
      // sit beside the G-H bond, on the side away from K
      let px = -(b.y - a.y), py = b.x - a.x; const d = Math.hypot(px, py) || 1; px /= d; py /= d;
      if ((c.x - mx2) * px + (c.y - my2) * py > 0) { px = -px; py = -py; }
      const tx = mx2 + px * r * 1.9, ty = my2 + py * r * 1.9;
      copper.x += (tx - copper.x) * (Lab.reduced ? 1 : 0.06); copper.y += (ty - copper.y) * (Lab.reduced ? 1 : 0.06);
    }
  }
  function move(b, dx, dy) { if (b === grab?.b) return; b.x += dx; b.y += dy; }
  function bond(a, b, len) {
    const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.01, diff = (d - len) / d * 0.5;
    move(a, dx * diff, dy * diff); move(b, -dx * diff, -dy * diff);
  }
  function clampAll() { for (const b of chain) { b.x = Math.max(r + 4, Math.min(cv.w - r - 4, b.x)); b.y = Math.max(r + 56, Math.min(cv.h - r - 40, b.y)); } }
  function relax(k) { for (let i = 0; i < k; i++) step(0, false); }

  /* ---------- drawing ---------- */
  function fillFor(k) { const c = Lab.c, cls = AA[k][1]; return cls === 'np' ? c.gold : cls === 'pos' ? c.plum : cls === 'neg' ? c.olive : c.panel; }
  function inkFor(k) { const cls = AA[k][1]; if (cls === 'np') return '#211c19'; if (cls === 'po') return Lab.c.ink; return Lab.c.dark ? '#1f1815' : '#ffffff'; }
  function drawBead(ctx, x, y, rr, k, scale = 1, letter = true) {
    const c = Lab.c; rr *= scale;
    ctx.beginPath(); ctx.arc(x, y, rr, 0, 6.2832);
    ctx.fillStyle = fillFor(k); ctx.fill();
    if (AA[k][1] === 'po') { ctx.lineWidth = Math.max(1.5, rr * 0.14); ctx.strokeStyle = c.soft; ctx.stroke(); }
    // soft highlight for depth
    const g = ctx.createRadialGradient(x - rr * 0.35, y - rr * 0.4, rr * 0.1, x, y, rr);
    g.addColorStop(0, 'rgba(255,255,255,0.32)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rr, 0, 6.2832); ctx.fill();
    if (letter && rr > 10) {
      ctx.fillStyle = inkFor(k); ctx.font = `800 ${Math.round(rr * 1.0)}px Nunito, system-ui, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(k, x, y + 1);
    }
  }
  function draw() {
    const { ctx, w, h } = cv, c = Lab.c; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    if (mode === 'line') return drawLine();
    // faint water grid when folding
    if (fold) {
      ctx.fillStyle = Lab.alpha(c.stroke, 0.12);
      for (let y = 70; y < h - 30; y += 26) for (let x = 14 + ((y / 26) % 2) * 13; x < w; x += 26) { ctx.beginPath(); ctx.arc(x, y, 1.6, 0, 6.3); ctx.fill(); }
    }
    if (!chain.length) {
      ctx.fillStyle = c.dim; ctx.font = '600 18px Nunito, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Tap an amino acid to start a chain', w / 2, h / 2);
      return;
    }
    const now = performance.now();
    // backbone
    ctx.lineCap = 'round'; ctx.strokeStyle = c.stroke; ctx.lineWidth = Math.max(4, r * 0.34);
    ctx.beginPath(); chain.forEach((b, i) => (i ? ctx.lineTo(b.x, b.y) : ctx.moveTo(b.x, b.y))); ctx.stroke();
    const late = [];
    // disulfide bridge
    if (seq() === 'CYIQNCPLG') {
      ctx.save(); ctx.setLineDash([5, 6]); ctx.strokeStyle = c.gold_ink; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.moveTo(chain[0].x, chain[0].y); ctx.lineTo(chain[5].x, chain[5].y); ctx.stroke(); ctx.restore();
      { let mx = 0, my = 0; chain.forEach((q) => { mx += q.x; my += q.y; }); mx /= chain.length; my /= chain.length;
        const bx = (chain[0].x + chain[5].x) / 2, by = (chain[0].y + chain[5].y) / 2, dx = bx - mx, dy = by - my, dd = Math.hypot(dx, dy) || 1;
        const lx = bx + dx / dd * r * 3.2, ly = by + dy / dd * r * 3.2;
        ctx.save(); ctx.strokeStyle = c.gold_ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(lx, ly); ctx.stroke(); ctx.restore();
        late.push(['S–S bridge', lx, ly + (dy > 0 ? 10 : -10), c.gold_ink]); }
    }
    // beads (with pop-in)
    chain.forEach((b) => {
      const age = Lab.reduced ? 1 : Math.min(1, (now - b.born) / 260);
      const s = age < 1 ? 0.4 + 0.6 * easeBack(age) : 1;
      if (age < 1) { ctx.beginPath(); ctx.arc(b.x, b.y, r * (1 + (1 - age) * 1.2), 0, 6.3); ctx.strokeStyle = Lab.alpha(c.gold, 1 - age); ctx.lineWidth = 2; ctx.stroke(); }
      drawBead(ctx, b.x, b.y, r, b.k, s);
    });
    // ends
    if (chain.length > 3) {
      // label the two ends, pushed outward from the chain's centre
      let mx = 0, my = 0; chain.forEach((b) => { mx += b.x; my += b.y; }); mx /= chain.length; my /= chain.length;
      const out = (b) => { const dx = b.x - mx, dy = b.y - my, d = Math.hypot(dx, dy) || 1; return [b.x + dx / d * (r + 22), b.y + dy / d * (r + 16)]; };
      const [ax, ay] = out(chain[0]), [zx, zy] = out(chain[chain.length - 1]);
      label(ctx, 'start', ax, ay, c.dim); label(ctx, 'end', zx, zy, c.dim);
    }
    late.forEach((l) => label(ctx, ...l));
    readout(ctx);
    if (copper) {
      if (chain.length === 3) {
        ctx.save(); ctx.setLineDash([3, 4]); ctx.strokeStyle = c.dark ? '#d98f55' : '#a8582a'; ctx.lineWidth = 2;
        [0, 1].forEach((i) => { ctx.beginPath(); ctx.moveTo(copper.x, copper.y); ctx.lineTo(chain[i].x, chain[i].y); ctx.stroke(); }); ctx.restore();
      }
      const g = ctx.createRadialGradient(copper.x, copper.y, 2, copper.x, copper.y, r * 2);
      g.addColorStop(0, 'rgba(201,120,62,0.55)'); g.addColorStop(1, 'rgba(201,120,62,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(copper.x, copper.y, r * 2, 0, 6.3); ctx.fill();
      ctx.beginPath(); ctx.arc(copper.x, copper.y, r * 0.8, 0, 6.3); ctx.fillStyle = c.dark ? '#d98f55' : '#a8582a'; ctx.fill();
      ctx.fillStyle = c.dark ? '#1f1815' : '#fff'; ctx.font = `800 ${Math.round(r * 0.8)}px Nunito, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('Cu', copper.x, copper.y + 1);
      if (chain.length === 3) label(ctx, 'copper ion', copper.x, copper.y + (copper.y < chain[1].y ? -r * 1.45 : r * 1.45), c.soft);
    }
  }
  function readout(ctx) {
    const c = Lab.c, s = seq(); if (!s) return;
    const known = KNOWN[s];
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.font = '500 24px Fraunces, Georgia, serif'; ctx.fillStyle = c.ink;
    const shown = s.length > 18 ? s.slice(0, 18) + '…' : s.split('').join(' ');
    ctx.fillText(known ? known.name : shown, 16, cv.h - 40);
    ctx.font = '600 16px Nunito, sans-serif'; ctx.fillStyle = c.soft;
    ctx.fillText(`${s.length} amino acid${s.length > 1 ? 's' : ''}${known ? ' · ' + s.split('').join(' ') : ''}`.slice(0, 48), 16, cv.h - 16);
  }
  function label(ctx, s, x, y, col) {
    ctx.font = '700 16px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 5; ctx.strokeStyle = Lab.c.panel; ctx.strokeText(s, x, y); ctx.fillStyle = col; ctx.fillText(s, x, y);
  }
  function wrap(ctx, text, x, y, maxW, lh) { const words = text.split(' '); let line = '', yy = y; for (const wd of words) { const t = line ? line + ' ' + wd : wd; if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, x, yy); line = wd; yy += lh; } else line = t; } ctx.fillText(line, x, yy); return yy; }
  const easeBack = (t) => { const s = 1.7; return 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); };

  /* ---------- line-up (to scale) ---------- */
  function layoutLine() {
    const pad = 18, top = 166;
    const d = Math.min(16, (cv.w - pad * 2) / 40);
    const rows = [{ name: 'Your chain', n: chain.length, seq: seq(), mine: true }, ...LINEUP];
    let y = top, k = 0;
    lineRows = rows.map((row) => {
      const lines = Math.max(1, Math.ceil(row.n / 40));
      const o = { ...row, y, lines, d, start: k };
      k += row.n;
      y += 26 + lines * d + 16;
      return o;
    });
    lineMax = Math.max(0, y + 10 - cv.h);
  }
  function drawLine() {
    hint.hidden = lineY > 20;
    const { ctx, w, h } = cv, c = Lab.c, pad = 18;
    const now = performance.now();
    const t = Lab.reduced ? 1e9 : now - lineStart;
    ctx.save(); ctx.translate(0, -lineY);
    // header
    ctx.fillStyle = c.ink; ctx.font = '500 22px Fraunces, Georgia, serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText('Each row holds 40 amino acids.', pad, 92, w - pad * 2);
    ctx.fillStyle = c.soft; ctx.font = '600 17px Nunito, sans-serif';
    wrap(ctx, 'Spill onto a second row and the FDA calls it a protein.', pad, 118, w - pad * 2, 22);
    for (const row of lineRows) {
      const d = row.d, x0 = pad;
      ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
      ctx.fillStyle = row.mine ? c.plum : c.ink; ctx.font = '800 17px Nunito, sans-serif';
      ctx.fillText(row.name, x0, row.y + 17);
      const right = row.note || `${row.n}`;
      ctx.textAlign = 'right'; ctx.fillStyle = c.soft; ctx.font = '600 16px Nunito, sans-serif';
      ctx.fillText(row.n > 40 ? right + ' · protein' : right, w - pad, row.y + 17);
      if (row.n > 40) { ctx.fillStyle = c.plum; }
      // ruler for one row
      ctx.strokeStyle = Lab.alpha(c.stroke, 0.35); ctx.lineWidth = 1;
      ctx.strokeRect(x0 - 0.5, row.y + 26 - 0.5, d * 40 + 1, d * row.lines + 1);
      for (let i = 0; i < row.n; i++) {
        const appear = (row.start + i) * 2.2;
        if (appear > t) break;
        const pop = Math.min(1, (t - appear) / 160);
        const col = i % 40, ln = Math.floor(i / 40);
        const x = x0 + col * d + d / 2, y = row.y + 26 + ln * d + d / 2;
        if (row.ghost) {
          ctx.beginPath(); ctx.arc(x, y, d * 0.42 * pop, 0, 6.3); ctx.setLineDash([2, 2]); ctx.strokeStyle = c.dim; ctx.lineWidth = 1.5; ctx.stroke(); ctx.setLineDash([]);
        } else if (row.seq && AA[row.seq[i]]) {
          drawBead(ctx, x, y, d * 0.46, row.seq[i], pop, false);
        } else {
          ctx.beginPath(); ctx.arc(x, y, d * 0.44 * pop, 0, 6.3);
          ctx.fillStyle = row.n > 40 ? Lab.alpha(c.plum, 0.55 + 0.25 * ((i * 7) % 3) / 2) : Lab.alpha(c.gold, 0.6 + 0.25 * ((i * 7) % 3) / 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();
    if (lineMax > 0 && lineY < lineMax - 4) {
      const g = ctx.createLinearGradient(0, h - 60, 0, h); g.addColorStop(0, Lab.alpha(c.panel, 0)); g.addColorStop(1, c.panel);
      ctx.fillStyle = g; ctx.fillRect(0, h - 60, w, 60);
      ctx.fillStyle = c.soft; ctx.font = '700 16px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(lineY > 40 ? '↓ drag for more' : '↓ drag to see albumin', w / 2, h - 18);
    }
  }

  /* ---------- captions ---------- */
  function setCap(tier, h, p, theory) {
    cap.innerHTML = `${tier ? `<span class="tier${theory ? ' theory' : ''}">${tier}</span>` : ''}<h2>${h}</h2><p>${p}</p>`;
  }
  function capMax() { setCap('FDA definition', 'That\'s 40', 'One more amino acid and this would count as a protein, not a peptide. The lab stops here. Try <b>Line them up</b> to see how far proteins go.'); }
  function caption(during) {
    if (mode === 'line') return setCap('To scale', 'Size, side by side', 'Most of the peptides people ask about fit inside one row. Tirzepatide nearly fills it. Albumin, the most common protein in your blood, needs 15 rows. Naltrexone and NAD+ aren\'t chains at all.');
    const s = seq(), n = chain.length;
    if (!during && KNOWN[s]) { const k = KNOWN[s]; const h = touched ? k.h : k.h.replace('You built GHK, and it grabbed copper', 'Meet GHK, holding a copper ion'); const next = touched ? ' Next: tap <b>Line them up</b> to see it to scale.' : ' Tap <b>Clear</b> and build your own, or add a bead to this one.'; return setCap(k.tier, h, k.p + next); }
    if (n === 0) return setCap('', 'Start a chain', 'Amino acids are the 20 building blocks your body uses for every protein it makes. Tap one to begin.');
    if (n === 1) return setCap('', `One bead: ${AA[s][0].toLowerCase()}`, 'On its own, an amino acid is just a building block. Add a second and they snap together with a peptide bond. That bond is where the word "peptide" comes from.');
    if (n === 2) return setCap('', 'Two beads, one peptide bond', 'Technically you already have a peptide. Add one more and you\'re the size of KPV or GHK.');
    if (n === 40) return capMax();
    if (fold && n > 12) return setCap('Toy model', 'Folding', 'Water-shy beads (gold) huddle together to get away from water, and the water-loving ones end up on the outside. This pull is the main reason proteins fold. Real proteins do it in three dimensions, into one precise shape.');
    if (n <= 12) return setCap('', `${n} beads`, 'Chains this short stay loose and floppy. Many of the peptides in medicine are about this size: small enough to act like a message that fits one receptor, then gets broken down.');
    return setCap('', `${n} beads`, 'Longer chains start bending back on themselves. Turn on <b>Let it fold</b> and watch the water-shy beads hide in the middle.');
  }

  /* ---------- pointer ---------- */
  let down = null;
  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    const p = Lab.pt(e, canvas);
    down = { x: p.x, y: p.y, moved: false, ly: lineY };
    if (mode === 'line') return;
    let best = null, bd = 34;
    chain.forEach((b) => { const d = Math.hypot(b.x - p.x, b.y - p.y); if (d < bd) { bd = d; best = b; } });
    if (best) { grab = { b: best }; kick(1); }
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!down) return;
    const p = Lab.pt(e, canvas);
    if (Math.hypot(p.x - down.x, p.y - down.y) > 6) down.moved = true;
    if (mode === 'line') { panned = true; lineY = Math.max(0, Math.min(lineMax, down.ly - (p.y - down.y))); draw(); return; }
    if (grab) { grab.b.x = grab.b.px = Math.max(r, Math.min(cv.w - r, p.x)); grab.b.y = grab.b.py = Math.max(r + 40, Math.min(cv.h - r, p.y)); if (Lab.reduced) { relax(3); draw(); } }
  });
  const up = (e) => {
    if (!down) return;
    if (!down.moved && grab) { const k = grab.b.k; tip.show(grab.b.x, grab.b.y, `${k} · ${AA[k][0]}`, `<span>${CLASS_NAME[AA[k][1]].replace(/^./, (m) => m.toUpperCase())}</span>`); }
    grab = null; down = null; if (Lab.reduced) { relax(200); draw(); } kick(1);
  };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('wheel', (e) => { if (mode !== 'line' || lineMax <= 0) return; e.preventDefault(); lineY = Math.max(0, Math.min(lineMax, lineY + e.deltaY)); draw(); }, { passive: false });

  /* ---------- loop ---------- */
  function kick() { if (Lab.reduced) { draw(); return; } settle = 1; if (running && !raf) raf = requestAnimationFrame(loop); }
  function loop(t) {
    raf = 0;
    if (mode === 'build') { step(t, true); step(t, true); }
    draw();
    const lineAnimating = mode === 'line' && t - lineStart < 7000;
    if (mode === 'line' && !panned && t - lineStart > 2400 && lineMax > 0) lineY += (lineMax - lineY) * 0.04;
    if (running && (mode === 'build' || lineAnimating)) raf = requestAnimationFrame(loop);
  }
  Lab.onTheme(() => draw());

  // start complete: GHK already holding its copper
  function initial() {
    cv.fit();
    chain = []; 'GHK'.split('').forEach((k) => add(k, true));
    chain.forEach((b) => (b.born = -1e6));
    copper = { x: cv.w / 2 + 60, y: cv.h / 2 - 60 };
    relax(300);
    countOut.textContent = '3 / 40';
    caption(); draw();
  }
  let inited = false;
  Lab.view('beads', {
    start() { if (!inited) { initial(); inited = true; } else cv.fit(); running = true; if (!Lab.reduced) { cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); } else draw(); },
    stop() { running = false; cancelAnimationFrame(raf); raf = 0; },
  });
})();
