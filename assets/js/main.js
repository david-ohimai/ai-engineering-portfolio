/* David Ohimai: portfolio interactions. No dependencies. */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var all = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch = matchMedia('(hover: none)').matches;
  var dpr = function () { return Math.min(window.devicePixelRatio || 1, 2); };

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  // Reviewer aid: ?todo outlines everything that still needs a real value.
  if (/[?&]todo\b/.test(location.search)) root.classList.add('show-todo');

  /* Toast ------------------------------------------------------------------ */
  var toastEl = $('#toast'), toastT;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
  }

  /* Theme ------------------------------------------------------------------ */
  var palette = {};
  function readPalette() {
    var cs = getComputedStyle(root);
    palette.dot = cs.getPropertyValue('--dot-rgb').split(',').map(Number);
    palette.hot = cs.getPropertyValue('--dot-hot').split(',').map(Number);
  }
  function isDark() {
    var t = root.getAttribute('data-theme');
    return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function toggleTheme() {
    var next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next); store('theme', next);
    readPalette(); redrawFields();
  }
  $('#theme').addEventListener('click', toggleTheme);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () { readPalette(); redrawFields(); });
  readPalette();

  /* Mobile menu ------------------------------------------------------------ */
  var toggle = $('.nav__toggle'), menu = $('#menu');
  function setMenu(o) { menu.classList.toggle('open', o); toggle.setAttribute('aria-expanded', String(o)); }
  toggle.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
  menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });

  /* Scroll: progress bar, nav border, active link --------------------------- */
  var nav = $('#nav'), prog = $('.progress span'), pend = false;
  function onScroll() {
    if (pend) return; pend = true;
    requestAnimationFrame(function () {
      pend = false;
      var max = root.scrollHeight - innerHeight;
      prog.style.transform = 'scaleX(' + (max > 0 ? scrollY / max : 0) + ')';
      nav.classList.toggle('scrolled', scrollY > 8);
    });
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var navLinks = all('.nav__links a');
  var spy = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['work', 'more', 'skills', 'journey', 'contact'].forEach(function (id) { var el = document.getElementById(id); if (el) spy.observe(el); });

  /* Reveal on scroll -------------------------------------------------------- */
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.1 });
    all('.head, .b, .wcard, .sg, .evidence, .pr, .jrow, .linklist, .case__top').forEach(function (el) {
      el.classList.add('reveal'); io.observe(el);
    });
  }

  /* Typed role -------------------------------------------------------------- */
  (function () {
    var el = $('#typed'), words = ['AI Engineer', 'Backend Engineer', 'RAG & agents', 'LLM application developer'];
    if (reduced) return;
    var w = 0, i = words[0].length, del = true;
    setTimeout(function tick() {
      var word = words[w];
      i += del ? -1 : 1;
      el.textContent = word.slice(0, i);
      var wait = del ? 38 : 75;
      if (!del && i === word.length) { del = true; wait = 2200; }
      else if (del && i === 0) { del = false; w = (w + 1) % words.length; wait = 300; }
      setTimeout(tick, wait);
    }, 2400);
  })();

  /* Count-up ---------------------------------------------------------------- */
  var cio = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      var el = e.target, to = +el.dataset.count, t0 = performance.now(), dur = reduced ? 0 : 1100;
      (function step(t) {
        var p = dur ? Math.min((t - t0) / dur, 1) : 1;
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  }, { threshold: 0.6 });
  all('[data-count]').forEach(function (el) { cio.observe(el); });

  /* Hero terminal trace ----------------------------------------------------- */
  var TRACE = [
    '<span class="t-dim">$</span> <span class="t-b">POST</span> /api/v1/conversations/c_8f2/messages',
    '  <span class="t-str">{"question": "What is our refund window?"}</span>',
    '',
    '<span class="t-acc">→ auth      </span> jwt ok · role=member · docs:read <span class="t-ok">✓</span>',
    '<span class="t-acc">→ ratelimit </span> sliding window 14/20 per min <span class="t-ok">✓</span>',
    '<span class="t-acc">→ embed     </span> text-embedding-3-small · <span class="t-ok">cache HIT</span>',
    '<span class="t-acc">→ pgvector  </span> top_k=10 min_score=0.30 → <span class="t-b">4 chunks</span>',
    '<span class="t-acc">→ context   </span> 3 chunks · 1,842 tokens · within budget',
    '<span class="t-acc">→ llm       </span> gpt-4o-mini · temp 0.1 · <span class="t-ok">breaker closed</span>',
    '<span class="t-ok">← 200 OK</span>    <span class="t-dim">612 ms · $0.0004 · corr=7f3a…</span>',
    '  "Items can be returned within <span class="t-b">30 days</span> <span class="t-acc">[1]</span>,',
    '   and refunds need a receipt <span class="t-acc">[2]</span>."',
    '  <span class="t-dim">[1] handbook.pdf p.12   [2] returns-policy.pdf p.3</span>'
  ];
  var traceEl = $('#trace'), traceTimers = [];
  function runTrace() {
    traceTimers.forEach(clearTimeout); traceTimers = [];
    traceEl.innerHTML = TRACE.map(function (l) { return '<span class="ln">' + (l || '&nbsp;') + '</span>'; }).join('');
    all('.ln', traceEl).forEach(function (ln, i) {
      if (reduced) { ln.classList.add('on'); return; }
      traceTimers.push(setTimeout(function () { ln.classList.add('on'); }, 500 + i * (i > 2 && i < 10 ? 420 : 160)));
    });
  }
  runTrace();
  $('#replay').addEventListener('click', runTrace);

  /* Dot-field canvases (hero wave + footer ripples) -------------------------- */
  function dot(c, x, y, r, g, a) {
    var D = palette.dot, H = palette.hot;
    var k = function (i) { return Math.round(D[i] + (H[i] - D[i]) * g); };
    c.globalAlpha = a; c.fillStyle = 'rgb(' + k(0) + ',' + k(1) + ',' + k(2) + ')';
    c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fill();
  }
  var fields = [];
  function redrawFields() { fields.forEach(function (f) { f.redraw(); }); }
  function field(canvas, host, avoid, frame) {
    var f = { ctx: canvas.getContext('2d'), w: 0, h: 0, zones: [], vis: true }, run = false, raf = 0, rt;
    f.fadeAt = function (x, y) {
      var m = 1;
      f.zones.forEach(function (a) {
        var dx = Math.max(a.l - x, 0, x - a.r), dy = Math.max(a.t - y, 0, y - a.b);
        m = Math.min(m, 0.1 + 0.9 * Math.min(Math.sqrt(dx * dx + dy * dy) / 80, 1));
      });
      return m;
    };
    function loop(t) { if (!run) return; if (frame(f, t) === false) { run = false; return; } raf = requestAnimationFrame(loop); }
    function halt() { run = false; cancelAnimationFrame(raf); }
    f.wake = function () { if (reduced || run || !f.vis || document.hidden) return; run = true; raf = requestAnimationFrame(loop); };
    f.redraw = function () { frame(f, performance.now()); };
    f.size = function () {
      var d = dpr(), hr = host.getBoundingClientRect();
      f.w = host.clientWidth; f.h = host.clientHeight;
      canvas.width = f.w * d; canvas.height = f.h * d; f.ctx.setTransform(d, 0, 0, d, 0, 0);
      f.zones = avoid.map(function (el) {
        var c = el.getBoundingClientRect();
        return { l: c.left - hr.left, t: c.top - hr.top, r: c.right - hr.left, b: c.bottom - hr.top };
      });
      f.redraw();
    };
    new IntersectionObserver(function (e) { f.vis = e[0].isIntersecting; f.vis ? f.wake() : halt(); }).observe(host);
    document.addEventListener('visibilitychange', function () { document.hidden ? halt() : f.wake(); });
    addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(f.size, 120); });
    f.size(); fields.push(f);
    return f;
  }

  var hero = $('.hero'), hp = { x: -9999, y: -9999, tx: -9999, ty: -9999, on: false }, GAP = 26, R = 150;
  var hf = field($('#dots'), hero, [$('.hero__copy'), $('.hero__side')], function (f, t) {
    var c = f.ctx, s = reduced ? 0 : t * 0.001, cols = Math.ceil(f.w / GAP) + 1, rows = Math.ceil(f.h / GAP) + 1, i, j;
    c.clearRect(0, 0, f.w, f.h);
    if (touch && !reduced) { hp.x = f.w * (0.5 + 0.42 * Math.sin(s * 0.33)); hp.y = f.h * (0.5 + 0.32 * Math.sin(s * 0.5 + 1)); }
    else { hp.x += (hp.tx - hp.x) * 0.12; hp.y += (hp.ty - hp.y) * 0.12; }
    for (i = 0; i < cols; i++) for (j = 0; j < rows; j++) {
      var bx = i * GAP, by = j * GAP;
      var x = bx + Math.cos(j * 0.35 + s * 0.7) * 2, y = by + Math.sin(i * 0.35 + s * 0.8) * 3 + Math.cos(j * 0.3 + s * 0.6) * 2;
      var n = 0, dx = x - hp.x, dy = y - hp.y, d = Math.sqrt(dx * dx + dy * dy);
      if (!reduced && d < R) { n = 1 - d / R; n = n * n * (3 - 2 * n); x += dx / (d || 1) * n * 14; y += dy / (d || 1) * n * 14; }
      dot(c, x, y, 1.3 + n * 1.9, n > 0.3 ? (n - 0.3) / 0.7 : 0, f.fadeAt(bx, by));
    }
    c.globalAlpha = 1;
  });
  hero.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    var r = hero.getBoundingClientRect(); hp.tx = e.clientX - r.left; hp.ty = e.clientY - r.top;
    if (!hp.on) { hp.x = hp.tx; hp.y = hp.ty; hp.on = true; }
    hf.wake();
  });
  hero.addEventListener('pointerleave', function () { hp.tx = hp.ty = -9999; hp.on = false; });
  hf.wake();

  var foot = $('.footer'), rip = [], last = { x: -999, y: -999 };
  var ff = field($('#ripples'), foot, [$('.footer__in')], function (f, t) {
    var c = f.ctx, S = 24, cols = Math.ceil(f.w / S) + 1, rows = Math.ceil(f.h / S) + 1, i, j, q;
    c.clearRect(0, 0, f.w, f.h);
    rip = rip.filter(function (r) { return t - r.t < 3200; });
    for (i = 0; i < cols; i++) for (j = 0; j < rows; j++) {
      var x = i * S, y = j * S, k = 0, ox = 0, oy = 0;
      for (q = 0; q < rip.length; q++) {
        var r = rip[q], age = (t - r.t) / 1000, dx = x - r.x, dy = y - r.y, d = Math.sqrt(dx * dx + dy * dy) || 1, off = d - age * 240;
        var e = Math.exp(-off * off / 1800) * r.a * Math.max(0, 1 - age / 3);
        k += e; ox += dx / d * e * 7; oy += dy / d * e * 7;
      }
      k = Math.min(k, 1);
      dot(c, x + ox, y + oy, 1.3 + 2.4 * k, k > 0.3 ? (k - 0.3) / 0.7 : 0, f.fadeAt(x, y));
    }
    c.globalAlpha = 1;
    return rip.length > 0;
  });
  function spawn(x, y, a) { if (reduced) return; rip.push({ x: x, y: y, t: performance.now(), a: a }); if (rip.length > 8) rip.shift(); ff.wake(); }
  function local(e) { var r = foot.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  foot.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    var p = local(e), dx = p.x - last.x, dy = p.y - last.y;
    if (dx * dx + dy * dy > 4900) { last = p; spawn(p.x, p.y, 0.7); }
  });
  foot.addEventListener('pointerdown', function (e) { var p = local(e); spawn(p.x, p.y, 1.1); });
  if (touch && !reduced) setInterval(function () { if (ff.vis) spawn(Math.random() * ff.w, Math.random() * ff.h, 0.8); }, 2800);

  /* DocuChat architecture explorer ------------------------------------------ */
  var ARCH = {
    client: { t: 'Client', k: 'any HTTP client · REST + JSON',
      b: 'DocuChat is API-first. A client sends JSON with a bearer token and gets back a standard response envelope.',
      l: ['Versioned routes under /api/v1', 'Consistent status codes and error shapes', 'Swagger docs generated from the code at /api-docs'] },
    api: { t: 'Express API', k: 'route → controller → service',
      b: 'Every request runs through the same middleware chain before any business logic.',
      l: ['Helmet security headers + CSP, CORS locked to the frontend origin', 'JWT authentication + tier-based permission check', 'Redis sliding-window rate limit per user tier', 'Zod validation + input sanitisation', 'Correlation ID attached to every log line'] },
    svc: { t: 'Service layer', k: 'documents · conversations · rag · agent',
      b: 'All business logic lives here, with no knowledge of HTTP. RAG and the agent are services like any other.',
      l: ['Semantic search scoped to the user\'s own documents', 'Token-budgeted context assembly with numbered citations', 'Transactions around multi-step writes'] },
    mcp: { t: 'OpenAI gateway', k: 'axios client → retry → circuit breaker',
      b: 'Nothing calls OpenAI directly. Every embedding and chat request goes through one function with timeouts, retries and a circuit breaker.',
      l: ['30-second timeout on every call', 'Retries only transient failures (timeouts, 429, 5xx) and honours Retry-After', 'Circuit breaker fails fast with a 503 when OpenAI is down', 'Every call priced and logged per user for cost tracking'] },
    pg: { t: 'PostgreSQL + pgvector', k: 'prisma · HNSW index · cosine distance',
      b: 'Relational data and vectors live together, so a similarity search can filter on ownership in the same query.',
      l: ['Users, roles, documents, chunks, conversations, messages', 'Vector column with an HNSW index on chunks', 'Soft delete and an audit trail', 'Transactions keep upload → chunk → usage-log atomic'] },
    redis: { t: 'Redis', k: 'cache · rate limits · job queue',
      b: 'One Redis instance doing three jobs.',
      l: ['Cache-aside for permissions, metadata and conversation lists', 'Embedding cache, so the same text is never paid for twice', 'Rate-limit counters', 'Backend for the BullMQ job queue'] },
    worker: { t: 'Ingestion worker', k: 'extract → clean → chunk → embed → store',
      b: 'Uploads return straight away with status "pending". A BullMQ worker does the slow work in the background.',
      l: ['PDF and text extraction with cleanup', 'Recursive chunking with overlap', 'Exponential-backoff retries and a dead-letter queue', 'Progress and per-document cost tracking'] },
    llm: { t: 'OpenAI API', k: 'embeddings + chat completions',
      b: 'Treated as an expensive, unreliable dependency, always behind timeouts and a circuit breaker.',
      l: ['Embeddings: text-embedding-3-small', 'Chat: gpt-4o-mini at temperature 0.1, max 1,500 tokens', 'Circuit breaker and timeouts on every call', 'Skipped entirely when retrieval finds nothing relevant'] }
  };
  var archSvg = $('#arch'), nodes = all('.node', archSvg), edges = all('.edge', archSvg);
  function selectNode(id) {
    var d = ARCH[id]; if (!d) return;
    nodes.forEach(function (n) { n.classList.toggle('on', n.dataset.node === id); n.setAttribute('aria-pressed', String(n.dataset.node === id)); });
    edges.forEach(function (e) { var p = e.id.split('-'); e.classList.toggle('hot', p[1] === id || p[2] === id); });
    $('#arch-title').textContent = d.t; $('#arch-k').textContent = d.k; $('#arch-body').textContent = d.b;
    $('#arch-list').innerHTML = d.l.map(function (x) { return '<li>' + x.replace(/</g, '&lt;') + '</li>'; }).join('');
  }
  nodes.forEach(function (n) {
    n.addEventListener('click', function () { selectNode(n.dataset.node); });
    n.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectNode(n.dataset.node); } });
  });
  selectNode('api');

  // A pulse travels the path of one RAG question while the diagram is on screen.
  (function () {
    if (reduced) return;
    var pulse = $('#pulse'), route = [
      ['e-client-api', 1], ['e-api-svc', 1], ['e-svc-pg', 1], ['e-svc-pg', -1], ['e-svc-mcp', 1], ['e-mcp-llm', 1],
      ['e-mcp-llm', -1], ['e-svc-mcp', -1], ['e-api-svc', -1], ['e-client-api', -1]
    ], seg = 0, t0 = 0, on = false, raf = 0, SEG = 650;
    function frame(t) {
      if (!on) return;
      if (!t0) t0 = t;
      var p = (t - t0) / SEG;
      if (p >= 1) { seg = (seg + 1) % (route.length + 2); t0 = t; p = 0; }
      if (seg >= route.length) { pulse.setAttribute('cx', -10); raf = requestAnimationFrame(frame); return; } // short pause
      var path = document.getElementById(route[seg][0]), len = path.getTotalLength();
      var pt = path.getPointAtLength(route[seg][1] > 0 ? p * len : (1 - p) * len);
      pulse.setAttribute('cx', pt.x); pulse.setAttribute('cy', pt.y);
      raf = requestAnimationFrame(frame);
    }
    new IntersectionObserver(function (e) {
      on = e[0].isIntersecting && !document.hidden;
      if (on) { t0 = 0; raf = requestAnimationFrame(frame); } else cancelAnimationFrame(raf);
    }).observe(archSvg);
  })();

  /* Pipeline steps light up in sequence ------------------------------------- */
  (function () {
    var steps = all('#pipe li'), i = 0, timer = 0;
    if (reduced || !steps.length) return;
    function tick() { steps.forEach(function (s, k) { s.classList.toggle('lit', k === i); }); i = (i + 1) % steps.length; }
    new IntersectionObserver(function (e) {
      clearInterval(timer);
      if (e[0].isIntersecting) { tick(); timer = setInterval(tick, 1300); }
    }, { threshold: 0.4 }).observe($('#pipe'));
  })();

  /* Tabs (WAI-ARIA pattern) -------------------------------------------------- */
  all('[data-tabs]').forEach(function (box) {
    var tabs = all('[role="tab"]', box);
    function activate(tab, focus) {
      tabs.forEach(function (t) {
        var sel = t === tab;
        t.setAttribute('aria-selected', String(sel)); t.tabIndex = sel ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !sel;
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { activate(t); });
      t.addEventListener('keydown', function (e) {
        var n = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (n) { e.preventDefault(); activate(tabs[(i + n + tabs.length) % tabs.length], true); }
      });
    });
  });

  /* Project filter ----------------------------------------------------------- */
  (function () {
    var cards = all('#workgrid .wcard'), btns = all('.filter');
    btns.forEach(function (b) {
      var f = b.dataset.filter;
      b.querySelector('span').textContent = f === 'all' ? cards.length : cards.filter(function (c) { return c.dataset.cat.split(' ').indexOf(f) > -1; }).length;
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        cards.forEach(function (c) { c.hidden = f !== 'all' && c.dataset.cat.split(' ').indexOf(f) < 0; });
      });
    });
  })();

  /* Skills ↔ project evidence ------------------------------------------------ */
  (function () {
    var box = $('#skillbox'), skills = all('.skill', box), evs = all('.ev', box), current = null;
    evs.forEach(function (b) {
      var p = b.dataset.p, n = skills.filter(function (s) { return s.dataset.ev.split(' ').indexOf(p) > -1; }).length;
      var tag = b.querySelector('span');
      if (tag) tag.textContent = tag.textContent + ' · ' + n; else b.insertAdjacentHTML('beforeend', '<span>' + n + '</span>');
      b.addEventListener('click', function () {
        current = current === p ? null : p;
        evs.forEach(function (x) { x.setAttribute('aria-pressed', String(x.dataset.p === current)); });
        box.classList.toggle('filtering', !!current);
        skills.forEach(function (s) { s.classList.toggle('match', !!current && s.dataset.ev.split(' ').indexOf(current) > -1); });
      });
    });
  })();

  /* Copy email --------------------------------------------------------------- */
  $('#copy-email').addEventListener('click', copyEmail);
  function copyEmail() {
    var email = 'daveohimai@gmail.com';
    if (navigator.clipboard) navigator.clipboard.writeText(email).then(function () { toast('Email copied: ' + email); }, function () { location.href = 'mailto:' + email; });
    else location.href = 'mailto:' + email;
  }

  /* Command palette ----------------------------------------------------------- */
  (function () {
    var CV = 'https://drive.google.com/file/d/1dZ7vPFGzl32c1JyRlWF7Z8-MhBDidhgs/view?usp=sharing';
    var items = [
      { l: 'Case study: DocuChat', k: 'section', go: '#docuchat' },
      { l: 'Case study: MedVerify NG', k: 'section', go: '#medverify' },
      { l: 'More AI work', k: 'section', go: '#more' },
      { l: 'Skills with evidence', k: 'section', go: '#skills' },
      { l: 'How I engineer', k: 'section', go: '#principles' },
      { l: 'Learning journey', k: 'section', go: '#journey' },
      { l: 'Contact', k: 'section', go: '#contact' },
      { l: 'Open résumé / CV', k: 'link', url: CV },
      { l: 'GitHub: david-ohimai', k: 'link', url: 'https://github.com/david-ohimai' },
      { l: 'GitHub: Daveohi', k: 'link', url: 'https://github.com/Daveohi' },
      { l: 'LinkedIn', k: 'link', url: 'https://www.linkedin.com/in/david-ohimai' },
      { l: 'Repo: DocuChat', k: 'repo', url: 'https://github.com/david-ohimai/docuchat-bootcamp-project' },
      { l: 'Repo: MedVerify NG', k: 'repo', url: 'https://github.com/david-ohimai/medverify-ng' },
      { l: 'Repo: KodeBuddy AI backend', k: 'repo', url: 'https://github.com/david-ohimai/be-kodebuddy-ai' },
      { l: 'Repo: Code Review Agent', k: 'repo', url: 'https://github.com/david-ohimai/code-review-agent' },
      { l: 'Repo: LangChain RAG Agent', k: 'repo', url: 'https://github.com/david-ohimai/langchain-rag-agent' },
      { l: 'Copy email address', k: 'action', run: copyEmail },
      { l: 'Toggle dark / light theme', k: 'action', run: toggleTheme }
    ];
    var box = $('#cmdk'), input = $('#cmdk-input'), list = $('#cmdk-list'), shown = [], sel = 0, lastFocus = null;
    function render() {
      var q = input.value.trim().toLowerCase();
      shown = items.filter(function (it) { return !q || (it.l + ' ' + it.k).toLowerCase().indexOf(q) > -1; });
      sel = Math.min(sel, Math.max(shown.length - 1, 0));
      list.innerHTML = shown.length ? shown.map(function (it, i) {
        return '<li role="option" id="cmdk-' + i + '" aria-selected="' + (i === sel) + '" data-i="' + i + '">' + it.l + '<span>' + it.k + '</span></li>';
      }).join('') : '<li class="cmdk__empty" aria-disabled="true">No matches</li>';
      input.setAttribute('aria-activedescendant', shown.length ? 'cmdk-' + sel : '');
      var cur = list.children[sel]; if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest' });
    }
    function open() { lastFocus = document.activeElement; box.classList.add('open'); input.value = ''; sel = 0; render(); input.focus(); }
    function close() { box.classList.remove('open'); if (lastFocus) lastFocus.focus(); }
    function run(it) {
      if (!it) return; close();
      if (it.go) { var el = $(it.go); if (el) el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); history.replaceState(null, '', it.go); }
      else if (it.url) window.open(it.url, '_blank', 'noopener');
      else if (it.run) it.run();
    }
    $('#cmdk-open').addEventListener('click', open);
    input.addEventListener('input', function () { sel = 0; render(); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % Math.max(shown.length, 1); render(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + shown.length) % Math.max(shown.length, 1); render(); }
      else if (e.key === 'Enter') { e.preventDefault(); run(shown[sel]); }
      else if (e.key === 'Tab') e.preventDefault();
    });
    list.addEventListener('click', function (e) { var li = e.target.closest('li[data-i]'); if (li) run(shown[+li.dataset.i]); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); box.classList.contains('open') ? close() : open(); }
      else if (e.key === '/' && !/input|textarea/i.test(document.activeElement.tagName) && !box.classList.contains('open')) { e.preventDefault(); open(); }
      else if (e.key === 'Escape') { if (box.classList.contains('open')) close(); setMenu(false); }
    });
    // Show the right shortcut on Mac.
    if (/Mac|iPhone|iPad/.test(navigator.platform)) { var kb = $('.cmdk-btn kbd'); if (kb) kb.textContent = '⌘K'; }
  })();
})();
