# HOME design proposals

Four working alternatives built with frontend-design using the existing verified 12-tool catalog. Open `designs/` for the visual comparison or `designs/?concept=a` (a–d) for an interactive version.

| Proposal | Direction | Distinct structure |
|---|---|---|
| A Blue Workspace | Swiss / #002FA7 / Helvetica Neue | Left category rail, three-column working cards |
| B Tool Directory | Swiss / #FF4F00 / Helvetica Neue | Horizontal index, compact numbered two-column cards |
| C Engineering Desk | Industrial / #0B0C0A + #00E676 / JetBrains Mono | Dark flat workspace, square outlines, monospace typography |
| D Sand Studio | Organic / #8B9D83 + #E8DCC7 / Epilogue | Rounded horizontal navigation and sand work cards |

All versions have category filtering, Chinese/exact-repository search, Ctrl/Cmd+K, Escape, optional legacy/preview entries, favorites and recent launches. The default view has nine daily tools; the legacy/preview switch reveals the other three. Local checklist links to launch instructions.

Preview preference keys are separate from the production Home: `cae-hub:design-preview:favorites:v1` and `cae-hub:design-preview:recent:v1`. All four proposals share these preview preferences. No backend or runtime GitHub API is used.

Local preview: serve the repository root over HTTP. Fonts are self-hosted from Google Fonts with their OFL licenses in `fonts/`. Chinese glyphs use the system font fallback. No decorative background imagery or animated effects are used.

Production root files are unchanged. The proposals live under the independent `/designs/` path and use the existing GitHub Pages publication.
