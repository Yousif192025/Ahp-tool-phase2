# Research Decision Log: Separating AHP Priority Analysis from Institutional Readiness

**Date:** 2026-07-23
**Status:** Decided — architecturally enforced. Readiness methodology itself remains open.

## The problem

Phase 4.3's first implementation of `interpretation.js` classified
institutional readiness by feeding the AHP engine's normalized
alternative score directly into a set of fixed bands (0.80–1.00
"Excellent," etc.). Running the example lifecycle
(`test/example-lifecycle.mjs`) against a realistic 4-alternative case
exposed the flaw immediately: the top-ranked alternative scored 34.9%
and was classified "Low Readiness" — despite being the best available
option among those compared.

## Why this happened

The AHP priority vector is a **relative** measure: by construction, the
scores of all compared alternatives sum to 1. Adding a fifth alternative
mechanically lowers every other alternative's share, regardless of any
change in actual institutional performance. Treating that relative share
as an **absolute** readiness percentage was a conflation between two
different mathematical objects — relative priority vs. absolute
readiness — and would have produced misleading classifications for any
assessment with more than a couple of alternatives.

## The decision

Institutional readiness is not derived from AHP output directly. The
pipeline is now explicitly:

```
Decision Analysis (AHP) -> Priority Analysis -> AMSESHI Interpretation
Model (ARIM) -> Institutional Readiness Assessment
```

**AHP's role stops at Priority Analysis** — producing relative weights
and consistency ratios. **ARIM (AMSESHI Readiness Interpretation
Model)** is the (as-yet-undefined) component responsible for converting
priority-analysis output into an absolute readiness assessment, using
whatever methodology the dissertation research ultimately validates
(e.g., criteria-weighted absolute performance scores, a normalized
composite index independent of alternative count, expert-validated
cut points, etc.). This is explicitly **out of scope to invent now** —
it is a research contribution to be developed and validated separately,
not an implementation detail to guess at.

## What changed in code

- `js/frameworks/amseshi/interpretation.js`: removed `classifyReadiness()`
  and its direct use of AHP alternative scores. Added
  `deriveInstitutionalReadiness()` as an explicit, documented extension
  point that **throws** rather than silently returning a guessed value.
  `interpretAssessment()` now returns `readiness: { status:
  'pending-arim-methodology', label: null, ... }` instead of a
  classification.
- `rateConsistencyConfidence()` and `explainConsistency()` are
  **unaffected** — CR measures judgment consistency, not readiness, so
  no conflation exists there.
- `js/config/interpretation-config.js`: removed `READINESS_THRESHOLDS`
  and `RECOMMENDATION_RULES` as active mappings. Replaced with
  `ARIM_BAND_LABELS`, explicitly marked as an illustrative banding
  *style* only, not wired to any calculation.

## What this buys the research

- The architecture can absorb whatever ARIM methodology is eventually
  validated **without touching `js/core/ahp-engine.js` or
  `amseshi-framework.js` at all** — exactly the separation the
  dissertation's scientific-contribution claim depends on.
- ARIM itself becomes a nameable, citable sub-contribution: AHP produces
  priorities; ARIM (part of the AMSESHI Framework, not the AHP engine)
  is what turns those priorities into an institutional readiness
  judgment. This is a stronger and more defensible framing than
  "AHP produces a ranking" for a PhD committee.
- No dissertation claim is currently at risk of resting on an
  unvalidated, ad hoc mapping — the previous (removed) threshold table
  was never presented as final, but removing it outright closes any
  ambiguity.

## Next step (not started)

Define and validate the actual ARIM methodology — this is a research
task for the dissertation itself, not a software task. Once defined,
`deriveInstitutionalReadiness()` gets a real implementation, and
`interpretAssessment()` is updated to call it. No other file changes
should be required.
