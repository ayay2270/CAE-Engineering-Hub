# CAE Engineering Hub — UI/UX refinement R1

Six working HTML prototypes on `concepts/codex-uiux-refinement-r1`.

Open [the concept gallery](index.html) through an HTTP server. From the repository root, run `python -m http.server 4280 --bind 127.0.0.1`, then visit [the local gallery](http://127.0.0.1:4280/concepts/). Direct `file://` navigation cannot fetch the JSON catalog.

| Concept | Prototype | Design decision |
| --- | --- | --- |
| A — Refined Engineering Launchpad | [Open A](concept-a/index.html) | Preserve the engineering hero and dark navigation; give cards clearer names, practical descriptions, and individual technical illustrations. |
| B — Dense Engineering Workbench | [Open B](concept-b/index.html) | Use a compact register with thumbnail, purpose, category, status, and launch action on one row. |
| C — Search-first Tool Hub | [Open C](concept-c/index.html) | Center metadata search, category shortcuts, and keyboard navigation; all tools are visible before a query is entered. |
| D — Visual Engineering Library | [Open D](concept-d/index.html) | Use a featured opening card and a restrained visual collection, with the illustration doing more of the identification work. |
| E — Category-driven Workspace | [Open E](concept-e/index.html) | Make the category index primary and group tools beneath category headings with real catalog counts. |
| F — Codex Free Exploration: Tool Navigator | [Open F](concept-f/index.html) | Use a charcoal index and a single inspector pane; keep direct launching available on every index row. |

A trades first-screen density for a larger engineering introduction and visual cards. B–F show all seven tool entries at 1440×900. Every layout continues to render additional catalog entries rather than reserving seven fixed slots.

## UI/UX Pro Max application

Used UI/UX Pro Max design-system searches for engineering productivity and developer workspaces, followed by focused UX searches for search, command shortcuts, compact hierarchy, keyboard navigation, and master/detail interaction. Typography exploration included IBM Plex Sans and technical monospace pairings.

Applied the relevant findings: clear heading hierarchy, restrained blue accents, technical type treatments, text labels accompanying status colors, visible keyboard focus, a skip link, actionable empty states, and a dark technical palette for F. Automatic marketing/FAQ landing-page recommendations did not fit this launcher and were discarded. The implementation uses system-font fallbacks and no remote font dependency. Frontend-design was not used.

## Implementation boundaries

- All catalog entries, categories, descriptions, tags, statuses, and launch URLs come from the existing `../data/tools.json`.
- `shared/launcher.js` provides local metadata search, category/status filtering, catalog counts, favorites, and a recent list capped at 12 entries. The recent view orders newest first.
- Favorites and recent history use separate `cae-hub:concepts:*` localStorage keys. Production history is untouched. Browsing still works when storage is unavailable.
- Ctrl/Cmd+K focuses search in every concept. Escape clears the query. C also supports Up/Down through launch links and Enter to open the selected or first result.
- F supports selecting a tool in the index while keeping its independent launch link available. On phones, selecting an index entry brings the updated inspector into view.
- Illustrations in `shared/visuals/` are engineering-themed previews, not fabricated application screenshots. Known tools use these concept-specific illustrations; future entries use their JSON `image` or a neutral fallback.
- The existing hero, icon module, and metadata search helper are read-only references. No production file was changed.
- Gallery preview treatments identify the six layout structures. Actual desktop and phone captures are in `previews/`.
- No framework, backend, account system, repository integration, or new deployment configuration was added.

## Verification

Verified locally in the Codex in-app browser:

| Check | Result |
| --- | --- |
| Gallery links to all six working prototypes | Passed |
| Seven tool entries in each prototype | Passed |
| Every launch URL matches the source catalog; new-tab links use noopener | Passed |
| Local search by name, description, category, and tags | Passed |
| Category and status filters in all six concepts | Passed |
| Combined filters, no-result state, and clearing filters | Passed |
| Ctrl+K and Escape in all six concepts | Passed |
| C result-link keyboard navigation | Passed |
| F desktop and mobile inspector selection | Passed |
| Favorites survive refresh; removal and empty view | Passed |
| Recently used survives refresh after opening a tool | Passed |
| 1440×900 and 1920×1080 desktop layouts | Passed |
| 768×1024 tablet, 390×844 phone, and 320×800 narrow phone | Passed |
| Sidebar toggle on phones in A, B, E | Passed |
| No page/card horizontal overflow at checked sizes | Passed |
| Console errors/warnings during local prototype checks | None |
| JavaScript syntax and illustration XML checks | Passed |

The prototypes preserve URL destinations; external application availability is independent of this exploration. Mac-specific key dispatch was not tested on this Windows host; Cmd+K is supported by the shared event handler.

## Files

```text
concepts/
├── README.md
├── index.html
├── gallery.css
├── concept-a/ … concept-f/
│   ├── index.html
│   └── style.css
├── shared/
│   ├── base.css
│   ├── launcher.js
│   └── visuals/ (8 SVG illustrations)
└── previews/ (desktop, phone, and gallery captures)
```

Baseline `origin/main` before work: `7432ade51b9fb03a076a7a2c1d5ab003991a8614`.

Only files below `concepts/` belong to this change. Root application files, catalog, styles, scripts, assets, and production documentation remain unchanged. The concept branch is not the GitHub Pages publishing source; these prototypes are reviewed locally. No Pages settings, default branch, main branch, merge, or pull request are part of this work.
