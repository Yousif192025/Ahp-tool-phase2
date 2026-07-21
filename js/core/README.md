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

Empty as of Phase 2. **Phase 3** will extract the following functions
verbatim (same algorithm, same numeric behavior) from the live
`index.html`, verified against golden test cases first:

- `calculatePriorityVector(matrix)`
- `calculateConsistencyRatio(matrix, weights)`
- `calculateOverallConsistency(criteriaCR, alternativeCRs, criteriaWeights)`

The higher-level orchestration currently named `calculateEnhancedAHP(...)`
in `index.html` will **not** live here — it belongs to the AMSESHI
framework (`js/frameworks/amseshi/`), since it encodes AMSESHI's specific
process (criteria → alternatives → weighted final score), not a generic
AHP primitive.
