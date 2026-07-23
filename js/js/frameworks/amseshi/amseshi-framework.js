/**
 * Module Name: amseshi-framework.js
 * Purpose: Orchestrates the AMSESHI assessment process (criteria and
 *   alternatives -> AHP engine -> weighted institutional result).
 * Responsibilities:
 *   - Build and run a full AMSESHI assessment using the AHP engine
 *   - Assemble criteria weights, alternative priorities, and consistency
 *     diagnostics into a single assessment result
 *   - Perform no matrix arithmetic itself — always delegates to js/core/
 * Dependencies:
 *   - js/core/ahp-engine.js
 * Author: Yousif Hashim
 * Version: 1.0.0
 * Research Project: AMSESHI Academic Decision Support System (ADSS) — PhD Dissertation, Al Neelain University
 * Last Updated: 2026-07-22
 * -----------------------------------------------------------------------
 * AMSESHI Success Factors Assessment Framework — orchestration layer.
 *
 * This is where AMSESHI's scientific contribution lives: it defines the
 * assessment process (criteria -> alternatives -> weighted final score)
 * and calls the generic AHP engine (js/core/ahp-engine.js) to perform the
 * actual matrix calculations. AMSESHI itself never does matrix arithmetic
 * directly.
 *
 * Extracted verbatim (Phase 3) from the live index.html implementation
 * (previously the inline function `calculateEnhancedAHP`). The algorithm
 * and output shape are UNCHANGED. See docs/reproducibility/ for the
 * golden-case verification proving numerically identical output.
 * -----------------------------------------------------------------------
 */
import { calculatePriorityVector, calculateOverallConsistency } from '../../core/ahp-engine.js';

/**
 * Runs a full AMSESHI assessment: given criteria/alternative labels and
 * their pairwise comparison matrices, computes criteria weights,
 * per-criterion alternative priorities, final weighted scores, and
 * consistency diagnostics.
 *
 * Kept under its original name (`calculateEnhancedAHP`) for backward
 * compatibility with existing call sites in index.html.
 *
 * @param {string[]} items - alternative labels
 * @param {string[]} criteria - criteria labels
 * @param {number[][][]} alternativeMatrices - one pairwise matrix per criterion
 * @param {number[][]} criteriaMatrix - pairwise matrix over criteria
 * @returns {object} assessment result (criteria weights, alternative scores, consistency, metadata)
 */
export function calculateEnhancedAHP(items, criteria, alternativeMatrices, criteriaMatrix) {
    console.log('🔢 Performing Enhanced AHP calculation...');

    const criteriaResult = calculatePriorityVector(criteriaMatrix);
    const criteriaWeights = criteriaResult.weights;
    const criteriaCR = criteriaResult.consistencyRatio;

    const alternativePriorities = [];
    const alternativeCRs = [];

    for (let c = 0; c < criteria.length; c++) {
        const altResult = calculatePriorityVector(alternativeMatrices[c]);
        alternativePriorities.push(altResult.weights);
        alternativeCRs.push(altResult.consistencyRatio);
    }

    const finalScores = [];
    for (let i = 0; i < items.length; i++) {
        let score = 0;
        for (let c = 0; c < criteria.length; c++) {
            score += criteriaWeights[c] * alternativePriorities[c][i];
        }
        finalScores.push(score);
    }

    const totalScore = finalScores.reduce((sum, s) => sum + s, 0);
    const normalizedScores = finalScores.map(s => s / totalScore);

    const overallCR = calculateOverallConsistency(criteriaCR, alternativeCRs, criteriaWeights);

    return {
        criteria: {
            labels: criteria,
            weights: criteriaWeights,
            normalizedWeights: criteriaWeights.map(w => w / criteriaWeights.reduce((a, b) => a + b, 0)),
            consistencyRatio: criteriaCR
        },
        alternatives: {
            labels: items,
            scores: normalizedScores,
            rawScores: finalScores,
            prioritiesByCriterion: alternativePriorities
        },
        consistency: {
            criteriaCR: criteriaCR,
            alternativeCRs: alternativeCRs,
            overallCR: overallCR
        },
        metadata: {
            calculationMethod: 'enhanced-ahp',
            timestamp: new Date().toISOString(),
            // NOTE (Phase 1 finding, intentionally preserved): this label
            // says "Eigenvector Method" but the engine actually computes
            // the row geometric mean approximation. Left unchanged here
            // to guarantee identical output shape; correcting the label
            // is a proposed Phase 4/7 change requiring separate approval,
            // since it alters returned data, not just internal code.
            algorithm: 'Eigenvector Method with Consistency Check',
            sensitivity: 'available'
        }
    };
}

/**
 * Alias exposing the same function under a framework-neutral name, for
 * future code that wants to call "the AMSESHI assessment" without
 * depending on the legacy function name. Both names are the same function.
 */
export const runAssessment = calculateEnhancedAHP;
