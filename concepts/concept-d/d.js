/* Concept D: Modular Engineering Cockpit */
(function () {
  'use strict';
  const H = window.Hub;
  const $ = id => document.getElementById(id);
  const state = { tools: [], q: '', cat: '', status: '', active: null };
  const input = $('launch-input');

  $('brand-mark').innerHTML = H.cgMark();
  $('launch-ico').innerHTML = H.icon('search');

  const byId = id => state.tools.find(t => t.id === id);
  const filtered = () => state.tools.filter(t => H.matches(t, state.q)
    && (!state.cat || t.category === state.cat) && (!state.status || t.status === state.status));
  const dot = t => `<span class="dot ${H.statusKey(t.status)}" aria-hidden="true"></span>`;
  const code = t => `${H.categoryMeta(t.category).code}-${String(state.tools.indexOf(t) + 1).padStart(2, '0')}`;

  /* ---------- render ---------- */
  function renderLaunch() {
    const list = filtered();
    if (!list.some(t => t.id === state.active)) state.active = list.length ? list[0].id : state.active;
    $('launch-list').innerHTML = list.map(t => `
      <li class="l-row${t.id === state.active ? ' is-active' : ''}" id="row-${t.id}">
        <button type="button" class="l-pick" data-id="${t.id}" aria-pressed="${t.id === state.active}">
          <span class="l-ico">${H.icon(H.categoryMeta(t.category).icon)}</span>
          <span class="l-text"><span class="l-name">${H.esc(t.name)}</span><span class="l-cat">${H.esc(t.category)}</span></span>
          <span class="l-status">${dot(t)}<span class="lbl">${H.esc(t.status)}</span></span>
        </button>
        <a class="l-go" ${H.launchAttrs(t)} aria-label="Open ${H.esc(t.name)} in a new tab" title="Open in new tab">${H.icon('external')}</a>
      </li>`).join('');
    $('launch-empty').hidden = list.length > 0;
    const f = [state.cat, state.status].filter(Boolean).join(' · ');
    $('launch-filter').hidden = !f;
    $('launch-filter').textContent = f;
    const row = $('row-' + state.active);
    if (row) row.scrollIntoView({ block: 'nearest' });
  }

  function renderSelected() {
    const t = byId(state.active);
    if (!t) { $('selected').innerHTML = '<p class="m-empty">Choose a tool in Launch.</p>'; return; }
    const pinned = H.favorites.has(t.id);
    $('selected').innerHTML = `
      <div class="sel-plate">${H.plate(t)}<span class="sel-code">${code(t)}</span></div>
      <div class="sel-body">
        <p class="sel-cat">${H.icon(H.categoryMeta(t.category).icon)}${H.esc(t.category)}<span class="status-text">${dot(t)}${H.esc(t.status)}</span></p>
        <h3 class="sel-name">${H.esc(t.name)}</h3>
        <p class="sel-desc">${H.esc(t.description)}</p>
        <div class="sel-tags">${t.tags.map(g => `<span>${H.esc(g)}</span>`).join('')}</div>
        <div class="sel-actions">
          <a class="btn-open" ${H.launchAttrs(t)}>Open tool ${H.icon('external')}<span class="sr-only"> (new tab)</span></a>
          <button type="button" class="btn-pin" id="pin-btn" aria-pressed="${pinned}">${H.icon('star')}${pinned ? 'Pinned' : 'Pin'}</button>
        </div>
      </div>`;
  }

  function miniList(ids, emptyIcon, emptyText) {
    const tools = ids.map(byId).filter(Boolean);
    if (!tools.length) return `<div class="m-empty">${H.icon(emptyIcon)}<p>${emptyText}</p></div>`;
    return `<ul class="mini-list">${tools.map(t => `
      <li class="m-row"><button type="button" class="m-pick" data-id="${t.id}">${dot(t)}<span>${H.esc(t.shortName)}</span></button>
      <a class="m-go" ${H.launchAttrs(t)} aria-label="Open ${H.esc(t.name)} in a new tab">${H.icon('external')}</a></li>`).join('')}</ul>`;
  }

  function renderPinned() { $('pinned').innerHTML = miniList(H.favorites.list(), 'star', 'Nothing pinned yet. Pin a tool from Selected to keep it here.'); }
  function renderRecent() { $('recent').innerHTML = miniList(H.recent.list().slice(0, 6), 'clock', 'Tools you open appear here, newest first.'); }

  function renderSwitches() {
    const base = state.tools.filter(t => H.matches(t, state.q));
    const catCounts = H.countBy(base.filter(t => !state.status || t.status === state.status), 'category');
    $('cats').innerHTML = H.categoriesOf(state.tools).map(c => {
      const n = catCounts[c] || 0;
      return `<button type="button" class="sw" data-cat="${H.esc(c)}" aria-pressed="${state.cat === c}" ${n || state.cat === c ? '' : 'disabled'}>
        <span class="sw-top">${H.icon(H.categoryMeta(c).icon)}<span class="sw-n">${n}</span></span><span class="sw-name">${H.esc(c)}</span></button>`;
    }).join('');
    const stCounts = H.countBy(base.filter(t => !state.cat || t.category === state.cat), 'status');
    $('statuses').innerHTML = H.STATUSES.map(s => {
      const n = stCounts[s] || 0;
      return `<button type="button" class="sw" data-status="${s}" aria-pressed="${state.status === s}" ${n || state.status === s ? '' : 'disabled'}>
        <span class="sw-top">${dot({ status: s })}<span class="sw-n">${n}</span></span><span class="sw-name">${s}</span></button>`;
    }).join('');
  }

  function render() { renderLaunch(); renderSelected(); renderSwitches(); }

  function setActive(id, announce) {
    state.active = id;
    renderLaunch(); renderSelected();
    if (announce) {
      const t = byId(id);
      $('announce').textContent = `${t.name}, ${t.category}, ${t.status}. Enter opens it.`;
    }
  }

  function move(dir) {
    const list = filtered();
    if (!list.length) return;
    const i = list.findIndex(t => t.id === state.active);
    setActive(list[Math.max(0, Math.min(list.length - 1, i + dir))].id, true);
  }

  function openActive() {
    const t = byId(state.active);
    if (!t || !filtered().includes(t)) return;
    H.recent.record(t.id);
    window.open(t.url, '_blank', 'noopener,noreferrer');
  }

  function togglePin() {
    if (!state.active) return;
    const on = H.favorites.toggle(state.active);
    $('announce').textContent = `${byId(state.active).name} ${on ? 'pinned' : 'unpinned'}.`;
  }

  /* ---------- events ---------- */
  input.addEventListener('input', () => { state.q = input.value; render(); });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') { e.preventDefault(); openActive(); }
  });
  H.bindSearchKeys(input);

  $('launch-list').addEventListener('click', e => {
    const b = e.target.closest('.l-pick');
    if (b) setActive(b.dataset.id, false);
  });
  $('launch-list').addEventListener('keydown', e => {
    if (!e.target.classList.contains('l-pick')) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault(); move(e.key === 'ArrowDown' ? 1 : -1);
      const b = document.querySelector(`.l-pick[data-id="${state.active}"]`);
      if (b) b.focus();
    }
  });
  $('launch-reset').addEventListener('click', () => { state.q = ''; state.cat = ''; state.status = ''; input.value = ''; render(); input.focus(); });

  $('selected').addEventListener('click', e => { if (e.target.closest('#pin-btn')) togglePin(); });
  [$('pinned'), $('recent')].forEach(el => el.addEventListener('click', e => {
    const b = e.target.closest('.m-pick');
    if (!b) return;
    if (!filtered().some(t => t.id === b.dataset.id)) { state.q = ''; state.cat = ''; state.status = ''; input.value = ''; renderSwitches(); }
    setActive(b.dataset.id, true);
  }));
  $('cats').addEventListener('click', e => {
    const b = e.target.closest('button[data-cat]');
    if (!b || b.disabled) return;
    state.cat = state.cat === b.dataset.cat ? '' : b.dataset.cat; render();
  });
  $('statuses').addEventListener('click', e => {
    const b = e.target.closest('button[data-status]');
    if (!b || b.disabled) return;
    state.status = state.status === b.dataset.status ? '' : b.dataset.status; render();
  });

  document.addEventListener('keydown', e => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement && document.activeElement.tagName);
    if (!typing && !e.ctrlKey && !e.metaKey && !e.altKey && (e.key === 'p' || e.key === 'P')) { e.preventDefault(); togglePin(); }
  });
  document.addEventListener('hub:favorites', () => { renderPinned(); renderSelected(); });
  document.addEventListener('hub:recent', renderRecent);
  addEventListener('storage', () => { renderPinned(); renderRecent(); });

  H.loadTools().then(tools => {
    state.tools = tools;
    render(); renderPinned(); renderRecent();
  });
})();
