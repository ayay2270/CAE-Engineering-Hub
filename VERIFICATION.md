# Original UI restoration — 2026-10-27

Restored production index, navigation, app and card rendering from commit 7432ade. Original CSS and illustrated assets are unchanged. Minimal adjustments retain the verified 12-tool catalog, corrected launch URLs, exact-repository search, and a safe local-checklist instruction link.

The design proposals now use designs/shared/ modules and designs/data/tools.json, so production UI modules can be restored independently.

Run node --test tests/catalog.test.mjs for catalog validation, exclusions, canonical URLs, local instructions and search/filter coverage.
