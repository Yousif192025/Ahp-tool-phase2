/**
 * Module Name: interpretation-config.js
 * Purpose: Configurable data used by js/frameworks/amseshi/interpretation.js
 *   (the AMSESHI Interpretation Layer). Holds ONLY thresholds that are
 *   already methodologically well-defined (consistency confidence, from
 *   Saaty's CR). Does NOT hold any mapping from AHP priority
 *   weights/scores to institutional readiness — that mapping is an open
 *   research question within the AMSESHI Framework, deliberately not
 *   encoded here. See docs/research-decisions/interpretation-layer-separation.md.
 * Responsibilities:
 *   - Hold CONSISTENCY_CONFIDENCE_THRESHOLDS (data only)
 *   - Hold READINESS_BAND_LABELS: an illustrative banding *style* (not a
 *     mapping) for whatever index the AMSESHI Interpretation Layer
 *     eventually produces
 * Dependencies:
 *   - None
 * Author: Yousif Hashim
 * Version: 1.2.0
 * Research Project: AMSESHI Academic Decision Support System (ADSS) — PhD Dissertation, Al Neelain University
 * Last Updated: 2026-07-23
 * -----------------------------------------------------------------------
 * CHANGE LOG:
 *   v1.1.0 — removed READINESS_THRESHOLDS/RECOMMENDATION_RULES as a
 *     direct function of AHP alternative scores (see
 *     docs/research-decisions/interpretation-layer-separation.md).
 *   v1.2.0 — terminology unification: this interpretive functionality is
 *     the AMSESHI Interpretation Layer, an internal component of the
 *     single AMSESHI Framework — not a separate named model or
 *     subsystem. "ARIM" is not used anywhere in this codebase.
 * -----------------------------------------------------------------------
 */

// Well-defined: Saaty's CR is a property of the pairwise comparison
// matrix itself (how consistent the judgments are), not of the AHP
// alternative scores. This mapping is unaffected by the interpretation/
// readiness separation and remains in direct use.
export const CONSISTENCY_CONFIDENCE_THRESHOLDS = [
  { max: 0.05, stars: 5, label: 'Very High', reliability: 'Excellent', phrase: 'highly consistent' },
  { max: 0.08, stars: 4, label: 'High',      reliability: 'Good',      phrase: 'consistent' },
  { max: 0.10, stars: 3, label: 'Moderate',  reliability: 'Acceptable', phrase: 'acceptably consistent' },
];

// PLACEHOLDER ONLY — a banding *style* (5 ordinal bands, evenly spaced),
// kept here purely as a formatting convention the AMSESHI Interpretation
// Layer's future Institutional Readiness Index could reuse. This is NOT
// wired to anything yet, and must NOT be applied to raw AHP priority
// weights or alternative scores. The actual readiness methodology (what
// index these bands would apply to, and where its cut points fall) is an
// open research question within the AMSESHI Framework — see
// docs/research-decisions/interpretation-layer-separation.md.
export const READINESS_BAND_LABELS = [
  { min: 0.80, max: 1.00, label: 'Excellent' },
  { min: 0.60, max: 0.79, label: 'High' },
  { min: 0.40, max: 0.59, label: 'Moderate' },
  { min: 0.20, max: 0.39, label: 'Low' },
  { min: 0.00, max: 0.19, label: 'Critical' },
];
