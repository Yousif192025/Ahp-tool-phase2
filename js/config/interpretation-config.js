/**
 * Module Name: interpretation-config.js
 * Purpose: Configurable data used by js/frameworks/amseshi/interpretation.js.
 *   Holds ONLY thresholds that are already methodologically well-defined
 *   (consistency confidence, from Saaty's CR). Does NOT hold any mapping
 *   from AHP priority weights/scores to institutional readiness — that
 *   mapping is an open research question, deliberately not encoded here.
 *   See docs/research-decisions/arim-separation.md.
 * Responsibilities:
 *   - Hold CONSISTENCY_CONFIDENCE_THRESHOLDS (data only)
 *   - Hold ARIM_BAND_LABELS: an illustrative banding *style* (not a
 *     mapping) for whatever index a future validated ARIM produces
 * Dependencies:
 *   - None
 * Author: Yousif Hashim
 * Version: 1.1.0
 * Research Project: AMSESHI Academic Decision Support System (ADSS) — PhD Dissertation, Al Neelain University
 * Last Updated: 2026-07-23
 * -----------------------------------------------------------------------
 * CHANGE LOG (v1.1.0): removed READINESS_THRESHOLDS and RECOMMENDATION_RULES
 * as a direct function of AHP alternative scores. Rationale: the AHP
 * priority vector expresses RELATIVE priority among compared alternatives
 * (it necessarily sums to 1 across whatever alternatives happen to be
 * compared), not an ABSOLUTE institutional readiness measure. Classifying
 * it directly as "readiness" was a conflation error, caught during the
 * Phase 4.3 example run (see docs/reproducibility/phase4.3-verification-report.md)
 * and corrected per the researcher's explicit decision. See
 * docs/research-decisions/arim-separation.md for the full rationale.
 * -----------------------------------------------------------------------
 */

// Well-defined: Saaty's CR is a property of the pairwise comparison
// matrix itself (how consistent the judgments are), not of the AHP
// alternative scores. This mapping is NOT affected by the ARIM
// separation decision and remains in direct use.
export const CONSISTENCY_CONFIDENCE_THRESHOLDS = [
  { max: 0.05, stars: 5, label: 'Very High', reliability: 'Excellent', phrase: 'highly consistent' },
  { max: 0.08, stars: 4, label: 'High',      reliability: 'Good',      phrase: 'consistent' },
  { max: 0.10, stars: 3, label: 'Moderate',  reliability: 'Acceptable', phrase: 'acceptably consistent' },
];

// PLACEHOLDER ONLY — a banding *style* (5 ordinal bands, evenly spaced),
// kept here purely as a formatting convention future ARIM output could
// reuse. This is NOT wired to anything yet, and must NOT be applied to
// raw AHP priority weights or alternative scores. The actual ARIM
// methodology (what index these bands would apply to, and where its
// cut points fall) is an open research question — see
// docs/research-decisions/arim-separation.md.
export const ARIM_BAND_LABELS = [
  { min: 0.80, max: 1.00, label: 'Excellent' },
  { min: 0.60, max: 0.79, label: 'High' },
  { min: 0.40, max: 0.59, label: 'Moderate' },
  { min: 0.20, max: 0.39, label: 'Low' },
  { min: 0.00, max: 0.19, label: 'Critical' },
];
