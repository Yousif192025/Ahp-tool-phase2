/**
 * Module Name: interpretation.js
 * Purpose: The AMSESHI Interpretation Layer — an internal component of
 *   the AMSESHI Framework (not a separate framework) that interprets
 *   already-computed AHP output. Handles the part that IS
 *   methodologically well-defined today (consistency confidence, from
 *   Saaty's CR) in full. The derivation of institutional readiness from
 *   AHP priority weights is INTENTIONALLY left undefined here pending
 *   the AMSESHI Framework's readiness methodology — see
 *   docs/research-decisions/interpretation-layer-separation.md.
 * Responsibilities:
 *   - Rate assessment confidence from a consistency ratio (well-defined, implemented)
 *   - Provide a stable, documented extension point for the eventual
 *     Institutional Readiness Index and Recommendation Engine
 *     (deriveInstitutionalReadiness — not yet implemented)
 *   - Perform NO calculation; only label already-computed numbers
 * Dependencies:
 *   - js/config/interpretation-config.js (thresholds)
 * Author: Yousif Hashim
 * Version: 2.1.0
 * Research Project: AMSESHI Academic Decision Support System (ADSS) — PhD Dissertation, Al Neelain University
 * Last Updated: 2026-07-23
 * -----------------------------------------------------------------------
 * PIPELINE THIS MODULE SITS IN, entirely within the AMSESHI Framework:
 *
 *   AMSESHI Framework
 *         -> Decision Analysis Engine (AHP)
 *         -> Interpretation Layer (this module)
 *         -> Institutional Readiness Assessment
 *         -> Decision Support
 *
 * The AHP priority vector expresses RELATIVE priority among the
 * alternatives that happened to be compared — it is not, by itself, an
 * absolute institutional readiness measure. This module therefore does
 * not derive a readiness classification directly from AHP weights or
 * alternative scores. That derivation belongs to the Interpretation
 * Layer's Institutional Readiness Index, whose methodology has not yet
 * been defined. See docs/research-decisions/interpretation-layer-separation.md
 * for the full rationale.
 *
 * NOTE ON TERMINOLOGY: this functionality was briefly referred to during
 * design discussion as "ARIM" (a standalone model name). That naming has
 * been retired — it is not a separate research framework, model, or
 * subsystem. It is the AMSESHI Interpretation Layer, a component of the
 * single AMSESHI Framework, which remains the dissertation's one
 * scientific contribution.
 * -----------------------------------------------------------------------
 */
import { CONSISTENCY_CONFIDENCE_THRESHOLDS } from '../../config/interpretation-config.js';

/**
 * Rates assessment confidence from a consistency ratio (CR), as computed
 * unchanged by js/core/ahp-engine.js (the Decision Analysis Engine). CR
 * above 0.10 is always flagged inconsistent, per Saaty's standard
 * acceptability rule (not configurable).
 *
 * This function is UNAFFECTED by the readiness/interpretation separation:
 * CR measures how internally consistent the pairwise judgments are,
 * which is a property of the comparison process itself, not a claim
 * about institutional readiness.
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
 * This is where the AMSESHI Framework's Institutional Readiness Index
 * and Recommendation Engine will convert AHP priority-analysis output
 * into an institutional readiness assessment, once that methodology is
 * defined and validated. Deliberately left unimplemented rather than
 * solved ad hoc — see
 * docs/research-decisions/interpretation-layer-separation.md.
 *
 * The function signature below is a placeholder for integration
 * purposes only (so calling code can be written against a stable shape
 * today), and throws rather than silently guessing a mapping.
 *
 * @param {object} priorityAnalysisResult - output of amseshi-framework.js's calculateEnhancedAHP
 * @throws {Error} always, until the readiness methodology is defined
 */
export function deriveInstitutionalReadiness(priorityAnalysisResult) {
  throw new Error(
    'deriveInstitutionalReadiness() is not yet implemented. The mapping from ' +
    'AHP priority weights to institutional readiness is an open research ' +
    'question within the AMSESHI Framework (its Institutional Readiness ' +
    'Index) and is intentionally left undefined until validated. See ' +
    'docs/research-decisions/interpretation-layer-separation.md.'
  );
}

/**
 * Interpretation available TODAY: confidence only. The "readiness" field
 * is explicitly null with a status flag, rather than a guessed value —
 * so integration code (js/application/assessment-service.js) can already
 * be written against this shape without knowing the future readiness
 * methodology's internals.
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
      status: 'pending-methodology',
      label: null,
      explanation:
        'Institutional readiness classification awaits the AMSESHI ' +
        'Framework\'s Institutional Readiness Index, which has not yet ' +
        'been methodologically defined. See ' +
        'docs/research-decisions/interpretation-layer-separation.md.',
    },
    recommendation: {
      status: 'pending-methodology',
      action: null,
      rationale: 'Recommendations depend on the readiness classification above, which is not yet available.',
    },
  };
}
