/* Concept B: Immersive CAE Studio */
(function () {
  'use strict';
  const H = window.Hub;
  const $ = id => document.getElementById(id);
  const state = { tools: [], q: '', selected: null, collapsed: new Set() };

  $('brand-mark').innerHTML = H.cgMark();
  $('search-ico').innerHTML = H.icon('search');
  $('prev').innerHTML = H.icon('arrowLeft');
  $('next').innerHTML = H.icon('arrowRight');

  const input = $('q');
  // Fringe levels, max (red) to min (blue).
  const FRINGE = ['#d7301f', '#ee6a2b', '#f4a52a', '#e2d43c', '#9fd04c', '#4fc28e', '#35b2c6', '#3a86d1', '#3150b7'];

  /* ---------- illustrative fringe plot of a cantilever bracket ----------
     Element-wise colors from a rough bending-stress field (M·c/I with fillet
     and bolt-hole concentrations). Illustrative only, not analysis data. */
  function stressAt(x, y) {
    const near = (cx, cy, r, w) => { const d = Math.hypot(x - cx, y - cy) - r; return Math.exp(-(d * d) / (w * w)); };
    if (x >= 220 && x <= 604) {
      const k = (x - 220) / 384;
      const yt = 150 + 50 * k, yb = 350 - 30 * k, yc = (yt + yb) / 2, h = (yb - yt) / 2;
      const bending = (650 - x) * Math.abs(y - yc) / (h * h * h);
      const fillet = 1 + .55 * (near(220, 150, 0, 34) + near(220, 350, 0, 34));
      return bending * fillet;
    }
    if (x < 220) {
      const root = 430 * Math.abs(y - 250) / 1e6;
      return root * Math.exp(-(220 - x) / 55) + .018 * (near(170, 140, 13, 7) + near(170, 360, 13, 7));
    }
    return .004 + .016 * near(620, 260, 26, 9) * Math.abs(y - 260) / 40;
  }

  function fringeSVG() {
    const outline = 'M140 90H200Q220 90 220 110V150C320 160 480 196 604 200A62 62 0 0 1 604 320C480 324 320 340 220 350V390Q220 410 200 410H140Q120 410 120 390V110Q120 90 140 90Z';
    const hole = (x, y, r) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
    const shape = outline + hole(170, 140, 13) + hole(170, 360, 13) + hole(620, 260, 26);
    const S = 12, cells = [];
    let max = 0;
    for (let x = 114; x < 696; x += S) {
      for (let y = 84; y < 416; y += S) {
        const s = stressAt(x + S / 2, y + S / 2);
        if (s > max) max = s;
        cells.push([x, y, s]);
      }
    }
    // Paths per fringe level keep the DOM small.
    const levels = FRINGE.map(() => '');
    cells.forEach(([x, y, s]) => {
      const band = Math.min(8, Math.floor(Math.pow(s / max, .8) * 9));
      levels[8 - band] += `M${x} ${y}h${S}v${S}h-${S}Z`;
    });
    let mesh = '';
    for (let x = 114; x <= 696; x += S) mesh += `M${x} 84V416`;
    for (let y = 84; y <= 416; y += S) mesh += `M114 ${y}H696`;
    let hatch = '';
    for (let y = 98; y <= 404; y += 14) hatch += `M110 ${y}l-12 12`;
    return `<svg class="fringe" viewBox="60 60 700 380" role="img" aria-label="Illustrative stress fringe plot of a meshed cantilever bracket, fixed at the left and loaded at the lug">
      <defs><clipPath id="b-clip"><path d="${shape}" clip-rule="evenodd"/></clipPath></defs>
      <g clip-path="url(#b-clip)">
        ${levels.map((d, i) => `<path d="${d}" fill="${FRINGE[i]}"/>`).join('')}
        <path d="${mesh}" stroke="rgba(8,12,20,.42)" stroke-width=".7" fill="none"/>
      </g>
      <path d="${shape}" fill="none" stroke="#0a0e14" stroke-width="1.6" fill-rule="evenodd"/>
      <path d="M110 92V408" stroke="#e8edf3" stroke-width="2.2"/><path d="${hatch}" stroke="#e8edf3" stroke-width="1" opacity=".75"/>
      <path d="M620 128V222M613 210l7 13 7-13" stroke="#e8edf3" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="630" y="140" fill="#e8edf3" font-family="Georgia,serif" font-style="italic" font-size="20">F</text>
    </svg>`;
  }

  function legendHTML() {
    return `<div class="legend" aria-hidden="true">
      <span>max</span>
      <div class="legend-bar">${FRINGE.map(c => `<span style="background:${c}"></span>`).join('')}</div>
      <span>min</span>
      <span class="legend-note">Illustrative fringe. Not analysis data.</span>
    </div>`;
  }

  /* ---------- helpers ---------- */
  const visible = () => state.tools.filter(t => H.matches(t, state.q));
  const byId = id => state.tools.find(t => t.id === id);
  const statusMark = t => `<span class="st ${H.statusKey(t.status)}" aria-hidden="true"></span>`;

  function select(id, opts) {
    state.selected = id && byId(id) ? id : null;
    const hash = state.selected ? '#tool=' + state.selected : '#';
    if (location.hash !== hash) history.replaceState(null, '', state.selected ? hash : location.pathname + location.search);
    render(opts);
  }

  /* ---------- render ---------- */
  function renderTree() {
    const list = visible();
    const filtering = Boolean(state.q.trim());
    const cats = H.categoriesOf(state.tools).filter(c => !filtering || list.some(t => t.category === c));
    $('tree').innerHTML = cats.map(c => {
      const ts = list.filter(t => t.category === c);
      const open = filtering || !state.collapsed.has(c);
      const gid = 'tg-' + H.categoryMeta(c).code;
      return `<div class="t-node">
        <button type="button" class="t-cat" data-cat="${H.esc(c)}" aria-expanded="${open}" aria-controls="${gid}">${H.icon('chevron', 'chev')}${H.icon(H.categoryMeta(c).icon)}<span>${H.esc(c)}</span><span class="n">${ts.length}</span></button>
        <ul class="t-group" id="${gid}" ${open ? '' : 'hidden'}>${ts.map(t => `
          <li class="t-leaf${t.id === state.selected ? ' is-selected' : ''}">
            <button type="button" class="t-sel" data-id="${t.id}" aria-pressed="${t.id === state.selected}">${statusMark(t)}<span class="name">${H.esc(t.shortName)}</span><span class="sr-only">, ${H.esc(t.status)}</span></button>
            <a class="t-open" ${H.launchAttrs(t)} aria-label="Open ${H.esc(t.name)} in a new tab" title="Open in new tab">${H.icon('external')}</a>
          </li>`).join('')}
        </ul></div>`;
    }).join('');
    $('tree-count').textContent = filtering ? `${list.length} of ${state.tools.length}` : `${state.tools.length} tools`;
    $('tree-empty').hidden = list.length > 0;
  }

  function renderFilmstrip() {
    $('filmstrip').innerHTML = visible().map(t => `
      <button type="button" class="frame" data-id="${t.id}" aria-pressed="${t.id === state.selected}" aria-label="Show ${H.esc(t.name)}">
        <span class="frame-img">${H.plate(t)}</span>
        <span class="frame-name">${statusMark(t)}${H.esc(t.shortName)}</span>
      </button>`).join('');
  }

  function renderViewport(animate) {
    const t = byId(state.selected);
    const canvas = $('vp-canvas');
    if (!t) {
      $('vp-title').textContent = 'Overview';
      canvas.innerHTML = `<div class="overview">${fringeSVG()}${legendHTML()}</div>`;
      $('viewport').querySelector('.overview-title') || $('viewport').insertAdjacentHTML('beforeend',
        '<div class="overview-title"><h1>CAE Engineering Hub</h1><p>Select a tool in the tree to inspect it, or open it directly with the arrow beside its name.</p></div>');
    } else {
      $('vp-title').textContent = `${t.category} · ${t.shortName}`;
      canvas.innerHTML = `<div class="vp-plate">${H.plate(t)}</div>`;
      const ot = $('viewport').querySelector('.overview-title');
      if (ot) ot.remove();
    }
    if (!animate) canvas.firstElementChild.style.animation = 'none';
  }

  function renderProps() {
    const t = byId(state.selected);
    const props = $('props');
    if (!t) {
      const counts = H.countBy(state.tools, 'category');
      const recents = H.recent.list().map(byId).filter(Boolean).slice(0, 5);
      props.innerHTML = `<div class="pane-head"><h2 id="props-title">Properties</h2><span class="pane-meta">Hub</span></div>
        <div class="props-body">
          <div><p class="p-cat">${H.icon('grid')}Overview</p><p class="p-name">Seven independent tools</p></div>
          <p class="p-desc">Each tool is its own site and opens in a new tab. The tree groups them by category; nothing is embedded here.</p>
          <div><p class="p-section-title">Categories</p><div class="p-list">${H.categoriesOf(state.tools).map(c => `
            <button type="button" data-first="${H.esc(c)}">${H.icon(H.categoryMeta(c).icon)}${H.esc(c)}<span class="n">${counts[c] || 0}</span></button>`).join('')}</div></div>
          <div><p class="p-section-title">Recently opened</p>${recents.length ? `<div class="p-list">${recents.map(r => `<button type="button" data-id="${r.id}">${H.icon('clock')}${H.esc(r.shortName)}</button>`).join('')}</div>` : '<p class="p-note">Tools you open from the Studio appear here.</p>'}</div>
          <div><p class="p-section-title">Keys</p><div class="p-keys"><kbd>/</kbd><span>Filter tools</span><kbd>↑ ↓</kbd><span>Move in the tree</span><kbd>← →</kbd><span>Previous / next tool</span><kbd>Esc</kbd><span>Clear filter, back to overview</span></div></div>
        </div>`;
      return;
    }
    const meta = H.categoryMeta(t.category);
    props.innerHTML = `<div class="pane-head"><h2 id="props-title">Properties</h2><span class="pane-meta">${meta.code}-${String(state.tools.indexOf(t) + 1).padStart(2, '0')}</span></div>
      <div class="props-body">
        <div><p class="p-cat">${H.icon(meta.icon)}${H.esc(t.category)}</p><h2 class="p-name">${H.esc(t.name)}</h2></div>
        <p class="p-desc">${H.esc(t.description)}</p>
        <a class="p-open" ${H.launchAttrs(t)}>Open tool ${H.icon('external')}<span class="sr-only"> (new tab)</span></a>
        <dl class="p-table">
          <dt>Status</dt><dd><span class="p-status">${statusMark(t)}${H.esc(t.status)}</span></dd>
          <dt>Tags</dt><dd><div class="p-tags">${t.tags.map(g => `<span>${H.esc(g)}</span>`).join('')}</div></dd>
          <dt>Address</dt><dd class="mono">${H.esc(H.host(t.url))}</dd>
        </dl>
        ${t.repo ? `<a class="p-repo" href="${H.esc(t.repo)}" target="_blank" rel="noopener noreferrer">${H.icon('repo')}Source repository<span class="sr-only"> (new tab)</span></a>` : ''}
      </div>`;
  }

  function renderCrumbs() {
    const t = byId(state.selected);
    $('crumbs').innerHTML = `<li><button type="button" data-home>Hub</button></li>`
      + (t ? `<li>${H.esc(t.category)}</li><li aria-current="true">${H.esc(t.shortName)}</li>` : '<li aria-current="true">Overview</li>');
  }

  function render(opts) {
    renderTree(); renderFilmstrip(); renderViewport(opts && opts.animate); renderProps(); renderCrumbs();
    if (opts && opts.focusId) {
      const b = document.querySelector(`.t-sel[data-id="${opts.focusId}"]`);
      if (b) b.focus();
    }
    const f = document.querySelector('.frame[aria-pressed="true"]');
    if (f) f.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  function step(dir) {
    const list = visible();
    if (!list.length) return;
    const i = list.findIndex(t => t.id === state.selected);
    const next = i < 0 ? (dir > 0 ? 0 : list.length - 1) : (i + dir + list.length) % list.length;
    select(list[next].id, { animate: true });
  }

  /* ---------- events ---------- */
  input.addEventListener('input', () => { state.q = input.value; render(); });
  H.bindSearchKeys(input);
  $('tree-reset').addEventListener('click', () => { input.value = ''; state.q = ''; render(); input.focus(); });

  $('tree').addEventListener('click', e => {
    const cat = e.target.closest('.t-cat');
    if (cat) {
      const c = cat.dataset.cat;
      if (state.collapsed.has(c)) state.collapsed.delete(c); else state.collapsed.add(c);
      renderTree();
      const again = document.querySelector(`.t-cat[data-cat="${CSS.escape(c)}"]`);
      if (again) again.focus();
      return;
    }
    const sel = e.target.closest('.t-sel');
    if (sel) select(sel.dataset.id, { animate: true, focusId: sel.dataset.id });
  });

  // Up/Down walk the visible tree; Left/Right collapse or expand a category.
  $('tree').addEventListener('keydown', e => {
    const items = [...$('tree').querySelectorAll('.t-cat, .t-group:not([hidden]) .t-sel')];
    const i = items.indexOf(document.activeElement);
    if (i < 0) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const n = items[Math.min(items.length - 1, Math.max(0, i + (e.key === 'ArrowDown' ? 1 : -1)))];
      n.focus();
    } else if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && document.activeElement.classList.contains('t-cat')) {
      e.preventDefault();
      const open = document.activeElement.getAttribute('aria-expanded') === 'true';
      if ((e.key === 'ArrowLeft') === open) document.activeElement.click();
    }
  });

  $('filmstrip').addEventListener('click', e => {
    const f = e.target.closest('.frame');
    if (f) select(f.dataset.id, { animate: true });
  });
  $('props').addEventListener('click', e => {
    const b = e.target.closest('button[data-id], button[data-first]');
    if (!b) return;
    if (b.dataset.id) { select(b.dataset.id, { animate: true }); return; }
    const first = visible().find(t => t.category === b.dataset.first) || state.tools.find(t => t.category === b.dataset.first);
    if (first) select(first.id, { animate: true, focusId: first.id });
  });
  $('crumbs').addEventListener('click', e => { if (e.target.closest('[data-home]')) select(null, { animate: true }); });
  $('prev').addEventListener('click', () => step(-1));
  $('next').addEventListener('click', () => step(1));

  document.addEventListener('keydown', e => {
    const el = document.activeElement;
    const inField = /^(INPUT|TEXTAREA|SELECT)$/.test(el && el.tagName);
    const inTree = el && el.closest && el.closest('#tree');
    if (inField || inTree || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    else if (e.key === 'Escape' && state.selected) select(null, { animate: true });
  });

  document.addEventListener('hub:recent', () => { if (!state.selected) renderProps(); });
  addEventListener('hashchange', () => {
    const m = location.hash.match(/^#tool=(.+)$/);
    const id = m ? decodeURIComponent(m[1]) : null;
    if (id !== state.selected) select(id, { animate: true });
  });

  H.loadTools().then(tools => {
    state.tools = tools;
    const m = location.hash.match(/^#tool=(.+)$/);
    state.selected = m && byId(decodeURIComponent(m[1])) ? decodeURIComponent(m[1]) : null;
    render({ animate: true });
  });
})();
