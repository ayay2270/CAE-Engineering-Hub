/*
 * CAE Engineering Hub: shared data and helpers for the UI/UX concept prototypes.
 *
 * Classic script (not a module) so every concept also opens straight from disk.
 * Over HTTP it reads the production registry at ../../data/tools.json. When that
 * is unavailable (file://), it uses FALLBACK, a verbatim copy of that file.
 */
(function () {
  'use strict';

  const DATA_URL = '../../data/tools.json';
  const CATEGORIES = ['Knowledge', 'Materials', 'Calculators', 'Workflow', 'Standards', 'Project Data'];
  const STATUSES = ['Active', 'Preview', 'In Development'];
  const CATEGORY_META = {
    Knowledge: { icon: 'book', code: 'KN' },
    Materials: { icon: 'layers', code: 'MT' },
    Calculators: { icon: 'calc', code: 'CA' },
    Workflow: { icon: 'clipboard', code: 'WF' },
    Standards: { icon: 'doc', code: 'ST' },
    'Project Data': { icon: 'scale', code: 'PD' }
  };

  const FALLBACK = [
    { id: 'knowledge-base', name: 'CAE Knowledge Base', shortName: 'Knowledge Base', category: 'Knowledge', status: 'Active', description: 'Browse CAE methodologies, technical notes, and practical engineering references.', tags: ['CAE', 'Best Practice'], url: 'https://ayay2270.github.io/CAE-Knowledge-Base-V4/', repo: 'https://github.com/ayay2270/CAE-Knowledge-Base-V4', image: 'assets/images/knowledge.svg', featured: true },
    { id: 'material-library', name: 'CAE Material Library', shortName: 'Material Library', category: 'Materials', status: 'Preview', description: 'Look up material properties for metals, polymers, and composites used in CAE models.', tags: ['Properties', 'CAE'], url: 'https://ayay2270.github.io/CAE-Material-Library-V2-Preview/', repo: 'https://github.com/ayay2270/CAE-Material-Library-V2-Preview', image: 'assets/images/materials.svg', featured: true },
    { id: 'shock-pulse', name: 'Shock Pulse Initial Velocity Calculator', shortName: 'Shock Pulse Calculator', category: 'Calculators', status: 'Active', description: 'Calculate initial velocity from a shock pulse acceleration–time history.', tags: ['Dynamics', 'Impact'], url: 'https://ayay2270.github.io/Shock-Pulse-Initial-Velocity-Calculator-V2/', repo: 'https://github.com/ayay2270/Shock-Pulse-Initial-Velocity-Calculator-V2', image: 'assets/images/shock.svg', featured: true },
    { id: 'center-of-gravity', name: 'Center of Gravity Calculator', shortName: 'Center of Gravity', category: 'Calculators', status: 'Active', description: 'Determine the center of gravity of components and multi-body assemblies.', tags: ['Mass Properties', 'Geometry'], url: 'https://ayay2270.github.io/Center-of-Gravity-Calculator-V2/', repo: 'https://github.com/ayay2270/Center-of-Gravity-Calculator-V2', image: 'assets/images/gravity.svg', featured: false },
    { id: 'pre-run-checklist', name: 'CAE Pre-run Checklist', shortName: 'Pre-run Checklist', category: 'Workflow', status: 'Active', description: 'Review model setup, mesh quality, and boundary conditions before a simulation run.', tags: ['Quality', 'Best Practice'], url: 'https://ayay2270.github.io/cae-pre-run-checklist/', repo: 'https://github.com/ayay2270/cae-pre-run-checklist', image: 'assets/images/checklist.svg', featured: false },
    { id: 'standard-finder', name: 'Engineering Test Standard Finder', shortName: 'Test Standard Finder', category: 'Standards', status: 'In Development', description: 'Find engineering test standards by keyword, application, or test type.', tags: ['Testing', 'Reference'], url: 'https://ayay2270.github.io/Engineering-Test-Standard-Finder-V2/', repo: 'https://github.com/ayay2270/Engineering-Test-Standard-Finder-V2', image: 'assets/images/standards.svg', featured: false },
    { id: 'weight-manager', name: 'Weight Data Manager', shortName: 'Weight Data Manager', category: 'Project Data', status: 'In Development', description: 'Organize and compare component and assembly weight data across configurations.', tags: ['Mass Properties', 'Configuration'], url: 'https://ayay2270.github.io/Weight-Data-Manager-V2/', repo: 'https://github.com/ayay2270/Weight-Data-Manager-V2', image: 'assets/images/weight.svg', featured: false }
  ];

  /* ---------- data ---------- */

  function isHttpUrl(value) {
    try { return /^https?:$/.test(new URL(value).protocol); } catch (e) { return false; }
  }

  function normalize(list) {
    if (!Array.isArray(list)) return [];
    const seen = new Set();
    return list.filter(t => t && typeof t.id === 'string' && !seen.has(t.id) && seen.add(t.id)
      && typeof t.name === 'string' && typeof t.category === 'string'
      && STATUSES.includes(t.status) && isHttpUrl(t.url))
      .map(t => ({
        id: t.id,
        name: t.name,
        shortName: t.shortName || t.name,
        category: t.category,
        status: t.status,
        description: t.description || '',
        tags: Array.isArray(t.tags) ? t.tags.filter(x => typeof x === 'string') : [],
        url: t.url,
        repo: typeof t.repo === 'string' ? t.repo : '',
        featured: Boolean(t.featured)
      }));
  }

  async function loadTools() {
    if (location.protocol !== 'file:') {
      try {
        const res = await fetch(DATA_URL, { cache: 'no-cache' });
        if (res.ok) {
          const tools = normalize(await res.json());
          if (tools.length) return tools;
        }
      } catch (e) { /* fall through to the embedded copy */ }
    }
    return normalize(FALLBACK);
  }

  /** The six fixed categories first, then any extra category names found in the data. */
  function categoriesOf(tools) {
    const extra = [];
    tools.forEach(t => { if (!CATEGORIES.includes(t.category) && !extra.includes(t.category)) extra.push(t.category); });
    return CATEGORIES.concat(extra);
  }

  function categoryMeta(name) {
    return CATEGORY_META[name] || { icon: 'cube', code: name.slice(0, 2).toUpperCase() };
  }

  function countBy(tools, key) {
    const out = {};
    tools.forEach(t => { out[t[key]] = (out[t[key]] || 0) + 1; });
    return out;
  }

  /* ---------- search ---------- */

  const fold = v => String(v).normalize('NFKC').toLocaleLowerCase();

  /** Every word must appear in name, description, category, status, tags or extra keywords. */
  function matches(tool, query, extra) {
    const words = fold(query).trim().split(/\s+/).filter(Boolean);
    if (!words.length) return true;
    const hay = fold([tool.name, tool.shortName, tool.description, tool.category, tool.status]
      .concat(tool.tags, extra || []).join(' '));
    return words.every(w => hay.includes(w));
  }

  /** "/" or Ctrl/Cmd+K focuses the field; Escape clears it. */
  function bindSearchKeys(input, onClear) {
    document.addEventListener('keydown', e => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement && document.activeElement.tagName);
      if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault(); input.focus(); input.select();
      } else if (e.key === '/' && !typing) {
        e.preventDefault(); input.focus(); input.select();
      } else if (e.key === 'Escape' && document.activeElement === input && input.value) {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        if (onClear) onClear();
      }
    });
  }

  /* ---------- local state (separate keys from production) ---------- */

  const KEYS = { favorites: 'cae-hub-concepts:favorites:v1', recent: 'cae-hub-concepts:recent:v1' };
  const memory = {};

  function readList(key) {
    try {
      const v = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(v) ? v.filter(x => typeof x === 'string') : [];
    } catch (e) { return memory[key] || []; }
  }

  function writeList(key, list) {
    memory[key] = list;
    try { localStorage.setItem(key, JSON.stringify(list)); } catch (e) { /* session-only */ }
  }

  const favorites = {
    list: () => readList(KEYS.favorites),
    has: id => readList(KEYS.favorites).includes(id),
    toggle(id) {
      const list = readList(KEYS.favorites);
      const next = list.includes(id) ? list.filter(x => x !== id) : list.concat(id);
      writeList(KEYS.favorites, next);
      document.dispatchEvent(new CustomEvent('hub:favorites', { detail: next }));
      return next.includes(id);
    }
  };

  const recent = {
    list: () => readList(KEYS.recent),
    record(id) {
      const next = [id].concat(readList(KEYS.recent).filter(x => x !== id)).slice(0, 12);
      writeList(KEYS.recent, next);
      document.dispatchEvent(new CustomEvent('hub:recent', { detail: next }));
    }
  };

  // Any <a data-launch="tool-id"> records a launch on click or middle-click.
  function onLaunch(e) {
    if (e.type === 'auxclick' && e.button !== 1) return;
    const a = e.target.closest && e.target.closest('a[data-launch]');
    if (a) recent.record(a.dataset.launch);
  }
  document.addEventListener('click', onLaunch);
  document.addEventListener('auxclick', onLaunch);

  /* ---------- formatting ---------- */

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = v => String(v).replace(/[&<>"']/g, c => ESC[c]);

  /** Escaped HTML with each query word (2+ chars) wrapped in <mark>. Matches raw text, then escapes. */
  function highlight(text, query) {
    const words = String(query || '').trim().split(/\s+/).filter(w => w.length > 1)
      .map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (!words.length) return esc(text);
    return String(text).split(new RegExp('(' + words.join('|') + ')', 'gi'))
      .map((part, i) => (i % 2 ? `<mark>${esc(part)}</mark>` : esc(part))).join('');
  }

  function statusKey(status) {
    return status === 'Active' ? 'active' : status === 'Preview' ? 'preview' : 'dev';
  }

  function host(url) {
    try { const u = new URL(url); return u.host + u.pathname.replace(/\/$/, ''); } catch (e) { return url; }
  }

  /** Attributes for a real tool link: new tab, no opener, launch tracking. */
  function launchAttrs(tool) {
    return `href="${esc(tool.url)}" target="_blank" rel="noopener noreferrer" data-launch="${esc(tool.id)}"`;
  }

  /* ---------- icons (24px grid, 1.6 stroke) ---------- */

  const ICONS = {
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>',
    book: '<path d="M12 6.5C10 4.8 7 4.3 3.5 4.8v13.5c3.5-.5 6.5 0 8.5 1.7 2-1.7 5-2.2 8.5-1.7V4.8C17 4.3 14 4.8 12 6.5Zm0 0V20"/>',
    layers: '<path d="m12 3 9 4.5-9 4.5-9-4.5Z"/><path d="m3 12 9 4.5 9-4.5"/><path d="m3 16.5 9 4.5 9-4.5"/>',
    calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8.5 7h7M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01M8.5 15h.01M12 15h.01M15.5 15v2.5M8.5 18h.01M12 18h.01"/>',
    clipboard: '<rect x="5" y="4.5" width="14" height="17" rx="2"/><path d="M9 4.5V3h6v1.5"/><path d="m8.5 13 2.5 2.5 4.5-5"/>',
    doc: '<path d="M6 3h8l4 4v14H6Z"/><path d="M14 3v4h4M9 12h6M9 15.5h6M9 9h2"/>',
    scale: '<path d="M6 9h12l2.5 11h-17Z"/><circle cx="12" cy="6" r="2.5"/><path d="M9.5 14.5h5"/>',
    cube: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
    star: '<path d="m12 3.5 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8Z"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    external: '<path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    arrowRight: '<path d="M4 12h15m-5-5 5 5-5 5"/>',
    arrowLeft: '<path d="M20 12H5m5-5-5 5 5 5"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1"/>',
    pin: '<path d="M9 4h6l-1 5 3 3v2H7v-2l3-3Z"/><path d="M12 14v6"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    repo: '<path d="M6 4h11a1 1 0 0 1 1 1v14H7.5A1.5 1.5 0 0 0 6 20.5Z"/><path d="M6 20.5V5"/><path d="M10 8h4"/>'
  };

  function icon(name, cls) {
    return `<svg class="ico${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.cube}</svg>`;
  }

  /** Center-of-gravity symbol, used as the Hub mark in several concepts. */
  function cgMark(cls) {
    return `<svg class="cg-mark${cls ? ' ' + cls : ''}" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M16 16V3a13 13 0 0 1 13 13Z" fill="currentColor"/><path d="M16 16v13A13 13 0 0 1 3 16Z" fill="currentColor"/></svg>`;
  }

  window.Hub = {
    CATEGORIES, STATUSES, loadTools, categoriesOf, categoryMeta, countBy,
    matches, bindSearchKeys, favorites, recent,
    esc, highlight, statusKey, host, launchAttrs, icon, cgMark
  };
})();
