# CAE Engineering Hub: UI/UX refinement concepts (round 1, Claude study)

Six usable HTML prototypes exploring stronger directions for the Hub before production is refined.
They live entirely in `concepts/`; the production `index.html`, `css/`, `js/`, `data/` and `assets/` are untouched.

Open `concepts/index.html` for the gallery.

## Run locally

Serve the repository root (the concepts read `../../data/tools.json`, exactly like production):

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Then open <http://127.0.0.1:4173/concepts/>.
Each concept is also built to open straight from disk (`file://`): it uses no ES modules and, without HTTP, falls back to an embedded copy of `data/tools.json` in `shared/hub.js`.

## What every concept keeps

- The seven real tools, their real URLs (new tab, `noopener noreferrer`), the six real categories and the three real statuses.
- Status is never shown by color alone: Active is a filled dot, Preview a ring, In Development a diamond outline (concept F uses drawing conventions instead), always with the text label.
- Search matches name, description, category, status and tags; every word must match. `/` or Ctrl/Cmd+K focuses search and Escape clears it.
- New tools in `data/tools.json` appear automatically. Unknown categories get a generic icon and a category drawing.
- Local favorites and recent launches (concept D, plus recent lists in B and E) use their own keys, `cae-hub-concepts:*`, so production history is not touched.

## Shared layer (`concepts/shared/`)

| File | Purpose |
| --- | --- |
| `hub.js` | Loads the registry, search, local favorites/recent, icons, CG mark |
| `plates.js` | One engineering line drawing per tool, drawn from what the tool does (beam notes, stress–strain curves, half-sine pulse, CG on an assembly, meshed plate with BCs, PSD test profile, mass breakdown). Tinted per concept with CSS variables |
| `base.css` | Reset, focus, reduced motion, plate styling |

The plates replace generic card images: each one says what the tool is for, at any size, in any palette.

## Concepts

| | Concept | Idea | How it scales to 15–25 tools |
| --- | --- | --- | --- |
| A | Premium Engineering Portal | Editorial calm: featured spread on navy plate tiles, then a numbered index grouped by category with sticky group heads | Index rows grow per category; featured stays at three |
| B | Immersive CAE Studio | Pre/post-processor layout: tool tree, viewport (element-wise fringe plot on the overview, tool drawing when selected), properties panel, filmstrip | Tree collapses per category; filmstrip scrolls |
| C | Task-Based Engineering Hub | Verbs first (Learn / Reference, Find Material, Calculate, Check Model, Find Standard, Manage Data); each tool is framed as the question it answers | Tasks map 1:1 to categories, so new tools fall under their task automatically |
| D | Modular Engineering Cockpit | Keyboard-first Launch panel, Selected module, Pinned and Recently opened, Categories and Status switches; no KPI language | Launch list scrolls inside its module; switches filter it |
| E | Knowledge + Tool Library | Catalogue with call numbers (KN·01, CA·02…), Reference shelf vs Instruments, subject index built from the real tags, "See also" from shared tags | Subject index and call numbers grow with the data |
| F | Drawing Sheet (free) | The Hub as an engineering drawing: zone border, detail views with balloons, revision cloud for In Development, boxed note for Preview, notes and title block | Details flow in the sheet grid; filtering greys details in place so layout stays stable |

## How UI/UX Pro Max was used

- `--design-system` for the product (engineering tool launcher) returned a landing-page pattern and Swiss-style minimalism. Both were rejected: the brief excludes Swiss design and the Hub is not a marketing page. The palette guidance (navy + restrained accent, slate text, 4.5:1 contrast) carried into A and the gallery.
- Dialed runs (`--variance 8–9`) pushed toward bento/brutalist structures. Bento informed D's spatial modules; brutalism was rejected for the brief's calm, precise tone.
- Typography searches gave the pairings: IBM Plex Sans/Mono (B, technical software), Source Serif 4 + Plex Mono (E, library), Newsreader + Hanken Grotesk + Plex Mono (A, editorial), Archivo + JetBrains Mono (D, instrument panel), Schibsted Grotesk (C), Barlow Semi Condensed (F, drawing lettering).
- UX guidelines applied across all six: no-results state with recovery, visible focus, keyboard reachability, icon-only controls labelled, hover not required (touch shows inline Open actions), `prefers-reduced-motion`, color never the only status signal, primary actions 36–48px tall and every target above the WCAG 2.2 24px minimum.
- Style results for "technical / blueprint" returned HUD / sci-fi FUI. They were deliberately avoided; engineering character comes from real conventions (fringe plots, FE meshes, BC symbols, drawing frames, call numbers) instead.

## Notes for evaluation

- Drawings are illustrative, not screenshots. Concept B's fringe plot is labelled "Illustrative fringe. Not analysis data."
- Concept B shows the `repo` link from `tools.json` (reserved metadata in production) in its properties panel; E shows it as "Source".
- Fonts load from Google Fonts. Offline, each concept falls back to system fonts.
