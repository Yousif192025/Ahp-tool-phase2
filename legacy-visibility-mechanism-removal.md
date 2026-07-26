# Research Decision Log: Removal of the Legacy Static-Grid Visibility Mechanism

**Date:** 2026-07-25
**Status:** Fixed and verified with real computed-style evidence (before/after).

## Root cause (confirmed, not inferred)

The original (pre-AMSESHI) application used a **static 8×8 grid** approach
for pairwise comparison tables: every possible row/column combination
(`tr.crit0`...`tr.crit7`, `th.crit0`...`th.crit7`, etc.) existed in the
DOM at all times, and CSS classes (`active_crit0`...`active_crit7`,
`active_item0`...`active_item7`) applied to an ancestor element were
used to selectively reveal only the rows/columns actually in use.

The enabling CSS rule was:

```css
.pairwise_criteria td,
.pairwise_items td,
.pairwise_criteria tr[class],
.pairwise_items tr[class] {
  display: none;
}
```

with visibility restored only via `.active_critN td.critN` /
`.active_itemN td.itemN` overrides.

**The application has since moved entirely to dynamically generated
matrices** (`setupAlternativePairwiseTables()` builds fresh `<table>`
markup via `innerHTML` based on the actual number of criteria/alternatives
entered). This dynamic markup does **not** use the `critN`/`itemN` class
scheme, and — critically — **no JavaScript anywhere in the codebase
still applies `active_critN` / `active_itemN` classes to any ancestor**
(confirmed via exhaustive search). The blanket `display: none` rule
therefore had no corresponding "reveal" trigger left, and permanently
hid every dynamically generated comparison cell and every criteria
column header.

## Verification (real computed-style evidence, not inference)

Using a simulated DOM (jsdom) loaded from the actual live file:

| Element | Before fix | After fix |
|---|---|---|
| A dynamically generated comparison `<td>` | `display: none` | `display: table-cell` |
| `#pairwise_criteria th.crit1` (column header) | `display: none` | `display: table-cell` |

## What was removed and why

### 1. `css/styles.css` — obsolete visibility CSS (78 lines)
The entire "Classes to hide unused inputs" block: the blanket
`display: none` rule and all `active_critN`/`active_itemN` override
rules. Removed because dynamically generated matrices need no CSS-based
reveal step — they should be visible by default, which is now the case.
The unrelated `.pairwisetable input[type="text"] { margin: 0; }` rule
(a harmless margin reset, not part of the hide/show mechanism) was left
untouched.

### 2. `index.html` — duplicate table-generation implementation (208 lines)
Two separate, competing implementations of the same functionality existed:

- **`setupAlternativePairwiseTables()`** (original) — correctly wired
  into the core flow: per-field input listeners, test-data loading,
  `refreshAllTables()`, and `runEnhancedCalculation()` (8 call sites).
- **`createAlternativeTables()`** (later addition) — a near-duplicate,
  wired only to a manually-injected "🔄 Generate Tables" button (added
  via `setTimeout`), plus a second, redundant `input` listener and a
  second, redundant initial-generation timer.

A line of code — `window.setupAlternativePairwiseTables =
createAlternativeTables;` — silently **overwrote** the original function
at runtime, meaning `createAlternativeTables()`'s implementation was the
one actually executing everywhere, despite the original name still
being called from 8 places. This is a textbook case of a symptom patch
(the manual button) layered on top of the real bug (the CSS rule)
without removing the code it was working around.

**Consolidation:** the original `setupAlternativePairwiseTables()` body
was removed (it was already dead — silently replaced at runtime).
`createAlternativeTables()` was renamed to `setupAlternativePairwiseTables()`,
becoming the single canonical implementation under the name already used
by all 8 legitimate call sites. The runtime reassignment hack, the
duplicate `input` listener, the duplicate initial-generation timer, the
manual "Generate Tables" button, and its supporting `generateTablesNow()`
function were all removed — they existed only to work around tables not
appearing automatically, which is no longer necessary.

## Confirmation

- `git diff --stat` on `js/core/ahp-engine.js`, `js/frameworks/amseshi/amseshi-framework.js`,
  `js/frameworks/amseshi/interpretation.js`, and `js/application/assessment-service.js`:
  **zero diff** — no mathematical or orchestration code touched.
- `test/verify-extraction.mjs`, `test/verify-assessment-service.mjs`,
  `test/verify-matrix-split.mjs`, `test/verify-step2-return-shape.mjs`,
  `test/example-lifecycle.mjs`: **all pass**, identical numerical output
  to every prior verified baseline.
- No HTML structure changed. No CSS outside the obsolete block changed.
- The fix is a pure "stop hiding what already exists correctly" change —
  no new rendering logic was introduced.

## Known limitation of this verification

This fix was verified using a simulated DOM (jsdom) for CSS/DOM behavior,
which does **not** execute `<script type="module">` blocks (a confirmed
jsdom limitation, unrelated to this fix). This means the module-loaded
AHP engine/framework/interpretation exposure to `window` could not be
exercised in this simulation. That code path is verified separately and
independently via Node's native ES module support (all five test suites
above import the actual `.js` module files directly). A final manual
smoke test in a real browser remains recommended, as with every prior
phase.
