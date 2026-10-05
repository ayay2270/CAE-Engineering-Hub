/* Concept C: Task-Based Engineering Hub */
(function () {
  'use strict';
  const H = window.Hub;
  const $ = id => document.getElementById(id);

  // One task per real category. Keywords only widen search; they add no workflows.
  const TASKS = [
    { id: 'learn', cat: 'Knowledge', verb: 'Learn / Reference', sub: 'Methods, notes and references', color: '#2c5a8a', keys: 'learn reference method methodology note notes theory guide practice how' },
    { id: 'material', cat: 'Materials', verb: 'Find Material', sub: 'Properties for CAE models', color: '#356f50', keys: 'material materials property metal polymer composite steel aluminium aluminum modulus density' },
    { id: 'calculate', cat: 'Calculators', verb: 'Calculate', sub: 'Quick engineering calculations', color: '#a94f27', keys: 'calculate calculation calculator velocity impact drop cg cog centroid' },
    { id: 'check', cat: 'Workflow', verb: 'Check Model', sub: 'Before a simulation run', color: '#634a99', keys: 'check review model mesh boundary conditions bc setup run solve' },
    { id: 'standard', cat: 'Standards', verb: 'Find Standard', sub: 'Engineering test standards', color: '#1b6971', keys: 'standard standards test spec specification vibration' },
    { id: 'data', cat: 'Project Data', verb: 'Manage Data', sub: 'Project and configuration data', color: '#4f5967', keys: 'manage data weight mass compare assembly component' }
  ];
  // The question each tool answers, phrased from its own description.
  const QUESTIONS = {
    'knowledge-base': 'How is this kind of analysis usually set up?',
    'material-library': 'What are the properties of this material?',
    'shock-pulse': 'What initial velocity does this shock pulse give?',
    'center-of-gravity': 'Where is the center of gravity of this assembly?',
    'pre-run-checklist': 'Is this model ready to run?',
    'standard-finder': 'Which test standard covers this test?',
    'weight-manager': 'How do weights compare across configurations?'
  };
  const SUGGEST = ['velocity', 'mesh', 'steel', 'weight', 'standard', 'notes'];

  const state = { tools: [], tasks: [], q: '', task: '' };
  const input = $('q');

  $('brand-mark').innerHTML = H.cgMark();
  $('search-ico').innerHTML = H.icon('search');

  function buildTasks(tools) {
    const list = TASKS.slice();
    H.categoriesOf(tools).forEach(c => {
      if (!list.some(t => t.cat === c)) list.push({ id: 'cat-' + c.toLowerCase().replace(/\W+/g, '-'), cat: c, verb: c, sub: 'More tools', color: '#4f5967', keys: '' });
    });
    return list.map(t => Object.assign({ icon: H.categoryMeta(t.cat).icon }, t));
  }

  const taskOf = tool => state.tasks.find(t => t.cat === tool.category);
  const question = tool => QUESTIONS[tool.id] || tool.description;
  const matchesTool = tool => {
    const task = taskOf(tool);
    return H.matches(tool, state.q, [task ? task.verb : '', task ? task.keys : '', question(tool)]);
  };

  const highlight = text => H.highlight(text, state.q);

  function renderVerbs() {
    const hits = state.tools.filter(matchesTool);
    const counts = H.countBy(hits, 'category');
    const searching = Boolean(state.q.trim());
    $('verbs').innerHTML = state.tasks.map(t => {
      const n = counts[t.cat] || 0;
      return `<li><button type="button" class="verb${n ? '' : ' is-zero'}" data-task="${t.id}" style="--c:${t.color}" aria-current="${state.task === t.id}" ${n || state.task === t.id ? '' : 'disabled'}>
        <span class="v-ico">${H.icon(t.icon)}</span><span class="v-label">${H.esc(t.verb)}</span><span class="v-n" aria-label="${n} ${n === 1 ? 'tool' : 'tools'}">${n}</span></button></li>`;
    }).join('') + `<li class="sep" aria-hidden="true"></li><li class="all-item"><button type="button" class="verb all" data-task="" aria-current="${state.task === ''}"><span class="v-ico">${H.icon('grid')}</span><span class="v-label">${searching ? 'Every matching task' : 'Show every task'}</span><span class="v-n">${hits.length}</span></button></li>`;
  }

  function renderTasks() {
    const hits = state.tools.filter(matchesTool);
    const shown = state.tasks.filter(t => (!state.task || t.id === state.task) && hits.some(x => x.category === t.cat));
    const container = $('tasks');
    container.className = state.task ? 'single' : '';
    container.innerHTML = shown.map(task => {
      const tools = hits.filter(x => x.category === task.cat);
      return `<section class="task" id="task-${task.id}" style="--task:${task.color}" aria-labelledby="h-${task.id}">
        <div class="task-head"><h2 id="h-${task.id}">${H.esc(task.verb)}</h2><p class="task-sub">${H.esc(task.sub)}</p><p class="task-n">${tools.length} ${tools.length === 1 ? 'tool' : 'tools'}</p></div>
        <div class="answer-list">${tools.map(t => `
          <article class="answer">
            <div class="answer-plate">${H.plate(t)}</div>
            <div class="answer-body">
              <p class="answer-q">${highlight(question(t))}</p>
              <h3 class="answer-tool">${highlight(t.name)}</h3>
              <p class="answer-desc">${highlight(t.description)}</p>
              <p class="answer-meta"><span class="status ${H.statusKey(t.status)}">${H.esc(t.status)}</span>${t.tags.map(g => `<span class="tag">${highlight(g)}</span>`).join('')}</p>
            </div>
            <div class="open-cell"><a class="open" ${H.launchAttrs(t)} aria-label="Open ${H.esc(t.name)} in a new tab">Open tool ${H.icon('arrowRight')}</a></div>
          </article>`).join('')}
        </div></section>`;
    }).join('');

    const current = state.tasks.find(t => t.id === state.task);
    const searching = Boolean(state.q.trim());
    $('answers-title').textContent = current ? `Task: ${current.verb}` : searching ? `Tasks matching “${state.q.trim()}”` : 'Every task';
    const n = shown.reduce((s, t) => s + hits.filter(x => x.category === t.cat).length, 0);
    $('count').textContent = `${n} ${n === 1 ? 'tool' : 'tools'}${searching || current ? ` of ${state.tools.length}` : ''}`;
    $('empty').hidden = shown.length > 0;
    if (!shown.length) {
      $('empty-q').textContent = state.q.trim();
      $('suggest').innerHTML = SUGGEST.map(s => `<button type="button" data-suggest="${s}">${s}</button>`).join('');
    }
  }

  function render() { renderVerbs(); renderTasks(); }

  function setTask(id, focus) {
    state.task = id;
    const hash = id ? '#' + id : '';
    if (location.hash !== hash) history.replaceState(null, '', hash || location.pathname + location.search);
    render();
    if (focus) {
      $('answers').focus({ preventScroll: true });
      if (matchMedia('(max-width: 860px)').matches) $('answers').scrollIntoView({ block: 'start' });
      else scrollTo({ top: 0 });
    }
  }

  /* events */
  input.addEventListener('input', () => {
    state.q = input.value;
    // A task that no longer has matches would hide everything; widen to all tasks.
    if (state.task) {
      const t = state.tasks.find(x => x.id === state.task);
      if (t && !state.tools.some(x => x.category === t.cat && matchesTool(x))) setTask('');
    }
    render();
  });
  H.bindSearchKeys(input);
  $('verbs').addEventListener('click', e => {
    const b = e.target.closest('button[data-task]');
    if (b && !b.disabled) setTask(b.dataset.task, true);
  });
  $('suggest').addEventListener('click', e => {
    const b = e.target.closest('button[data-suggest]');
    if (!b) return;
    input.value = b.dataset.suggest; state.q = input.value; render(); input.focus();
  });
  addEventListener('hashchange', () => {
    const id = location.hash.slice(1);
    if (id !== state.task && (id === '' || state.tasks.some(t => t.id === id))) setTask(id);
  });

  H.loadTools().then(tools => {
    state.tools = tools;
    state.tasks = buildTasks(tools);
    const id = location.hash.slice(1);
    state.task = state.tasks.some(t => t.id === id) ? id : '';
    render();
  });
})();
