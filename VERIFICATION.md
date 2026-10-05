# Local verification

Verified on 2026-10-05 (Asia/Taipei). Static preview: http://127.0.0.1:4173/.

This report records the initial local build, before any later user-authorized Git commits or pushes.

## Requested checks

| Check | Result |
| --- | --- |
| Site runs locally | Passed; bound to 127.0.0.1 only |
| All seven tools render from JSON | Passed; names, status labels, and category counts match the registry |
| Search | Passed for name, description, category, tags, multi-word queries, and no-match feedback |
| Category filter | Passed; Calculators returns two tools |
| Status filter | Passed; Active returns four, Preview one, In Development two |
| Combined filters | Passed; category, status, and search combine with the current view |
| Favorites survive refresh | Passed by starring a tool, opening Favorites, and refreshing |
| Recently Used survives refresh | Passed by launching two tools, refreshing, and checking history |
| Recent ordering/deduplication | Passed; reopening an existing tool moves it to the front without duplication |
| Eighth-tool extensibility | Passed; a temporary eighth JSON object rendered automatically with an image fallback, searchable tags, a new category, and a navigation count |
| Eighth-tool cleanup | Passed; restored exact original tools.json bytes and verified seven tools again |
| No HTML changes needed for tool eight | Passed; index.html SHA-256 remained D3C565CA3FD1F34B21FC3E63F1BF5CBCAADCFAD0493AF10ED7408F2CD405DCB6 during the registry test |
| Desktop and mobile | Passed at 375×812, 812×375, 768×1024, 1280×800, 1440×1040, and 1920×1080; seven cards remain available and no horizontal document overflow |
| Mobile navigation | Passed; menu expands/collapses, category selection works, collapsed links are inert, focus moves to the workspace after selecting a view |
| Keyboard search | Passed; Ctrl+K focuses search and Escape clears the query |
| All Tools | Passed; uses the same registry and omits the Home hero |
| Empty personal views | Passed; useful empty messages for Favorites and Recently Used |
| JavaScript syntax | Passed using node --check for every module |
| Browser errors | None in final browser console check |

Test Favorites and Recently Used entries were removed using a temporary visible cleanup page. That page was removed afterward. The final launcher starts with empty personal views.

## Scope and limitations

All project writes were confined to the new `outputs/CAE-Engineering-Hub` directory; intermediate verification scripts and logs are under this chat's `work` directory, and preview screenshots are under `outputs`. No existing CAE repository was edited. No Git initialization, commits, pushes, deployment, GitHub API calls, or remote repository changes were performed.

Open Tool links use native anchors with target="_blank" and rel="noopener noreferrer". Browser launch checks recorded recent history and opened independent tool sites; the Material Library site was observed loading. A separate read-only HEAD check of all seven Pages addresses was blocked by the execution environment's outbound-network restriction. Full remote availability is therefore unverified. URLs use conventional repository-derived GitHub Pages paths; edit `url` in tools.json if an independent site has a custom or different address. This limitation does not affect the local launcher tests.

Engineering SVG previews are placeholders, not fabricated application screenshots. The hero is a generated technical illustration matching the user-selected concept. No repository content or application code was copied into the launcher.
