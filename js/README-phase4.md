# Phase 4.1 Foundation Layer — New Directories

Added in Phase 4.1, alongside the existing `js/core/` and
`js/frameworks/amseshi/` from Phase 3. **Every file below is currently a
documentation-header-only stub** (`export {};`, no logic) — structure
first, implementation later, each pending explicit approval.

| Folder | Role | Depends on |
|---|---|---|
| `js/application/` | Coordinates a full assessment run: framework → storage → reporting. The single entry point the UI calls. | `js/frameworks/`, `js/storage/` |
| `js/ui/` | Dashboard, wizard, results view, charts. Display only — no calculation, no storage calls. | `js/application/` |
| `js/storage/` | Project persistence facade (`project-service.js`) over concrete backends (`local-storage.js` today, `json-service.js` for import/export). | none (backend-only) |
| `js/config/` | Static configuration: research identity (`research-metadata.js`, moved here from the old `js/metadata/`), interpretation thresholds, application constants. | none |
| `js/utils/` | Small shared helpers (validation, formatting) usable by any layer above `js/core/`. | none |

## Why `research-metadata.js` moved here

It previously lived in `js/metadata/` (Phase 2). Since nothing in
`index.html` imports it yet, moving it to `js/config/` — its intended
final home per the Phase 4 structure — carries zero runtime risk. Its
content was also updated from placeholders to the final confirmed
research identity at the same time.

## What did not change

`js/core/ahp-engine.js` and `js/frameworks/amseshi/amseshi-framework.js`
only received an added documentation header (comment-only). Every
golden test case in `test/golden-cases/` was re-verified afterward and
still matches exactly — see `docs/reproducibility/`.
