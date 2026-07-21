# Legacy Code (Archived, Not Deleted)

Everything in this folder was part of the repository **before** the
architectural refactor, but is **not used by the live application**
(`index.html`). It is kept here — rather than deleted — for historical
provenance and academic traceability: a dissertation reviewer should be able
to see exactly what existed before, and confirm nothing was silently lost.

## What's here and why it's inactive

| Path | Origin | Why it's inactive |
|---|---|---|
| `rolledup.js`, `modules.js`, `js-modules/`, `root-modules/`, `rollup.config.js` | Original 2019 Comcast `ahp-tool` build pipeline (npm `ahp` package, bundled via Rollup) | Never referenced by `index.html`. The live app does not use this bundle or build step. |
| `index.js`, `enhanced-integration.js` | An intermediate development stage | Their logic was manually copied into `index.html`'s inline script at some point (visible from comments like `// ENHANCED SENSITIVITY ANALYSIS (من integration.js)`); the standalone files were left behind afterward, unreferenced. |
| `test-rolledup.js` (formerly `test/test.js`) | Original Mocha/Chai test suite | Tests only `rolledup.js` (the dead bundle), not the logic actually running in `index.html`. Does not currently verify any live behavior. |
| `index1.html`, `index2.html`, `indexp.html`, `indexy.html` | Development snapshots | Git history shows only `index.html` receives ongoing commits and is the file GitHub Pages serves. These are earlier iterations, not alternate live pages. |
| `package.json.orig`, `package-lock.json` | npm scaffolding from the original build pipeline | The live app runs with zero build step (per project requirements: no Node, no npm, no bundler). `package.json.orig` is also structurally invalid (two concatenated JSON objects) and was never functional as-is. |

## Verification

Before archiving, every file above was checked against `index.html` and
confirmed to have **zero references** (no `<script src>`, no dynamic import,
no usage). Moving them changes no runtime behavior of the live application.

## Future value

`js-modules/core/AHPEngine.js` and `root-modules/core/SensitivityAnalyzer.js`
represent an earlier, independent attempt at separating the AHP engine from
the UI. They are not used as the basis for the Phase 3 engine extraction
(which instead extracts the verified, currently-live calculation code from
`index.html`), but they may be useful as a reference during that work.
