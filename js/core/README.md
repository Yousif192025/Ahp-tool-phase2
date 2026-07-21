# `js/core/` — AHP Decision Engine

This folder will hold the **generic, reusable, framework-agnostic**
Analytic Hierarchy Process engine: pairwise-matrix priority calculation
(row geometric mean method) and Saaty consistency-ratio checking.

## Design rule

Nothing in this folder may reference:
- the DOM (`document`, `window` UI globals),
- AMSESHI-specific vocabulary (goal/success-factors/etc. — the engine only
  knows "matrix," "criteria," "alternatives" in the generic MCDA sense),
- charts, storage, or reporting.

It takes plain numeric matrices in and returns plain numeric results out.
This is what makes it reusable by AMSESHI today, and by any future
framework later, unchanged.

## Status

**Populated in Phase 3.** Contains `ahp-engine.js`, exporting:

- `calculatePriorityVector(matrix)`
- `calculateConsistencyRatio(matrix, weights)`
- `calculateOverallConsistency(criteriaCR, alternativeCRs, criteriaWeights)`

Extracted verbatim from `index.html`, verified byte-for-byte identical
against five golden test cases — see
`docs/reproducibility/phase3-verification-report.md`.

The higher-level orchestration (`calculateEnhancedAHP(...)`) does **not**
live here — it belongs to the AMSESHI framework
(`js/frameworks/amseshi/amseshi-framework.js`), since it encodes AMSESHI's
specific process (criteria → alternatives → weighted final score), not a
generic AHP primitive.
