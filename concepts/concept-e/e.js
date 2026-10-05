/* Concept E: Knowledge + Tool Hybrid (curated library) */
(function () {
  'use strict';
  const H = window.Hub;
  const $ = id => document.getElementById(id);

  // Two wings of the library. Categories outside both land in "Further entries".
  const WINGS = [
    { id: 'ref', name: 'Reference shelf', note: 'Knowledge, materials and standards to consult', cats: ['Knowledge', 'Materials', 'Standards'] },
    { id: 'ins', name: 'Instruments', note: 'Calculators, checks and project data to work with', cats: ['Calculators', 'Workflow', 'Project Data'] }
  ];

  const state = { tools: [], q: '', section: '', subject: '' };
  const input = $('q');

  $('brand-mark').innerHTML = H.cgMark();
  $('search-ico').innerHTML = H.icon('search');

  const wingOf = c => WINGS.find(w => w.cats.includes(c)) || { id: 'ins', name: 'Further entries', note: 'Other categories', cats: [] };
  const byId = id => state.tools.find(t => t.id === id);

  // Call numbers: category code + order within that category, e.g. CA·02.
  const callNo = {};
  function assignCallNumbers() {
    const seen = {};
    state.tools.forEach(t => {
      const code = H.categoryMeta(t.category).code;
      seen[code] = (seen[code] || 0) + 1;
      callNo[t.id] = `${code}·${String(seen[code]).padStart(2, '0')}`;
    });
  }

  function subjects() {
    const map = {};
    state.tools.forEach(t => t.tags.forEach(g => { (map[g] = map[g] || []).push(t); }));
    return Object.keys(map).sort((a, b) => a.localeCompare(b)).map(name => ({ name, tools: map[name] }));
  }

  // Related: entries sharing a subject first, then siblings in the same section.
  function related(tool) {
    const out = [];
    state.tools.forEach(o => {
      if (o.id === tool.id) return;
      const shared = o.tags.filter(g => tool.tags.includes(g));
      if (shared.length) out.push({ tool: o, why: shared.join(', ') });
    });
    state.tools.forEach(o => {
      if (o.id !== tool.id && o.category === tool.category && !out.some(r => r.tool.id === o.id)) out.push({ tool: o, why: 'same section' });
    });
    return out.slice(0, 3);
  }

  const filtered = () => state.tools.filter(t => H.matches(t, state.q, [callNo[t.id], wingOf(t.category).name])
    && (!state.section || t.category === state.section)
    && (!state.subject || t.tags.includes(state.subject)));

  const highlight = text => H.highlight(text, state.q);

  /* ---------- render ---------- */
  function renderSections() {
    const base = state.tools.filter(t => H.matches(t, state.q, [callNo[t.id]]) && (!state.subject || t.tags.includes(state.subject)));
    const counts = H.countBy(base, 'category');
    const cats = H.categoriesOf(state.tools);
    const wings = WINGS.concat(cats.some(c => !WINGS.some(w => w.cats.includes(c))) ? [{ id: 'ins', name: 'Further entries', cats: cats.filter(c => !WINGS.some(w => w.cats.includes(c))) }] : []);
    $('sections').innerHTML = `<button type="button" class="sec all" data-sec="" aria-current="${state.section === ''}"><span class="code">ALL</span><span>Whole catalogue</span><span class="n">${base.length}</span></button>`
      + wings.map(w => `<p class="wing-name">${H.esc(w.name)}</p>` + w.cats.map(c => {
        const n = counts[c] || 0;
        return `<button type="button" class="sec" style="--wing:var(--${w.id})" data-sec="${H.esc(c)}" aria-current="${state.section === c}" ${n || state.section === c ? '' : 'disabled'}><span class="code">${H.categoryMeta(c).code}</span><span>${H.esc(c)}</span><span class="n">${n}</span></button>`;
      }).join('')).join('');
  }

  function renderShelves() {
    const list = filtered();
    const groups = WINGS.map(w => ({ w, tools: list.filter(t => wingOf(t.category) === w) }))
      .concat([{ w: { id: 'ins', name: 'Further entries', note: 'Other categories' }, tools: list.filter(t => !WINGS.some(w => w.cats.includes(t.category))) }])
      .filter(g => g.tools.length);

    $('shelves').innerHTML = groups.map(({ w, tools }) => `
      <section class="shelf" aria-labelledby="shelf-${w.id}-${w.name.length}">
        <div class="shelf-head"><h2 id="shelf-${w.id}-${w.name.length}">${H.esc(w.name)}</h2><p>${H.esc(w.note)}</p><span class="n">${tools.length} ${tools.length === 1 ? 'entry' : 'entries'}</span></div>
        <div class="entries">${tools.map(entry).join('')}</div>
      </section>`).join('');

    $('empty').hidden = list.length > 0;
    if (!list.length) {
      const parts = [state.q.trim() && `“${state.q.trim()}”`, state.section, state.subject && `subject ${state.subject}`].filter(Boolean).join(', ');
      $('empty-text').textContent = `Nothing in the catalogue matches ${parts}.`;
    }

    const chips = [];
    if (state.section) chips.push(['section', `Section: ${state.section}`]);
    if (state.subject) chips.push(['subject', `Subject: ${state.subject}`]);
    $('active-filters').innerHTML = chips.map(([k, label]) => `<span class="f-chip">${H.esc(label)}<button type="button" data-clear="${k}" aria-label="Remove ${H.esc(label)}">${H.icon('close')}</button></span>`).join('');
    const total = state.tools.length;
    $('cat-title').textContent = state.q.trim() ? `Results for “${state.q.trim()}”` : 'Catalogue';
    $('cat-intro').textContent = (state.q || state.section || state.subject)
      ? `${list.length} of ${total} entries.`
      : 'Reference works and working instruments for CAE. Shared subjects link related entries.';
  }

  function entry(t) {
    const w = wingOf(t.category);
    const rel = related(t);
    return `<article class="entry ${w.id}" id="e-${t.id}" aria-labelledby="t-${t.id}">
      <div class="entry-top"><span class="callno">${callNo[t.id]}</span><span class="cat">${H.esc(t.category)}</span><span class="status ${H.statusKey(t.status)}">${H.esc(t.status)}</span></div>
      <div class="entry-main">
        <h3 id="t-${t.id}">${highlight(t.name)}</h3>
        <p class="desc">${highlight(t.description)}</p>
        <dl class="facts">
          <dt>Subjects</dt><dd>${t.tags.map(g => `<button type="button" class="subj-link" data-subject="${H.esc(g)}">${highlight(g)}</button>`).join('<span class="subj-sep" aria-hidden="true">·</span>')}</dd>
          ${rel.length ? `<dt>See also</dt><dd>${rel.map(r => `<a class="rel-link" href="#e-${r.tool.id}" data-jump="${r.tool.id}">${H.esc(r.tool.shortName)}</a> <span class="rel-why">(${H.esc(r.why)})</span>`).join('; ')}</dd>` : ''}
          <dt>Location</dt><dd class="loc">${H.esc(H.host(t.url))}</dd>
        </dl>
      </div>
      <div class="entry-plate">${H.plate(t)}</div>
      <div class="entry-actions">
        <a class="open" ${H.launchAttrs(t)} aria-label="Open ${H.esc(t.name)} in a new tab">Open tool ${H.icon('external')}</a>
        ${t.repo ? `<a class="src" href="${H.esc(t.repo)}" target="_blank" rel="noopener noreferrer">${H.icon('repo')}Source<span class="sr-only"> repository for ${H.esc(t.name)} (new tab)</span></a>` : ''}
      </div>
    </article>`;
  }

  function renderSubjects() {
    const hits = new Set(state.tools.filter(t => H.matches(t, state.q, [callNo[t.id]])).map(t => t.id));
    $('subjects').innerHTML = subjects().map(s => {
      const live = s.tools.some(t => hits.has(t.id));
      return `<li class="subj${live ? '' : ' dim'}">
        <button type="button" class="subj-btn" data-subject="${H.esc(s.name)}" aria-pressed="${state.subject === s.name}"><span class="name">${H.esc(s.name)}</span><span class="lead" aria-hidden="true"></span><span class="n">${s.tools.length}</span></button>
        <div class="subj-refs">${s.tools.map(t => `<a class="${wingOf(t.category).id}" href="#e-${t.id}" data-jump="${t.id}" title="${H.esc(t.name)}">${callNo[t.id]}<span class="sr-only"> ${H.esc(t.name)}</span></a>`).join('')}</div>
      </li>`;
    }).join('');
  }

  function renderConsulted() {
    const recent = H.recent.list().map(byId).filter(Boolean).slice(0, 5);
    $('consulted').innerHTML = recent.length
      ? `<ul>${recent.map(t => `<li><a ${H.launchAttrs(t)}>${H.icon('clock')}${H.esc(t.shortName)}<span class="sr-only"> (opens in a new tab)</span></a></li>`).join('')}</ul>`
      : '<p class="none">Entries you open appear here.</p>';
  }

  function render() { renderSections(); renderShelves(); renderSubjects(); }

  function jumpTo(id) {
    // Make sure the target entry is visible under the current filters.
    if (!filtered().some(t => t.id === id)) { state.q = ''; input.value = ''; state.section = ''; state.subject = ''; render(); }
    const el = $('e-' + id);
    if (!el) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
    const link = el.querySelector('.open');
    if (link) link.focus({ preventScroll: true });
  }

  function setSubject(s) { state.subject = state.subject === s ? '' : s; render(); $('catalogue').focus({ preventScroll: true }); scrollTo({ top: 0 }); }

  /* ---------- events ---------- */
  input.addEventListener('input', () => { state.q = input.value; render(); });
  H.bindSearchKeys(input);

  $('sections').addEventListener('click', e => {
    const b = e.target.closest('button[data-sec]');
    if (!b || b.disabled) return;
    state.section = b.dataset.sec; render(); scrollTo({ top: 0 });
  });
  document.addEventListener('click', e => {
    const subj = e.target.closest('[data-subject]');
    if (subj) { setSubject(subj.dataset.subject); return; }
    const jump = e.target.closest('a[data-jump]');
    if (jump) { e.preventDefault(); jumpTo(jump.dataset.jump); return; }
    const clear = e.target.closest('button[data-clear]');
    if (clear) { state[clear.dataset.clear] = ''; render(); }
  });
  $('empty-reset').addEventListener('click', () => { state.q = ''; input.value = ''; state.section = ''; state.subject = ''; render(); });
  document.addEventListener('hub:recent', renderConsulted);

  H.loadTools().then(tools => {
    state.tools = tools;
    assignCallNumbers();
    render(); renderConsulted();
  });
})();
