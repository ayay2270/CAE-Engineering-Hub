# CAE Engineering Hub

A lightweight local launcher for independent CAE tools. Plain HTML, CSS, JavaScript modules, and JSON; no framework, packages, build step, or application backend.

## Quick links

- [Open CAE Engineering Hub](https://ayay2270.github.io/CAE-Engineering-Hub/) — the hosted launcher on GitHub Pages.
- [Open the local preview](http://127.0.0.1:4173/) — available on the computer running the local preview server below.
- [View the GitHub repository](https://github.com/ayay2270/CAE-Engineering-Hub)

The hosted Hub is a static website published from the `main` branch. Each tool opens its own independent site in a new tab.

## Local preview

Serve this directory over HTTP because the tool collection is loaded with `fetch()` and the JavaScript uses modules. With Python installed:

```powershell
cd "path\to\CAE-Engineering-Hub"
python -m http.server 4173 --bind 127.0.0.1
```

Open [http://127.0.0.1:4173/](http://127.0.0.1:4173/). Stop the static preview server with Ctrl+C. Opening `index.html` directly with `file://` is not supported.

## Add or edit a tool

`data/tools.json` is the only tool registry. It is an array of objects:

```json
{
  "id": "new-tool",
  "name": "New Engineering Tool",
  "shortName": "New Tool",
  "category": "Calculators",
  "status": "Preview",
  "description": "A brief, accurate description of what this tool does.",
  "tags": ["Geometry"],
  "url": "https://example.com/tool/",
  "repo": "https://github.com/example/tool",
  "image": "assets/images/default.svg",
  "featured": false
}
```

Use a unique stable `id`. Required fields are `id`, `name`, `category`, `status`, `description`, `tags`, and a valid HTTP/HTTPS `url`. Only **Active**, **Preview**, and **In Development** are accepted. Use a JSON array of strings for `tags`.

Add the object and refresh: the card, count, filters, and navigation counts update automatically. Additional category names also appear automatically, with a generic icon until optionally given a style in `js/icons.js`. The six original category entries remain available when empty. Cards have no hardcoded limit and scale naturally to 15–25 tools.

`shortName`, `repo`, and `featured` are reserved optional metadata; this version displays the full name and preserves JSON order without a featured-only section. The launcher never reads repository contents or retrieves repository metadata.

Change `image` to a local asset path or an image URL to replace a preview. Missing or empty images use a neutral engineering illustration. The included SVG previews are illustrative placeholders, not application screenshots. The blue mesh-bracket hero was created with the built-in ImageGen tool from the selected concept reference; prompt: "A blue mounting bracket with a fine finite element mesh overlay on pale engineering blueprints, large bracket at right, light empty space at left, deep navy at far right; no text or UI." The asset is `assets/images/hero.png`.

## Navigation and local behavior

- Home: engineering hero and complete tool collection.
- All Tools: efficient card collection without the hero.
- Categories: filter tools by category; additional categories come from JSON.
- Favorites: star tools; stored in this browser under `cae-engineering-hub:favorites:v1`.
- Recently Used: records tool-link clicks, including middle-clicks; keeps the last 12 distinct tools, newest first, under `cae-engineering-hub:recent:v1`.
- Search: instant, case-insensitive matching across name, description, category, and tags. Multiple search words must all match. Ctrl/Cmd+K focuses search; Escape clears it.
- Category and status filters combine with search and the current personal view. Reset filters clears search/category/status while retaining Favorites or Recently Used. Navigation to another view resets filters.

Favorites and history persist across refreshes for the same browser and origin. Changing the preview port creates a different origin and a separate local history. There is no account, tracking, synchronization, or storage outside the browser. If storage is blocked, session-only state still works and a notice explains the limitation. Favorites and recent history update between same-origin tabs.

Tool URLs open independent sites in a new tab with `noopener noreferrer`; nothing is embedded. Recently Used records the launch action, not whether a remote application loaded successfully. Browser context-menu “Open in new tab” does not dispatch a normal click and is not recorded.

## Site URLs and future work

The initial `url` fields use the conventional GitHub Pages address derived from the supplied repository names. They are editable configuration, independent of the `repo` field. A repository can be public while its Pages site is unavailable or uses a different/custom address. Confirm those addresses as needed; this launcher does not publish, enable, or monitor remote sites. Status values are the user-provided labels, not fetched availability information. In-development tools retain their configured launch links.

Future work is intentionally limited to replacing illustrative previews with real screenshots, confirming/changing independent site URLs, and adding tools to JSON. Repository integration, cross-tool content search, backend services, authentication, and GitHub automation are outside this shell's scope.

## Structure

```text
CAE-Engineering-Hub/
├── index.html
├── README.md
├── VERIFICATION.md
├── data/tools.json
├── assets/
│   ├── icons/hub.svg
│   └── images/  (hero.png, seven SVG previews, default.svg)
├── css/
│   ├── base.css
│   ├── layout.css
│   ├── components.css
│   └── responsive.css
└── js/
    ├── app.js
    ├── tools.js
    ├── icons.js
    ├── search.js
    ├── filters.js
    ├── storage.js
    ├── favorites.js
    └── recent.js
```

No existing CAE repository is included, imported, or modified. Each application remains independent; the launcher contains no GitHub automation or repository synchronization.
