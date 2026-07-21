/**
 * ahp-engine.js
 * -----------------------------------------------------------------------
 * Generic Analytic Hierarchy Process (AHP) decision engine.
 *
 * Extracted verbatim (Phase 3) from the live index.html implementation
 * (row geometric mean priority vectors + Saaty consistency ratio). The
 * algorithm itself is UNCHANGED — only its location and export syntax
 * differ from the original inline version. See docs/reproducibility/
 * for the golden-case verification proving numerically identical output.
 *
 * This module has NO knowledge of AMSESHI, success factors, the DOM,
 * charts, storage, or reporting. It operates only on plain numeric
 * matrices, which is what makes it reusable by any future assessment
 * framework (see js/frameworks/README.md).
 * -----------------------------------------------------------------------
 */

/**
 * Computes the priority (weight) vector of a pairwise comparison matrix
 * using the row geometric mean method, together with its consistency
 * ratio.
 * @param {number[][]} matrix - n x n reciprocal pairwise comparison matrix
 * @returns {{weights: number[], consistencyRatio: number}}
 */
export function calculatePriorityVector(matrix) {
    const n = matrix.length;

    const geometricMeans = [];
    for (let i = 0; i < n; i++) {
        let product = 1;
        for (let j = 0; j < n; j++) {
            product *= matrix[i][j];
        }
        geometricMeans.push(Math.pow(product, 1 / n));
    }

    const sumGM = geometricMeans.reduce((s, gm) => s + gm, 0);
    const priorityVector = geometricMeans.map(gm => gm / sumGM);

    const consistency = calculateConsistencyRatio(matrix, priorityVector);

    return {
        weights: priorityVector,
        consistencyRatio: consistency
    };
}

/**
 * Computes Saaty's consistency ratio (CR) for a pairwise comparison
 * matrix given its priority weights.
 * @param {number[][]} matrix
 * @param {number[]} weights
 * @returns {number} consistency ratio, >= 0
 */
export function calculateConsistencyRatio(matrix, weights) {
    const n = matrix.length;
    if (n <= 1) return 0;

    let lambdaMax = 0;
    for (let i = 0; i < n; i++) {
        let rowSum = 0;
        for (let j = 0; j < n; j++) {
            rowSum += matrix[i][j] * weights[j];
        }
        lambdaMax += rowSum / weights[i];
    }
    lambdaMax /= n;

    const CI = (lambdaMax - n) / (n - 1);

    const RI = [0, 0, 0.58, 0.90, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49];

    const CR = CI / (RI[n] || 1.49);

    return Math.max(0, CR);
}

/**
 * Aggregates a criteria-level consistency ratio and a set of per-criterion
 * alternative-level consistency ratios into a single overall consistency
 * measure, weighted by criteria importance. Generic to any two-level AHP
 * hierarchy (criteria -> alternatives), not specific to any one framework.
 * @param {number} criteriaCR
 * @param {number[]} alternativeCRs
 * @param {number[]} criteriaWeights
 * @returns {number}
 */
export function calculateOverallConsistency(criteriaCR, alternativeCRs, criteriaWeights) {
    if (alternativeCRs.length === 0) return criteriaCR;

    let weightedSum = criteriaCR;
    for (let i = 0; i < alternativeCRs.length; i++) {
        weightedSum += alternativeCRs[i] * (criteriaWeights[i] || 0);
    }

    const totalWeight = 1 + criteriaWeights.reduce((a, b) => a + b, 0);
    return weightedSum / totalWeight;
}
