# Research Decision Log: Alternative Comparison Values Reset Before Calculation

**Date:** 2026-07-25
**Status:** Fixed and verified via real browser execution (Puppeteer + actual Chrome), not simulation.

## Methodology (per explicit requirement: no assumptions, no jsdom, no synthetic data)

This investigation used **Puppeteer driving an actual installed Chrome
browser** against the live app served over a real local HTTP server
(matching how GitHub Pages/Vercel serve it — not `file://`). The exact
reported workflow was reproduced verbatim: 4 criteria, 6 alternatives
(CSC1–CSC6), CSC1 set to dominate all others (value 9) under the first
criterion, then the real "Calculate" button was clicked.

Non-destructive instrumentation was installed via `page.evaluate()` to
wrap `window.runAssessment` — the exact call site `performCalculation()`
uses (`window.runAssessment({...})`) — capturing its real input and
output without modifying any source file. No matrix was ever
hand-constructed; every value below was read from the live DOM by the
application's own code, in the browser, during a real click event.

## First finding: `calculateEnhancedAHP` cannot be intercepted this way

An initial attempt wrapped `window.calculateEnhancedAHP` and captured
nothing (`window.__trace` stayed empty) even though the calculation
visibly completed. Root cause: `assessment-service.js` imports
`calculateEnhancedAHP` via an ES module `import` statement, which binds
directly to the source module's export — reassigning the unrelated
`window.calculateEnhancedAHP` property has no effect on that internal
binding. This is expected ES module behavior, not a bug. Wrapping
`window.runAssessment` instead (a plain classic-script global that
`performCalculation` calls explicitly) worked correctly.

## Root cause (confirmed with real captured data)

With the working instrumentation in place, the traced input to
`runAssessment()` showed:

```
alternativeMatrices[0] = [[1,1,1,1,1,1], [1,1,1,1,1,1], ...]   ← all 1s
```

despite CSC1 vs every other alternative having just been set to 9 in the
real DOM. Calling `createAlternativeMatrices()` directly, immediately
before the Calculate click, returned the **correct** matrix
(`[[1,9,9,9,9,9], [0.111,1,1,1,1,1], ...]`) — proving the DOM held the
right values and the reading function itself works correctly.

The only place the two diverge is **timing**: `runEnhancedCalculation()`
called `setupAlternativePairwiseTables()` — which destructively rebuilds
the entire alternative comparison table via `container.innerHTML = ''`
— immediately **before** `performCalculation()` read the matrix values.
This reset every input back to its "1" default a moment before it was
read, discarding whatever the user had just entered.

This is the same behavior identified in an earlier investigation
session, where a broader fix (an idempotency cache added to
`setupAlternativePairwiseTables()` itself) was attempted and had to be
reverted because it interfered with the test-data auto-load path. This
time, the fix targets only the single problematic call site.

## The fix

One line was removed: the call to `setupAlternativePairwiseTables();`
inside `runEnhancedCalculation()`, immediately after form validation and
before `performCalculation()`. This call was redundant — the tables are
already kept correctly in sync by the per-field `input` event listeners
(attached during `setupEventListeners()`) and by
`ensureTestDataLoaded()`/`refreshAllTables()`. Removing it does not
remove any functionality; it removes a destructive, unnecessary rebuild
at the one moment it was actively harmful.

`setupAlternativePairwiseTables()` itself, and its remaining 6 call
sites, are completely unchanged.

## Verification (real browser, same exact workflow, after the fix)

```
alternativeMatrices[0] row 0: [1, 9, 9, 9, 9, 9]        ← now correct
Normalized final scores: CSC1 = 28.57%, CSC2–6 = 14.29% each
```

CSC1 now clearly leads, exactly as expected from its value-9 dominance
under one of four criteria. The remaining five alternatives are equal to
each other, which is also correct: no other criterion's comparisons were
modified in this test, so nothing else differentiates them.

## Confirmation

- `git diff --stat` on `js/core/ahp-engine.js`,
  `js/frameworks/amseshi/amseshi-framework.js`,
  `js/frameworks/amseshi/interpretation.js`, and
  `js/application/assessment-service.js`: **zero diff**.
- `test/verify-extraction.mjs`, `test/verify-assessment-service.mjs`,
  `test/verify-matrix-split.mjs`, `test/verify-step2-return-shape.mjs`:
  all pass, identical to every prior verified baseline.
- Test-data auto-loading, table generation, and all 6 remaining
  `setupAlternativePairwiseTables()` call sites confirmed still working
  correctly in the same real-browser trace (`criteriaCount: 4,
  itemsCount: 6` matched exactly, no manual "Generate Tables" button
  needed).
