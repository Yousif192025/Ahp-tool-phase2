/**
 * Module Name: interpretation.js
 * Purpose: AMSESHI's interpretive layer over already-computed AHP output.
 *   Handles the parts that ARE methodologically well-defined today
 *   (consistency confidence, from Saaty's CR) in full. The mapping from
 *   AHP priority weights to institutional readiness is INTENTIONALLY
 *   left undefined here pending the AMSESHI Readiness Interpretation
 *   Model (ARIM) — see docs/research-decisions/arim-separation.md.
 * Responsibilities:
 *   - Rate assessment confidence from a consistency ratio (well-defined, implemented)
 *   - Provide a stable, documented extension point for ARIM once its
 *     methodology is defined (deriveInstitutionalReadiness — not yet implemented)
 *   - Perform NO calculation; only label already-computed numbers
 * Dependencies:
 *   - js/config/interpretation-config.js (thresholds)
 * Author: Yousif Hashim
 * Version: 2.0.0
 * Research Project: AMSESHI Academic Decision Support System (ADSS) — PhD Dissertation, Al Neelain University
 * Last Updated: 2026-07-23
 * -----------------------------------------------------------------------
 * PIPELINE THIS MODULE SITS IN (per researcher's explicit design decision):
 *
 *   Decision Analysis (AHP) -> Priority Analysis -> AMSESHI Interpretation
 *   Model (ARIM) -> Institutional Readiness Assessment
 *
 * The AHP priority vector expresses RELATIVE priority among the
 * alternatives that happened to be compared — it is not, by itself, an
 * absolute institutional readiness measure. This module therefore no
 * longer derives a readiness classification directly from AHP weights
 * or alternative scores. That derivation is ARIM's job, and ARIM's
 * methodology has not yet been defined. See
 * docs/research-decisions/arim-separation.md for the full rationale and
 * the removed v1.0.0 implementation this replaces.
 * -----------------------------------------------------------------------
 */
import { CONSISTENCY_CONFIDENCE_THRESHOLDS } from '../../config/interpretation-config.js';

/**
 * Rates assessment confidence from a consistency ratio (CR), as computed
 * unchanged by js/core/ahp-engine.js. CR above 0.10 is always flagged
 * inconsistent, per Saaty's standard acceptability rule (not configurable).
 *
 * This function is UNAFFECTED by the ARIM separation decision: CR
 * measures how internally consistent the pairwise judgments are, which
 * is a property of the comparison process itself, not a claim about
 * institutional readiness.
 *
 * @param {number} cr
 * @param {Array} thresholds
 * @returns {{stars:number,label:string,reliability:string,phrase:string}}
 */
export function rateConsistencyConfidence(cr, thresholds = CONSISTENCY_CONFIDENCE_THRESHOLDS) {
  if (cr > 0.10) {
    return { stars: 1, label: 'Inconsistent', reliability: 'Revise comparisons', phrase: 'inconsistent' };
  }
  return thresholds.find(t => cr <= t.max) ?? thresholds[thresholds.length - 1];
}

/**
 * Builds a plain-language sentence explaining the consistency result.
 * @param {number} cr
 * @param {{label:string,reliability:string,phrase:string}} confidence - result of rateConsistencyConfidence(cr)
 * @returns {string}
 */
export function explainConsistency(cr, confidence) {
  if (cr > 0.10) {
    return `The pairwise comparisons show meaningful inconsistency (CR = ${cr.toFixed(2)}, above the 0.10 threshold). Revisit the comparisons before relying on this ranking.`;
  }
  return `The pairwise comparisons are ${confidence.phrase} (CR = ${cr.toFixed(2)}), so the assessment results can be considered ${confidence.reliability.toLowerCase()} in reliability.`;
}

/**
 * EXTENSION POINT — NOT YET IMPLEMENTED.
 *
 * This is where the AMSESHI Readiness Interpretation Model (ARIM) will
 * convert AHP priority-analysis output into an institutional readiness
 * assessment, once its methodology is defined and validated. Deliberately
 * left unimplemented rather than solved ad hoc — see
 * docs/research-decisions/arim-separation.md.
 *
 * The function signature below is a placeholder for integration
 * purposes only (so calling code can be written against a stable shape
 * today), and throws rather than silently guessing a mapping.
 *
 * @param {object} priorityAnalysisResult - output of amseshi-framework.js's calculateEnhancedAHP
 * @throws {Error} always, until ARIM's methodology is defined
 */
export function deriveInstitutionalReadiness(priorityAnalysisResult) {
  throw new Error(
    'deriveInstitutionalReadiness() is not yet implemented. The mapping from ' +
    'AHP priority weights to institutional readiness is an open research ' +
    'question (the AMSESHI Readiness Interpretation Model, ARIM) and is ' +
    'intentionally left undefined until its methodology is validated. ' +
    'See docs/research-decisions/arim-separation.md.'
  );
}

/**
 * Interpretation available TODAY: confidence only. The "readiness" field
 * is explicitly null with a status flag, rather than a guessed value —
 * so integration code (js/application/assessment-service.js) can already
 * be written against this shape without knowing ARIM's future internals.
 *
 * @param {object} params
 * @param {number} params.overallCR - overall consistency ratio
 * @returns {object} partial interpretation block
 */
export function interpretAssessment({ overallCR }) {
  const confidence = rateConsistencyConfidence(overallCR);

  return {
    confidence: {
      ...confidence,
      consistencyRatio: overallCR,
      explanation: explainConsistency(overallCR, confidence),
    },
    readiness: {
      status: 'pending-arim-methodology',
      label: null,
      explanation:
        'Institutional readiness classification awaits the AMSESHI Readiness ' +
        'Interpretation Model (ARIM), which has not yet been methodologically ' +
        'defined. See docs/research-decisions/arim-separation.md.',
    },
    recommendation: {
      status: 'pending-arim-methodology',
      action: null,
      rationale: 'Recommendations depend on the readiness classification above, which is not yet available.',
    },
  };
}
