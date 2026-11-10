/* Equilibria Rx Learn runtime.
   Components hold no copy. Every visible string comes from rx/content/*.json.
   Pages call EQ.page('<slug>') or EQ.hub(). */
(function () {
  'use strict';
  var EQ = window.EQ = {};
  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';
  var SYS = null;

  /* ---------- helpers ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  // copy formatting: {{field}} interpolation from the record, *italic*. Everything else is escaped.
  function fmt(s, rec) {
    var out = esc(s).replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/g, function (m, k) { return rec && rec[k] != null ? esc(rec[k]) : m; });
    return out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  }
  EQ.fmt = fmt;
  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) { if (attrs[k] != null) n.setAttribute(k, attrs[k]); }
    if (html != null) n.innerHTML = html;
    return n;
  }
  function svg(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  var CUR = null; // record being rendered, for {{field}} interpolation inside SVG text
  function plain(s, rec) {
    return String(s == null ? '' : s).replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/g, function (m, k) { return rec && rec[k] != null ? rec[k] : m; }).replace(/\*([^*]+)\*/g, '$1');
  }
  function svgText(parent, x, y, str, attrs) {
    var t = svg('text', Object.assign({ x: x, y: y, fill: 'var(--text-soft)' }, attrs || {}), parent);
    t.textContent = plain(str, CUR);
    return t;
  }
  function getJSON(path) {
    return fetch(path, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(path + ' ' + r.status);
      return r.json();
    });
  }
  EQ.getJSON = getJSON;

  /* ---------- theme ---------- */
  EQ.initTheme = function () {
    var btn = document.querySelector('.theme-toggle');
    if (!btn) return;
    function cur() { return document.documentElement.getAttribute('data-theme') || 'light'; }
    function paint() {
      var dark = cur() === 'dark';
      btn.textContent = dark ? '☀' : '☾';
      btn.setAttribute('aria-label', dark ? (SYS ? SYS.ui_theme_light : '') : (SYS ? SYS.ui_theme_dark : ''));
    }
    btn.addEventListener('click', function () {
      var next = cur() === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('eq-theme', next); } catch (e) {}
      paint();
    });
    paint();
  };

  /* ---------- footnotes ---------- */
  // Sources are numbered in order of first use on the page.
  function Notes(rec) {
    var byId = {}, order = [];
    (rec.sources || []).forEach(function (s) { byId[s.source_id] = s; });
    return {
      ref: function (ids) {
        if (!ids || !ids.length) return '';
        return '<span class="fn">' + ids.map(function (id) {
          if (!byId[id]) return '';
          var i = order.indexOf(id);
          if (i < 0) { order.push(id); i = order.length - 1; }
          return '<a href="#src-' + esc(id) + '" aria-label="' + esc((SYS.ui_source_aria || '') + ' ' + (i + 1)) + '">[' + (i + 1) + ']</a>';
        }).join('') + '</span>';
      },
      list: function () { return order.map(function (id) { return byId[id]; }); }
    };
  }

  /* ---------- shared modules ---------- */
  var M = EQ.modules = {};

  M.pending = function (on) { return on ? ' <span class="pending">' + esc(SYS.ui_pending_label) + '</span>' : ''; };

  M.tierChip = function (tierId) {
    if (tierId === 'none') return '<span class="tier-chip"><span class="tier-line none" aria-hidden="true"></span>' + esc(SYS.ui_no_data_label) + '</span>';
    var t = SYS.tiers.filter(function (x) { return x.tier_id === tierId; })[0];
    if (!t) return '';
    return '<span class="tier-chip"><span class="tier-line ' + esc(t.tier_id) + '" aria-hidden="true"></span>' + esc(t.short_label) + '</span>';
  };

  M.tierLegend = function () {
    var box = el('div', { class: 'panel' });
    box.innerHTML = '<h3>' + fmt(SYS.ui_tier_legend_title) + '</h3><p class="small">' + fmt(SYS.ui_tier_legend_intro) + '</p>' +
      '<div class="tier-legend">' + SYS.tiers.map(function (t) {
        return '<div class="tier-key"><span class="tier-line ' + esc(t.tier_id) + '" aria-hidden="true"></span><span><strong>' + esc(t.short_label) + '.</strong> ' + esc(t.description) + '</span></div>';
      }).join('') + '</div>';
    return box;
  };

  M.hero = function (rec) {
    var h = el('header', { class: 'hero' });
    var html = '';
    if (rec.internal_banner) html += '<div class="internal-banner">' + fmt(rec.internal_banner) + '</div>';
    html += '<div class="kicker rise">' + fmt(rec.kicker, rec) + '</div>';
    html += '<h1 class="rise d1">' + fmt(rec.headline, rec) + '</h1>';
    html += '<p class="lede rise d2">' + fmt(rec.lede, rec) + '</p>';
    h.innerHTML = html;
    return h;
  };

  M.section = function (title, intro, rec) {
    var s = el('section', { class: 'block' });
    if (title) s.appendChild(el('h2', null, fmt(title, rec)));
    if (intro) s.appendChild(el('p', { class: 'body-copy' }, fmt(intro, rec)));
    return s;
  };

  M.recognition = function (rec, notes) {
    var s = el('section', { class: 'block' });
    s.appendChild(el('p', { class: 'recognition' }, fmt(rec.recognition, rec)));
    if (rec.reframe) s.appendChild(el('div', { class: 'body-copy', style: 'margin-top:18px' }, '<p>' + fmt(rec.reframe, rec) + notes.ref(rec.reframe_source_ids) + '</p>'));
    return s;
  };

  M.steps = function (rec, notes) {
    var s = M.section(rec.mechanism_title, rec.mechanism_intro, rec);
    var ol = el('ol', { class: 'steps' });
    (rec.mechanism_steps || []).forEach(function (st) {
      var li = el('li', { class: 'tiered ' + esc(st.tier) });
      li.innerHTML = '<h3>' + fmt(st.step_title, rec) + '</h3><p>' + fmt(st.step_body, rec) + notes.ref(st.source_ids) + '</p>' + M.tierChip(st.tier) + M.pending(st.pending_clinician);
      ol.appendChild(li);
    });
    s.appendChild(ol);
    return s;
  };

  M.notice = function (rec, notes) {
    var s = M.section(SYS.ui_notice_title, rec.notice_intro, rec);
    var ol = el('ol', { class: 'timeline' });
    (rec.notice_items || []).forEach(function (n) {
      var li = el('li', { class: 'tiered ' + esc(n.tier) });
      li.innerHTML = '<div class="when">' + fmt(n.when_label, rec) + '</div><div><p>' + fmt(n.notice_text, rec) + notes.ref(n.source_ids) + '</p>' + M.tierChip(n.tier) + M.pending(n.pending_clinician) + '</div>';
      ol.appendChild(li);
    });
    s.appendChild(ol);
    return s;
  };

  M.route = function (rec, notes) {
    var s = M.section(SYS.ui_route_title, rec.route_intro, rec);
    var box = el('div', { class: 'panel route' });
    var fig = el('div', { class: 'route-figure' });
    fig.appendChild(EQ.bodyMap(rec.route_points || [], rec.route_figure_label));
    box.appendChild(fig);
    var txt = el('div');
    txt.innerHTML = '<ol>' + (rec.route_steps || []).map(function (r) { return '<li>' + fmt(r.route_text, rec) + notes.ref(r.source_ids) + (r.tier ? '<br>' + M.tierChip(r.tier) : '') + M.pending(r.pending_clinician) + '</li>'; }).join('') + '</ol>';
    box.appendChild(txt);
    s.appendChild(box);
    return s;
  };

  M.cautions = function (rec, notes) {
    var s = M.section(SYS.ui_cautions_title, rec.cautions_intro, rec);
    var box = el('div', { class: 'panel' });
    box.innerHTML = '<div class="cautions"><div><h3>' + fmt(SYS.ui_not_for_you_title) + '</h3><ul>' +
      (rec.not_for_you_if || []).map(function (c) { return '<li>' + fmt(c.item_text, rec) + notes.ref(c.source_ids) + '</li>'; }).join('') + '</ul></div>' +
      '<div><h3>' + fmt(SYS.ui_watch_title) + '</h3><ul>' +
      (rec.what_to_watch || []).map(function (c) { return '<li>' + fmt(c.item_text, rec) + notes.ref(c.source_ids) + '</li>'; }).join('') + '</ul></div></div>' +
      '<div class="pending-wrap">' + M.pending(true) + '</div>' +
      (SYS.ui_cautions_footer ? '<p class="small" style="margin-top:12px">' + fmt(SYS.ui_cautions_footer) + '</p>' : '');
    s.appendChild(box);
    return s;
  };

  M.cadence = function (rec) {
    if (!rec.cadence_ships) return null;
    var s = M.section(SYS.ui_cadence_title, rec.cadence_intro, rec);
    var rail = el('div', { class: 'cadence' });
    [['ui_cadence_ships', 'cadence_ships'], ['ui_cadence_recheck', 'cadence_recheck'], ['ui_cadence_refills', 'cadence_refills']].forEach(function (p) {
      rail.appendChild(el('div', null, '<div class="label">' + fmt(SYS[p[0]]) + '</div><div class="val">' + fmt(rec[p[1]], rec) + '</div>'));
    });
    s.appendChild(rail);
    if (rec.cadence_pending) s.appendChild(el('div', { class: 'pending-wrap' }, M.pending(true)));
    return s;
  };

  M.cta = function (rec) {
    if (!rec.cta_label) return null;
    var s = el('section', { class: 'block panel cta' });
    s.innerHTML = '<h2>' + fmt(rec.cta_title, rec) + '</h2><a class="btn" href="' + esc(rec.cta_href || '#') + '">' + fmt(rec.cta_label, rec) + '</a>' +
      (rec.cta_note ? '<p>' + fmt(rec.cta_note, rec) + '</p>' : '');
    return s;
  };

  M.sources = function (notes) {
    var list = notes.list();
    if (!list.length) return null;
    var s = el('section', { class: 'block sources' });
    s.innerHTML = '<h2>' + fmt(SYS.ui_sources_title) + '</h2><ol>' + list.map(function (x) {
      return '<li id="src-' + esc(x.source_id) + '">' + esc(x.citation) + ' <a href="' + esc(x.url) + '" rel="noopener" target="_blank">' + esc(SYS.ui_source_link) + '</a></li>';
    }).join('') + '</ol>';
    return s;
  };

  M.footer = function (rec) {
    return el('footer', { class: 'foot' }, fmt(rec.footer_note || SYS.ui_footer, rec));
  };

  /* ---------- bottom sheet ---------- */
  var sheetEl, sheetBody, lastFocus;
  function ensureSheet() {
    if (sheetEl) return;
    var bd = el('div', { class: 'sheet-backdrop' });
    sheetEl = el('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': SYS.ui_sheet_label });
    sheetEl.innerHTML = '<div class="sheet-bar"><span class="sheet-handle"></span><button class="sheet-close" type="button" aria-label="' + esc(SYS.ui_close) + '">✕</button></div><div class="sheet-body"></div>';
    document.body.appendChild(bd); document.body.appendChild(sheetEl);
    sheetBody = sheetEl.querySelector('.sheet-body');
    bd.addEventListener('click', EQ.closeSheet);
    sheetEl.querySelector('.sheet-close').addEventListener('click', EQ.closeSheet);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') EQ.closeSheet(); });
  }
  EQ.openSheet = function (html) {
    ensureSheet();
    lastFocus = document.activeElement;
    sheetBody.innerHTML = html;
    sheetEl.scrollTop = 0;
    document.body.classList.add('sheet-open');
    sheetEl.querySelector('.sheet-close').focus();
  };
  EQ.closeSheet = function () {
    if (!document.body.classList.contains('sheet-open')) return;
    document.body.classList.remove('sheet-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };

  /* ---------- body map component ---------- */
  // points: [{x, y, point_label}] in the silhouette's own coordinates (viewBox 0 0 483.08 754.61)
  EQ.bodyMap = function (points, label) {
    var s = svg('svg', { viewBox: '0 0 483.08 754.61', class: 'viz', role: 'img', 'aria-label': plain(label, CUR) });
    var g = svg('g', null, s);
    g.innerHTML = window.EQ_BODY_SVG || '';
    if (points.length > 1) {
      svg('polyline', { class: 'path', points: points.map(function (p) { return p.x + ',' + p.y; }).join(' ') }, s);
    }
    points.forEach(function (p, i) {
      var pg = svg('g', { class: 'pt', transform: 'translate(' + p.x + ',' + p.y + ')' }, s);
      var ring = svg('circle', { class: 'ring', r: 16 }, pg);
      svg('circle', { class: 'core', r: 9 }, pg);
      if (!REDUCED) {
        svg('animate', { attributeName: 'r', values: '12;22;12', dur: '2.6s', begin: (i * 0.4) + 's', repeatCount: 'indefinite' }, ring);
      }
      var t = svg('title', null, pg); t.textContent = plain(p.point_label, CUR);
    });
    return s;
  };

  /* Visuals render at the panel's real pixel width so SVG text stays at true size on phones. */
  function vizWidth() {
    var app = document.getElementById('app');
    var w = (app ? app.clientWidth : 720) - (window.innerWidth > 760 ? 66 : 42);
    return Math.max(300, Math.min(720, Math.round(w)));
  }
  EQ.vizWidth = vizWidth;

  /* ---------- archetypes ---------- */
  var A = EQ.archetypes = {};

  /* Receptor signal (LDN). Two dose lanes over a 24-hour axis.
     Solid band = receptor occupancy window; dotted curve = the body's own response (theory tier). */
  A.receptor_signal = function (rec, notes) {
    var s = M.section(rec.viz_title, rec.viz_intro, rec);
    var panel = el('div', { class: 'panel' });
    var W = vizWidth(), compact = W < 560;
    var L = compact ? 8 : 132, R = compact ? 8 : 24, plotW = W - L - R;
    var lanes = rec.viz_lanes || [];
    var laneH = compact ? 150 : 130, top = compact ? 8 : 40;
    var H = top + lanes.length * laneH + 56;
    var root = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'viz', role: 'img', 'aria-label': plain(rec.viz_alt, rec) });
    var hours = rec.viz_axis_hours || 24;
    function x(h) { return L + plotW * (h / hours); }

    // axis
    var axisY = top + lanes.length * laneH + 8;
    svg('line', { x1: L, y1: axisY, x2: W - R, y2: axisY, stroke: 'var(--line)', 'stroke-width': 2 }, root);
    (rec.viz_axis_ticks || []).forEach(function (t) {
      svg('line', { x1: x(t.hour), y1: axisY, x2: x(t.hour), y2: axisY + 8, stroke: 'var(--text-dim)', 'stroke-width': 1.5 }, root);
      svgText(root, x(t.hour), axisY + 30, t.tick_label, { 'text-anchor': t.hour === 0 ? 'start' : (t.hour === hours ? 'end' : 'middle'), 'font-size': 16 });
    });

    var laneGroups = [];
    lanes.forEach(function (ln, i) {
      var g = svg('g', { class: 'lane', 'data-lane': ln.lane_id }, root);
      var y0 = top + i * laneH;
      svg('rect', { x: L, y: y0, width: plotW, height: laneH - 18, rx: 14, fill: 'var(--bg-sunk)' }, g);
      if (compact) {
        var lt = svgText(g, L + 12, y0 + 26, ln.lane_label, { 'font-size': 17, 'font-weight': 700, fill: 'var(--text)' });
        svgText(g, W - R - 12, y0 + 26, ln.lane_sublabel || '', { 'font-size': 16, 'text-anchor': 'end' });
      } else {
        svgText(g, 12, y0 + 34, ln.lane_label, { 'font-size': 19, 'font-weight': 700, fill: 'var(--text)' });
        svgText(g, 12, y0 + 58, ln.lane_sublabel || '', { 'font-size': 16 });
      }
      // occupancy band: opacity ramps down over its window
      var gradId = 'occ-' + ln.lane_id;
      var defs = svg('defs', null, g);
      var lg = svg('linearGradient', { id: gradId, x1: 0, x2: 1, y1: 0, y2: 0 }, defs);
      svg('stop', { offset: '0%', 'stop-color': 'var(--plum)', 'stop-opacity': 0.85 }, lg);
      svg('stop', { offset: '70%', 'stop-color': 'var(--plum)', 'stop-opacity': 0.55 }, lg);
      svg('stop', { offset: '100%', 'stop-color': 'var(--plum)', 'stop-opacity': 0.08 }, lg);
      var bandY = y0 + (compact ? 38 : 16), bandH = 30;
      svg('rect', { x: x(0), y: bandY, width: Math.max(4, x(ln.occupancy_hours) - x(0)), height: bandH, rx: 8, fill: 'url(#' + gradId + ')' }, g);
      svg('rect', { x: x(0), y: bandY, width: Math.max(4, x(ln.occupancy_hours) - x(0)), height: bandH, rx: 8, fill: 'none', stroke: 'var(--plum)', 'stroke-width': ln.occupancy_tier === 't1' ? 3 : 2, 'stroke-dasharray': ln.occupancy_tier === 't3' ? '8 6' : (ln.occupancy_tier === 't4' ? '2 6' : 'none') }, g);
      svgText(g, x(0) + 10, bandY + 21, ln.occupancy_label, { 'font-size': 16, 'font-weight': 700, fill: 'var(--bg-panel)' });
      // response curve (theory): dotted line
      if (ln.response_points && ln.response_points.length) {
        var baseY = y0 + laneH - (compact ? 40 : 26), amp = compact ? 38 : 52;
        var d = ln.response_points.map(function (p, k) { return (k ? 'L' : 'M') + x(p.hour).toFixed(1) + ',' + (baseY - amp * p.level).toFixed(1); }).join(' ');
        var path = svg('path', { d: d, fill: 'none', stroke: 'var(--gold-fill)', 'stroke-width': 4, 'stroke-linecap': 'round',
          'stroke-dasharray': ln.response_tier === 't4' ? '1 9' : (ln.response_tier === 't3' ? '10 7' : 'none') }, g);
        var last = ln.response_points[Math.floor(ln.response_points.length * 0.62)];
        svgText(g, compact ? W - R - 12 : x(last.hour), compact ? baseY + 14 : baseY - amp * last.level - 14, ln.response_label, { 'font-size': 16, 'font-weight': 700, fill: 'var(--gold)', 'text-anchor': compact ? 'end' : 'middle' });
        if (!REDUCED) {
          var len = 900;
          path.setAttribute('stroke-dasharray', ln.response_tier === 't4' ? '1 9' : '10 7');
          path.style.opacity = '0';
          setTimeout(function () { path.style.transition = 'opacity 1.2s ease'; path.style.opacity = '1'; }, 400 + i * 300);
        }
      }
      laneGroups.push(g);
    });

    // scrubber cursor
    var cursor = svg('line', { x1: x(0), x2: x(0), y1: top - 10, y2: axisY, stroke: 'var(--text)', 'stroke-width': 2, 'stroke-dasharray': '4 4', opacity: 0 }, root);
    panel.appendChild(root);
    panel.appendChild(el('p', { class: 'caption' }, fmt(rec.viz_caption, rec) + notes.ref(rec.viz_caption_source_ids)));

    // legend of line styles specific to this visual
    var leg = el('div', { class: 'tier-legend' });
    leg.innerHTML = (rec.viz_legend || []).map(function (k) {
      return '<div class="tier-key"><span class="tier-line ' + esc(k.tier) + '" aria-hidden="true" style="border-top-color:' + (k.swatch === 'gold' ? 'var(--gold-fill)' : 'var(--plum)') + '"></span><span>' + fmt(k.legend_text, rec) + '</span></div>';
    }).join('');
    panel.appendChild(leg);

    // interaction: lane focus + time scrubber (adds depth; static frame already shows both lanes)
    var ctrl = el('div', { class: 'control' });
    ctrl.innerHTML = '<label>' + fmt(rec.viz_focus_label) + '</label><div class="seg" role="group">' +
      [{ id: 'all', label: rec.viz_focus_all }].concat(lanes.map(function (l) { return { id: l.lane_id, label: l.lane_label }; })).map(function (o, k) {
        return '<button type="button" data-focus="' + esc(o.id) + '" aria-pressed="' + (k === 0) + '">' + fmt(o.label) + '</button>';
      }).join('') + '</div>' +
      '<label for="scrub-' + esc(rec.slug) + '" style="margin-top:18px">' + fmt(rec.viz_scrub_label) + '</label>' +
      '<input id="scrub-' + esc(rec.slug) + '" type="range" min="0" max="' + hours + '" step="1" value="0">' +
      '<p class="body-copy" aria-live="polite" data-readout>' + fmt(rec.viz_scrub_prompt) + '</p>';
    panel.appendChild(ctrl);
    ctrl.querySelectorAll('[data-focus]').forEach(function (b) {
      b.addEventListener('click', function () {
        ctrl.querySelectorAll('[data-focus]').forEach(function (o) { o.setAttribute('aria-pressed', o === b); });
        var f = b.getAttribute('data-focus');
        laneGroups.forEach(function (g) { g.style.opacity = (f === 'all' || g.getAttribute('data-lane') === f) ? '1' : '0.25'; });
      });
    });
    var range = ctrl.querySelector('input'), readout = ctrl.querySelector('[data-readout]');
    range.addEventListener('input', function () {
      var h = +range.value;
      cursor.setAttribute('x1', x(h)); cursor.setAttribute('x2', x(h)); cursor.setAttribute('opacity', 1);
      var st = (rec.viz_scrub_states || []).filter(function (z) { return h >= z.from_hour && h <= z.to_hour; })[0];
      readout.innerHTML = st ? fmt(st.state_text, rec) : '';
    });
    s.appendChild(panel);
    return s;
  };

  /* Cell energy (NAD+, MOTS-c). A mitochondrion with a molecule in one of two roles:
     'shuttle' = loops inside the energy line; 'signal' = leaves the mitochondrion for a target.
     Plus a level gauge across states (age, rest vs exercise) set by the record. */
  A.cell_energy = function (rec, notes) {
    var s = M.section(rec.viz_title, rec.viz_intro, rec);
    var panel = el('div', { class: 'panel' });
    var W = 720, H = 360;
    var root = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'viz', role: 'img', 'aria-label': plain(rec.viz_alt, rec) });
    var defs = svg('defs', null, root);
    var glow = svg('radialGradient', { id: 'mito-glow-' + rec.slug }, defs);
    svg('stop', { offset: '0%', 'stop-color': 'var(--gold-fill)', 'stop-opacity': 0.35 }, glow);
    svg('stop', { offset: '100%', 'stop-color': 'var(--gold-fill)', 'stop-opacity': 0 }, glow);

    var signal = rec.viz_role === 'signal';
    var cx = signal ? 270 : 360, cy = 170;
    svg('ellipse', { cx: cx, cy: cy, rx: 230, ry: 150, fill: 'url(#mito-glow-' + rec.slug + ')' }, root);
    // outer membrane
    svg('rect', { x: cx - 190, y: cy - 92, width: 380, height: 184, rx: 92, fill: 'var(--bg-sunk)', stroke: 'var(--plum)', 'stroke-width': 3 }, root);
    // cristae
    var cr = '';
    for (var i = 0; i < 6; i++) {
      var xx = cx - 140 + i * 56;
      cr += 'M' + xx + ',' + (cy - 70) + ' C' + (xx + 26) + ',' + (cy - 30) + ' ' + (xx - 26) + ',' + (cy + 30) + ' ' + xx + ',' + (cy + 70) + ' ';
    }
    svg('path', { d: cr, fill: 'none', stroke: 'var(--plum)', 'stroke-width': 2, opacity: 0.45, 'stroke-linecap': 'round' }, root);
    if (false) svgText(root, cx, cy + 122, rec.viz_organelle_label, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, fill: 'var(--text)' });

    var nodes = rec.viz_nodes || [];
    var mover;
    if (!signal) {
      // shuttle loop: pick up (left) to drop off (right)
      var loop = 'M' + (cx - 120) + ',' + cy + ' C' + (cx - 60) + ',' + (cy - 70) + ' ' + (cx + 60) + ',' + (cy - 70) + ' ' + (cx + 120) + ',' + cy +
        ' C' + (cx + 60) + ',' + (cy + 70) + ' ' + (cx - 60) + ',' + (cy + 70) + ' ' + (cx - 120) + ',' + cy + ' Z';
      svg('path', { id: 'loop-' + rec.slug, d: loop, fill: 'none', stroke: 'var(--gold-fill)', 'stroke-width': 2.5, 'stroke-dasharray': rec.viz_path_tier === 't1' ? 'none' : '7 7', opacity: 0.9 }, root);
      mover = 'loop-' + rec.slug;
    } else {
      var tx = W - 92, ty = cy;
      var p = 'M' + (cx + 150) + ',' + cy + ' C' + (cx + 230) + ',' + (cy - 90) + ' ' + (tx - 110) + ',' + (ty - 90) + ' ' + (tx - 46) + ',' + ty;
      svg('path', { id: 'sig-' + rec.slug, d: p, fill: 'none', stroke: 'var(--gold-fill)', 'stroke-width': 2.5, 'stroke-dasharray': rec.viz_path_tier === 't4' ? '1 8' : '7 7' }, root);
      svg('circle', { cx: tx, cy: ty, r: 48, fill: 'var(--bg-panel)', stroke: 'var(--olive)', 'stroke-width': 3 }, root);
      svg('circle', { cx: tx, cy: ty, r: 18, fill: 'var(--olive)', opacity: 0.35 }, root);
      if (false) svgText(root, tx, ty + 76, rec.viz_target_label || '', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, fill: 'var(--text)' });
      mover = 'sig-' + rec.slug;
    }
    // node markers: numbered in the drawing, labeled in an HTML key below (legible at any width)
    var narrow = vizWidth() < 560, compact = true;
    function openNode(n) { EQ.openSheet('<h3>' + fmt(n.node_label, rec) + '</h3><p>' + fmt(n.node_detail, rec) + notes.ref(n.source_ids) + '</p>' + M.tierChip(n.tier)); }
    nodes.forEach(function (n, i) {
      notes.ref(n.source_ids);
      var g = svg('g', { class: 'node', tabindex: 0, role: 'button', 'aria-label': plain(n.node_label, rec) }, root);
      g.style.cursor = 'pointer';
      svg('circle', { cx: n.x, cy: n.y, r: signal ? 48 : 40, fill: 'transparent' }, g);
      svg('circle', { cx: n.x, cy: n.y, r: compact ? 22 : 11, fill: 'var(--plum)' }, g);
      if (compact) svgText(g, n.x, n.y + 10, String(i + 1), { 'text-anchor': 'middle', 'font-size': 28, 'font-weight': 700, fill: 'var(--bg-panel)' });
      else svgText(g, n.x + (n.label_dx || 0), n.y + (n.label_dy || -22), n.node_label, { 'text-anchor': n.anchor || 'middle', 'font-size': 17, 'font-weight': 700, fill: 'var(--text)' });
      g.addEventListener('click', function () { openNode(n); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openNode(n); } });
    });
    // moving molecules
    var count = rec.viz_particles || 5;
    var particles = [];
    for (var k = 0; k < count; k++) {
      var c = svg('circle', { r: 7, fill: 'var(--gold-fill)', stroke: 'var(--bg-panel)', 'stroke-width': 2 }, root);
      particles.push(c);
      if (!REDUCED) {
        // negative begin offsets: every particle is already mid-loop on first paint
        var am = svg('animateMotion', { dur: (signal ? 3.2 : 5) + 's', repeatCount: 'indefinite', begin: (-k * (signal ? 3.2 : 5) / count).toFixed(2) + 's' }, c);
        var mp = svg('mpath', null, am);
        mp.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#' + mover);
        mp.setAttribute('href', '#' + mover);
      }
    }
    // reduced motion: place particles statically along the path
    requestAnimationFrame(function () {
      if (!REDUCED) return;
      var pathEl = root.querySelector('#' + mover);
      if (!pathEl || !pathEl.getTotalLength) return;
      var L = pathEl.getTotalLength();
      particles.forEach(function (c, k) { var pt = pathEl.getPointAtLength(L * (k + 0.5) / count); c.setAttribute('cx', pt.x); c.setAttribute('cy', pt.y); });
    });
    if (!compact) svgText(root, cx, 34, rec.viz_molecule_label, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, fill: 'var(--gold)' });

    root.setAttribute('viewBox', signal ? '50 50 670 250' : (cx - 205) + ' 52 410 240');
    if (!narrow) root.style.maxWidth = '520px', root.style.margin = '0 auto';
    panel.appendChild(root);
    if (compact) {
      var key = el('ul', { class: 'viz-key' });
      key.innerHTML = '<li><span class="swatch gold" aria-hidden="true"></span>' + fmt(rec.viz_molecule_label, rec) + '</li>' +
        '<li><span class="swatch organelle" aria-hidden="true"></span>' + fmt(rec.viz_organelle_label, rec) + '</li>' +
        (signal && rec.viz_target_label ? '<li><span class="swatch target" aria-hidden="true"></span>' + fmt(rec.viz_target_label, rec) + '</li>' : '');
      nodes.forEach(function (n, i) {
        var li = el('li');
        var btn = el('button', { type: 'button', class: 'key-btn' }, '<span class="num" aria-hidden="true">' + (i + 1) + '</span>' + fmt(n.node_label, rec));
        btn.addEventListener('click', function () { openNode(n); });
        li.appendChild(btn); key.appendChild(li);
      });
      panel.appendChild(key);
    }
    panel.appendChild(el('p', { class: 'caption' }, fmt(rec.viz_caption, rec) + notes.ref(rec.viz_caption_source_ids) + ' ' + fmt(rec.viz_tap_hint || '', rec)));

    // gauge: states with relative levels
    if (rec.gauge_states && rec.gauge_states.length) {
      var g = el('div', { class: 'control' });
      var st0 = rec.gauge_states[rec.gauge_default_index || 0];
      g.innerHTML = '<h3 style="margin-top:12px">' + fmt(rec.gauge_title, rec) + '</h3>' +
        '<div class="gauge" style="display:grid;gap:14px;margin-top:14px">' + rec.gauge_states.map(function (st, i) {
          return '<div class="gauge-row" data-i="' + i + '" style="display:grid;grid-template-columns:120px 1fr;gap:12px;align-items:center">' +
            '<div style="font-weight:700">' + fmt(st.state_label, rec) + '</div>' +
            '<div style="height:22px;border-radius:11px;background:var(--bg-sunk);overflow:hidden;border:1px solid var(--line)"><div class="gauge-fill ' + esc(rec.gauge_tier) + '" style="height:100%;width:' + (+st.level_pct) + '%;background:linear-gradient(90deg,var(--plum),var(--gold-fill));border-radius:11px"></div></div></div>';
        }).join('') + '</div>' +
        '<p class="caption">' + fmt(rec.gauge_scale_note, rec) + notes.ref(rec.gauge_source_ids) + '</p><div>' + M.tierChip(rec.gauge_tier) + '</div>' +
        '<div class="seg" role="group" style="margin-top:16px">' + rec.gauge_states.map(function (st, i) {
          return '<button type="button" data-g="' + i + '" aria-pressed="' + (i === (rec.gauge_default_index || 0)) + '">' + fmt(st.state_label, rec) + '</button>';
        }).join('') + '</div>' +
        '<p class="body-copy" aria-live="polite" data-gnote style="margin-top:12px">' + fmt(st0.state_note, rec) + '</p>';
      panel.appendChild(g);
      g.querySelectorAll('[data-g]').forEach(function (b) {
        b.addEventListener('click', function () {
          var i = +b.getAttribute('data-g');
          g.querySelectorAll('[data-g]').forEach(function (o) { o.setAttribute('aria-pressed', o === b); });
          g.querySelectorAll('.gauge-row').forEach(function (r) { r.style.opacity = (+r.getAttribute('data-i') === i) ? '1' : '0.45'; });
          g.querySelector('[data-gnote]').innerHTML = fmt(rec.gauge_states[i].state_note, rec);
        });
      });
    }
    s.appendChild(panel);
    return s;
  };

  /* Scale primer (Bead String). One bead per amino acid. Proteins are truncated with a break mark.
     Small molecules sit off the string as a single glyph. A marker shows a threshold bead count. */
  A.scale_primer = function (rec, notes) {
    var s = M.section(rec.viz_title, rec.viz_intro, rec);
    var panel = el('div', { class: 'panel' });
    var W = vizWidth(), L = 8, perLine = rec.threshold_count || 40;
    var gap = (W - 2 * L - 12) / perLine, r = Math.min(6, gap * 0.38), lineGap = Math.max(14, gap * 1.1);
    var rows = rec.scale_rows || [];
    var y = 20, layout = [];
    rows.forEach(function (row) {
      var shown = row.kind === 'small_molecule' ? 0 : Math.min(row.count, row.kind === 'protein' ? perLine * (W < 560 ? 2 : 3) : row.count);
      var lines = row.kind === 'small_molecule' ? 1 : Math.ceil(shown / perLine);
      var h = 34 + lines * lineGap + (row.kind === 'protein' ? 22 : 8);
      layout.push({ row: row, y: y, shown: shown, lines: lines, h: h });
      y += h + 10;
    });
    var H = y + 24;
    var root = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'viz', role: 'img', 'aria-label': plain(rec.viz_alt, rec) });
    // threshold marker
    if (rec.threshold_count) {
      var tx = L + 8 + (perLine - 0.5) * gap;
      layout.forEach(function (lo) {
        if (lo.row.kind === 'small_molecule') return;
        svg('line', { x1: tx, x2: tx, y1: lo.y + 30, y2: lo.y + 48 + (lo.lines - 1) * lineGap, stroke: 'var(--olive)', 'stroke-width': 2, 'stroke-dasharray': '3 4' }, root);
      });
    }
    layout.forEach(function (lo, idx) {
      var row = lo.row;
      var g = svg('g', { class: 'bead-row', tabindex: 0, role: 'button', 'aria-label': plain(row.row_label + ', ' + row.count_label, rec) }, root);
      g.style.cursor = 'pointer';
      svg('rect', { x: 0, y: lo.y - 4, width: W, height: lo.h, rx: 12, fill: 'transparent' }, g);
      svgText(g, L, lo.y + 18, row.row_label, { 'font-size': 18, 'font-weight': 700, fill: 'var(--text)' });
      svgText(g, W - L, lo.y + 18, row.count_label, { 'font-size': 17, 'text-anchor': 'end', fill: row.kind === 'small_molecule' ? 'var(--olive)' : 'var(--gold)', 'font-weight': 700 });
      var by = lo.y + 40;
      if (row.kind === 'small_molecule') {
        // hexagon glyph: a ring structure, not a chain
        var hx = L + 14, hy = by, hr = 11, pts = [];
        for (var k = 0; k < 6; k++) { var a = Math.PI / 6 + k * Math.PI / 3; pts.push((hx + hr * Math.cos(a)).toFixed(1) + ',' + (hy + hr * Math.sin(a)).toFixed(1)); }
        svg('polygon', { points: pts.join(' '), fill: 'none', stroke: 'var(--olive)', 'stroke-width': 3 }, g);
        svgText(g, hx + 26, hy + 6, row.glyph_note || '', { 'font-size': 16 });
      } else {
        for (var b = 0; b < lo.shown; b++) {
          var line = Math.floor(b / perLine), col = b % perLine;
          var c = svg('circle', { cx: L + 8 + col * gap, cy: by + line * lineGap, r: r, fill: row.highlight ? 'var(--plum)' : 'var(--gold-fill)', opacity: row.kind === 'protein' ? 0.55 : 0.95 }, g);
          if (!REDUCED) { c.style.opacity = 0; c.style.transition = 'opacity .35s ease ' + (idx * 0.12 + b * 0.006).toFixed(3) + 's'; }
        }
        // string line behind beads
        if (lo.shown > 1) {
          var lastLine = Math.floor((lo.shown - 1) / perLine);
          for (var ln = 0; ln <= lastLine; ln++) {
            var n = ln < lastLine ? perLine : ((lo.shown - 1) % perLine) + 1;
            var sl = svg('line', { x1: L + 8, x2: L + 8 + (n - 1) * gap, y1: by + ln * lineGap, y2: by + ln * lineGap, stroke: 'var(--body-stroke)', 'stroke-width': 1.2 }, g);
            g.insertBefore(sl, g.children[3] || null);
          }
        }
        if (row.kind === 'protein') {
          var ey = by + (lo.lines - 1) * lineGap;
          svgText(g, L, ey + 26, String(row.truncation_note || '').replace('{n}', lo.shown), { 'font-size': 16, 'font-style': 'italic' });
        }
      }
      function open() { EQ.openSheet('<h3>' + fmt(row.row_label, rec) + '</h3><p><strong>' + fmt(row.count_label, rec) + '</strong></p><p>' + fmt(row.row_note, rec) + notes.ref(row.source_ids) + '</p>' + M.tierChip(row.tier)); }
      g.addEventListener('click', open);
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
      // footnote refs register even before opening so the source list is complete
      notes.ref(row.source_ids);
    });
    if (rec.threshold_count) {
      var tx2 = L + 8 + (perLine - 0.5) * gap;
      svgText(root, tx2 - 6, H - 12, rec.threshold_label, { 'font-size': 15, fill: 'var(--olive)', 'font-weight': 700, 'text-anchor': 'end' });
    }
    if (!REDUCED) requestAnimationFrame(function () { setTimeout(function () { root.querySelectorAll('circle').forEach(function (c) { c.style.opacity = ''; }); }, 60); });
    panel.appendChild(root);
    panel.appendChild(el('p', { class: 'caption' }, fmt(rec.viz_caption, rec) + (rec.threshold_source_ids ? notes.ref(rec.threshold_source_ids) : '')));
    s.appendChild(panel);
    return s;
  };

  /* ---------- internals shared with page variants (eq-story.js) ---------- */
  EQ.setContext = function (sys, rec) { SYS = sys; CUR = rec; };
  EQ.Notes = Notes;
  EQ.svg = svg;
  EQ.svgText = svgText;
  EQ.plain = plain;
  EQ.reduced = REDUCED;

  /* ---------- page assembly ---------- */
  function shell() {
    var app = document.getElementById('app');
    app.innerHTML = '';
    return app;
  }

  EQ.page = function (slug, base) {
    base = base || 'content/';
    return Promise.all([getJSON(base + '_system.json'), getJSON(base + slug + '.json')]).then(function (res) {
      SYS = res[0]; var rec = res[1]; CUR = rec;
      document.title = rec.page_title;
      EQ.initTheme();
      var back = document.querySelector('.back-link');
      if (back) back.textContent = '← ' + SYS.ui_back_to_hub;
      var app = shell();
      var notes = Notes(rec);
      app.appendChild(M.hero(rec));
      if (rec.recognition) app.appendChild(M.recognition(rec, notes));
      var arch = A[rec.archetype];
      if (arch) app.appendChild(arch(rec, notes));
      if (rec.scale_takeaways) {
        var tk = M.section(rec.scale_takeaways_title, null, rec);
        var ul = el('ol', { class: 'steps' });
        rec.scale_takeaways.forEach(function (t) {
          ul.appendChild(el('li', { class: 'tiered ' + esc(t.tier) }, '<h3>' + fmt(t.step_title, rec) + '</h3><p>' + fmt(t.step_body, rec) + notes.ref(t.source_ids) + '</p>' + M.tierChip(t.tier)));
        });
        tk.appendChild(ul); app.appendChild(tk);
      }
      if (rec.mechanism_steps) app.appendChild(M.steps(rec, notes));
      var legend = M.section(null, null, rec); legend.appendChild(M.tierLegend()); app.appendChild(legend);
      if (rec.notice_items) app.appendChild(M.notice(rec, notes));
      if (rec.route_steps) app.appendChild(M.route(rec, notes));
      if (rec.not_for_you_if) app.appendChild(M.cautions(rec, notes));
      var cad = M.cadence(rec); if (cad) app.appendChild(cad);
      var cta = M.cta(rec); if (cta) app.appendChild(cta);
      var src = M.sources(notes); if (src) app.appendChild(src);
      app.appendChild(M.footer(rec));
      document.documentElement.setAttribute('data-ready', '1');
      return rec;
    }).catch(function (err) {
      var app = shell();
      app.innerHTML = '<p class="body-copy">' + esc(String(err)) + '</p>';
      document.documentElement.setAttribute('data-ready', 'error');
    });
  };

  EQ.hub = function (base) {
    base = base || 'content/';
    return Promise.all([getJSON(base + '_system.json'), getJSON(base + '_hub.json')]).then(function (res) {
      SYS = res[0]; var hub = res[1];
      document.title = hub.page_title;
      EQ.initTheme();
      return Promise.all(hub.cards.map(function (c) { return getJSON(base + c.slug + '.json'); })).then(function (recs) {
        var app = shell();
        app.appendChild(M.hero(hub));
        if (hub.intro) app.appendChild(el('p', { class: 'body-copy', style: 'margin-top:-12px' }, fmt(hub.intro)));
        var cards = el('div', { class: 'cards' }), internal = el('div', { class: 'cards' });
        hub.cards.forEach(function (c, i) {
          var r = recs[i];
          var target = c.internal ? internal : cards;
          var a = el('a', { class: 'card rise d' + Math.min(3, i + 1), href: c.href });
          a.innerHTML = '<div class="kicker">' + fmt(r.card_kicker || r.kicker, r) + '</div><h3>' + fmt(r.card_title, r) + '</h3><p>' + fmt(r.card_summary, r) + '</p>' +
            (r.internal_banner ? '<p><span class="pending">' + fmt(r.internal_banner) + '</span></p>' : '');
          target.appendChild(a);
        });
        app.appendChild(cards);
        if (internal.children.length) { var sec = M.section(SYS.ui_internal_title, null, hub); sec.appendChild(internal); app.appendChild(sec); }
        var legend = M.section(null, null, hub); legend.appendChild(M.tierLegend()); app.appendChild(legend);
        app.appendChild(M.footer(hub));
        document.documentElement.setAttribute('data-ready', '1');
      });
    }).catch(function (err) {
      shell().innerHTML = '<p class="body-copy">' + esc(String(err)) + '</p>';
      document.documentElement.setAttribute('data-ready', 'error');
    });
  };
})();
