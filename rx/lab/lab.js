/* Rx Lab shell: theme, hash routing, canvas sizing, token colors. No tracking, no storage beyond the theme. */
(function () {
  const Lab = (window.Lab = {});
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  Lab.reduced = mq.matches;
  const themeCbs = [];
  Lab.onTheme = (fn) => themeCbs.push(fn);

  /* ---- colors from CSS tokens (re-read on theme change) ---- */
  Lab.c = {};
  function readColors() {
    const cs = getComputedStyle(document.documentElement);
    ['bg', 'panel', 'sunk', 'ink', 'soft', 'dim', 'line', 'stroke', 'plum', 'plum-glow', 'gold', 'gold-ink', 'gold-glow', 'olive', 'grey']
      .forEach((k) => (Lab.c[k.replace('-', '_')] = cs.getPropertyValue('--' + k).trim()));
    Lab.c.dark = isDark();
  }
  function isDark() {
    const t = document.documentElement.getAttribute('data-theme');
    if (t) return t === 'dark';
    return matchMedia('(prefers-color-scheme: dark)').matches;
  }
  Lab.alpha = (col, a) => {
    // accepts #rrggbb or rgba()
    if (col.startsWith('#')) {
      const n = parseInt(col.slice(1), 16);
      return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
    }
    const m = col.match(/[\d.]+/g);
    if (!m) return col;
    return `rgba(${m[0]},${m[1]},${m[2]},${(m[3] ? +m[3] : 1) * a})`;
  };

  function setTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('eq-theme', t); } catch (e) {}
    readColors();
    themeCbs.forEach((f) => f());
  }
  Lab.toggleTheme = () => setTheme(isDark() ? 'light' : 'dark');
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { readColors(); themeCbs.forEach((f) => f()); });

  /* ---- canvas helper: keeps backing store at device pixels, reports CSS size ---- */
  Lab.canvas = function (canvas, onResize) {
    const ctx = canvas.getContext('2d');
    const state = { ctx, w: 0, h: 0, dpr: 1 };
    function fit() {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      state.dpr = Math.min(window.devicePixelRatio || 1, 2);
      state.w = r.width; state.h = r.height;
      canvas.width = Math.round(r.width * state.dpr);
      canvas.height = Math.round(r.height * state.dpr);
      ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
      onResize && onResize(state);
    }
    new ResizeObserver(fit).observe(canvas);
    state.fit = fit;
    return state;
  };

  /* pointer position in CSS px relative to element */
  Lab.pt = (e, el) => { const r = el.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };

  /* small "try this" checklist */
  Lab.done = (id) => { const li = document.getElementById(id); if (li && !li.classList.contains('done')) { li.classList.add('done'); li.setAttribute('aria-label', li.textContent + ' (done)'); } };

  /* tooltip inside a stage */
  Lab.tip = function (stage) {
    const el = document.createElement('div');
    el.className = 'tip'; el.hidden = true; el.setAttribute('role', 'status');
    stage.appendChild(el);
    let timer;
    return {
      show(x, y, title, body) {
        el.innerHTML = `<b>${title}</b>${body}`;
        el.hidden = false;
        const sw = stage.clientWidth, sh = stage.clientHeight;
        const w = Math.min(260, sw - 28);
        el.style.maxWidth = w + 'px';
        const bw = el.offsetWidth, bh = el.offsetHeight;
        let lx = x + 16, ly = y - bh - 14;
        if (lx + bw > sw - 12) lx = Math.max(12, x - bw - 16);
        if (ly < 12) ly = Math.min(sh - bh - 12, y + 18);
        el.style.left = lx + 'px'; el.style.top = ly + 'px';
        clearTimeout(timer); timer = setTimeout(() => (el.hidden = true), 5200);
      },
      hide() { el.hidden = true; },
    };
  };

  /* ---- views & routing ---- */
  const views = {};
  Lab.view = (name, api) => (views[name] = api);
  let current = null;
  function route() {
    const name = (location.hash || '').replace('#', '') || 'home';
    const target = document.getElementById('v-' + name) ? name : 'home';
    document.querySelectorAll('[data-view]').forEach((s) => (s.hidden = s.dataset.view !== target));
    document.querySelectorAll('.navlink').forEach((a) => { if (a.getAttribute('href') === '#' + target) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    if (current && current !== target && views[current]) views[current].stop();
    current = target;
    if (views[target]) requestAnimationFrame(() => views[target].start());
    const titles = { home: 'Rx Lab', beads: 'Bead by Bead · Rx Lab', spark: 'The Spark · Rx Lab', dial: 'The Dial · Rx Lab' };
    document.title = titles[target] || 'Rx Lab';
    window.scrollTo(0, 0);
  }
  Lab.boot = function () {
    readColors();
    document.getElementById('themeBtn').addEventListener('click', Lab.toggleTheme);
    window.addEventListener('hashchange', route);
    route();
  };
  readColors();
})();
