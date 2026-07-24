# Research Decision Log: Separating Priority Analysis from Institutional Readiness

**Date:** 2026-07-23 (updated same day — terminology unified)
**Status:** Decided — architecturally enforced. Readiness methodology itself remains open.

## Terminology note (supersedes an earlier naming choice)

During design discussion, this interpretive functionality was briefly
named "ARIM" (AMSESHI Readiness Interpretation Model), framed as if it
might become its own named model alongside AMSESHI. **That naming has
been retired.** The dissertation's scientific contribution is the single
**AMSESHI Framework**. What follows is internal to it — the **AMSESHI
Interpretation Layer** — not a second framework, model, or subsystem.
"ARIM" does not appear anywhere in the current codebase or documentation.

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
pipeline is entirely internal to the AMSESHI Framework:

```
AMSESHI Framework
      -> Decision Analysis Engine (AHP)
      -> Interpretation Layer
      -> Institutional Readiness Assessment
      -> Decision Support
```

**The Decision Analysis Engine (AHP) stops at priority analysis** —
producing relative weights and consistency ratios. It must never
classify readiness, generate recommendations, or make institutional
decisions. **The AMSESHI Interpretation Layer** — specifically its
(as-yet-undefined) Institutional Readiness Index and Recommendation
Engine — is responsible for converting priority-analysis output into an
absolute readiness assessment, using whatever methodology the
dissertation research ultimately validates (e.g., criteria-weighted
absolute performance scores, a normalized composite index independent of
alternative count, expert-validated cut points, etc.). This is
explicitly **out of scope to invent now** — it is a research question to
be developed and validated within the AMSESHI Framework, not an
implementation detail to guess at, and not a second framework.

## What changed in code

- `js/frameworks/amseshi/interpretation.js` (the AMSESHI Interpretation
  Layer): removed the direct mapping from AHP alternative scores to a
  readiness classification. Added `deriveInstitutionalReadiness()` as an
  explicit, documented extension point that **throws** rather than
  silently returning a guessed value. `interpretAssessment()` returns
  `readiness: { status: 'pending-methodology', label: null, ... }`
  instead of a classification.
- `rateConsistencyConfidence()` and `explainConsistency()` are
  **unaffected** — CR measures judgment consistency, not readiness, so
  no conflation exists there.
- `js/config/interpretation-config.js`: `READINESS_BAND_LABELS` is kept
  only as an illustrative banding *style*, explicitly not wired to any
  calculation.

## What this buys the research

- The architecture can absorb whatever readiness methodology is
  eventually validated **without touching `js/core/ahp-engine.js`
  (Decision Analysis Engine) or `amseshi-framework.js` at all** — exactly
  the separation the dissertation's scientific-contribution claim
  depends on.
- The dissertation presents **one** framework — AMSESHI — with a clearly
  named internal Interpretation Layer, rather than risking the
  appearance of two competing scientific contributions.
- No dissertation claim currently rests on an unvalidated, ad hoc
  mapping — the previous threshold table was never presented as final,
  and removing the direct mapping closes any ambiguity.

## Next step (not started)

Define and validate the AMSESHI Framework's readiness methodology
(its Institutional Readiness Index and Recommendation Engine) — this is
a research task for the dissertation itself, not a software task. Once
defined, `deriveInstitutionalReadiness()` gets a real implementation, and
`interpretAssessment()` is updated to call it. No other file changes
should be required.
