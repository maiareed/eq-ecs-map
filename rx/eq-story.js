/* Story page variant: the ECS map's figure-as-stage format, driven by a content record.
   Archetype 'receptor_story'. The record lists stops; each stop names the figure layers it shows.
   Components hold no copy. Usage: EQ.story('ldn'). Needs eq-body.js and eq.js first. */
(function () {
  'use strict';
  var EQ = window.EQ, fmt = EQ.fmt, M = EQ.modules, svg = EQ.svg, svgText = EQ.svgText, REDUCED = EQ.reduced;

  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- the figure, with every layer drawn once ---------- */
  function figure(rec) {
    var f = rec.figure || {};
    var s = svg('svg', { class: 'figure', viewBox: '0 0 483.08 754.61', role: 'img', 'aria-label': EQ.plain(f.figure_alt, rec) });
    var g = svg('g', { class: 'breathe' }, s);
    var body = svg('g', null, g); body.innerHTML = window.EQ_BODY_SVG || '';
    var defs = svg('defs', null, s);
    var rg = svg('radialGradient', { id: 'glow-' + rec.slug }, defs);
    svg('stop', { offset: '0%', 'stop-color': 'var(--gold-fill)', 'stop-opacity': 0.9 }, rg);
    svg('stop', { offset: '100%', 'stop-color': 'var(--gold-fill)', 'stop-opacity': 0 }, rg);

    // capsule route
    var cap = svg('g', { class: 'layer capsule' }, g);
    var pts = f.capsule_path || [];
    if (pts.length > 1) {
      var d = 'M' + pts.map(function (p) { return p.x + ',' + p.y; }).join(' L');
      svg('path', { class: 'route', id: 'cap-route-' + rec.slug, d: d }, cap);
      var pill = svg('g', null, cap);
      svg('rect', { class: 'pill', x: -13, y: -6.5, width: 26, height: 13, rx: 6.5 }, pill);
      svg('rect', { class: 'pill-half', x: 0, y: -5, width: 11.5, height: 10, rx: 5 }, pill);
      var end = pts[pts.length - 1];
      if (REDUCED) pill.setAttribute('transform', 'translate(' + end.x + ',' + end.y + ')');
      else {
        var am = svg('animateMotion', { dur: '2.6s', begin: 'indefinite', fill: 'freeze', rotate: 'auto', keyPoints: '0;1', keyTimes: '0;1', calcMode: 'spline', keySplines: '.4 0 .2 1' }, pill);
        var mp = svg('mpath', null, am); mp.setAttribute('href', '#cap-route-' + rec.slug);
        cap._play = function () { try { am.beginElement(); } catch (e) {} };
      }
      (f.capsule_labels || []).forEach(function (l) { svgText(cap, l.x, l.y, l.label_text, { class: 'figure-label', 'text-anchor': l.anchor || 'start' }); });
    }

    // rebound glow sits under the receptor points
    var reb = svg('g', { class: 'layer rebound' }, g);
    (f.rebound_glows || []).forEach(function (p) { svg('circle', { class: 'glow', cx: p.x, cy: p.y, r: p.r || 90 }, reb); });

    var rcp = svg('g', { class: 'layer receptors' }, g);
    var blk = svg('g', { class: 'layer block' }, g);
    (f.receptor_points || []).forEach(function (p, i) {
      var pg = svg('g', { class: 'rpt', transform: 'translate(' + p.x + ',' + p.y + ')' }, rcp);
      var r1 = svg('circle', { class: 'ripple', r: 7 }, pg); r1.style.animationDelay = (i * 0.35) + 's';
      var r2 = svg('circle', { class: 'ripple second', r: 7 }, pg); r2.style.animationDelay = (i * 0.35 + 1.4) + 's';
      svg('circle', { class: 'core', r: 7 }, pg);
      svg('circle', { class: 'ring ' + (f.block_tier || 't1'), cx: p.x, cy: p.y, r: 13 }, blk);
      var w = svg('g', { transform: 'translate(' + p.x + ',' + p.y + ')' }, reb);
      ['w1', 'w2', 'w3'].forEach(function (k) { var c = svg('circle', { class: 'wave ' + k, r: 10 }, w); c.style.animationDelay = (i * 0.3 + (k === 'w2' ? 1.2 : k === 'w3' ? 2.4 : 0)) + 's'; });
    });
    (f.receptor_labels || []).forEach(function (l) { svgText(rcp, l.x, l.y, l.label_text, { class: 'figure-label', 'text-anchor': l.anchor || 'start' }); });

    var gl = svg('g', { class: 'layer glia' }, g);
    (f.glia_points || []).forEach(function (p) {
      var sg = svg('g', { transform: 'translate(' + p.x + ',' + p.y + ')' }, gl);
      svg('circle', { class: 'halo', r: 15 }, sg);
      for (var k = 0; k < 3; k++) { var a = k * Math.PI / 3; svg('line', { class: 'star', x1: -8 * Math.cos(a), y1: -8 * Math.sin(a), x2: 8 * Math.cos(a), y2: 8 * Math.sin(a) }, sg); }
    });
    (f.glia_labels || []).forEach(function (l) { svgText(gl, l.x, l.y, l.label_text, { class: 'figure-label', 'text-anchor': l.anchor || 'start' }); });

    var moon = svg('g', { class: 'layer moon' }, g);
    if (f.moon_point) {
      var mg = svg('g', { transform: 'translate(' + f.moon_point.x + ',' + f.moon_point.y + ')' }, moon);
      svg('path', { d: 'M8,-14 A16,16 0 1,0 8,14 A12,12 0 1,1 8,-14 Z' }, mg);
      if (f.moon_point.label_text) svgText(moon, f.moon_point.x + 24, f.moon_point.y + 6, f.moon_point.label_text, { class: 'figure-label' });
    }
    s._layers = { capsule: cap };
    return s;
  }

  /* ---------- card visuals, data from the record ---------- */
  var V = {};
  function arc(cx, cy, r, a0, a1) {
    var p = function (a) { var t = (a - 90) * Math.PI / 180; return [cx + r * Math.cos(t), cy + r * Math.sin(t)]; };
    if (a1 - a0 >= 359.9) return 'M' + (cx) + ',' + (cy - r) + ' A' + r + ',' + r + ' 0 1,1 ' + (cx - 0.01) + ',' + (cy - r);
    var s0 = p(a0), s1 = p(a1);
    return 'M' + s0[0].toFixed(1) + ',' + s0[1].toFixed(1) + ' A' + r + ',' + r + ' 0 ' + (a1 - a0 > 180 ? 1 : 0) + ',1 ' + s1[0].toFixed(1) + ',' + s1[1].toFixed(1);
  }
  V.dose_clock = function (rec, stop) {
    var c = rec.dose_clock || {}, box = el('div', { class: 'clock' });
    var s = svg('svg', { viewBox: '0 0 240 240', role: 'img', 'aria-label': EQ.plain(c.clock_alt, rec) });
    var hours = c.hours || 24, deg = function (h) { return 360 * h / hours; };
    svg('circle', { cx: 120, cy: 120, r: 100, fill: 'none', stroke: 'var(--line)', 'stroke-width': 14 }, s);
    svg('circle', { cx: 120, cy: 120, r: 76, fill: 'none', stroke: 'var(--line)', 'stroke-width': 14 }, s);
    svg('path', { d: arc(120, 120, 100, 0, deg(c.standard_hours)), fill: 'none', stroke: 'var(--plum)', 'stroke-width': 14, 'stroke-linecap': 'round' }, s);
    svg('path', { d: arc(120, 120, 76, 0, deg(c.low_hours)), fill: 'none', stroke: 'var(--plum)', 'stroke-width': 14, 'stroke-linecap': 'round', opacity: 0.75 }, s);
    svg('path', { d: arc(120, 120, 54, deg(c.low_hours), deg(hours) - 4), fill: 'none', stroke: 'var(--gold-fill)', 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-dasharray': '0.5 11' }, s);
    (c.ticks || []).forEach(function (t) {
      var a = (deg(t.hour) - 90) * Math.PI / 180;
      svgText(s, 120 + 33 * Math.cos(a), 125 + 33 * Math.sin(a), t.tick_label, { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: 'var(--text-dim)' });
    });
    box.appendChild(s);
    box.appendChild(el('ul', null, (c.rings || []).map(function (r) { return '<li><i class="' + esc(r.ring_style) + '" aria-hidden="true"></i><span>' + fmt(r.ring_text, rec) + '</span></li>'; }).join('')));
    var wrap = el('div'); wrap.appendChild(box);
    if (c.clock_caption) wrap.appendChild(el('p', { class: 'caption' }, fmt(c.clock_caption, rec)));
    return wrap;
  };
  V.evidence_ladder = function (rec) {
    var sys = EQ._sys;
    var ul = el('ul', { class: 'ladder' });
    sys.tiers.forEach(function (t) {
      var items = (rec.ladder_items || []).filter(function (x) { return x.tier === t.tier_id; });
      ul.appendChild(el('li', null, '<div class="rung"><span class="tier-line ' + t.tier_id + '" aria-hidden="true" style="flex:0 0 34px"></span>' + esc(t.short_label) + '</div>' +
        '<div class="items">' + (items.length ? items.map(function (x) { return '<span class="item">' + fmt(x.item_label, rec) + '</span>'; }).join('') : '<span class="small">' + fmt(rec.ladder_empty_label || '', rec) + '</span>') + '</div>'));
    });
    return ul;
  };
  V.notice_timeline = function (rec, stop, notes) {
    var ol = el('ol', { class: 'ntl' });
    (rec.notice_items || []).forEach(function (n) {
      ol.appendChild(el('li', null, '<div class="when">' + fmt(n.when_label, rec) + '</div><p>' + fmt(n.notice_text, rec) + notes.ref(n.source_ids) + '</p>' + M.tierChip(n.tier) + M.pending(n.pending_clinician)));
    });
    return ol;
  };

  /* ---------- page ---------- */
  EQ.story = function (slug, base) {
    base = base || 'content/';
    return Promise.all([EQ.getJSON(base + '_system.json'), EQ.getJSON(base + slug + '.json')]).then(function (res) {
      var SYS = res[0], rec = res[1];
      EQ.setContext(SYS, rec); EQ._sys = SYS;
      document.title = rec.page_title;
      EQ.initTheme();
      var back = document.querySelector('.back-link'); if (back) back.textContent = '← ' + SYS.ui_back_to_hub;
      var app = document.getElementById('app'); app.innerHTML = '';
      var notes = EQ.Notes(rec);

      var hero = el('header', { class: 'story-hero' });
      hero.innerHTML = '<div class="kicker rise">' + fmt(rec.kicker, rec) + '</div><h1 class="rise d1">' + fmt(rec.headline, rec) + '</h1><p class="lede rise d2">' + fmt(rec.lede, rec) + '</p>';
      var story = el('div', { class: 'story' });
      story.appendChild(hero);
      var stage = el('div', { class: 'stage', 'data-state': (rec.figure.overview_layers || []).join(' ') });
      var inner = el('div', { class: 'stage-inner' });
      inner.appendChild(el('div', { class: 'blob b1', 'aria-hidden': 'true' })); inner.appendChild(el('div', { class: 'blob b2', 'aria-hidden': 'true' }));
      var fig = figure(rec); inner.appendChild(fig); stage.appendChild(inner);
      stage.appendChild(el('div', { class: 'stage-key' }, (rec.figure.key_items || []).map(function (k) { return '<span><i class="' + esc(k.key_style) + '" aria-hidden="true"></i>' + fmt(k.key_text, rec) + '</span>'; }).join('')));
      var tracker = el('div', { class: 'tracker' }, '<div class="count" aria-live="polite"></div><div class="bar"><div class="fill"></div></div>');
      stage.appendChild(tracker);
      story.appendChild(stage);

      var stops = rec.story_stops || [];
      var ol = el('ol', { class: 'stops' });
      stops.forEach(function (st, i) {
        var li = el('li', { class: 'stop', 'data-i': i });
        var card = el('div', { class: 'stop-card' });
        card.innerHTML = '<div class="kicker">' + fmt(st.stop_kicker, rec) + '</div><h2>' + fmt(st.stop_title, rec) + '</h2><p>' + fmt(st.stop_body, rec) + notes.ref(st.source_ids) + '</p>' +
          '<div class="meta">' + M.tierChip(st.tier) + M.pending(st.pending_clinician) + '</div>';
        if (st.card_visual && V[st.card_visual]) { var vw = el('div', { class: 'stop-visual' }); vw.appendChild(V[st.card_visual](rec, st, notes)); card.appendChild(vw); }
        li.appendChild(card); ol.appendChild(li);
      });
      story.appendChild(ol);
      app.appendChild(story);

      // which stop is in view drives the figure
      var countEl = tracker.querySelector('.count'), fillEl = tracker.querySelector('.fill'), current = -1;
      function activate(i) {
        if (i === current) return; current = i;
        var st = stops[i];
        stage.setAttribute('data-state', (st.figure_layers || []).join(' '));
        ol.querySelectorAll('.stop').forEach(function (n) { n.classList.toggle('active', +n.getAttribute('data-i') === i); });
        countEl.textContent = String(SYS.ui_tracker || '').replace('{n}', i + 1).replace('{total}', stops.length);
        fillEl.style.width = ((i + 1) / stops.length * 100) + '%';
        if ((st.figure_layers || []).indexOf('capsule') >= 0 && fig._layers.capsule._play) fig._layers.capsule._play();
      }
      countEl.textContent = fmt(rec.figure.overview_label || '', rec);
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) { if (e.isIntersecting) activate(+e.target.getAttribute('data-i')); });
        }, { rootMargin: window.innerWidth >= 900 ? '-45% 0px -45% 0px' : '-52% 0px -30% 0px' });
        ol.querySelectorAll('.stop').forEach(function (n) { io.observe(n); });
      }
      ol.querySelectorAll('.stop').forEach(function (n) { n.addEventListener('click', function () { activate(+n.getAttribute('data-i')); }); });

      // after the story: CTA, ECS map crosslink, clinician drawer
      var after = el('div', { class: 'after' });
      var cta = M.cta(rec); if (cta) after.appendChild(cta);
      if (rec.crosslink_href) {
        var a = el('a', { class: 'crosslink', href: rec.crosslink_href });
        var mini = EQ.bodyMap(rec.crosslink_points || [], rec.crosslink_alt);
        a.appendChild(mini);
        a.appendChild(el('div', null, '<div class="k">' + fmt(rec.crosslink_kicker, rec) + '</div><h3>' + fmt(rec.crosslink_title, rec) + '</h3><p>' + fmt(rec.crosslink_body, rec) + '</p><span class="go">' + fmt(rec.crosslink_label, rec) + ' →</span>'));
        after.appendChild(a);
      }
      var dr = el('details', { class: 'drawer' });
      dr.innerHTML = '<summary><h2>' + fmt(SYS.ui_drawer_title) + '</h2><p>' + fmt(SYS.ui_drawer_sub) + '</p></summary>';
      var db = el('div', { class: 'drawer-body' });
      if (rec.not_for_you_if) db.appendChild(M.cautions(rec, notes));
      var cad = M.cadence(rec); if (cad) db.appendChild(cad);
      var tl = M.section(null, null, rec); tl.appendChild(M.tierLegend()); db.appendChild(tl);
      var src = M.sources(notes); if (src) db.appendChild(src);
      dr.appendChild(db);
      after.appendChild(dr);
      // footnote links open the drawer
      app.addEventListener('click', function (e) { var t = e.target.closest && e.target.closest('.fn a'); if (t) dr.open = true; });
      after.appendChild(M.footer(rec));
      app.appendChild(after);
      document.documentElement.setAttribute('data-ready', '1');
    }).catch(function (err) {
      document.getElementById('app').innerHTML = '<p class="body-copy">' + esc(String(err)) + '</p>';
      document.documentElement.setAttribute('data-ready', 'error');
    });
  };
})();
