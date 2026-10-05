/* Concept A: Premium Engineering Portal */
(function () {
  'use strict';
  const H = window.Hub;
  const $ = id => document.getElementById(id);
  const state = { tools: [], q: '', category: '', status: '' };

  $('brand-mark').innerHTML = H.cgMark();
  $('search-ico').innerHTML = H.icon('search');

  const input = $('q');

  const highlight = text => H.highlight(text, state.q);

  function renderFeatured() {
    let picks = state.tools.filter(t => t.featured);
    if (picks.length < 3) picks = picks.concat(state.tools.filter(t => !picks.includes(t))).slice(0, 3);
    const card = (t, big) => `
      <article class="feat">
        <div class="tile">${H.plate(t)}<span class="status ${H.statusKey(t.status)}">${H.esc(t.status)}</span></div>
        <div class="feat-body">
          <p class="feat-meta">${H.esc(t.category)}</p>
          <h3><a ${H.launchAttrs(t)}>${H.esc(big ? t.name : t.shortName)}<span class="sr-only"> (opens in a new tab)</span></a></h3>
          <p class="desc">${H.esc(t.description)}</p>
          <span class="open-cue" aria-hidden="true">Open tool ${H.icon('external')}</span>
        </div>
      </article>`;
    $('featured-grid').innerHTML = card(picks[0], true)
      + `<div class="feat-side">${picks.slice(1, 3).map(t => card(t, false)).join('')}</div>`;
  }

  function renderLeadCats() {
    const counts = H.countBy(state.tools, 'category');
    $('lead-cats').innerHTML = H.categoriesOf(state.tools).map(c => `
      <li><a href="#index" data-cat="${H.esc(c)}">${H.icon(H.categoryMeta(c).icon)}<span>${H.esc(c)}</span><span class="n">${counts[c] || 0}</span>${H.icon('arrowRight', 'go')}</a></li>`).join('');
  }

  function renderFilters() {
    const base = state.tools.filter(t => H.matches(t, state.q) && (!state.status || t.status === state.status));
    const counts = H.countBy(base, 'category');
    $('cat-tabs').innerHTML = [['', 'All', base.length]].concat(H.categoriesOf(state.tools).map(c => [c, c, counts[c] || 0]))
      .map(([v, label, n]) => `<button class="tab" type="button" data-cat="${H.esc(v)}" aria-pressed="${state.category === v}" ${n === 0 && state.category !== v ? 'disabled' : ''}>${H.esc(label)}<span class="n">${n}</span></button>`).join('');
    $('status-filter').innerHTML = H.STATUSES.map(s => `<button class="chip" type="button" data-status="${s}" aria-pressed="${state.status === s}"><span class="status ${H.statusKey(s)}">${s}</span></button>`).join('');
  }

  function renderIndex() {
    const list = state.tools.filter(t => H.matches(t, state.q)
      && (!state.category || t.category === state.category)
      && (!state.status || t.status === state.status));
    const order = state.tools.map(t => t.id);
    const groups = H.categoriesOf(state.tools).map(c => [c, list.filter(t => t.category === c)]).filter(([, ts]) => ts.length);

    $('index-list').innerHTML = groups.map(([c, ts]) => {
      const meta = H.categoryMeta(c);
      return `<section class="group" aria-labelledby="g-${meta.code}">
        <header class="group-head"><p class="group-code">${meta.code}</p><h3 class="group-name" id="g-${meta.code}">${H.esc(c)}</h3><p class="group-n">${ts.length} ${ts.length === 1 ? 'tool' : 'tools'}</p></header>
        <div class="group-rows">${ts.map(t => `
          <article class="row">
            <span class="row-num">${String(order.indexOf(t.id) + 1).padStart(2, '0')}</span>
            <div class="tile">${H.plate(t)}</div>
            <div class="row-main">
              <h4 class="row-name">${highlight(t.name)}</h4>
              <p class="row-desc">${highlight(t.description)}</p>
              <p class="row-tags">${t.tags.map(g => `<span>${highlight(g)}</span>`).join('')}</p>
            </div>
            <div class="status-cell"><span class="status ${H.statusKey(t.status)}">${H.esc(t.status)}</span></div>
            <div class="open-cell"><a class="open" ${H.launchAttrs(t)} aria-label="Open ${H.esc(t.name)} in a new tab">Open tool ${H.icon('external')}</a></div>
          </article>`).join('')}
        </div>
      </section>`;
    }).join('');
    $('index-list').setAttribute('aria-busy', 'false');

    const total = state.tools.length;
    const filtered = state.q || state.category || state.status;
    $('count').textContent = filtered ? `${list.length} of ${total} tools` : `${total} tools`;
    $('index-title').textContent = state.q ? `Results for “${state.q.trim()}”` : 'Index';
    $('empty').hidden = list.length > 0;
    if (!list.length) {
      const parts = [state.q && `“${state.q.trim()}”`, state.category, state.status].filter(Boolean).join(' · ');
      $('empty-text').textContent = `Nothing in the index matches ${parts}. Try a broader term, such as a category or tag.`;
    }
    document.body.classList.toggle('is-searching', Boolean(state.q.trim()));
  }

  function update() { renderFilters(); renderIndex(); }

  function reset() {
    state.q = ''; state.category = ''; state.status = '';
    input.value = '';
    update();
  }

  /* events */
  input.addEventListener('input', () => { state.q = input.value; update(); });
  H.bindSearchKeys(input, () => input.blur());

  $('cat-tabs').addEventListener('click', e => {
    const b = e.target.closest('button[data-cat]');
    if (!b || b.disabled) return;
    state.category = b.dataset.cat; update();
  });
  $('status-filter').addEventListener('click', e => {
    const b = e.target.closest('button[data-status]');
    if (!b) return;
    state.status = state.status === b.dataset.status ? '' : b.dataset.status; update();
  });
  $('lead-cats').addEventListener('click', e => {
    const a = e.target.closest('a[data-cat]');
    if (!a) return;
    e.preventDefault();
    state.category = a.dataset.cat; update();
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    $('index').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    $('index').focus({ preventScroll: true });
  });
  $('empty-reset').addEventListener('click', () => { reset(); input.focus(); });

  const mast = $('mast');
  const onScroll = () => mast.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  H.loadTools().then(tools => {
    state.tools = tools;
    renderFeatured();
    renderLeadCats();
    update();
  });
})();
