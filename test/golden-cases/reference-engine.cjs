// VERBATIM copy of the calculation functions currently live in index.html
// (lines 1782-1926 as of the Phase 2 snapshot). Copied exactly, unmodified,
// purely to generate golden baseline outputs BEFORE any extraction happens.
// This file is not part of the application; it is a one-time verification tool.

function createAlternativeMatrices_REFERENCE(criteriaCount, itemsCount, overrides) {
    // Reimplementation of createAlternativeMatrices, but reading from a plain
    // "overrides" object instead of document.getElementById, since this
    // baseline script runs outside a browser. Produces IDENTICAL matrices
    // to what the live DOM-reading version would produce for the same
    // logical inputs (same clamping, same default-fill rule).
    const matrices = [];
    for (let c = 0; c < criteriaCount; c++) {
        matrices[c] = [];
        for (let i = 0; i < itemsCount; i++) {
            matrices[c][i] = [];
            for (let j = 0; j < itemsCount; j++) {
                if (i === j) {
                    matrices[c][i][j] = 1;
                } else {
                    const key = `c${c}_item${i}v${j}`;
                    const raw = overrides && overrides[key];
                    if (raw !== undefined && raw !== null && !isNaN(parseFloat(raw))) {
                        const value = parseFloat(raw);
                        matrices[c][i][j] = isNaN(value) ? 1 : Math.max(0.111, Math.min(9, value));
                    } else {
                        const defaultVal = 1 + Math.abs(i - j) * 0.5;
                        matrices[c][i][j] = defaultVal;
                    }
                }
            }
        }
    }
    return matrices;
}

function createCriteriaMatrix_REFERENCE(criteriaCount, overrides) {
    const matrix = [];
    for (let i = 0; i < criteriaCount; i++) {
        matrix[i] = [];
        for (let j = 0; j < criteriaCount; j++) {
            if (i === j) {
                matrix[i][j] = 1;
            } else {
                const key = `criteria${i}v${j}`;
                const raw = overrides && overrides[key];
                if (raw !== undefined && raw !== null && !isNaN(parseFloat(raw))) {
                    const value = parseFloat(raw);
                    matrix[i][j] = isNaN(value) ? 1 : Math.max(0.111, Math.min(9, value));
                } else {
                    matrix[i][j] = 1;
                }
            }
        }
    }
    return matrix;
}

// ---- Below: byte-for-byte identical to index.html lines 1813-1926 ----

function calculateEnhancedAHP(items, criteria, alternativeMatrices, criteriaMatrix) {
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
            algorithm: 'Eigenvector Method with Consistency Check',
            sensitivity: 'available'
        }
    };
}

function calculatePriorityVector(matrix) {
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

function calculateConsistencyRatio(matrix, weights) {
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

function calculateOverallConsistency(criteriaCR, alternativeCRs, criteriaWeights) {
    if (alternativeCRs.length === 0) return criteriaCR;

    let weightedSum = criteriaCR;
    for (let i = 0; i < alternativeCRs.length; i++) {
        weightedSum += alternativeCRs[i] * (criteriaWeights[i] || 0);
    }

    const totalWeight = 1 + criteriaWeights.reduce((a, b) => a + b, 0);
    return weightedSum / totalWeight;
}

// ---- Test case runner ----

module.exports = {
    calculateEnhancedAHP,
    calculatePriorityVector,
    calculateConsistencyRatio,
    calculateOverallConsistency,
    createCriteriaMatrix_REFERENCE,
    createAlternativeMatrices_REFERENCE,
};
