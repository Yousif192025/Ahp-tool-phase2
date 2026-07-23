# Phase 3 Reproducibility Report — AHP Engine & AMSESHI Framework Extraction

## What was extracted

Four functions were moved out of the single inline `<script>` in
`index.html` into two new ES modules, with **zero changes to the
algorithm itself**:

| Function | Old location | New location |
|---|---|---|
| `calculatePriorityVector` | inline script | `js/core/ahp-engine.js` |
| `calculateConsistencyRatio` | inline script | `js/core/ahp-engine.js` |
| `calculateOverallConsistency` | inline script | `js/core/ahp-engine.js` |
| `calculateEnhancedAHP` | inline script | `js/frameworks/amseshi/amseshi-framework.js` |

`index.html` now loads these via a single `<script type="module">` in
`<head>` that assigns them to `window`, so every existing call site in
the original inline script (`performCalculation`, etc.) is **completely
unchanged** — no other line of application logic was touched.

## Verification method

1. Before any extraction, the exact function bodies (copied
   character-for-character from `index.html`, including the original
   `console.log` line) were run in Node.js against five representative
   test cases, and the outputs were recorded as a golden baseline
   (`test/golden-cases/*.json`).
2. The extracted modules were then run against the identical inputs.
3. Every numeric field in the result — priority weights, consistency
   ratios, final scores, normalized scores — was compared using strict
   floating-point equality (`===`, not "close enough"). The only field
   excluded from comparison is `metadata.timestamp`, since it is a
   wall-clock value, not a calculation output.

## Test cases

| Case | Description | Criteria × Alternatives | Purpose |
|---|---|---|---|
| `case-1-single-criterion` | Minimal edge case | 1 × 2 | Smallest valid input; CR should be exactly 0 |
| `case-2-small-consistent` | Realistic, well-formed comparisons | 3 × 3 | Typical "good" input |
| `case-3-inconsistent` | Deliberately circular criteria matrix | 3 × 2 | CR should clearly exceed the 0.1 threshold |
| `case-4-typical-real-world` | Mixed consistent/near-consistent matrices | 4 × 4 | Representative real usage |
| `case-5-max-size-8x8` | Maximum matrix size the UI allows | 8 × 8 | Boundary/scale case |

## Result

```
PASS  case-1-single-criterion
PASS  case-2-small-consistent
PASS  case-3-inconsistent
PASS  case-4-typical-real-world
PASS  case-5-max-size-8x8

All golden cases matched exactly.
```

All five cases produced **bitwise-identical** numeric output between the
original inline implementation and the extracted `js/core/ahp-engine.js`
+ `js/frameworks/amseshi/amseshi-framework.js` modules.

To re-run this verification yourself at any time:

```
node test/verify-extraction.mjs
```

## What this does and does not prove

**Proves:** the mathematical extraction is exact — same inputs produce
the same outputs, to the last floating-point bit, across all tested
cases including edge and boundary conditions.

**Does not prove (out of scope for this script):** that the browser
correctly wires the new `<script type="module">` globals before the UI
calls them. That relies on standard, specified HTML execution order
(module scripts execute after parsing but before `DOMContentLoaded`,
and every calculation call site in `index.html` is only reachable from
a user-triggered event handler that fires after page load) rather than
on anything exotic. This should still be confirmed with a manual smoke
test of the live page (load it, run a calculation, compare the
displayed numbers against a known-good case) before treating Phase 3
as fully closed.

## Known, deliberately preserved issue

`metadata.algorithm` in the returned assessment object reads
`"Eigenvector Method with Consistency Check"`, though the implementation
actually computes the row geometric mean approximation, not the
principal eigenvector via power iteration (see Phase 1 analysis). This
label was **intentionally left unchanged** in Phase 3, since correcting
it would alter the shape/content of the returned data — a decision that
should be made and approved explicitly, not folded silently into a
"no behavior change" refactor. Recommended for Phase 4 or 7.
