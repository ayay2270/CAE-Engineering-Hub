# Proposal verification — 2026-10-27

Four frontend-design proposals share the existing verified 12-tool catalog, with nine daily tools shown by default and three optional legacy/preview versions.

Browser verification in the Codex in-app browser:

- A: desktop 1440 × 1000, three-column cards and side navigation.
- B: desktop 1440 × 1000, compact two-column numbered directory and horizontal navigation.
- C: desktop 1440 × 1000, three-column square cards and self-hosted JetBrains Mono.
- D: desktop 1440 × 1000, three-column rounded sand cards and self-hosted Epilogue.
- All four: 390 × 844 and 320 × 740 mobile widths; single-column cards, wrapping controls, no horizontal document overflow.
- Chinese multi-keyword search returned the expected gravity tool.
- Favorites saved across proposal navigation and could be removed from the Favorites view.
- Legacy/preview toggle increased the catalog from 9 to 12; CAE filtering then returned 5 entries.
- Online tool launch updated Recently Used; a no-match query displayed its empty state.
- Local checklist uses the repository instructions instead of a Pages or localhost launch URL.
- All four gallery screenshots loaded; no browser console warnings or errors observed.

Small orange text was changed to dark text while orange remains the accent for larger numbers, borders and icons. Sand-on-sage surfaces use darker ink for readable small text. Reduced-motion preferences disable transitions; focus outlines and native search/checkbox controls remain available.

JavaScript syntax and repository whitespace checks passed. These checks cover the proposals and their launcher interactions, not the internal workflows of linked tools. Screen-reader software and restricted-storage behavior were not separately exercised.

Publication adds only designs/ files and shares the existing main/root GitHub Pages deployment. Root production Home files are unchanged.
