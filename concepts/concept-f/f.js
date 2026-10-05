/* Concept F: Drawing Sheet */
(function () {
  'use strict';
  const H = window.Hub;
  const $ = id => document.getElementById(id);
  const state = { tools: [], q: '', view: '' };
  const input = $('q');

  // Zone references around the border, as on a drawing frame.
  const nums = Array.from({ length: 8 }, (_, i) => `<span>${i + 1}</span>`).join('');
  const letters = 'ABCDEF'.split('').map(l => `<span>${l}</span>`).join('');
  document.querySelector('.zones-top').innerHTML = nums;
  document.querySelector('.zones-bottom').innerHTML = nums;
  document.querySelector('.zones-left').innerHTML = letters;
  document.querySelector('.zones-right').innerHTML = letters;

  $('tb-mark').innerHTML = H.cgMark();
  const d = new Date();
  $('tb-date').textContent = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const letterFor = i => (i >= 26 ? String.fromCharCode(64 + Math.floor(i / 26)) : '') + String.fromCharCode(65 + (i % 26));

  const highlight = text => H.highlight(text, state.q);

  /* ---------- revision cloud (sized to the drawing in pixels) ---------- */
  function cloudPath(w, h) {
    const m = 5, pts = [[m, m], [w - m, m], [w - m, h - m], [m, h - m], [m, m]];
    let path = `M${m} ${m}`;
    for (let k = 0; k < 4; k++) {
      const [x0, y0] = pts[k], [x1, y1] = pts[k + 1];
      const len = Math.hypot(x1 - x0, y1 - y0), n = Math.max(2, Math.round(len / 24)), r = (len / n) * .6;
      for (let i = 1; i <= n; i++) path += `A${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${(x0 + (x1 - x0) * i / n).toFixed(1)} ${(y0 + (y1 - y0) * i / n).toFixed(1)}`;
    }
    return path;
  }
  function drawCloud(target) {
    const svg = target.querySelector('.cloud');
    if (!svg || !target.clientWidth) return;
    const w = target.clientWidth + 24, h = target.clientHeight + 24;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.innerHTML = `<path d="${cloudPath(w, h)}"/><path d="M${w - 26} 2l11 19h-22Z" fill="var(--paper)"/><text x="${w - 26}" y="17.5" text-anchor="middle">1</text>`;
  }
  const clouds = new ResizeObserver(entries => entries.forEach(({ target }) => drawCloud(target)));

  /* ---------- render ---------- */
  function renderDetails() {
    $('details').innerHTML = state.tools.map((t, i) => {
      const L = letterFor(i);
      const key = H.statusKey(t.status);
      return `<article class="detail" id="d-${t.id}" data-id="${t.id}" aria-labelledby="h-${t.id}">
        <a class="det-draw" ${H.launchAttrs(t)} tabindex="-1" aria-hidden="true">${H.plate(t)}${key === 'dev' ? '<svg class="cloud" aria-hidden="true"></svg>' : ''}${key === 'preview' ? '<span class="box-note">Preview</span>' : ''}</a>
        <div class="det-cap">
          <span class="balloon" aria-hidden="true">${L}</span>
          <h2 id="h-${t.id}"><span class="det-word">Detail ${L}</span><span class="det-name">${highlight(t.name)}</span></h2>
          <p class="det-meta"><span>${highlight(t.category)}</span><span class="st ${key}">${key === 'dev' ? '<span aria-hidden="true">△1</span>' : ''}${H.esc(t.status)}</span></p>
        </div>
        <p class="det-desc">${highlight(t.description)}</p>
        <a class="det-open" ${H.launchAttrs(t)} aria-label="Open ${H.esc(t.name)} in a new tab">Open ${H.icon('external')}</a>
      </article>`;
    }).join('');
    document.querySelectorAll('.det-draw').forEach(el => { if (el.querySelector('.cloud')) { drawCloud(el); clouds.observe(el); } });
  }

  function renderViews() {
    const base = state.tools.filter(t => H.matches(t, state.q));
    const counts = H.countBy(base, 'category');
    $('views').innerHTML = [['', 'All', base.length]].concat(H.categoriesOf(state.tools).map(c => [c, c, counts[c] || 0]))
      .map(([v, label, n]) => `<button type="button" class="view" data-view="${H.esc(v)}" aria-pressed="${state.view === v}">${H.esc(label)} <span aria-hidden="true">(${n})</span><span class="sr-only">, ${n} ${n === 1 ? 'tool' : 'tools'}</span></button>`).join('');
  }

  // Filtering greys details out in place so the sheet keeps its layout.
  function applyFilter() {
    let shown = 0;
    state.tools.forEach(t => {
      const on = H.matches(t, state.q) && (!state.view || t.category === state.view);
      const el = $('d-' + t.id);
      el.classList.toggle('is-dim', !on);
      el.inert = !on;
      if (on) shown++;
      const name = el.querySelector('.det-name');
      name.innerHTML = highlight(t.name);
      el.querySelector('.det-desc').innerHTML = highlight(t.description);
    });
    const total = state.tools.length;
    const filtering = state.q.trim() || state.view;
    $('find-count').textContent = filtering ? `${shown} of ${total} details` : `${total} details`;
    $('tb-details').textContent = filtering ? `${shown} of ${total}` : String(total);
  }

  function update() { renderViews(); applyFilter(); }

  /* ---------- events ---------- */
  input.addEventListener('input', () => { state.q = input.value; update(); });
  H.bindSearchKeys(input);
  $('views').addEventListener('click', e => {
    const b = e.target.closest('button[data-view]');
    if (!b) return;
    state.view = b.dataset.view; update();
  });

  H.loadTools().then(tools => {
    state.tools = tools;
    $('tb-cats').textContent = String(H.categoriesOf(tools).length);
    renderDetails();
    update();
  });
})();
